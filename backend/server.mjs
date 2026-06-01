import http from "node:http";

const PORT = Number(process.env.PORT || 8787);
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

const requiredFields = ["name", "contact", "task", "message"];

const sendJson = (res, status, payload) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
  });
  res.end(JSON.stringify(payload));
};

const normalize = (value) => String(value || "").trim();

const escapeHtml = (value) =>
  normalize(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const buildTelegramMessage = (payload) => {
  const lines = [
    "<b>Новая заявка с портфолио</b>",
    `Имя: ${escapeHtml(payload.name)}`,
    `Контакт: ${escapeHtml(payload.contact)}`,
    `Задача: ${escapeHtml(payload.taskLabel || payload.task)}`,
    `Язык: ${escapeHtml(payload.language)}`,
    `Источник: ${escapeHtml(payload.source)}`,
    `Страница: ${escapeHtml(payload.page)}`,
    `Время: ${escapeHtml(payload.createdAt)}`,
    "",
    "<b>Описание</b>",
    escapeHtml(payload.message)
  ];

  return lines.join("\n");
};

const requestHandler = async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== "POST" || req.url !== "/api/leads") {
    sendJson(res, 404, { ok: false, error: "Not found" });
    return;
  }

  if (!BOT_TOKEN || !CHAT_ID) {
    sendJson(res, 500, { ok: false, error: "Server is not configured" });
    return;
  }

  let raw = "";
  req.on("data", (chunk) => {
    raw += chunk;
    if (raw.length > 100_000) {
      req.destroy();
    }
  });

  req.on("end", async () => {
    try {
      const body = JSON.parse(raw || "{}");
      const missing = requiredFields.filter((field) => !normalize(body[field]));
      if (missing.length) {
        sendJson(res, 400, { ok: false, error: `Missing fields: ${missing.join(", ")}` });
        return;
      }

      const text = buildTelegramMessage(body);
      const tgResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true
        })
      });

      if (!tgResponse.ok) {
        const details = await tgResponse.text();
        sendJson(res, 502, { ok: false, error: "Telegram API request failed", details });
        return;
      }

      sendJson(res, 200, { ok: true });
    } catch (error) {
      sendJson(res, 400, { ok: false, error: "Invalid JSON payload", details: String(error) });
    }
  });
};

http.createServer(requestHandler).listen(PORT, () => {
  console.log(`Lead API is running on port ${PORT}`);
});
