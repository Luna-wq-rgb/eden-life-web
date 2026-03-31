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

function parseQuestions(rawQuestions: string) {
  return rawQuestions
    .split("\n")
    .map((question) => question.trim())
    .filter(Boolean)
    .map((label, index) => ({
      id: `question_${index + 1}`,
      label,
      placeholder: `Respuesta para: ${label}`,
      required: true,
    }));
}

export async function POST(req: Request) {
  try {
    const adminSession = await getAdminSession();

    if (!adminSession?.passwordVerified) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    const stillAllowed = await doesDiscordUserStillHaveAdminRole(adminSession.discordId);

    if (!stillAllowed) {
      return NextResponse.json(
        { message: "Tu cuenta ya no tiene permisos de staff/admin." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const title = body.title?.toString().trim();
    const description = body.description?.toString().trim() || null;
    const questionsInput = body.questions?.toString() ?? "";
    const questions = parseQuestions(questionsInput);

    if (!title) {
      return NextResponse.json(
        { message: "Debes escribir el nombre de la whitelist." },
        { status: 400 }
      );
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { message: "Debes agregar al menos una pregunta personalizada." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const baseSlug = slugify(title);
    const slug = `${baseSlug || "whitelist"}-${Date.now().toString().slice(-6)}`;

    const { error } = await supabase.from("whitelist_categories").insert({
      title,
      slug,
      description,
      is_active: true,
      questions,
      created_by: adminSession.discordUsername,
    });

    if (error) {
      return NextResponse.json(
        { message: "No se pudo crear la whitelist.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Whitelist creada correctamente." });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error interno al crear la whitelist";

    return NextResponse.json({ message }, { status: 500 });
  }
}