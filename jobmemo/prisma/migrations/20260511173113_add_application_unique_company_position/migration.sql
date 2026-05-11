/*
  Warnings:

  - A unique constraint covering the columns `[company,position]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Application_company_position_key" ON "Application"("company", "position");
