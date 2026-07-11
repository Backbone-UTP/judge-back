const fs = require('fs/promises');
const path = require('path');

const TEST_CASES_DIR = path.resolve(__dirname, '../../files/test-cases');

async function getAllTestCases(problemId) {
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
      const notFoundError = new Error('Test cases file not found');
      notFoundError.statusCode = 404;
      throw notFoundError;
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