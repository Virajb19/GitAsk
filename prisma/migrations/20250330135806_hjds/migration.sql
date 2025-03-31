/*
  Warnings:

  - You are about to drop the column `isIndexed` on the `Project` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('INDEXING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "isIndexed",
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'INDEXING';

-- DropEnum
DROP TYPE "projectStatus";
