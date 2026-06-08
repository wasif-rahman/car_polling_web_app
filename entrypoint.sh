#!/bin/sh
echo "Applying Prisma migrations to the Data Tier..."
npx prisma db push --accept-data-loss

echo "Starting Next.js server (Application Tier)..."
node server.js
