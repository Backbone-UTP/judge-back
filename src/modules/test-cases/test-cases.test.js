const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const testCasesService = require('./test-cases.service');

test('service reads and separates test cases correctly', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'judge-test-'));
  const filePath = path.join(tempDir, 'problema-1.json');

  const testData = [
    { id: 1, problem_id: 1, input: '2 3', expected_output: '5', is_sample: true, sort_order: 1 },
    { id: 2, problem_id: 1, input: '10 20', expected_output: '30', is_sample: false, sort_order: 2 },
  ];

  await fs.writeFile(filePath, JSON.stringify(testData, null, 2), 'utf8');

  const allCases = await testCasesService.getAllTestCases('1', tempDir);
  const publicCases = await testCasesService.getPublicTestCases('1', tempDir);

  assert.equal(allCases.length, 2);
  assert.equal(publicCases.length, 1);
  assert.equal(publicCases[0].is_sample, true);
});