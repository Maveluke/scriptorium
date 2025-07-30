#!/bin/sh
ls -la /app/prisma
npx prisma generate
npx prisma migrate deploy
# npx prisma db seed
npm start
# npm run dev