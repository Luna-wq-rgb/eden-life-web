import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "eden_admin_session";

type AdminSession = {
  discordId: string;
  discordUsername: string;
  passwordVerified: boolean;
};

function getSecret() {
  return process.env.ADMIN_SECRET_KEY || "dev-secret";
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function encodeSession(payload: AdminSession) {
  const json = JSON.stringify(payload);
  const base64 = Buffer.from(json, "utf8").toString("base64url");
  const signature = sign(base64);
  return `${base64}.${signature}`;
}

function decodeSession(value: string): AdminSession | null {
  const [base64, signature] = value.split(".");
  if (!base64 || !signature) return null;

  const expected = sign(base64);
  if (signature !== expected) return null;

  try {
    const json = Buffer.from(base64, "base64url").toString("utf8");
    return JSON.parse(json) as AdminSession;
  } catch {
    return null;
  }
}

export async function createAdminSession(payload: AdminSession) {
  const store = await cookies();
  store.set(COOKIE_NAME, encodeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getAdminSession() {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}

export function isAdminPasswordValid(password: string) {
  const secret = process.env.ADMIN_SECRET_KEY;
  return Boolean(secret) && password === secret;
}

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

export async function isAdminAuthenticated() {
  const session = await getAdminSession();

  if (!session || !session.passwordVerified) {
    return false;
  }

  return doesDiscordUserStillHaveAdminRole(session.discordId);
}