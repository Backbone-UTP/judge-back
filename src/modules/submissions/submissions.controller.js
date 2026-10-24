const { Router } = require('express');
const submissionsService = require('./submissions.service');
const { authGuard } = require('../auth/auth.middleware');

const router = Router();

router.post('/', authGuard, async (req, res, next) => {
  
  try {
    const body = req.body ?? {};

    const submission = await submissionsService.createSubmission({      
      userId: req.user.id,
      problemId: body.problemId,
      language: body.language,
      sourceCode: body.sourceCode,
    });

    return res.status(201).json(submission);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;