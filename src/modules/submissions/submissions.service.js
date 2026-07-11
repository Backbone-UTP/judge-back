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

function ensureSubmissionPayload({ problemId, language, sourceCode }) {
  const parsedProblemId = Number(problemId);

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
  });

  await submissionsQueue.enqueueSubmissionJob({
    submissionId: createdSubmission.id,
    userId,
    problemId: payload.problemId,
    language: payload.language,
    sourceCode: payload.sourceCode,
    createdAt: createdSubmission.created_at,
  });

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