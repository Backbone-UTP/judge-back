const fs = require('fs/promises');
const path = require('path');

const TEST_CASES_DIR = path.resolve(__dirname, '../../files/test-cases');

async function getAllTestCases(problemId) {

  if (!/^\d+$/.test(problemId)) {
    const error = new Error('Invalid problem ID');
    error.statusCode = 400;
    throw error;
  }

  const filePath = path.join(TEST_CASES_DIR, `problema-${problemId}.json`);
  
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const testCases = JSON.parse(fileContent);
    
    if (!Array.isArray(testCases)) {
      const error = new Error('Invalid test cases format');
      error.statusCode = 500;
      throw error;
    }

    testCases.sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }
      return a.id - b.id;
    });
    
    return testCases;
  } catch (error) {
    if (error.code === 'ENOENT') {
      const err = new Error('Test cases file not found');
      err.statusCode = 404;
      throw err;
    }
    
    if (error.message === 'Unexpected token') {
      const parseError = new Error('Invalid JSON in test cases file');
      parseError.statusCode = 500;
      throw parseError;
    }
    
    throw error;
  }
}

async function getPublicTestCases(problemId) {
  const testCases = await getAllTestCases(problemId);
  
  const publicCases = testCases.filter(testCase => testCase.is_sample === true);
  
  return publicCases;
}

module.exports = {
  getAllTestCases,
  getPublicTestCases,
};