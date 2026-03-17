const DISCORD_API = "https://discord.com/api/v10";

function getBotHeaders() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    throw new Error("Falta DISCORD_BOT_TOKEN en .env.local");
  }

  return {
    Authorization: `Bot ${token}`,
    "Content-Type": "application/json",
  };
}

export async function addWhitelistRoleToMember(discordUserId: string) {
  const guildId = process.env.DISCORD_GUILD_ID;
  const roleId = process.env.DISCORD_WHITELIST_ROLE_ID;

  if (!guildId) throw new Error("Falta DISCORD_GUILD_ID en .env.local");
  if (!roleId) throw new Error("Falta DISCORD_WHITELIST_ROLE_ID en .env.local");
  if (!discordUserId) throw new Error("Falta discordUserId");

  const url = `${DISCORD_API}/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: getBotHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`No se pudo asignar el rol WH. Discord respondió ${res.status}: ${text}`);
  }

  return true;
}

export async function removeWhitelistRoleFromMember(discordUserId: string) {
  const guildId = process.env.DISCORD_GUILD_ID;
  const roleId = process.env.DISCORD_WHITELIST_ROLE_ID;

  if (!guildId) throw new Error("Falta DISCORD_GUILD_ID en .env.local");
  if (!roleId) throw new Error("Falta DISCORD_WHITELIST_ROLE_ID en .env.local");
  if (!discordUserId) throw new Error("Falta discordUserId");

  const url = `${DISCORD_API}/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: getBotHeaders(),
  });

  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`No se pudo quitar el rol WH. Discord respondió ${res.status}: ${text}`);
  }

  return true;
}