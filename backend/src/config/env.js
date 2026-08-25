import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(
      `Missing required environment variable ${name}. ` +
        'Copy .env.example to .env and fill it in.',
    );
    process.exit(1);
  }
  return value;
}

export const config = Object.freeze({
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5001),
  mongoUri: required('MONGODB_URI'),
  /** Comma-separated list of browser origins allowed to call the API. */
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
});
