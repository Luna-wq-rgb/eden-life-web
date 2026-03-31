import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { doesDiscordUserStillHaveAdminRole, getAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const adminSession = await getAdminSession();

    if (!adminSession?.passwordVerified) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    const stillAllowed = await doesDiscordUserStillHaveAdminRole(adminSession.discordId);

    if (!stillAllowed) {
      return NextResponse.json(
        { message: "Tu cuenta ya no tiene permisos de admin/staff." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const categoryId = String(body.categoryId || "").trim();
    const isActive = Boolean(body.isActive);

    if (!categoryId) {
      return NextResponse.json(
        { message: "Falta la categoría." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("whitelist_categories")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId);

    if (error) {
      return NextResponse.json(
        {
          message: "No se pudo actualizar el estado de la whitelist.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: isActive
        ? "Whitelist abierta correctamente."
        : "Whitelist cerrada correctamente.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error interno al actualizar la whitelist.",
      },
      { status: 500 }
    );
  }
}