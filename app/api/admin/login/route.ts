import { NextResponse } from "next/server";
import {
  createAdminSession,
  getAdminSession,
  isAdminPasswordValid,
} from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const currentSession = await getAdminSession();

    if (!currentSession) {
      return NextResponse.json(
        { message: "Primero inicia sesión con Discord." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const password = body?.password?.toString?.().trim?.();

    if (!password) {
      return NextResponse.json(
        { message: "Debes introducir la clave." },
        { status: 400 }
      );
    }

    if (!isAdminPasswordValid(password)) {
      return NextResponse.json(
        { message: "Clave incorrecta." },
        { status: 401 }
      );
    }

    await createAdminSession({
      discordId: currentSession.discordId,
      discordUsername: currentSession.discordUsername,
      passwordVerified: true,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "No se pudo iniciar sesión." },
      { status: 500 }
    );
  }
}