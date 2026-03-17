import { NextResponse } from "next/server";
import { readRules } from "@/lib/rules";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await readRules();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al leer normativas.";
    return NextResponse.json({ message }, { status: 500 });
  }
}