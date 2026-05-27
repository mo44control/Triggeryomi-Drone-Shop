#!/bin/sh
set -e

echo "==> Waiting for database to be ready..."
until pnpm --filter @workspace/db run push-force < /dev/null 2>&1; do
  echo "    Migration failed, retrying in 3s..."
  sleep 3
done

echo "==> Database schema is up to date."
echo "==> Starting API server on port ${PORT}..."
exec node --enable-source-maps /app/artifacts/api-server/dist/index.mjs
