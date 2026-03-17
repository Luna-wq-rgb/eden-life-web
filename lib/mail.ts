import nodemailer from "nodemailer";

type ReviewResult = "approved" | "rejected";

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error("Faltan variables SMTP.");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

export async function sendWhitelistReceivedEmail(to: string) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Whitelist recibida - Eden Life",
    text: [
      "Hola,",
      "",
      "Hemos recibido correctamente tu whitelist de Eden Life.",
      "En menos de 24 horas tendrás el resultado en nuestra comunidad de Discord.",
      "",
      "Gracias por tu interés en formar parte del servidor.",
      "",
      "Equipo de Eden Life"
    ].join("\n")
  });
}

export async function sendWhitelistReviewedEmail(to: string, result: ReviewResult) {
  const transporter = getTransporter();
  const approved = result === "approved";

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: approved ? "Whitelist aprobada - Eden Life" : "Whitelist rechazada - Eden Life",
    text: approved
      ? [
          "Hola,",
          "",
          "Tu whitelist de Eden Life ha sido aprobada.",
          "Revisa nuestra comunidad de Discord para continuar con el acceso al servidor.",
          "",
          "Equipo de Eden Life"
        ].join("\n")
      : [
          "Hola,",
          "",
          "Tu whitelist de Eden Life no fue aprobada esta vez.",
          "Puedes volver a intentarlo siguiendo las indicaciones del equipo y revisando las normativas del servidor.",
          "",
          "Equipo de Eden Life"
        ].join("\n")
  });
}
