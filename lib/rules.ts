import fs from "fs";
import path from "path";

export type RuleGroup = {
  title: string;
  points: string[];
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

const RULES_FILE = path.join(process.cwd(), "data", "normas.json");

export function getRulesFilePath() {
  return RULES_FILE;
}

export function ensureRulesFile() {
  const dir = path.dirname(RULES_FILE);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(RULES_FILE)) {
    const initialData: RulesDocument = {
      categorias: [],
    };

    fs.writeFileSync(RULES_FILE, JSON.stringify(initialData, null, 2), "utf8");
  }
}

export function readRules(): RulesDocument {
  ensureRulesFile();
  const raw = fs.readFileSync(RULES_FILE, "utf8");
  return JSON.parse(raw) as RulesDocument;
}

export function writeRules(data: RulesDocument) {
  ensureRulesFile();
  fs.writeFileSync(RULES_FILE, JSON.stringify(data, null, 2), "utf8");
}