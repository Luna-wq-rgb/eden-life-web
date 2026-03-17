export type WhitelistStatus = "pendiente" | "aprobada" | "rechazada";

export type WhitelistApplication = {
  id: string;
  rp_name: string;
  real_age: string;
  character_age: string;
  email: string;
  discord_id: string;
  discord_user: string;
  experience: string;
  rdm: string;
  vdm: string;
  metagaming: string;
  powergaming: string;
  serious_roleplay: string;
  accepted_rules: boolean;
  allowed_failures: number;
  status: WhitelistStatus;
  admin_note: string | null;

  reviewed_by: string | null;
  reviewed_at: string | null;

  created_at: string;
};
