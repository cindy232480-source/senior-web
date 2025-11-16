/*
  Warnings:

  - A unique constraint covering the columns `[likerId,likedId]` on the table `Match` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Match_likerId_idx" ON "Match"("likerId");

-- CreateIndex
CREATE INDEX "Match_likedId_idx" ON "Match"("likedId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_likerId_likedId_key" ON "Match"("likerId", "likedId");
