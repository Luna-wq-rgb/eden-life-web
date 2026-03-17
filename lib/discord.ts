type ReviewResult = "approved" | "rejected";

type SubmitPayload = {
  rpName: string;
  email: string;
  discordId: string;
  discordUser: string;
};

type ReviewPayload = {
  discordId: string;
  rpName: string;
  email: string;
  result: ReviewResult;
};

async function send(webhookUrl: string | undefined, content: string) {
  if (!webhookUrl) {
    return;
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  });
}

export async function notifyDiscordNewWhitelist(payload: SubmitPayload) {
  await send(
    process.env.DISCORD_WH_WEBHOOK_URL,
    [
      "📥 **Nueva whitelist recibida en Eden Life**",
      `Usuario: <@${payload.discordId}>`,
      `Discord: ${payload.discordUser}`,
      `Correo: ${payload.email}`,
      `Nombre RP: ${payload.rpName}`,
      "Estado: Pendiente"
    ].join("\n")
  );
}

export async function notifyDiscordReview(payload: ReviewPayload) {
  const status = payload.result === "approved"
    ? "✅ **Whitelist aprobada**"
    : "❌ **Whitelist rechazada**";

  const extra = payload.result === "approved"
    ? "Resultado: Aprobada"
    : "Resultado: Reprobada, vuelve a intentarlo";

  await send(
    process.env.DISCORD_RESULTS_WEBHOOK_URL || process.env.DISCORD_WH_WEBHOOK_URL,
    [
      status,
      `Usuario: <@${payload.discordId}>`,
      `Correo: ${payload.email}`,
      `Nombre RP: ${payload.rpName}`,
      extra
    ].join("\n")
  );
}
