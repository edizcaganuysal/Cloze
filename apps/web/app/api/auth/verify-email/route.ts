import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/server-env';

const API = getApiBaseUrl();

export async function GET(request: Request) {
  if (!API) {
    return NextResponse.json(
      { message: 'Service configuration is incomplete.' },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') ?? '';

  try {
    const res = await fetch(
      `${API}/auth/verify-email?token=${encodeURIComponent(token)}`,
      { signal: AbortSignal.timeout(10_000) },
    );

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: 'Verification service is temporarily unavailable.' },
      { status: 503 },
    );
  }
}
