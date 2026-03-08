/**
 * Audio transcoding utilities for bridging Twilio (mulaw G.711 8 kHz)
 * and OpenAI Realtime API (PCM16 16 kHz).
 *
 * All functions are pure TypeScript — no native addons or external deps.
 */

// G.711 mulaw decode table (8-bit → 16-bit linear PCM)
const MULAW_DECODE_TABLE: Int16Array = (() => {
  const table = new Int16Array(256);
  for (let i = 0; i < 256; i++) {
    let mulaw = ~i & 0xff;
    const sign = mulaw & 0x80;
    mulaw &= 0x7f;
    const exponent = (mulaw >> 4) & 0x07;
    const mantissa = mulaw & 0x0f;
    let sample = ((mantissa << 1) + 33) << exponent;
    sample -= 33;
    table[i] = sign ? -sample : sample;
  }
  return table;
})();

/**
 * Decode G.711 mulaw bytes to 16-bit linear PCM samples.
 */
export function mulawDecode(mulaw: Uint8Array): Int16Array {
  const out = new Int16Array(mulaw.length);
  for (let i = 0; i < mulaw.length; i++) {
    out[i] = MULAW_DECODE_TABLE[mulaw[i]];
  }
  return out;
}

/**
 * Encode 16-bit linear PCM samples to G.711 mulaw bytes.
 */
export function mulawEncode(pcm: Int16Array): Uint8Array {
  const MULAW_MAX = 0x1fff;
  const BIAS = 0x84;
  const out = new Uint8Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) {
    let sample = pcm[i];
    let sign = 0;
    if (sample < 0) {
      sample = -sample;
      sign = 0x80;
    }
    sample += BIAS;
    if (sample > MULAW_MAX) sample = MULAW_MAX;

    let exponent = 7;
    for (let expMask = 0x4000; (sample & expMask) === 0 && exponent > 0; exponent--, expMask >>= 1) {
      /* find highest set bit */
    }
    const mantissa = (sample >> (exponent + 3)) & 0x0f;
    const mulawByte = ~(sign | (exponent << 4) | mantissa) & 0xff;
    out[i] = mulawByte;
  }
  return out;
}

/**
 * Upsample from 8 kHz to 16 kHz using linear interpolation (2× factor).
 */
export function upsample8to16(input: Int16Array): Int16Array {
  const out = new Int16Array(input.length * 2);
  for (let i = 0; i < input.length - 1; i++) {
    out[i * 2] = input[i];
    out[i * 2 + 1] = Math.round((input[i] + input[i + 1]) / 2);
  }
  // Last sample — duplicate
  out[(input.length - 1) * 2] = input[input.length - 1];
  out[(input.length - 1) * 2 + 1] = input[input.length - 1];
  return out;
}

/**
 * Downsample from 16 kHz to 8 kHz by averaging adjacent pairs (0.5× factor).
 */
export function downsample16to8(input: Int16Array): Int16Array {
  const outLen = Math.floor(input.length / 2);
  const out = new Int16Array(outLen);
  for (let i = 0; i < outLen; i++) {
    out[i] = Math.round((input[i * 2] + input[i * 2 + 1]) / 2);
  }
  return out;
}

/**
 * Upsample from 8 kHz to 24 kHz using linear interpolation (3× factor).
 * Used for Twilio → OpenAI Realtime (which expects 24 kHz PCM16).
 */
export function upsample8to24(input: Int16Array): Int16Array {
  const out = new Int16Array(input.length * 3);
  for (let i = 0; i < input.length - 1; i++) {
    const s0 = input[i];
    const s1 = input[i + 1];
    out[i * 3] = s0;
    out[i * 3 + 1] = Math.round(s0 + (s1 - s0) / 3);
    out[i * 3 + 2] = Math.round(s0 + (2 * (s1 - s0)) / 3);
  }
  // Last sample — duplicate
  const last = input[input.length - 1];
  const li = (input.length - 1) * 3;
  out[li] = last;
  out[li + 1] = last;
  out[li + 2] = last;
  return out;
}

/**
 * Full pipeline: Twilio mulaw 8 kHz base64 → PCM16 24 kHz base64 (for OpenAI Realtime).
 */
export function twilioToOpenAI(base64Mulaw: string): string {
  const mulaw = new Uint8Array(Buffer.from(base64Mulaw, 'base64'));
  const pcm8k = mulawDecode(mulaw);
  const pcm24k = upsample8to24(pcm8k);
  // Convert Int16Array to Buffer (little-endian)
  const buf = Buffer.allocUnsafe(pcm24k.length * 2);
  for (let i = 0; i < pcm24k.length; i++) {
    buf.writeInt16LE(pcm24k[i], i * 2);
  }
  return buf.toString('base64');
}

/**
 * Downsample from 24 kHz to 8 kHz by averaging every 3 samples (1/3 factor).
 * Used when converting TTS API output (24 kHz PCM) to Twilio format (8 kHz mulaw).
 */
export function downsample24to8(input: Int16Array): Int16Array {
  const outLen = Math.floor(input.length / 3);
  const out = new Int16Array(outLen);
  for (let i = 0; i < outLen; i++) {
    out[i] = Math.round((input[i * 3] + input[i * 3 + 1] + input[i * 3 + 2]) / 3);
  }
  return out;
}

/**
 * Full pipeline: TTS 24 kHz PCM raw buffer → Twilio mulaw 8 kHz base64.
 * OpenAI TTS with response_format='pcm' returns 24kHz 16-bit LE mono.
 */
export function ttsToTwilio(pcmBuffer: Buffer): string {
  const pcm24k = new Int16Array(pcmBuffer.length / 2);
  for (let i = 0; i < pcm24k.length; i++) {
    pcm24k[i] = pcmBuffer.readInt16LE(i * 2);
  }
  const pcm8k = downsample24to8(pcm24k);
  const mulaw = mulawEncode(pcm8k);
  return Buffer.from(mulaw).toString('base64');
}

/**
 * Full pipeline: OpenAI PCM16 24 kHz base64 → Twilio mulaw 8 kHz base64.
 */
export function openAIToTwilio(base64Pcm16: string): string {
  const buf = Buffer.from(base64Pcm16, 'base64');
  const pcm24k = new Int16Array(buf.length / 2);
  for (let i = 0; i < pcm24k.length; i++) {
    pcm24k[i] = buf.readInt16LE(i * 2);
  }
  const pcm8k = downsample24to8(pcm24k);
  const mulaw = mulawEncode(pcm8k);
  return Buffer.from(mulaw).toString('base64');
}
