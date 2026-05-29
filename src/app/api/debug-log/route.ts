import { NextResponse } from "next/server";
import { appendFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-dynamic";

type Payload = {
  sessionId?: string;
  runId?: string;
  hypothesisId?: string;
  location?: string;
  message?: string;
  data?: unknown;
  timestamp?: number;
};

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  try {
    const payload = (await req.json()) as Payload;
    if (payload?.sessionId !== "c3018a") {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const logPath = join(process.cwd(), ".cursor", "debug-c3018a.log");
    await appendFile(logPath, `${JSON.stringify(payload)}\n`, "utf8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

