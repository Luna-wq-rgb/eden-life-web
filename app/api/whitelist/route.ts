import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const requiredFields = [
      "rpName",
      "realAge",
      "characterAge",
      "email",
      "discordId",
      "discordUser",
      "experience",
      "rdm",
      "vdm",
      "metagaming",
      "powergaming",
      "seriousRoleplay",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Falta el campo ${field}` },
          { status: 400 }
        );
      }
    }

    const { error } = await supabase.from("whitelist_applications").insert({
      rp_name: body.rpName,
      real_age: body.realAge,
      character_age: body.characterAge,
      email: body.email,
      discord_id: body.discordId,
      discord_user: body.discordUser,
      experience: body.experience,
      rdm: body.rdm,
      vdm: body.vdm,
      metagaming: body.metagaming,
      powergaming: body.powergaming,
      serious_roleplay: body.seriousRoleplay,
      status: "pendiente",
    });

    if (error) {
      return NextResponse.json(
        { message: "No se pudo guardar la whitelist", details: error.message },
        { status: 500 }
      );
    }

    const adminWebhook = process.env.DISCORD_NEW_WH_WEBHOOK_URL;

    if (adminWebhook) {
      await fetch(adminWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content:
            `📥 Nueva whitelist recibida en Eden Life\n` +
            `Usuario: <@${body.discordId}>\n` +
            `Discord: ${body.discordUser}\n` +
            `Correo: ${body.email}\n` +
            `Nombre RP: ${body.rpName}\n` +
            `Estado: Pendiente`,
        }),
      });
    }

    return NextResponse.json({
      message: "Tu whitelist fue enviada correctamente.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error interno al enviar la whitelist";

    return NextResponse.json({ message }, { status: 500 });
  }
}