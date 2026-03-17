import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { addWhitelistRoleToMember } from "@/lib/discord-role";
import { getAdminSession, doesDiscordUserStillHaveAdminRole } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const adminSession = await getAdminSession();

    if (!adminSession || !adminSession.passwordVerified) {
      return NextResponse.json(
        { message: "No autorizado." },
        { status: 401 }
      );
    }

    const stillAllowed = await doesDiscordUserStillHaveAdminRole(adminSession.discordId);

    if (!stillAllowed) {
      return NextResponse.json(
        { message: "Tu cuenta ya no tiene permisos de staff/admin." },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    const formData = await req.formData();
    const id = formData.get("id")?.toString().trim();
    const result = formData.get("result")?.toString().trim() as
      | "approved"
      | "rejected";

    if (!id || !result) {
      return NextResponse.json(
        {
          message: "Faltan datos para revisar la whitelist",
          id,
          result,
        },
        { status: 400 }
      );
    }

    if (result !== "approved" && result !== "rejected") {
      return NextResponse.json(
        {
          message: "Resultado inválido",
          result,
        },
        { status: 400 }
      );
    }

    const { data: application, error: fetchError } = await supabase
      .from("whitelist_applications")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        {
          message: "Error al buscar la whitelist en Supabase",
          details: fetchError.message,
          code: fetchError.code,
        },
        { status: 500 }
      );
    }

    if (!application) {
      return NextResponse.json(
        { message: "No se encontró la whitelist", id },
        { status: 404 }
      );
    }

    const newStatus = result === "approved" ? "aprobada" : "rechazada";

    const { data: updatedRows, error: updateError } = await supabase
      .from("whitelist_applications")
      .update({
        status: newStatus,
        reviewed_by: adminSession.discordUsername,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id");

    if (updateError) {
      return NextResponse.json(
        {
          message: "No se pudo actualizar el estado en Supabase",
          details: updateError.message,
          code: updateError.code,
          id,
          newStatus,
        },
        { status: 500 }
      );
    }

    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json(
        {
          message: "Supabase no actualizó ninguna fila",
          id,
          newStatus,
        },
        { status: 500 }
      );
    }

    if (result === "approved") {
      await addWhitelistRoleToMember(application.discord_id);
    }

    const publicWebhook = process.env.DISCORD_RESULTS_WEBHOOK_URL;

    if (publicWebhook) {
      const statusText =
        result === "approved"
          ? "✅ Whitelist aprobada"
          : "❌ Whitelist rechazada. Vuelve a intentarlo";

      await fetch(publicWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content:
            `${statusText}\n` +
            `Usuario: <@${application.discord_id}>\n` +
            `Discord: ${application.discord_user}\n` +
            `Nombre RP: ${application.rp_name}\n` +
            `Estado: ${result === "approved" ? "Aprobada" : "Rechazada"}\n` +
            `Revisado por: ${adminSession.discordUsername}`,
        }),
      });
    }

    return NextResponse.redirect(new URL("/admin", req.url));
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error interno al procesar la revisión";

    return NextResponse.json({ message }, { status: 500 });
  }
}
