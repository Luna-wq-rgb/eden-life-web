import { NextResponse } from "next/server";
import { createAdminSession, doesDiscordUserStillHaveAdminRole } from "@/lib/auth";

type DiscordTokenResponse = {
  access_token: string;
};

type DiscordUserResponse = {
  id: string;
  username: string;
  global_name?: string | null;
};

export async function GET(req: Request) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!clientId || !clientSecret || !siteUrl) {
    return NextResponse.json(
      { message: "Faltan variables de Discord OAuth" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/admin/login?error=discord_code`);
  }

  const redirectUri = `${siteUrl}/api/admin/discord/callback`;

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${siteUrl}/admin/login?error=discord_token`);
  }

  const tokenData = (await tokenRes.json()) as DiscordTokenResponse;

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(`${siteUrl}/admin/login?error=discord_user`);
  }

  const user = (await userRes.json()) as DiscordUserResponse;

  const allowed = await doesDiscordUserStillHaveAdminRole(user.id);

  if (!allowed) {
    return NextResponse.redirect(`${siteUrl}/admin/login?error=not_allowed`);
  }

  await createAdminSession({
    discordId: user.id,
    discordUsername: user.global_name || user.username,
    passwordVerified: false,
  });

  return NextResponse.redirect(`${siteUrl}/admin/login?discord=ok`);
}