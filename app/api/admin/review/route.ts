import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { addWhitelistRoleToMember } from "@/lib/discord-role";
import { getAdminSession, doesDiscordUserStillHaveAdminRole } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const adminSession = await getAdminSession();

    if (!adminSession || !adminSession.passwordVerified) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
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
        { message: "Faltan datos para revisar la whitelist." },
        { status: 400 }
      );
    }

    if (result !== "approved" && result !== "rejected") {
      return NextResponse.json(
        { message: "Resultado inválido." },
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
          message: "Error al buscar la whitelist.",
          details: fetchError.message,
        },
        { status: 500 }
      );
    }

    if (!application) {
      return NextResponse.json(
        { message: "No se encontró la whitelist." },
        { status: 404 }
      );
    }

    if (application.status !== "pendiente") {
      return NextResponse.json(
        {
          message:
            "Esta whitelist ya fue revisada. Si hubo un error, el usuario debe volver a enviarla.",
        },
        { status: 409 }
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
      .eq("status", "pendiente")
      .select("id");

    if (updateError) {
      return NextResponse.json(
        {
          message: "No se pudo actualizar el estado.",
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json(
        {
          message:
            "La whitelist ya había sido revisada. El usuario debe volver a enviarla si necesita nueva revisión.",
        },
        { status: 409 }
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
            `Categoría: ${application.category_name || "General"}\n` +
            `Usuario: <@${application.discord_id}>\n` +
            `Discord: ${application.discord_user}\n` +
            `Nombre RP: ${application.rp_name}\n` +
            `Estado: ${result === "approved" ? "Aprobada" : "Rechazada"}\n` +
            `Revisado por: ${adminSession.discordUsername}`,
        }),
      });
    }

    return NextResponse.redirect(new URL("/admin/whitelist", req.url));
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error interno al procesar la revisión.",
      },
      { status: 500 }
    );
  }
}