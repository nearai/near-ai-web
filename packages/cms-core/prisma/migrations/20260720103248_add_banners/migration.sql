-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('TOP', 'MODAL', 'BOTTOM');

-- CreateEnum
CREATE TYPE "BannerFrequency" AS ENUM ('ALWAYS', 'ONCE_PER_SESSION', 'DONT_SHOW_AGAIN');

-- CreateEnum
CREATE TYPE "BannerContentMode" AS ENUM ('EDITOR', 'HTML');

-- AlterTable
ALTER TABLE "Media" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "excludeFromSitemap" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastEditedById" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BannerType" NOT NULL DEFAULT 'TOP',
    "paths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "frequency" "BannerFrequency" NOT NULL DEFAULT 'ALWAYS',
    "contentMode" "BannerContentMode" NOT NULL DEFAULT 'EDITOR',
    "content" JSONB,
    "htmlContent" TEXT,
    "modalDelaySeconds" INTEGER,
    "modalScrollPercent" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "dismissCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Banner_enabled_idx" ON "Banner"("enabled");

-- CreateIndex
CREATE INDEX "FormSubmission_formId_idx" ON "FormSubmission"("formId");

-- CreateIndex
CREATE INDEX "FormSubmission_createdAt_idx" ON "FormSubmission"("createdAt");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_lastEditedById_fkey" FOREIGN KEY ("lastEditedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
