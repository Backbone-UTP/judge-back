const { Router } = require('express');
const testCasesService = require('./test-cases.service');

const router = Router();

router.get('/public/:problemId', async (req, res, next) => {
  try {
    const { problemId } = req.params;
    const testCases = await testCasesService.getPublicTestCases(problemId);

    return res.status(200).json(testCases);
  } catch (error) {
    return next(error);
  }
});

router.get('/:problemId', async (req, res, next) => {
  try {
    const { problemId } = req.params;
    const testCases = await testCasesService.getAllTestCases(problemId);

    return res.status(200).json(testCases);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;