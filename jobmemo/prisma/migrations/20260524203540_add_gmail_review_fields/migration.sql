-- AlterTable
ALTER TABLE "GmailEmailReview" ADD COLUMN     "applicationId" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "confidence" INTEGER,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "role" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'gmail',
ADD COLUMN     "status" TEXT,
ADD COLUMN     "syncedAt" TIMESTAMP(3),
ADD COLUMN     "threadId" TEXT;

-- CreateTable
CREATE TABLE "ApplicationEvent" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "emailSubject" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApplicationEvent_applicationId_createdAt_idx" ON "ApplicationEvent"("applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "Application_userId_status_idx" ON "Application"("userId", "status");

-- CreateIndex
CREATE INDEX "GmailEmailReview_userId_applicationId_idx" ON "GmailEmailReview"("userId", "applicationId");

-- AddForeignKey
ALTER TABLE "ApplicationEvent" ADD CONSTRAINT "ApplicationEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GmailEmailReview" ADD CONSTRAINT "GmailEmailReview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;
