const submissionsRepository = require('./submissions.repository');
const submissionsQueue = require('../../queues/submissions.queue');

const SUPPORTED_LANGUAGES = new Set(['javascript', 'python', 'cpp', 'java']);

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeLanguage(language) {
  return typeof language === 'string' ? language.trim().toLowerCase() : '';
}

function toQueueErrorMessage(error) {
  if (!error) {
    return 'Unknown queue error';
  }

  const message = typeof error.message === 'string' ? error.message : String(error);
  return message.slice(0, 500);
}

function ensureSubmissionPayload({ problemId, language, sourceCode }) {

  let parsedProblemId;

  if(typeof problemId === 'string' || typeof problemId === 'number') {
      parsedProblemId = Number(problemId);
  } else {
    throw createHttpError('problemId must be a string or a number', 400);
  }

  if (!Number.isInteger(parsedProblemId) || parsedProblemId <= 0) {
    throw createHttpError('problemId must be a positive integer', 400);
  }

  const normalizedLanguage = normalizeLanguage(language);

  if (!normalizedLanguage) {
    throw createHttpError('language is required', 400);
  }

  if (!SUPPORTED_LANGUAGES.has(normalizedLanguage)) {
    throw createHttpError('Unsupported language', 400);
  }

  if (typeof sourceCode !== 'string' || sourceCode.trim() === '') {
    throw createHttpError('sourceCode is required', 400);
  }

  return {
    problemId: parsedProblemId,
    language: normalizedLanguage,
    sourceCode,
  };
}

async function initSubmissionsModule() {
  await submissionsRepository.ensureSubmissionsTables();
}

async function createSubmission({ userId, problemId, language, sourceCode }) { 
  const payload = ensureSubmissionPayload({ problemId, language, sourceCode });
  const hasProblem = await submissionsRepository.problemExists(payload.problemId);

  if (!hasProblem) {
    throw createHttpError('Problem not found', 404);
  }

  const createdSubmission = await submissionsRepository.createSubmission({
    userId,
    problemId: payload.problemId,
    language: payload.language,
    sourceCode: payload.sourceCode,
    status: 'queued',
    verdict: null,
    queueJobId: null,
    queueError: null,
  });

  try {
    const createdJob = await submissionsQueue.enqueueSubmissionJob({
      submissionId: createdSubmission.id,
      userId,
      problemId: payload.problemId,
      language: payload.language,
      sourceCode: payload.sourceCode,
      createdAt: createdSubmission.created_at,
    });

    const queueJobId = createdJob?.id != null ? String(createdJob.id) : null;

    await submissionsRepository.updateSubmissionQueueTracking(createdSubmission.id, {
      status: 'queued',
      queueJobId,
      queueError: null,
    });
  } catch (error) {
    await submissionsRepository.updateSubmissionQueueTracking(createdSubmission.id, {
      status: 'queue_error',
      queueJobId: null,
      queueError: toQueueErrorMessage(error),
    });

    throw createHttpError(
      `Submission ${String(createdSubmission.id)} was created but could not be enqueued`,
      503,
    );
  }

  return {
    id: createdSubmission.id,
    status: createdSubmission.status,
    verdict: createdSubmission.verdict,
    createdAt: createdSubmission.created_at,
  };
}

module.exports = {
  initSubmissionsModule,
  createSubmission,
  ensureSubmissionPayload,
  SUPPORTED_LANGUAGES,
};