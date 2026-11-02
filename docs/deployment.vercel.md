# Vercel deployment

This fork packages GEOInflow as a Vercel Container Runtime application and two Vercel Daemons. The original Docker Compose deployment remains available and unchanged.

## Required backing services

Provide an external PostgreSQL database and Redis endpoint in the same region as the app/workers. Container filesystems are ephemeral; do not run a production database inside a daemon. Configure `DATABASE_URL`, `LIEKAN_ANALYTICS_REDIS_URL`, `APP_SECRET`, `TWO_FACTOR_ENCRYPTION_KEY`, `DEFAULT_LOCALE=zh-CN`, `DISABLE_TELEMETRY=1`, and `NEXT_TELEMETRY_DISABLED=1`. Set `LIEKAN_PUBLIC_URL` to the final HTTPS origin. Keep credentials exclusively in private configuration/Vercel environment variables.

Review service quotas and costs before enabling workers. Both daemon instance counts start at zero so an initial deployment does not accidentally start two continuously running instances. This initial state is not a complete analytics deployment.

## Initialize and deploy

1. Create an independent Vercel project from this fork. Keep the personal website in its existing project. `Dockerfile.vercel` selects Container Runtime; its build follows `Dockerfile.liekan` with only the final startup command changed. Keep these Dockerfiles synchronized when upgrading upstream.
2. Build `docker build -f Dockerfile.vercel -t geoinflow-vercel .` and run `docker run --rm --env-file /path/to/private-production.env geoinflow-vercel node scripts/liekan-vercel-release.mjs` once against the production database before routing traffic. The release operation checks the schema, applies incremental migrations, initializes queues, and updates tracking assets. Preserve existing encryption keys when migrating data. The official demo bundle remains in the image; importing it requires explicitly adding `--seed-demo` to the release command. It contains over a million synthetic records and can exceed free database storage limits. Initialization can take several minutes; it must not run on request-driven cold starts. Never put the private env file in source control.
3. Deploy the web application. Verify HTTPS, sign-in and `/api/heartbeat`. Change the initial administrator password before collecting production traffic. Do not use localhost database URLs in Vercel.
4. Set both `vercel.json` daemon instance counts to one after migrations and resource approval, and deploy to production. These workers are required for logs and analytics to update. Use the same database, application secret, and Redis connection for all relevant processes. Check worker logs and queue progress; HTTP health alone does not prove worker health.
5. Configure trusted client-IP ingress according to `local-deployment.md` and Vercel's actual forwarding guarantees. Do not blindly trust a client-supplied IP header. Without trusted identity evidence, some visitor metrics remain unavailable.
6. Open the production installation page for the intended website and copy its HTTPS tracking script into that website. Browser tracking and crawler request-log ingestion are separate inputs.

The bundled city database remains in the image. Managed filesystem-based geographic updates are ephemeral on Vercel; durable update storage requires separate integration. Keep AI analysis disabled unless its keys and provider connections are explicitly configured.

## Verification status

Configuration syntax and the release preflight can be checked locally. A successful Vercel deployment, external-database release run, enabled-worker processing, trusted-IP behavior and real event/log ingestion must all be verified before declaring production monitoring complete.

References: https://vercel.com/docs/functions/runtimes/container and https://vercel.com/docs/daemons/config-reference.
