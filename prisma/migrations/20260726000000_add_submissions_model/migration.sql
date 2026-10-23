-- CreateTable
CREATE TABLE "submissions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "problem_id" BIGINT NOT NULL,
    "language" TEXT NOT NULL,
    "source_code" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "verdict" TEXT,
    "execution_time_ms" INTEGER,
    "memory_kb" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "submissions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "submissions_user_id_idx" ON "submissions"("user_id");
CREATE INDEX "submissions_problem_id_idx" ON "submissions"("problem_id");