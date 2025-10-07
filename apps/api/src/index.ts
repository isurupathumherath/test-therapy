import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { createLogger } from './config/logger.js';
import { connectMongo } from './db/mongo.js';
import { createRateLimiterMiddleware } from './config/rateLimit.js';
import { healthRouter } from './routes/health.js';
import { chatRouter } from './routes/chat.js';
import { moodsRouter } from './routes/moods.js';
import { sessionsRouter } from './routes/sessions.js';
import { audioRouter } from './routes/audio.js';
import { usersRouter } from './routes/users.js';
import { stripeWebhookRouter, stripeRouter } from './routes/stripe.js';
import { errorHandler } from './middleware/errors.js';
import { getEnv } from './config/env.js';

const env = getEnv();
const logger = createLogger();

async function main() {
  await connectMongo(env.MONGODB_URI);

  const app = express();

  // Stripe webhook must use raw body; mount before JSON parser strictly at that path
  app.use('/v1/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookRouter());

  app.use(cors());
  app.use(helmet());
  app.use(compression());
  app.use(pinoHttp({ logger }));
  app.use(createRateLimiterMiddleware());
  app.use(express.json({ limit: '2mb' }));

  app.use('/health', healthRouter());
  app.use('/v1', chatRouter());
  app.use('/v1', moodsRouter());
  app.use('/v1', sessionsRouter());
  app.use('/v1', audioRouter());
  app.use('/v1', stripeRouter());
  app.use('/v1', usersRouter());

  app.use(errorHandler);

  const port = env.PORT;
  app.listen(port, () => {
    logger.info({ port }, 'API listening');
  });
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start API');
  process.exit(1);
});
