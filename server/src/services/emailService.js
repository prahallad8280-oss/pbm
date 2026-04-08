import nodemailer from "nodemailer";

const DEFAULT_FEEDBACK_EMAIL = "prahallad8280@zohomail.in";

let transporter;

const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeLine = (value = "") => value.replace(/[\r\n]+/g, " ").trim();

const isEmailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

const getFeedbackRecipient = () => process.env.FEEDBACK_TO_EMAIL || DEFAULT_FEEDBACK_EMAIL;

const getTransporter = () => {
  if (!isEmailConfigured()) {
    const error = new Error("Feedback email is not configured on the server.");
    error.statusCode = 503;
    throw error;
  }

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT);
    const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

export const sendFeedbackEmail = async ({ name, email, message, sourceUrl, userAgent }) => {
  const transport = getTransporter();
  const safeName = sanitizeLine(name);
  const safeEmail = sanitizeLine(email);
  const safeMessage = message.trim();
  const feedbackRecipient = getFeedbackRecipient();
  const submittedAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Calcutta" });
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transport.sendMail({
    from: fromAddress,
    to: feedbackRecipient,
    replyTo: safeEmail,
    subject: `New website feedback from ${safeName}`,
    text: [
      `Name: ${safeName}`,
      `Email: ${safeEmail}`,
      `Submitted: ${submittedAt}`,
      `Source: ${sourceUrl || "Unknown"}`,
      `User agent: ${userAgent || "Unknown"}`,
      "",
      "Feedback:",
      safeMessage,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #162439; line-height: 1.6;">
        <h2 style="margin-bottom: 12px;">New website feedback</h2>
        <p><strong>Name:</strong> ${escapeHtml(safeName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(safeEmail)}</p>
        <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
        <p><strong>Source:</strong> ${escapeHtml(sourceUrl || "Unknown")}</p>
        <p><strong>User agent:</strong> ${escapeHtml(userAgent || "Unknown")}</p>
        <div style="margin-top: 18px;">
          <strong>Feedback:</strong>
          <p style="white-space: pre-wrap;">${escapeHtml(safeMessage)}</p>
        </div>
      </div>
    `,
  });
};

