import { createApp } from './app.js';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './db/connect.js';

// A server that answers requests it cannot serve is worse than one that fails
// loudly at boot, so the database must be up before the port is opened.
await connectDB().catch(() => process.exit(1));

const server = createApp().listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port} (${config.env})`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    console.log(`\n${signal} received, shutting down`);
    server.close();
    await disconnectDB();
    process.exit(0);
  });
}
