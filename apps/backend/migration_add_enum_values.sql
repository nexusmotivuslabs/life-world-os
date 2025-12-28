-- Add new enum values to RealityNodeCategory
-- Run this manually in your database if Prisma migrate fails

ALTER TYPE "RealityNodeCategory" ADD VALUE IF NOT EXISTS 'CROSS_SYSTEM';
ALTER TYPE "RealityNodeCategory" ADD VALUE IF NOT EXISTS 'SYSTEM_TIER';
ALTER TYPE "RealityNodeCategory" ADD VALUE IF NOT EXISTS 'SYSTEM';
