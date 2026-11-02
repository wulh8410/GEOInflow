import { spawnSync } from 'node:child_process';

// Run as a single release operation with the production environment supplied.
// Never run database migrations or import demo data on HTTP cold starts.
for (const name of ['DATABASE_URL', 'APP_SECRET', 'TWO_FACTOR_ENCRYPTION_KEY']) {
  if (!process.env[name]) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}
const steps = [
  ['scripts/liekan-schema-check.mjs', '--migrations-only', '--allow-pending'],
  ['scripts/check-db.js'],
  ['scripts/liekan-schema-check.mjs'],
  ['scripts/liekan-migrate.mjs'],
  ['scripts/liekan-queue-bootstrap.mjs'],
  ['scripts/update-tracker.js'],
];
if (process.argv.includes('--seed-demo')) {
  steps.splice(4, 0, ['scripts/liekan-seed-demo.mjs', '--automatic']);
}
for (const args of steps) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env: process.env });
  if (result.error || result.status !== 0) {
    console.error(`Release operation failed: ${args[0]}`);
    process.exit(result.status || 1);
  }
}
console.log('Database initialization completed. Enable both Vercel daemons before production use.');
