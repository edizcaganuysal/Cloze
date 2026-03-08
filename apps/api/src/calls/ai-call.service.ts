import { randomUUID } from 'crypto';
import { HttpAdapterHost } from '@nestjs/core';
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  Optional,
} from '@nestjs/common';
import { WebSocketServer as WsServer } from 'ws';
import WebSocket from 'ws';
import { eq, asc, desc } from 'drizzle-orm';
import { DRIZZLE, DrizzleDb } from '../db/db.module';
import * as schema from '../db/schema';
import { CallsGateway } from './calls.gateway';
import { EngineService } from './engine.service';
import { buildAiCallerPrompt } from './ai-caller.prompt';
import { twilioToOpenAI, openAIToTwilio, ttsToTwilio } from './audio-utils';
import { CreditsService } from '../credits/credits.service';
import { ENGINE_AS_AI_CALLER_BRAIN } from '../config/feature-flags';

@Injectable()
export class AiCallService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AiCallService.name);
  private readonly apiKey = process.env['LLM_API_KEY'] ?? '';

  /** In-memory context cache per callId — eliminates redundant DB loads on turns 2+ */
  private readonly callContextCache = new Map<string, {
    orgId: string;
    voice: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  }>();

  /** TTS audio cache for Twilio <Play> URLs — auto-expires after 5 min */
  private readonly ttsAudioCache = new Map<string, { buffer: Buffer; createdAt: number }>();

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly gateway: CallsGateway,
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly creditsService: CreditsService,
    @Optional() private readonly engineService?: EngineService,
  ) {}

  get available(): boolean {
    return !!this.apiKey;
  }

  /** Generate TTS audio with OpenAI, cache it, return audioId for serving */
  async generateTts(text: string, voice: string): Promise<string> {
    const audioId = randomUUID();
    const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice,
        input: text,
        response_format: 'mp3',
        speed: 1.0,
      }),
    });
    if (!ttsRes.ok) throw new Error(`TTS failed: ${ttsRes.status}`);
    const buffer = Buffer.from(await ttsRes.arrayBuffer());
    this.ttsAudioCache.set(audioId, { buffer, createdAt: Date.now() });
    // Clean stale entries (> 5 min)
    const now = Date.now();
    for (const [id, entry] of this.ttsAudioCache) {
      if (now - entry.createdAt > 5 * 60_000) this.ttsAudioCache.delete(id);
    }
    return audioId;
  }

  /** Get cached TTS audio buffer by ID */
  getTtsAudio(audioId: string): Buffer | null {
    return this.ttsAudioCache.get(audioId)?.buffer ?? null;
  }

  /** Clear call context cache (call when call ends) */
  clearCallCache(callId: string) {
    this.callContextCache.delete(callId);
  }

  onApplicationBootstrap() {
    const httpServer = this.httpAdapterHost.httpAdapter.getHttpServer();
    const wss = new WsServer({ noServer: true });

    httpServer.prependListener('upgrade', (req: { url?: string }, socket: unknown, head: unknown) => {
      const pathname = req.url?.split('?')[0] ?? '';
      if (pathname !== '/ai-call-stream') return;
      this.logger.log('WS upgrade intercepted for /ai-call-stream');
      (wss as WsServer).handleUpgrade(
        req as Parameters<WsServer['handleUpgrade']>[0],
        socket as Parameters<WsServer['handleUpgrade']>[1],
        head as Parameters<WsServer['handleUpgrade']>[2],
        (ws) => wss.emit('connection', ws, req),
      );
    });

    wss.on('connection', (twilioWs: WebSocket) => {
      this.logger.log('Twilio Media Stream connected at /ai-call-stream');
      this.handleAiCallSession(twilioWs);
    });

    this.logger.log('AI Call WS attached at /ai-call-stream');
  }

  /**
   * HTTP-based AI call turn handler — used with Twilio <Gather> TwiML.
   * Uses in-memory context cache to eliminate DB queries on turns 2+.
   * Returns AI text, hangup flag, and selected voice for TTS.
   */
  async handleGatherWebhook(
    callId: string,
    speechResult: string | null,
  ): Promise<{ aiText: string; shouldHangup: boolean; voice: string }> {
    const fallback = { aiText: 'Thank you for your time. Have a great day!', shouldHangup: true, voice: 'marin' };
    if (!this.apiKey) return fallback;

    try {
      // Persist prospect speech in background (don't block the response)
      const prospectText = speechResult?.trim() ?? null;
      if (prospectText) {
        const tsMs = Date.now();
        void this.db
          .insert(schema.callTranscript)
          .values({ callId, tsMs, speaker: 'PROSPECT', text: prospectText, isFinal: true })
          .catch((err: Error) => this.logger.warn(`Speech persist error: ${err.message}`));
        this.gateway.emitToCall(callId, 'transcript.final', {
          speaker: 'PROSPECT', text: prospectText, tsMs, isFinal: true,
        });
      }

      // Use cached context if available; otherwise cold-load from DB
      let ctx = this.callContextCache.get(callId);
      if (!ctx) {
        const [callRow] = await this.db
          .select({
            orgId: schema.calls.orgId,
            agentId: schema.calls.agentId,
            preparedOpenerText: schema.calls.preparedOpenerText,
            contactJson: schema.calls.contactJson,
          })
          .from(schema.calls)
          .where(eq(schema.calls.id, callId))
          .limit(1);

        if (!callRow) return fallback;

        const contactCfg = (callRow.contactJson ?? {}) as Record<string, unknown>;
        const voice = typeof contactCfg.aiVoice === 'string' ? contactCfg.aiVoice : 'marin';

        // Load context + transcript in parallel
        const [ctxRow, productRows, agentRow, transcriptRows] = await Promise.all([
          this.db
            .select({
              companyName: schema.salesContext.companyName,
              whatWeSell: schema.salesContext.whatWeSell,
              targetCustomer: schema.salesContext.targetCustomer,
              globalValueProps: schema.salesContext.globalValueProps,
              proofPoints: schema.salesContext.proofPoints,
            })
            .from(schema.salesContext)
            .where(eq(schema.salesContext.orgId, callRow.orgId))
            .limit(1)
            .then((rows) => rows[0] ?? null),
          this.db
            .select({ name: schema.products.name, elevatorPitch: schema.products.elevatorPitch })
            .from(schema.products)
            .where(eq(schema.products.orgId, callRow.orgId)),
          callRow.agentId
            ? this.db
                .select({ prompt: schema.agents.prompt, promptDelta: schema.agents.promptDelta, openers: schema.agents.openers })
                .from(schema.agents)
                .where(eq(schema.agents.id, callRow.agentId))
                .limit(1)
                .then((rows) => rows[0] ?? null)
            : Promise.resolve(null),
          this.db
            .select({ speaker: schema.callTranscript.speaker, text: schema.callTranscript.text })
            .from(schema.callTranscript)
            .where(eq(schema.callTranscript.callId, callId))
            .orderBy(desc(schema.callTranscript.tsMs))
            .limit(16)
            .then((rows) => rows.reverse()),
        ]);

        const toList = (val: unknown): string[] =>
          Array.isArray(val) ? val.filter((v): v is string => typeof v === 'string') : [];

        const openers = toList(agentRow?.openers);
        const opener =
          callRow.preparedOpenerText?.trim() ||
          (openers.length > 0 ? openers[0] : null) ||
          `Hi, this is Alex from ${ctxRow?.companyName || 'our company'}. Quick question — do you have 30 seconds?`;

        const strategy = agentRow?.promptDelta?.trim() || agentRow?.prompt?.trim() || '';

        const systemPrompt = buildAiCallerPrompt({
          companyName: ctxRow?.companyName ?? '',
          whatWeSell: ctxRow?.whatWeSell ?? '',
          targetCustomer: ctxRow?.targetCustomer ?? '',
          globalValueProps: toList(ctxRow?.globalValueProps),
          proofPoints: toList(ctxRow?.proofPoints),
          products: productRows,
          strategy,
          opener,
        });

        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          {
            role: 'system',
            content: systemPrompt + '\n\nIMPORTANT: When you want to end the call, place [HANGUP] anywhere in your response. It will be removed before the prospect hears it.',
          },
        ];

        // Rebuild message history from existing transcript
        for (const row of transcriptRows) {
          messages.push({ role: row.speaker === 'REP' ? 'assistant' : 'user', content: row.text });
        }

        ctx = { orgId: callRow.orgId, voice, messages };
        this.callContextCache.set(callId, ctx);
        this.logger.log(`Context cached for call ${callId} (voice=${voice}, ${transcriptRows.length} transcript rows)`);
      }

      // Append prospect speech (or silence signal) to message history
      if (prospectText) {
        ctx.messages.push({ role: 'user', content: prospectText });
      } else if (ctx.messages.length <= 1) {
        ctx.messages.push({ role: 'user', content: '[Call connected — begin with your opener now]' });
      } else {
        ctx.messages.push({ role: 'user', content: '[No response — brief silence from prospect]' });
      }

      // Call OpenAI Chat Completions (the only network call on cached turns)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: ctx.messages,
          max_completion_tokens: 80,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        this.logger.error(`OpenAI Chat error ${response.status}: ${await response.text()}`);
        return { ...fallback, voice: ctx.voice };
      }

      const json = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };
      let aiText = json.choices[0]?.message?.content?.trim() ?? '';

      // Debit credits (fire-and-forget)
      const promptTokens = Number(json.usage?.prompt_tokens ?? 0);
      const completionTokens = Number(json.usage?.completion_tokens ?? 0);
      if (promptTokens > 0 || completionTokens > 0) {
        void this.creditsService.debitForAiUsage(
          ctx.orgId, 'gpt-4o-mini', promptTokens, completionTokens,
          'USAGE_LLM_AI_CALLER_HTTP', { call_id: callId },
        );
      }

      const shouldHangup = /\[HANGUP\]/i.test(aiText);
      if (shouldHangup) aiText = aiText.replace(/\[HANGUP\]\s*/gi, '').trim();

      if (!aiText) {
        return { aiText: 'Thank you, I appreciate your time.', shouldHangup: true, voice: ctx.voice };
      }

      // Append AI response to cached message history
      ctx.messages.push({ role: 'assistant', content: aiText });

      // Emit + persist transcript in background
      const aiTsMs = Date.now();
      this.gateway.emitToCall(callId, 'transcript.final', {
        speaker: 'REP', text: aiText, tsMs: aiTsMs, isFinal: true,
      });
      void this.db
        .insert(schema.callTranscript)
        .values({ callId, tsMs: aiTsMs, speaker: 'REP', text: aiText, isFinal: true })
        .catch((err: Error) => this.logger.warn(`AI persist error: ${err.message}`));

      if (shouldHangup) this.callContextCache.delete(callId);

      return { aiText, shouldHangup, voice: ctx.voice };
    } catch (err) {
      this.logger.error(`handleGatherWebhook error: ${(err as Error).message}`);
      return fallback;
    }
  }

  /**
   * Called by MediaStreamService when it detects an AI_CALLER call on /media-stream.
   * Picks up the already-established Twilio WebSocket and starts the AI session.
   */
  startFromHandover(ws: WebSocket, callId: string, streamSid: string | null): void {
    this.logger.log(`AI call handover received — callId=${callId} streamSid=${streamSid}`);
    this.handleAiCallSession(ws, callId, streamSid);
  }

  private handleAiCallSession(twilioWs: WebSocket, initialCallId: string | null = null, initialStreamSid: string | null = null) {
    // When ENGINE_AS_AI_CALLER_BRAIN is enabled, Realtime handles audio I/O only,
    // and Engine.tick() decides what to say each turn. This ensures the AI Caller
    // uses the same copilot brain as outbound coaching.
    if (ENGINE_AS_AI_CALLER_BRAIN() && this.engineService) {
      this.logger.log(`AI call: ENGINE_AS_AI_CALLER_BRAIN enabled — Engine will decide responses`);
      this.handleEngineBasedAiCallSession(twilioWs, initialCallId, initialStreamSid);
      return;
    }

    let callId: string | null = initialCallId;
    let streamSid: string | null = initialStreamSid;
    let openaiWs: WebSocket | null = null;
    let sessionReady = false;
    let partialAiText = '';
    let aiSpeechStartedAt: number | null = null;
    let lastTsMs = Date.now();

    const nextTs = () => {
      const now = Date.now();
      lastTsMs = now > lastTsMs ? now : lastTsMs + 1;
      return lastTsMs;
    };

    const sendToTwilio = (payload: Record<string, unknown>) => {
      if (twilioWs.readyState === WebSocket.OPEN) {
        twilioWs.send(JSON.stringify(payload));
      }
    };

    const persistTranscript = (speaker: 'REP' | 'PROSPECT', text: string, tsMs: number) => {
      if (!callId) return;
      this.db.insert(schema.callTranscript).values({ callId, tsMs, speaker, text, isFinal: true })
        .catch((err: Error) => this.logger.error(`Transcript persist error: ${err.message}`));
    };

    const emitTranscript = (speaker: 'REP' | 'PROSPECT', text: string) => {
      if (!callId) return;
      const tsMs = nextTs();
      this.gateway.emitToCall(callId, 'transcript.final', { speaker, text, tsMs, isFinal: true });
      persistTranscript(speaker, text, tsMs);
    };

    const closeAll = () => {
      if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.close();
      }
      if (callId) {
        this.db.update(schema.calls)
          .set({ status: 'COMPLETED' })
          .where(eq(schema.calls.id, callId))
          .catch((err: Error) => this.logger.error(`Call status update error: ${err.message}`));
        this.gateway.emitToCall(callId, 'call.ended', { callId });
      }
    };

    const startOpenAI = async (cId: string) => {
      const [callRow] = await this.db
        .select({
          orgId: schema.calls.orgId,
          agentId: schema.calls.agentId,
          preparedOpenerText: schema.calls.preparedOpenerText,
          contactJson: schema.calls.contactJson,
        })
        .from(schema.calls)
        .where(eq(schema.calls.id, cId))
        .limit(1);

      if (!callRow) {
        this.logger.error(`AI call not found: ${cId}`);
        twilioWs.close();
        return;
      }

      const orgId = callRow.orgId;
      const contactCfg = (callRow.contactJson ?? {}) as Record<string, unknown>;
      const selectedVoice = (typeof contactCfg.aiVoice === 'string' ? contactCfg.aiVoice : 'marin') as string;
      const selectedModel = (typeof contactCfg.aiModel === 'string' ? contactCfg.aiModel : 'gpt-4o-mini-realtime-preview') as string;

      // Start OpenAI WS connection + load context in parallel (saves ~150ms)
      const contextPromise = Promise.all([
        this.db
          .select({
            companyName: schema.salesContext.companyName,
            whatWeSell: schema.salesContext.whatWeSell,
            targetCustomer: schema.salesContext.targetCustomer,
            globalValueProps: schema.salesContext.globalValueProps,
            proofPoints: schema.salesContext.proofPoints,
          })
          .from(schema.salesContext)
          .where(eq(schema.salesContext.orgId, callRow.orgId))
          .limit(1)
          .then((rows) => rows[0] ?? null),
        this.db
          .select({ name: schema.products.name, elevatorPitch: schema.products.elevatorPitch })
          .from(schema.products)
          .where(eq(schema.products.orgId, callRow.orgId)),
        callRow.agentId
          ? this.db
              .select({ prompt: schema.agents.prompt, promptDelta: schema.agents.promptDelta, openers: schema.agents.openers })
              .from(schema.agents)
              .where(eq(schema.agents.id, callRow.agentId))
              .limit(1)
              .then((rows) => rows[0] ?? null)
          : Promise.resolve(null),
      ]);

      openaiWs = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=${selectedModel}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'OpenAI-Beta': 'realtime=v1',
          },
        },
      );

      openaiWs.on('open', async () => {
        this.logger.log(`OpenAI Realtime connected for AI call ${cId} (model=${selectedModel}, voice=${selectedVoice})`);

        // Context is likely already loaded by now; await just in case
        const [ctxRow, productRows, agentRow] = await contextPromise;

        const toList = (val: unknown): string[] =>
          Array.isArray(val) ? val.filter((v): v is string => typeof v === 'string') : [];

        const openers = toList(agentRow?.openers);
        const opener =
          callRow.preparedOpenerText?.trim() ||
          (openers.length > 0 ? openers[0] : null) ||
          `Hi, this is Alex from ${ctxRow?.companyName || 'our company'}. Quick question — do you have 30 seconds?`;

        const strategy = agentRow?.promptDelta?.trim() || agentRow?.prompt?.trim() || '';

        const prompt = buildAiCallerPrompt({
          companyName: ctxRow?.companyName ?? '',
          whatWeSell: ctxRow?.whatWeSell ?? '',
          targetCustomer: ctxRow?.targetCustomer ?? '',
          globalValueProps: toList(ctxRow?.globalValueProps),
          proofPoints: toList(ctxRow?.proofPoints),
          products: productRows,
          strategy,
          opener,
        });

        openaiWs!.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: prompt,
            voice: selectedVoice,
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: { model: 'whisper-1', language: 'en' },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 600,
            },
          },
        }));
      });

      openaiWs.on('message', (rawData) => {
        let event: { type: string; [key: string]: unknown };
        try {
          event = JSON.parse(rawData.toString());
        } catch {
          return;
        }

        switch (event.type) {
          case 'session.updated': {
            // Only trigger opener AFTER config is applied (not on session.created)
            if (!sessionReady) {
              sessionReady = true;
              this.logger.log(`OpenAI session configured for AI call ${cId}`);
              openaiWs!.send(JSON.stringify({ type: 'response.create', response: { modalities: ['audio', 'text'] } }));
            }
            break;
          }

          case 'response.audio.delta': {
            // AI rep speech — send to Twilio (to prospect's phone)
            const delta = event.delta as string;
            if (delta && streamSid) {
              const mulawPayload = openAIToTwilio(delta);
              sendToTwilio({
                event: 'media',
                streamSid,
                media: { payload: mulawPayload },
              });
            }
            break;
          }

          case 'response.audio_transcript.delta': {
            const text = event.delta as string;
            if (text) {
              if (!aiSpeechStartedAt) aiSpeechStartedAt = Date.now();
              partialAiText += text;
              this.gateway.emitToCall(cId, 'transcript.partial', {
                speaker: 'REP',
                text: partialAiText,
                tsMs: aiSpeechStartedAt,
                isFinal: false,
              });
            }
            break;
          }

          case 'response.audio_transcript.done': {
            const text = event.transcript as string;
            const finalText = text?.trim() || partialAiText.trim();
            partialAiText = '';
            if (finalText) {
              emitTranscript('REP', finalText);
            }
            aiSpeechStartedAt = null;
            break;
          }

          case 'conversation.item.input_audio_transcription.completed': {
            const text = event.transcript as string;
            if (text?.trim()) {
              emitTranscript('PROSPECT', text.trim());
            }
            break;
          }

          case 'response.done': {
            const usage = event.usage as {
              input_tokens?: number;
              output_tokens?: number;
              input_token_details?: { audio_tokens?: number; text_tokens?: number };
              output_token_details?: { audio_tokens?: number; text_tokens?: number };
            } | undefined;
            if (usage && orgId) {
              const totalInput = Number(usage.input_tokens ?? 0);
              const totalOutput = Number(usage.output_tokens ?? 0);
              const audioInput = Number(usage.input_token_details?.audio_tokens ?? 0);
              const audioOutput = Number(usage.output_token_details?.audio_tokens ?? 0);
              const textInput = Math.max(0, totalInput - audioInput);
              const textOutput = Math.max(0, totalOutput - audioOutput);
              if (textInput > 0 || textOutput > 0) {
                void this.creditsService.debitForAiUsage(
                  orgId, selectedModel, textInput, textOutput,
                  'USAGE_LLM_AI_CALLER_REALTIME', { call_id: cId },
                );
              }
              if (audioInput > 0 || audioOutput > 0) {
                void this.creditsService.debitForRealtimeAudio(
                  orgId, selectedModel, audioInput, audioOutput,
                  'USAGE_AUDIO_AI_CALLER_REALTIME', { call_id: cId },
                );
              }
            }
            break;
          }

          case 'error': {
            const errPayload = event.error && typeof event.error === 'object'
              ? (event.error as Record<string, unknown>)
              : {};
            const message = typeof errPayload['message'] === 'string' ? errPayload['message'] : '';
            this.logger.error(`OpenAI error for AI call ${cId}: ${message}`);
            break;
          }
        }
      });

      openaiWs.on('error', (err) => {
        this.logger.error(`OpenAI WS error for AI call ${cId}: ${err.message}`);
      });

      openaiWs.on('close', () => {
        this.logger.log(`OpenAI WS closed for AI call ${cId}`);
      });
    };

    // If callId was pre-set via handover from MediaStreamService, start OpenAI immediately
    if (callId) {
      void startOpenAI(callId);
    }

    // Handle Twilio Media Stream messages
    twilioWs.on('message', (rawData) => {
      let msg: { event: string; [key: string]: unknown };
      try {
        msg = JSON.parse(rawData.toString());
      } catch {
        return;
      }

      switch (msg.event) {
        case 'connected':
          this.logger.log('Twilio media stream connected');
          break;

        case 'start': {
          // Skip if already initialized via handover from MediaStreamService
          if (callId) break;

          const startData = msg.start as Record<string, unknown> | undefined;
          streamSid = (msg.streamSid ?? startData?.streamSid) as string | null;
          const customParams = (startData?.customParameters ?? {}) as Record<string, unknown>;
          callId = (customParams['callId'] ?? null) as string | null;

          if (!callId) {
            this.logger.error('AI call stream started without callId in customParameters');
            twilioWs.close();
            return;
          }

          this.logger.log(`AI call stream started — callId=${callId} streamSid=${streamSid}`);
          void startOpenAI(callId);
          break;
        }

        case 'media': {
          if (!openaiWs || openaiWs.readyState !== WebSocket.OPEN) break;
          const mediaPayload = msg.media as Record<string, unknown> | undefined;
          const track = mediaPayload?.track as string | undefined;
          // Only process inbound audio (from the prospect)
          if (track !== 'inbound' && track !== undefined) break;
          const payload = mediaPayload?.payload as string | undefined;
          if (!payload) break;

          try {
            const pcm16Payload = twilioToOpenAI(payload);
            openaiWs.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: pcm16Payload,
            }));
          } catch (err) {
            this.logger.warn(`Audio transcoding error: ${(err as Error).message}`);
          }
          break;
        }

        case 'stop':
          this.logger.log(`AI call stream stopped — callId=${callId}`);
          closeAll();
          break;
      }
    });

    twilioWs.on('error', (err) => {
      this.logger.error(`Twilio WS error for AI call ${callId}: ${err.message}`);
      closeAll();
    });

    twilioWs.on('close', () => {
      this.logger.log(`Twilio WS closed for AI call ${callId}`);
      closeAll();
    });
  }

  /**
   * Engine-based AI call: Realtime handles VAD + STT for prospect audio only.
   * Engine decides what the AI rep says. TTS generates speech → Twilio.
   * This ensures the AI Caller uses the same copilot brain as live outbound coaching.
   */
  private handleEngineBasedAiCallSession(
    twilioWs: WebSocket,
    initialCallId: string | null,
    initialStreamSid: string | null,
  ) {
    let callId: string | null = initialCallId;
    let streamSid: string | null = initialStreamSid;
    let openaiWs: WebSocket | null = null;
    let sessionReady = false;
    let lastTsMs = Date.now();
    let speakingTts = false;

    const nextTs = () => {
      const now = Date.now();
      lastTsMs = now > lastTsMs ? now : lastTsMs + 1;
      return lastTsMs;
    };

    const sendToTwilio = (payload: Record<string, unknown>) => {
      if (twilioWs.readyState === WebSocket.OPEN) {
        twilioWs.send(JSON.stringify(payload));
      }
    };

    const persistTranscript = (speaker: 'REP' | 'PROSPECT', text: string, tsMs: number) => {
      if (!callId) return;
      this.db.insert(schema.callTranscript).values({ callId, tsMs, speaker, text, isFinal: true })
        .catch((err: Error) => this.logger.error(`Transcript persist error: ${err.message}`));
    };

    const emitTranscript = (speaker: 'REP' | 'PROSPECT', text: string) => {
      if (!callId) return;
      const tsMs = nextTs();
      this.gateway.emitToCall(callId, 'transcript.final', { speaker, text, tsMs, isFinal: true });
      persistTranscript(speaker, text, tsMs);
    };

    const closeAll = () => {
      if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.close();
      }
      if (callId) {
        this.engineService!.unregisterTickCallback(callId);
        this.engineService!.stop(callId);
        this.db.update(schema.calls)
          .set({ status: 'COMPLETED' })
          .where(eq(schema.calls.id, callId))
          .catch((err: Error) => this.logger.error(`Call status update error: ${err.message}`));
        this.gateway.emitToCall(callId, 'call.ended', { callId });
      }
    };

    /**
     * Speak text via TTS and send audio to Twilio.
     * Converts 24kHz PCM from TTS to 8kHz mulaw for Twilio.
     */
    const speakViaTts = async (text: string, voice: string, cId: string, oId: string) => {
      speakingTts = true;
      try {
        const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini-tts',
            voice,
            input: text,
            response_format: 'pcm',
          }),
        });

        if (!ttsRes.ok) {
          this.logger.error(`TTS failed for AI call ${cId}: ${ttsRes.status}`);
          return;
        }

        const pcmBuffer = Buffer.from(await ttsRes.arrayBuffer());

        // Debit TTS credits
        void this.creditsService.debitForAiUsage(
          oId, 'gpt-4o-mini-tts', 0, text.length,
          'USAGE_TTS_AI_CALLER', { call_id: cId },
        );

        // Stream chunks to Twilio (convert 24kHz PCM → 8kHz mulaw)
        // Chunk at 4800 bytes (100ms at 24kHz 16-bit) for smooth streaming
        const CHUNK_SIZE = 4800;
        for (let offset = 0; offset < pcmBuffer.length; offset += CHUNK_SIZE) {
          if (twilioWs.readyState !== WebSocket.OPEN || !streamSid) break;
          const chunk = pcmBuffer.subarray(offset, Math.min(offset + CHUNK_SIZE, pcmBuffer.length));
          const mulawPayload = ttsToTwilio(chunk);
          sendToTwilio({
            event: 'media',
            streamSid,
            media: { payload: mulawPayload },
          });
        }

        // Emit REP transcript
        emitTranscript('REP', text);
      } finally {
        speakingTts = false;

        // Clear Realtime input buffer to prevent echo from TTS playback
        if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
          openaiWs.send(JSON.stringify({ type: 'input_audio_buffer.clear' }));
        }
      }
    };

    const startEngineSession = async (cId: string) => {
      const [callRow] = await this.db
        .select({
          orgId: schema.calls.orgId,
          agentId: schema.calls.agentId,
          preparedOpenerText: schema.calls.preparedOpenerText,
          contactJson: schema.calls.contactJson,
        })
        .from(schema.calls)
        .where(eq(schema.calls.id, cId))
        .limit(1);

      if (!callRow) {
        this.logger.error(`AI call not found: ${cId}`);
        twilioWs.close();
        return;
      }

      const orgId = callRow.orgId;
      const contactCfg = (callRow.contactJson ?? {}) as Record<string, unknown>;
      const selectedVoice = (typeof contactCfg.aiVoice === 'string' ? contactCfg.aiVoice : 'marin') as string;

      // Load context for opener
      const [ctxRow, , agentRow] = await Promise.all([
        this.db
          .select({ companyName: schema.salesContext.companyName })
          .from(schema.salesContext)
          .where(eq(schema.salesContext.orgId, callRow.orgId))
          .limit(1)
          .then((rows) => rows[0] ?? null),
        Promise.resolve(null),
        callRow.agentId
          ? this.db
              .select({ openers: schema.agents.openers })
              .from(schema.agents)
              .where(eq(schema.agents.id, callRow.agentId))
              .limit(1)
              .then((rows) => rows[0] ?? null)
          : Promise.resolve(null),
      ]);

      const toList = (val: unknown): string[] =>
        Array.isArray(val) ? val.filter((v): v is string => typeof v === 'string') : [];
      const openers = toList(agentRow?.openers);
      const opener =
        callRow.preparedOpenerText?.trim() ||
        (openers.length > 0 ? openers[0] : null) ||
        `Hi, this is Alex from ${ctxRow?.companyName || 'our company'}. Quick question — do you have 30 seconds?`;

      // Start Engine for this call (same brain as outbound coaching)
      this.engineService!.start(cId, false);

      // Register tick callback — Engine suggestions become AI rep speech
      this.engineService!.registerTickCallback(cId, (say: string) => {
        if (!say || speakingTts) return;
        this.logger.debug(`Engine tick callback for AI call ${cId}: "${say.substring(0, 60)}..."`);
        void speakViaTts(say, selectedVoice, cId, orgId);
      });

      // Connect to Realtime for VAD + STT (prospect audio only, no response generation)
      openaiWs = new WebSocket(
        'wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview',
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'OpenAI-Beta': 'realtime=v1',
          },
        },
      );

      openaiWs.on('open', () => {
        this.logger.log(`Engine-based AI call: Realtime connected for STT — call ${cId}`);

        // Configure for STT only (text modality = no audio output)
        openaiWs!.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text'],
            instructions: 'Transcribe audio input only. Do not generate meaningful responses.',
            voice: selectedVoice,
            input_audio_format: 'pcm16',
            input_audio_transcription: { model: 'whisper-1', language: 'en' },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 600,
            },
          },
        }));
      });

      openaiWs.on('message', (rawData) => {
        let event: { type: string; [key: string]: unknown };
        try {
          event = JSON.parse(rawData.toString());
        } catch {
          return;
        }

        switch (event.type) {
          case 'session.updated': {
            if (!sessionReady) {
              sessionReady = true;
              this.logger.log(`Engine-based AI call: STT session ready — call ${cId}`);
              // Speak the opener immediately via TTS (don't wait for Engine)
              void speakViaTts(opener!, selectedVoice, cId, orgId);
            }
            break;
          }

          case 'conversation.item.input_audio_transcription.completed': {
            // Prospect's speech transcribed
            const text = (event.transcript as string)?.trim();
            if (!text) break;

            this.logger.debug(`Engine AI call prospect said (${cId}): "${text.substring(0, 80)}"`);
            emitTranscript('PROSPECT', text);

            // Push to Engine — the tick callback will fire with the response to speak
            this.engineService!.pushTranscript(cId, 'PROSPECT', text);
            break;
          }

          case 'response.done': {
            // Ignore auto-responses from Realtime (text-only mode)
            // Debit the minimal text tokens used by auto-response
            const usage = event.usage as {
              input_tokens?: number;
              output_tokens?: number;
            } | undefined;
            if (usage && orgId) {
              const textIn = Number(usage.input_tokens ?? 0);
              const textOut = Number(usage.output_tokens ?? 0);
              if (textIn > 0 || textOut > 0) {
                void this.creditsService.debitForAiUsage(
                  orgId, 'gpt-4o-mini-realtime-preview', textIn, textOut,
                  'USAGE_LLM_AI_CALLER_REALTIME_STT', { call_id: cId },
                );
              }
            }
            break;
          }

          case 'error': {
            const errPayload = event.error && typeof event.error === 'object'
              ? (event.error as Record<string, unknown>)
              : {};
            const message = typeof errPayload['message'] === 'string' ? errPayload['message'] : '';
            if (!/active response|invalid_state|already/i.test(message)) {
              this.logger.error(`Engine AI call Realtime error (${cId}): ${message}`);
            }
            break;
          }
        }
      });

      openaiWs.on('error', (err) => {
        this.logger.error(`Engine AI call Realtime WS error (${cId}): ${err.message}`);
      });

      openaiWs.on('close', () => {
        this.logger.log(`Engine AI call Realtime WS closed — call ${cId}`);
      });
    };

    // If callId was pre-set via handover, start immediately
    if (callId) {
      void startEngineSession(callId);
    }

    // Handle Twilio Media Stream messages
    twilioWs.on('message', (rawData) => {
      let msg: { event: string; [key: string]: unknown };
      try {
        msg = JSON.parse(rawData.toString());
      } catch {
        return;
      }

      switch (msg.event) {
        case 'connected':
          this.logger.log('Engine AI call: Twilio media stream connected');
          break;

        case 'start': {
          if (callId) break; // Already initialized via handover

          const startData = msg.start as Record<string, unknown> | undefined;
          streamSid = (msg.streamSid ?? startData?.streamSid) as string | null;
          const customParams = (startData?.customParameters ?? {}) as Record<string, unknown>;
          callId = (customParams['callId'] ?? null) as string | null;

          if (!callId) {
            this.logger.error('Engine AI call stream started without callId');
            twilioWs.close();
            return;
          }

          this.logger.log(`Engine AI call stream started — callId=${callId} streamSid=${streamSid}`);
          void startEngineSession(callId);
          break;
        }

        case 'media': {
          if (!openaiWs || openaiWs.readyState !== WebSocket.OPEN) break;
          const mediaPayload = msg.media as Record<string, unknown> | undefined;
          const track = mediaPayload?.track as string | undefined;
          if (track !== 'inbound' && track !== undefined) break;
          const payload = mediaPayload?.payload as string | undefined;
          if (!payload) break;

          // Don't forward audio during TTS playback (prevents echo)
          if (speakingTts) break;

          try {
            const pcm16Payload = twilioToOpenAI(payload);
            openaiWs.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: pcm16Payload,
            }));
          } catch (err) {
            this.logger.warn(`Audio transcoding error: ${(err as Error).message}`);
          }
          break;
        }

        case 'stop':
          this.logger.log(`Engine AI call stream stopped — callId=${callId}`);
          closeAll();
          break;
      }
    });

    twilioWs.on('error', (err) => {
      this.logger.error(`Twilio WS error for Engine AI call ${callId}: ${err.message}`);
      closeAll();
    });

    twilioWs.on('close', () => {
      this.logger.log(`Twilio WS closed for Engine AI call ${callId}`);
      closeAll();
    });
  }
}
