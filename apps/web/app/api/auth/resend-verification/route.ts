import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/lib/server-env';

const API = getApiBaseUrl();

export async function POST() {
  if (!API) {
    return NextResponse.json(
      { message: 'Service configuration is incomplete.' },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return NextResponse.json(
      { message: 'Not authenticated' },
      { status: 401 },
    );
  }

  try {
    const res = await fetch(`${API}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10_000),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: 'Service is temporarily unavailable.' },
      { status: 503 },
    );
  }
}
