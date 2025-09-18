const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware')


router.post('/:id/contest-ranking', authMiddleware, DashboardController.updateContestRankingInfo);

router.post('/:id/total-questions',authMiddleware, DashboardController.updateTotalQuestions);

router.get('/:id', authMiddleware, DashboardController.getDashboardData);

module.exports = router;