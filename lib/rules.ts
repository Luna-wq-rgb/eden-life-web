import { getSupabaseAdmin } from "@/lib/supabase";

export type RuleTableColumn = {
  title: string;
  items: string[];
};

export type RuleGroup = {
  title: string;
  points: string[];
  table?: {
    columns: RuleTableColumn[];
  };
};

export type RuleCategory = {
  id: string;
  emoji: string;
  label: string;
  title: string;
  intro: string;
  rules: RuleGroup[];
};

export type RulesDocument = {
  categorias: RuleCategory[];
};

const DEFAULT_RULES: RulesDocument = {
  categorias: [
    {
      id: "generales",
      emoji: "⚖️",
      label: "Base del servidor",
      title: "Normativa general",
      intro:
        "Estas reglas marcan el tono de Eden Life: respeto, fair play, interpretación coherente y cero atajos para ganar una escena.",
      rules: [
        {
          title: "Respeto y convivencia",
          points: [
            "Respeta al staff y al resto de jugadores en todo momento.",
            "No se toleran insultos, acoso o comportamientos tóxicos."
          ]
        }
      ]
    }
  ]
};

const RULES_ROW_ID = "main";

export function getDefaultRules(): RulesDocument {
  return structuredClone(DEFAULT_RULES);
}

export async function readRules(): Promise<RulesDocument> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("rules")
    .select("content")
    .eq("id", RULES_ROW_ID)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.content) {
    await writeRules(getDefaultRules());
    return getDefaultRules();
  }

  return data.content as RulesDocument;
}

export async function writeRules(nextContent: RulesDocument) {
  const supabase = getSupabaseAdmin();

  const { data: existing, error: readError } = await supabase
    .from("rules")
    .select("content")
    .eq("id", RULES_ROW_ID)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }

  const previousContent = (existing?.content as RulesDocument | null) ?? null;

  const { error: upsertError } = await supabase
    .from("rules")
    .upsert(
      {
        id: RULES_ROW_ID,
        content: nextContent,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    );

  if (upsertError) {
    throw new Error(upsertError.message);
  }

  const { error: historyError } = await supabase.from("rule_change_history").insert({
    rule_id: RULES_ROW_ID,
    old_content: previousContent,
    new_content: nextContent
  });

  if (historyError) {
    throw new Error(historyError.message);
  }
}