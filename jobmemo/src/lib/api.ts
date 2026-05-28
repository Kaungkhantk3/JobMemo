import { NextResponse } from "next/server";

export function jsonError(message: string, status = 500, details?: unknown) {
  const payload: Record<string, unknown> = { error: message };

  if (details) payload.details = details;

  return NextResponse.json(payload, { status });
}
