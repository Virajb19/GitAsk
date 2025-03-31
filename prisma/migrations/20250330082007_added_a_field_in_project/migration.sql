-- CreateEnum
CREATE TYPE "projectStatus" AS ENUM ('INDEXING', 'INDEXED');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "isIndexed" BOOLEAN NOT NULL DEFAULT false;
