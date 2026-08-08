-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "constraints" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "examples" JSONB NOT NULL DEFAULT '[]';
