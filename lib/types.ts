export type WhitelistStatus = "pendiente" | "aprobada" | "rechazada";

export type WhitelistQuestion = {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
};

export type WhitelistAnswer = {
  question: string;
  answer: string;
};

export type WhitelistCategory = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  questions: WhitelistQuestion[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

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
  category_id: string | null;
  category_name: string | null;
  answers: WhitelistAnswer[] | null;
  created_at: string;
};