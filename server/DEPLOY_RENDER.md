# Render deployment steps

This document describes how to deploy the project to Render with managed Postgres and optionally managed Redis.

1) Connect GitHub repo to Render
   - Go to https://render.com and create an account.
   - Create a new Web Service and connect your GitHub repository `egemen348181-ai/duzcehub-clone`.

2) Create a Managed PostgreSQL on Render
   - In Render dashboard, create a new Database > PostgreSQL.
   - After creation, copy the DATABASE_URL value and add it to your Web Service's environment variables in Render.

3) Create a Managed Redis (optional but recommended)
   - Render offers Redis. Create a Redis instance and copy its URL (REDIS_URL). Add to Web Service env.
   - If you don't use Render Redis, you can use Upstash or another managed Redis provider.

4) Create an S3 bucket (AWS) or DigitalOcean Spaces
   - Create a bucket and obtain AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and S3_BUCKET name.
   - In Render Web Service env, add these values.

5) Environment variables (set in Render Web Service > Environment)
   - NODE_ENV=production
   - PORT=4000
   - DATABASE_URL=<render_postgres_database_url>
   - JWT_SECRET=change_this_secret
   - S3_BUCKET=<your-bucket-name>
   - AWS_REGION=<region>
   - AWS_ACCESS_KEY_ID=<key>
   - AWS_SECRET_ACCESS_KEY=<secret>
   - REDIS_URL=<redis-connection-string> (optional)
   - CLIENT_URL=https://<your-client-domain> or Render static site url

6) Build & Start commands (Render Web Service)
   - Build Command: npm ci && npm run prisma:generate && npm run build
   - Start Command: npm run start

7) Migrations & Seed
   - After DATABASE_URL is set, you can run `npx prisma migrate deploy` or `npx prisma migrate dev --name init` locally against the same DATABASE_URL.
   - Run seed script: `npm run seed` (make sure it runs against the DB on Render or your local dev DB)

8) Connect client
   - In client, set VITE_API_URL to your Render service URL (e.g. https://duzcehub.onrender.com/api)

9) (Optional) Use Render Background Worker for jobs
   - If you use BullMQ for background jobs, add a Background Worker service in Render pointing to server worker script.

Notes:
- Do not commit your AWS keys and secrets to GitHub. Use Render environment variables or GitHub Secrets for CI.
- If you prefer DigitalOcean Spaces instead of S3, set S3-compatible endpoints and the same env vars.
