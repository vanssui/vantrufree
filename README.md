# VANTRUFREE Portfolio

Первая версия портфолио-сайта VANTRUFREE в модульной статической архитектуре.

## Структура

```text
VANTRUFREE-portfolio/
├── assets/
│   └── images/        # фотографии и визуальные материалы
├── data/
│   └── content.js     # тексты, кейсы, видео, направления
├── scripts/
│   └── main.js        # рендеринг секций, анимации, модалки, фоновые сцены
├── styles/
│   ├── base.css       # переменные, reset, базовые стили
│   ├── layout.css     # сетка, секции, responsive-раскладка
│   └── sections.css   # hero, cards, editorial, cases, video
└── index.html         # каркас страницы
```

## Как редактировать

### 1. Добавить или поменять тексты

Открой:

`data/content.js`

Там лежат:
- `proofPills`
- `disciplines`
- `caseStudies`
- `workflow`
- `principles`
- `videos`
- `foodPills`
- `editorial`

### 2. Добавить новые фото

Скопируй изображения в:

`assets/images/`

Потом обнови пути в:

- `index.html` для статичных изображений
- `content.js`, если захочешь сделать дополнительные галереи через данные

### 3. Добавить новое YouTube-видео

В `data/content.js` добавь новый объект в массив `videos`:

```js
{
  youtubeId: "VIDEO_ID",
  title: "Название",
  meta: "Короткий тип работы",
  text: "Краткое описание"
}
```

### 4. Добавить новый кейс

В `data/content.js` добавь новый объект в `caseStudies`.

У кейса сейчас такая логика:
- `meta` — тип проекта
- `title` — название
- `summary` — что это за продукт
- `impact` — зачем он важен для портфолио
- `stack` — технологии
- `highlights` — ключевые возможности
- `accent` — `gold`, `amber` или `ice`

### 5. Отправка заявок

Форма заявки отключена: сайт больше не собирает данные и не отправляет их в Telegram автоматически.
В контактах оставлены только прямые ссылки на Telegram, Instagram и почту.

Старые backend-заготовки сохранены в проекте как архивная опция, если позже нужно будет вернуть серверную отправку:

- `backend/server.mjs` — Node.js-вариант для `POST /api/leads`.
- `api/leads.php` — PHP-вариант для Beget/shared hosting.
- `api/config.local.example.php` — шаблон закрытого PHP-конфига.
- `backend/.env.example` — шаблон переменных окружения.

Если отправку заявок нужно вернуть, сначала нужно заново добавить форму на страницу и явно указать endpoint.

Быстрый запуск старого backend-варианта:

```bash
cd backend
cp .env.example .env
node --env-file=.env server.mjs
```

Нужно заполнить:

- `BOT_TOKEN` — токен вашего бота.
- `CHAT_ID` — ваш приватный chat id (или id админ-чата).
- `ALLOWED_ORIGIN` — домены сайта через запятую (например, `https://nolclub.ru,https://www.nolclub.ru,https://yoummgqh.beget.tech`).

Если на хостинге нет SSH или неудобно настраивать переменные окружения:

1. Скопируйте `api/config.local.example.php` в `api/config.local.php`.
2. Впишите реальные `BOT_TOKEN`, `CHAT_ID` и домены сайта.
3. Загрузите `api/config.local.php` на хостинг рядом с `api/leads.php`.
4. Не коммитьте этот файл: он добавлен в `.gitignore`, а `.htaccess` закрывает прямой доступ к `config.local.php`.

Как узнать `CHAT_ID`:

1. Напишите сообщение вашему боту в Telegram.
2. Откройте `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`.
3. Возьмите `message.chat.id` из ответа.

Пример проксирования в Nginx:

```nginx
location /api/leads {
  proxy_pass http://127.0.0.1:8787/api/leads;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Как открыть локально

Из папки проекта:

```bash
python3 -m http.server 4321
```

Потом открой:

```text
http://127.0.0.1:4321
```

## Что можно улучшить дальше

- добавить реальные скриншоты кейсов вместо стилизованных системных карточек;
- вынести контакты в отдельный конфиг;
- сделать отдельную страницу `editorial`;
- добавить CMS или markdown-based админку;
- подключить форму заявок и аналитику;
- вынести секции в компонентный фреймворк, если захочешь потом перейти на `Next.js`.
