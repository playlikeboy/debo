import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'debo-web',
    version: '0.1.0',
    framework: 'Next.js App Router (React 19)',
    editor: 'BlockNote 0.55.0',
    timestamp: new Date().toISOString(),
  });
}
