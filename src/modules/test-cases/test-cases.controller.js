const { Router } = require('express');
const testCasesService = require('./test-cases.service');
const { authGuard } = require('../auth/auth.middleware');

const router = Router();

router.get('/public/:problemId', async (req, res, next) => {
  try {
    const { problemId } = req.params;
    const testCases = await testCasesService.getPublicTestCases(problemId);

    return res.status(200).json(testCases);
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ 
        message: error.message,
        statusCode: 404
      });
    }
    if (error.statusCode === 400) {
      return res.status(400).json({ 
        message: error.message,
        statusCode: 400
      });
    }
    return next(error);
  }
});

router.get('/:problemId', authGuard, async (req, res, next) => {
  try {
    const { problemId } = req.params;
    const testCases = await testCasesService.getAllTestCases(problemId);

    return res.status(200).json(testCases);
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ 
        message: error.message,
        statusCode: 404
      });
    }
    if (error.statusCode === 400) {
      return res.status(400).json({ 
        message: error.message,
        statusCode: 400
      });
    }
    return next(error);
  }
});

module.exports = router;