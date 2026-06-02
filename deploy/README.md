# VANTRUFREE deploy

## Beget shared hosting

For Beget shared hosting, use the PHP endpoint:

- `.htaccess` rewrites `/api/leads` to `api/leads.php`.
- `api/leads.php` sends the lead to Telegram Bot API.

Add these variables to the production `.htaccess` on Beget. Do not commit real secrets:

```apache
SetEnv BOT_TOKEN "1234567890:YOUR_TELEGRAM_BOT_TOKEN"
SetEnv CHAT_ID "123456789"
SetEnv ALLOWED_ORIGIN "https://nolclub.ru,https://www.nolclub.ru,https://yoummgqh.beget.tech"
```

The personal Telegram `CHAT_ID` can be the same numeric id used in existing bot admin configs.

If SSH or hosting environment variables are not available, use a private PHP config instead:

1. Copy `api/config.local.example.php` to `api/config.local.php`.
2. Put real `BOT_TOKEN`, `CHAT_ID` and `ALLOWED_ORIGIN` values there.
3. Upload `api/config.local.php` next to `api/leads.php`.
4. Do not commit it. The repository ignores it, and `.htaccess` blocks direct access to `config.local.php`.

Test after deploy:

```bash
curl -i -X POST https://nolclub.ru/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","contact":"@test","task":"automation","taskLabel":"Автоматизация","message":"Проверка","language":"ru","source":"VANTRUFREE portfolio","page":"https://nolclub.ru","createdAt":"2026-06-01T00:00:00.000Z"}'
```

## VPS with Node.js

The static portfolio can stay on GitHub Pages. The form sends leads to:

```text
https://nolclub.ru/api/vantrufree/leads
```

Expected project path on VPS:

```text
/opt/vantrufree
```

Create environment file:

```bash
cd /opt/vantrufree/backend
cp .env.example .env
nano .env
```

Required values:

```env
PORT=8787
BOT_TOKEN=1234567890:YOUR_TELEGRAM_BOT_TOKEN
CHAT_ID=123456789
ALLOWED_ORIGIN=https://nolclub.ru,https://www.nolclub.ru,https://yoummgqh.beget.tech
```

Install and start systemd service:

```bash
sudo cp /opt/vantrufree/deploy/vantrufree-leads.service /etc/systemd/system/vantrufree-leads.service
sudo systemctl daemon-reload
sudo systemctl enable vantrufree-leads
sudo systemctl restart vantrufree-leads
sudo systemctl status vantrufree-leads
```

If the VPS uses Caddy with the existing NOL bot, add the route from
`deploy/caddy-vantrufree-api.conf` before the existing `reverse_proxy bot:8080`,
then reload Caddy:

```bash
docker compose restart caddy
```

If the VPS uses Nginx, add `deploy/nginx-api-location.conf` inside the existing
site `server { ... }` block, then reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Test from VPS:

```bash
curl -i -X POST http://127.0.0.1:8787/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","contact":"@test","task":"automation","taskLabel":"Автоматизация","message":"Проверка","language":"ru","source":"VANTRUFREE portfolio","page":"https://nolclub.ru","createdAt":"2026-06-01T00:00:00.000Z"}'
```

Test public endpoint:

```bash
curl -i -X POST https://nolclub.ru/api/vantrufree/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","contact":"@test","task":"automation","taskLabel":"Автоматизация","message":"Проверка","language":"ru","source":"VANTRUFREE portfolio","page":"https://nolclub.ru","createdAt":"2026-06-01T00:00:00.000Z"}'
```
