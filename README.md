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

### 5. Подключить отправку заявок

Форма заявки в `index.html` работает безопасно: если у формы пустой `data-lead-endpoint`, она собирает текст заявки и открывает Telegram.

Когда появится backend или serverless-функция, укажи URL в атрибуте:

```html
<form data-lead-form data-lead-endpoint="https://example.com/api/leads">
```

Endpoint должен принимать JSON и уже на сервере отправлять сообщение в Telegram Bot API. Токен Telegram-бота нельзя хранить в HTML или JavaScript сайта.

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
