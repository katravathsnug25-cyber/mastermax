import { NextResponse } from 'next/server';

const BASE_URL =
  process.env.FREELLM_API_BASE ?? 'http://localhost:3001/v1';
const API_KEY =
  process.env.FREELLM_API_KEY ?? 'freellmapi-65177c08f67112390d20126ccb8ea4c0eea66ee707eecccc';
const DEFAULT_MODEL = process.env.FREELLM_DEFAULT_MODEL ?? 'auto';

interface ChatRequestBody {
  messages: { role: string; content: string }[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;

    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: body.model ?? DEFAULT_MODEL,
        messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens,
        stream: true,
        stream_options: { include_usage: true },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json(
        { error: `FreeLLMAPI ${res.status}: ${text}` },
        { status: res.status },
      );
    }

    return new Response(res.body, {
      status: res.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
