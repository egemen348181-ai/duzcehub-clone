# How to connect Render and set secrets

After you add the Web Service on Render and connect GitHub, set these Environment variables in the Render dashboard under the service's "Environment" section:

- NODE_ENV=production
- PORT=4000
- DATABASE_URL (from the managed Postgres instance)
- JWT_SECRET (random strong secret)
- S3_BUCKET
- AWS_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- REDIS_URL (optional if using managed Redis)
- CLIENT_URL (e.g., https://your-client-domain)

If you want automatic deploys, enable "Auto-Deploy" in the Render service settings.

If you use Render background workers (BullMQ), create a separate Background Worker service and point it to a worker script.
