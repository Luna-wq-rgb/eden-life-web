import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { doesDiscordUserStillHaveAdminRole, getAdminSession } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Ruta delete whitelist activa.",
  });
}

export async function POST(req: Request) {
  try {
    const adminSession = await getAdminSession();

    if (!adminSession?.passwordVerified) {
      return NextResponse.json(
        { message: "No autorizado." },
        { status: 401 }
      );
    }

    const stillAllowed = await doesDiscordUserStillHaveAdminRole(
      adminSession.discordId
    );

    if (!stillAllowed) {
      return NextResponse.json(
        { message: "Tu cuenta ya no tiene permisos de admin/staff." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const categoryId = String(body.categoryId || "").trim();

    if (!categoryId) {
      return NextResponse.json(
        { message: "Falta la categoría." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: category, error: categoryError } = await supabase
      .from("whitelist_categories")
      .select("id, title")
      .eq("id", categoryId)
      .maybeSingle();

    if (categoryError) {
      return NextResponse.json(
        {
          message: "No se pudo validar la categoría.",
          details: categoryError.message,
        },
        { status: 500 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { message: "La whitelist no existe." },
        { status: 404 }
      );
    }

    const { error: applicationsError } = await supabase
      .from("whitelist_applications")
      .delete()
      .eq("category_id", categoryId);

    if (applicationsError) {
      return NextResponse.json(
        {
          message: "No se pudieron eliminar las solicitudes de esta whitelist.",
          details: applicationsError.message,
        },
        { status: 500 }
      );
    }

    const { error: deleteCategoryError } = await supabase
      .from("whitelist_categories")
      .delete()
      .eq("id", categoryId);

    if (deleteCategoryError) {
      return NextResponse.json(
        {
          message: "No se pudo eliminar la whitelist.",
          details: deleteCategoryError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Whitelist "${category.title}" eliminada correctamente.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error interno al eliminar la whitelist.",
      },
      { status: 500 }
    );
  }
}