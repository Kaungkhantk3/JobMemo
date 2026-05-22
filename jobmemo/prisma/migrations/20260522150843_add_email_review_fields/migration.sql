-- CreateTable
CREATE TABLE "GmailEmailReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gmailMessageId" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "userCorrectedStatus" TEXT,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GmailEmailReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GmailEmailReview_userId_hidden_idx" ON "GmailEmailReview"("userId", "hidden");

-- CreateIndex
CREATE INDEX "GmailEmailReview_userId_reviewed_idx" ON "GmailEmailReview"("userId", "reviewed");

-- CreateIndex
CREATE UNIQUE INDEX "GmailEmailReview_userId_gmailMessageId_key" ON "GmailEmailReview"("userId", "gmailMessageId");

-- AddForeignKey
ALTER TABLE "GmailEmailReview" ADD CONSTRAINT "GmailEmailReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
