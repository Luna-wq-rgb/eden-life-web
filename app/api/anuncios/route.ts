import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("server_announcements")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = getSupabaseAdmin();

  if (body.isFeatured) {
    await supabase
      .from("server_announcements")
      .update({ is_featured: false })
      .neq("id", "");
  }

  const { data, error } = await supabase
    .from("server_announcements")
    .insert([
      {
        title: body.title,
        content: body.content,
        image_url: body.imageUrl || null,
        video_url: body.videoUrl || null,
        button_text: body.buttonText || null,
        button_url: body.buttonUrl || null,
        is_featured: body.isFeatured || false,
        created_by: body.admin
      }
    ])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}