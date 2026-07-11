const { Router } = require('express');
const submissionsService = require('./submissions.service');
const { authGuard } = require('../auth/auth.middleware');

const router = Router();

router.post('/', authGuard, async (req, res, next) => {
  try {
    const submission = await submissionsService.createSubmission({
      userId: req.user.id,
      problemId: req.body.problemId,
      language: req.body.language,
      sourceCode: req.body.sourceCode,
    });

    return res.status(201).json(submission);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;