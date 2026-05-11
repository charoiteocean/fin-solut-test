# Fin-Solut Test — Notifications Pipeline

Микросервисная архитектура на NestJS с RabbitMQ и Telegram Bot API.

- **Producer** (`apps/producer`) — REST API, валидирует payload, генерирует UUID, публикует событие в RabbitMQ с publisher confirms.
- **Consumer** (`apps/consumer`) — подписан на `q.consumer`, проверяет идемпотентность (Postgres), перепубликовывает в `q.notifier`.
- **Notifier** (`apps/notifier`) — подписан на `q.notifier`, проверяет идемпотентность, отправляет уведомление в Telegram через `grammy`.

## Стек

NestJS 10, TypeScript 5, RabbitMQ 3 (`amqp-connection-manager`), PostgreSQL 16 + TypeORM, `grammy`, `class-validator`, Swagger, Jest, Docker Compose.

## Запуск

Перед тестированием  необходимо начать общение с ботом, чтобы он мог отправить вам сообщение

# Вписать в .env реальный TELEGRAM_BOT_TOKEN (получить через @BotFather)

### Dev: инфраструктура в докере, приложения локально

# Установка зависимостей
```bash
npm ci
```

```bash
# 1) (rabbitmq + postgres)
docker compose up -d

# 2) Приложения — каждое в своём терминале
npm run start:dev producer
npm run start:dev consumer
npm run start:dev notifier
```

### Prod

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

После старта (в любом сценарии):
- **Swagger:** http://localhost:3000/api/docs
- **RabbitMQ Management UI:** http://localhost:15672 (guest / guest)
- **Postgres:** localhost:5433 (user `app`, password `app`, database `app`)

## Отправить уведомление

```bash
curl -X POST http://localhost:3000/notifications \
  -H 'content-type: application/json' \
  -d '{"title":"Test","message":"Hello","chatId":"YOUR_CHAT_ID"}'
```

## Тесты

### Unit-тесты (Jest)

```bash
npx jest apps/producer
npx jest apps/consumer
npx jest apps/notifier
# или сразу всё:
npx jest
```

### E2E (полный pipeline через MockServer)

```bash
npm run test:e2e
```