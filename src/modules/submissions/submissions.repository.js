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
      queueJobId: submission.queueJobId,
      queueError: submission.queueError,
    },
  });

  return {
    id: String(created.id),
    status: created.status,
    verdict: created.verdict,
    queue_job_id: created.queueJobId,
    queue_error: created.queueError,
    created_at: created.createdAt,
    updated_at: created.updatedAt,
  };
}

async function updateSubmissionQueueTracking(id, { status, queueJobId, queueError }) {
  const updated = await prisma.submission.update({
    where: { id: BigInt(id) },
    data: {
      status,
      queueJobId,
      queueError,
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    queue_job_id: updated.queueJobId,
    queue_error: updated.queueError,
    updated_at: updated.updatedAt,
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
    id: String(submission.id),
    user_id: submission.userId,
    problem_id: submission.problemId,
    language: submission.language,
    source_code: submission.sourceCode,
    status: submission.status,
    verdict: submission.verdict,
    queue_job_id: submission.queueJobId,
    queue_error: submission.queueError,
    created_at: submission.createdAt,
    updated_at: submission.updatedAt,
  };
}

module.exports = {
  ensureSubmissionsTables,
  createSubmission,
  updateSubmissionQueueTracking,
  problemExists,
  findSubmissionById,
};