-- CreateEnum
CREATE TYPE "BannerDisplayMode" AS ENUM ('OVERLAY', 'PUSH');

-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "displayMode" "BannerDisplayMode" NOT NULL DEFAULT 'OVERLAY';
