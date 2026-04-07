export async function doesDiscordUserStillHaveAdminRole(discordId: string) {
  const guildId = process.env.DISCORD_ADMIN_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const allowedRoleIds = (process.env.DISCORD_ALLOWED_ADMIN_ROLE_IDS || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  if (!guildId) {
    throw new Error("Falta DISCORD_ADMIN_GUILD_ID");
  }

  if (!botToken) {
    throw new Error("Falta DISCORD_BOT_TOKEN");
  }

  if (allowedRoleIds.length === 0) {
    throw new Error("Falta DISCORD_ALLOWED_ADMIN_ROLE_IDS");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
      }
    );

    if (res.status === 404) {
      console.error("Discord admin check: usuario no encontrado en el servidor", {
        guildId,
        discordId,
      });
      return false;
    }

    if (!res.ok) {
      const text = await res.text();
      console.error("Discord admin check error:", res.status, text);
      throw new Error(`Discord devolvió ${res.status}: ${text}`);
    }

    const member = (await res.json()) as { roles?: string[]; user?: { username?: string } };
    const roles = member.roles || [];

    console.log("Discord admin check OK", {
      discordId,
      guildId,
      username: member.user?.username,
      rolesEncontrados: roles,
      rolesPermitidos: allowedRoleIds,
    });

    return allowedRoleIds.some((roleId) => roles.includes(roleId));
  } finally {
    clearTimeout(timeout);
  }
}