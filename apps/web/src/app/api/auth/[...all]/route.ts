import { getAuth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const auth = getAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Auth database not configured' }, { status: 503 });
  }
  const handler = toNextJsHandler(auth.handler);
  return handler.GET(request);
}

export async function POST(request: Request) {
  const auth = getAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Auth database not configured' }, { status: 503 });
  }
  const handler = toNextJsHandler(auth.handler);
  return handler.POST(request);
}
