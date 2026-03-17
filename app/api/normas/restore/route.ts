import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("rules")
    .upsert({
      id: "main",
      content: body.old_content,
      updated_at: new Date().toISOString()
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}