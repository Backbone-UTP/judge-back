const { Router } = require('express');
const healthService = require('./health.service');

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const health = await healthService.getHealth();
    res.status(200).json(health);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
