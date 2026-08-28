const test = require('node:test');
const assert = require('node:assert/strict');

const { createApp } = require('../src/app');
const submissionsModule = require('../src/modules/submissions/submissions.module');
const submissionsRepository = require('../src/modules/submissions/submissions.repository');
const submissionsQueue = require('../src/queues/submissions.queue');
const authService = require('../src/modules/auth/auth.service');

async function startTestServer() {
  const app = await createApp([submissionsModule]);
  const server = app.listen(0);

  await new Promise((resolve) => server.once('listening', resolve));

  const { port } = server.address();

  return {
    server,
    baseUrl: `http://127.0.0.1:${port}`,
  };
}

test('POST /submissions creates a queued submission', async (t) => {
  const originalVerifyAppToken = authService.verifyAppToken;
  const originalEnsureSubmissionsTables = submissionsRepository.ensureSubmissionsTables;
  const originalCreateSubmission = submissionsRepository.createSubmission;
  const originalProblemExists = submissionsRepository.problemExists;
  const originalEnqueueSubmissionJob = submissionsQueue.enqueueSubmissionJob;

  const queueCalls = [];

  authService.verifyAppToken = () => ({ sub: 31, email: 'student@example.com' });
  submissionsRepository.ensureSubmissionsTables = async () => {};
  submissionsRepository.problemExists = async (id) => id === 9;
  submissionsRepository.createSubmission = async (submission) => ({
    id: 77,
    status: submission.status,
    verdict: submission.verdict,
    created_at: '2026-07-10T12:34:56.000Z',
  });
  submissionsQueue.enqueueSubmissionJob = async (payload) => {
    queueCalls.push(payload);
    return { id: 'job-1' };
  };

  t.after(() => {
    authService.verifyAppToken = originalVerifyAppToken;
    submissionsRepository.ensureSubmissionsTables = originalEnsureSubmissionsTables;
    submissionsRepository.createSubmission = originalCreateSubmission;
    submissionsRepository.problemExists = originalProblemExists;
    submissionsQueue.enqueueSubmissionJob = originalEnqueueSubmissionJob;
  });

  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const response = await fetch(`${baseUrl}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer fake-token',
    },
    body: JSON.stringify({
      problemId: 9,
      language: 'Python',
      sourceCode: 'print("hello")',
    }),
  });

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    id: 77,
    status: 'queued',
    verdict: null,
    createdAt: '2026-07-10T12:34:56.000Z',
  });

  assert.equal(queueCalls.length, 1);
  assert.deepEqual(queueCalls[0], {
    submissionId: 77,
    userId: 31,
    problemId: 9,
    language: 'python',
    sourceCode: 'print("hello")',
    createdAt: '2026-07-10T12:34:56.000Z',
  });
});

test('POST /submissions returns 404 when the problem does not exist', async (t) => {
  const originalVerifyAppToken = authService.verifyAppToken;
  const originalEnsureSubmissionsTables = submissionsRepository.ensureSubmissionsTables;
  const originalCreateSubmission = submissionsRepository.createSubmission;
  const originalProblemExists = submissionsRepository.problemExists;
  const originalEnqueueSubmissionJob = submissionsQueue.enqueueSubmissionJob;

  authService.verifyAppToken = () => ({ sub: 31, email: 'student@example.com' });
  submissionsRepository.ensureSubmissionsTables = async () => {};
  submissionsRepository.problemExists = async () => false;
  submissionsRepository.createSubmission = async () => {
    throw new Error('createSubmission should not be called when problem is missing');
  };
  submissionsQueue.enqueueSubmissionJob = async () => {
    throw new Error('enqueueSubmissionJob should not be called when problem is missing');
  };

  t.after(() => {
    authService.verifyAppToken = originalVerifyAppToken;
    submissionsRepository.ensureSubmissionsTables = originalEnsureSubmissionsTables;
    submissionsRepository.createSubmission = originalCreateSubmission;
    submissionsRepository.problemExists = originalProblemExists;
    submissionsQueue.enqueueSubmissionJob = originalEnqueueSubmissionJob;
  });

  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const response = await fetch(`${baseUrl}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer fake-token',
    },
    body: JSON.stringify({
      problemId: 999,
      language: 'python',
      sourceCode: 'print("hello")',
    }),
  });

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    message: 'Problem not found',
    statusCode: 404,
  });
});

test('POST /submissions rejects unsupported languages', async (t) => {
  const originalVerifyAppToken = authService.verifyAppToken;
  const originalEnsureSubmissionsTables = submissionsRepository.ensureSubmissionsTables;
  const originalProblemExists = submissionsRepository.problemExists;
  const originalCreateSubmission = submissionsRepository.createSubmission;
  const originalEnqueueSubmissionJob = submissionsQueue.enqueueSubmissionJob;

  authService.verifyAppToken = () => ({ sub: 31, email: 'student@example.com' });
  submissionsRepository.ensureSubmissionsTables = async () => {};
  submissionsRepository.problemExists = async () => true;
  submissionsRepository.createSubmission = async () => {
    throw new Error('createSubmission should not be called for unsupported languages');
  };
  submissionsQueue.enqueueSubmissionJob = async () => {
    throw new Error('enqueueSubmissionJob should not be called for unsupported languages');
  };

  t.after(() => {
    authService.verifyAppToken = originalVerifyAppToken;
    submissionsRepository.ensureSubmissionsTables = originalEnsureSubmissionsTables;
    submissionsRepository.problemExists = originalProblemExists;
    submissionsRepository.createSubmission = originalCreateSubmission;
    submissionsQueue.enqueueSubmissionJob = originalEnqueueSubmissionJob;
  });

  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const response = await fetch(`${baseUrl}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer fake-token',
    },
    body: JSON.stringify({
      problemId: 9,
      language: 'brainfuck',
      sourceCode: '++++',
    }),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    message: 'Unsupported language',
    statusCode: 400,
  });
});