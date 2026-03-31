import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("whitelist_categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { message: "No se pudieron cargar las categorías.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ categories: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error interno al cargar las categorías.",
      },
      { status: 500 }
    );
  }
}