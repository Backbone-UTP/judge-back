const prisma = require('../../database/prisma');

async function ensureSubmissionsTables() {
  return null;
}

async function createSubmission(submission) {
  const created = await prisma.submission.create({
    data: {
      userId: BigInt(submission.userId),
      problemId: BigInt(submission.problemId),
      language: submission.language,
      sourceCode: submission.sourceCode,
      status: submission.status,
      verdict: submission.verdict,
    },
  });

  return {
    id: created.id,
    status: created.status,
    verdict: created.verdict,
    created_at: created.createdAt,
    updated_at: created.updatedAt,
  };
}

async function problemExists(problemId) {
  const problem = await prisma.problem.findUnique({
    where: { id: BigInt(problemId) },
    select: { id: true },
  });

  return Boolean(problem);
}

async function findSubmissionById(id) {
  const submission = await prisma.submission.findUnique({
    where: { id: BigInt(id) },
  });

  if (!submission) {
    return null;
  }

  return {
    id: submission.id,
    user_id: submission.userId,
    problem_id: submission.problemId,
    language: submission.language,
    source_code: submission.sourceCode,
    status: submission.status,
    verdict: submission.verdict,
    created_at: submission.createdAt,
    updated_at: submission.updatedAt,
  };
}

module.exports = {
  ensureSubmissionsTables,
  createSubmission,
  problemExists,
  findSubmissionById,
};