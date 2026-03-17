import { NextResponse } from "next/server";
import { getAdminSession, doesDiscordUserStillHaveAdminRole } from "@/lib/auth";
import { readRules, writeRules, type RulesDocument } from "@/lib/rules";

export const runtime = "nodejs";

function canEditRules(discordId: string) {
  const allowedIds = (process.env.RULES_ADMIN_IDS || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  if (allowedIds.length === 0) {
    return true;
  }

  return allowedIds.includes(discordId);
}

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session || !session.passwordVerified) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    const stillAllowed = await doesDiscordUserStillHaveAdminRole(session.discordId);

    if (!stillAllowed) {
      return NextResponse.json(
        { message: "Tu cuenta ya no tiene permisos de staff/admin." },
        { status: 401 }
      );
    }

    if (!canEditRules(session.discordId)) {
      return NextResponse.json(
        { message: "No tienes permiso para editar normativas." },
        { status: 403 }
      );
    }

    const data = await readRules();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();

    if (!session || !session.passwordVerified) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    const stillAllowed = await doesDiscordUserStillHaveAdminRole(session.discordId);

    if (!stillAllowed) {
      return NextResponse.json(
        { message: "Tu cuenta ya no tiene permisos de staff/admin." },
        { status: 401 }
      );
    }

    if (!canEditRules(session.discordId)) {
      return NextResponse.json(
        { message: "No tienes permiso para editar normativas." },
        { status: 403 }
      );
    }

    const body = (await req.json()) as RulesDocument;

    if (!body || !Array.isArray(body.categorias)) {
      return NextResponse.json(
        { message: "Formato inválido de normativas." },
        { status: 400 }
      );
    }

    await writeRules(body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ message }, { status: 500 });
  }
}