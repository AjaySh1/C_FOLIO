const DashboardService = require('../services/dashboardService');

class DashboardController {
  static async updateContestRankingInfo(req, res) {
    try {
      const userId = req.params.id;
      const contestData = req.body;
      const result = await DashboardService.upsertContestRankingInfo(userId, contestData);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateTotalQuestions(req, res) {
    try {
      const userId = req.params.id;
      const questionsData = req.body;
      const result = await DashboardService.upsertTotalQuestions(userId, questionsData);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getDashboardData(req, res) {
    try {
      console.log("Calling DashboardService.getDashboardData...");
      const userId = req.params.id;
      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];
      const result = await DashboardService.getDashboardData(accessToken, userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = DashboardController;