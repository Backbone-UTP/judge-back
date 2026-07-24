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

router.get('/:id', authGuard, async (req, res, next) => {
    try {
        const { id } = req.params;

        if(!/^\d+$/.test(id)) {
            return res.status(400).json({
                message: 'id must be a numeric value'
            })
        }

        const problem = await problemsService.getProblemDetail(id);
        
        if (!problem) {
            return res.status(404).json({
                message: 'Problem not found'
            });
        }

        return res.status(200).json(problem);
    } catch (error) {
        return next(error);
    }
});


module.exports = router;