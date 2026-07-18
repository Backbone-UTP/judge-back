const { Router } = require('express');
const problemsService = require('./problems.service');
const { authGuard } = require('../auth/auth.middleware');

const router = Router();

router.get('/', authGuard, async (req, res, next) => {
    try {
        const problems = await problemsService.listProblems();
        return res.status(200).json(problems);
    } catch (error) {
        return next(error);
    }
});

module.exports = router;