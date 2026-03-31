import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { WhitelistQuestion } from "@/lib/types";

function normalizeAnswers(raw: unknown) {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => {
      const question =
        typeof item?.question === "string" ? item.question.trim() : "";
      const answer =
        typeof item?.answer === "string" ? item.answer.trim() : "";

      return { question, answer };
    })
    .filter((item) => item.question && item.answer);
}

function questionMap(questions: WhitelistQuestion[]) {
  return new Map(questions.map((question) => [question.label.trim(), question]));
}

async function sendNewWhitelistWebhook(payload: {
  categoryTitle: string;
  discordId: string;
  discordUser: string;
  email: string;
  rpName: string;
}) {
  const webhookUrl = process.env.DISCORD_NEW_WH_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("DISCORD_NEW_WH_WEBHOOK_URL no está configurada.");
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content:
          `📥 **Nueva whitelist recibida en Eden Life**\n` +
          `📂 **Categoría:** ${payload.categoryTitle}\n` +
          `👤 **Usuario:** <@${payload.discordId}>\n` +
          `💬 **Discord:** ${payload.discordUser}\n` +
          `📧 **Correo:** ${payload.email}\n` +
          `🎭 **Nombre RP:** ${payload.rpName}\n` +
          `📌 **Estado:** Pendiente`,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Error enviando webhook de nueva whitelist:", response.status, text);
    }
  } catch (error) {
    console.error("Fallo al enviar webhook de nueva whitelist:", error);
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const requiredBaseFields = [
      "categoryId",
      "rpName",
      "realAge",
      "characterAge",
      "email",
      "discordId",
      "discordUser",
    ];

    for (const field of requiredBaseFields) {
      if (!body[field] || !String(body[field]).trim()) {
        return NextResponse.json(
          { message: `Falta el campo ${field}` },
          { status: 400 }
        );
      }
    }

    const { data: category, error: categoryError } = await supabase
      .from("whitelist_categories")
      .select("*")
      .eq("id", String(body.categoryId).trim())
      .maybeSingle();

    if (categoryError) {
      return NextResponse.json(
        {
          message: "No se pudo validar la categoría de whitelist.",
          details: categoryError.message,
        },
        { status: 500 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { message: "La categoría de whitelist no existe." },
        { status: 404 }
      );
    }

    if (!category.is_active) {
      return NextResponse.json(
        { message: "Esta whitelist está temporalmente inactiva." },
        { status: 403 }
      );
    }

    const normalizedAnswers = normalizeAnswers(body.answers);
    const expectedQuestions = (category.questions ?? []) as WhitelistQuestion[];
    const questionsByLabel = questionMap(expectedQuestions);

    if (expectedQuestions.length === 0) {
      return NextResponse.json(
        { message: "Esta categoría no tiene preguntas configuradas." },
        { status: 400 }
      );
    }

    if (normalizedAnswers.length !== expectedQuestions.length) {
      return NextResponse.json(
        { message: "Debes responder todas las preguntas de esta whitelist." },
        { status: 400 }
      );
    }

    for (const expectedQuestion of expectedQuestions) {
      const found = normalizedAnswers.find(
        (item) => item.question.trim() === expectedQuestion.label.trim()
      );

      if (!found || !found.answer.trim()) {
        return NextResponse.json(
          { message: `Debes responder la pregunta: ${expectedQuestion.label}` },
          { status: 400 }
        );
      }
    }

    for (const answer of normalizedAnswers) {
      if (!questionsByLabel.has(answer.question.trim())) {
        return NextResponse.json(
          {
            message: `La pregunta "${answer.question}" no pertenece a esta categoría.`,
          },
          { status: 400 }
        );
      }
    }

    const acceptedRules =
      body.acceptedRules === true ||
      body.acceptedRules === "true" ||
      body.acceptedRules === "on";

    if (!acceptedRules) {
      return NextResponse.json(
        { message: "Debes aceptar las normativas." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("whitelist_applications").insert({
      rp_name: String(body.rpName).trim(),
      real_age: String(body.realAge).trim(),
      character_age: String(body.characterAge).trim(),
      email: String(body.email).trim(),
      discord_id: String(body.discordId).trim(),
      discord_user: String(body.discordUser).trim(),
      experience: "",
      rdm: "",
      vdm: "",
      metagaming: "",
      powergaming: "",
      serious_roleplay: "",
      accepted_rules: acceptedRules,
      status: "pendiente",
      category_id: category.id,
      category_name: category.title,
      answers: normalizedAnswers,
    });

    if (error) {
      return NextResponse.json(
        {
          message: "No se pudo guardar la whitelist.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    await sendNewWhitelistWebhook({
      categoryTitle: category.title,
      discordId: String(body.discordId).trim(),
      discordUser: String(body.discordUser).trim(),
      email: String(body.email).trim(),
      rpName: String(body.rpName).trim(),
    });

    return NextResponse.json({
      message: "Tu whitelist fue enviada correctamente.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error interno al enviar la whitelist.";

    return NextResponse.json({ message }, { status: 500 });
  }
}