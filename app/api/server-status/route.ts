import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ip = process.env.FIVEM_SERVER_IP || "23.26.146.221:30120";

    const [playersRes, infoRes] = await Promise.all([
      fetch(`http://${ip}/players.json`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }),
      fetch(`http://${ip}/info.json`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }),
    ]);

    if (!playersRes.ok || !infoRes.ok) {
      return NextResponse.json(
        {
          online: false,
          players: 0,
          max: 0,
          message: "No se pudo consultar el servidor.",
        },
        { status: 200 }
      );
    }

    const players = await playersRes.json();
    const info = await infoRes.json();

    return NextResponse.json({
      online: true,
      players: Array.isArray(players) ? players.length : 0,
      max: Number(info?.vars?.sv_maxClients || 0),
      message: "Servidor online",
    });
  } catch {
    return NextResponse.json(
      {
        online: false,
        players: 0,
        max: 0,
        message: "Servidor offline o no accesible.",
      },
      { status: 200 }
    );
  }
}