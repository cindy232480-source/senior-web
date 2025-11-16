-- CreateEnum
CREATE TYPE "ChatSource" AS ENUM ('MATCH', 'ACTIVITY_CARD', 'ACTIVITY_TRIP');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "source" "ChatSource";
