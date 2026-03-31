import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { doesDiscordUserStillHaveAdminRole, getAdminSession } from "@/lib/auth";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeQuestions(raw: unknown) {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item, index) => {
      const label =
        typeof item?.label === "string"
          ? item.label.trim()
          : typeof item === "string"
          ? item.trim()
          : "";

      if (!label) return null;

      return {
        id: `question_${index + 1}`,
        label,
        placeholder: `Respuesta para: ${label}`,
        required: true,
      };
    })
    .filter(Boolean);
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

    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim() || null;
    const questions = normalizeQuestions(body.questions);

    if (!title) {
      return NextResponse.json(
        { message: "Debes escribir el nombre de la whitelist." },
        { status: 400 }
      );
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { message: "Debes agregar al menos una pregunta." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const baseSlug = slugify(title) || "whitelist";
    const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    const { data, error } = await supabase
      .from("whitelist_categories")
      .insert({
        title,
        slug,
        description,
        is_active: true,
        questions,
        created_by: adminSession.discordUsername,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        {
          message: "No se pudo crear la whitelist.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Whitelist creada correctamente.",
      category: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error interno al crear la whitelist.",
      },
      { status: 500 }
    );
  }
}