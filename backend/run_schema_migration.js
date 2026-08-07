const { Client } = require('pg');

const client = new Client({
  user: 'postgres.xxsycsowpatnziamtkee',
  password: 'Nawazish@29',
  host: 'aws-0-ap-northeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  console.log('Connecting to Supabase PostgreSQL...');
  await client.connect();
  console.log('Connected! Creating all database tables...');

  const sql = `
    CREATE TABLE IF NOT EXISTS "AgentUser" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "username" TEXT UNIQUE NOT NULL,
      "email" TEXT UNIQUE NOT NULL,
      "mobile" TEXT,
      "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      "assignedPlayersCount" INTEGER NOT NULL DEFAULT 0,
      "walletBalance" DECIMAL NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "PaymentSettings" (
      "id" TEXT PRIMARY KEY DEFAULT 'default',
      "upiId" TEXT NOT NULL DEFAULT 'playverse@upi',
      "upiName" TEXT NOT NULL DEFAULT 'PLAYVERSE GAMING',
      "qrCodeUrl" TEXT,
      "minDeposit" DECIMAL NOT NULL DEFAULT 100,
      "maxDeposit" DECIMAL NOT NULL DEFAULT 100000,
      "isEnabled" BOOLEAN NOT NULL DEFAULT true,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "DepositRequest" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL,
      "username" TEXT NOT NULL,
      "agentName" TEXT DEFAULT 'Agent 1',
      "amount" DECIMAL NOT NULL,
      "gateway" TEXT NOT NULL DEFAULT 'UPI QR',
      "utr" TEXT NOT NULL,
      "screenshotUrl" TEXT,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "rejectReason" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "WithdrawalRequest" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "userId" TEXT NOT NULL,
      "username" TEXT NOT NULL,
      "agentName" TEXT DEFAULT 'Agent 1',
      "amount" DECIMAL NOT NULL,
      "bankName" TEXT NOT NULL,
      "accountNumber" TEXT NOT NULL,
      "ifsc" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "rejectReason" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "agentId" TEXT;

    INSERT INTO "PaymentSettings" ("id", "upiId", "upiName", "qrCodeUrl", "minDeposit", "maxDeposit", "isEnabled")
    VALUES ('default', 'playverse@upi', 'PLAYVERSE GAMING', NULL, 100, 100000, true)
    ON CONFLICT ("id") DO NOTHING;
  `;

  await client.query(sql);
  console.log('🎉🎉🎉 SUCCESS: AgentUser, PaymentSettings, DepositRequest, WithdrawalRequest TABLES CREATED IN POSTGRESQL DB!');
  await client.end();
}

migrate().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
