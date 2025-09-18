const leetcodeService = require('./leetcodeService');
const codeforcesService = require('./codeforcesService');
const codechefService = require('./codechefService');
const userService = require('./userService'); // For getting usernames

class DashboardService {
  static async getDashboardData(accessToken, userId) {
    console.log("[DashboardService] Fetching dashboard data for userId:", userId);

    let userProfileArr;
    try {
      userProfileArr = await userService.getProfile(accessToken, userId);
      console.log("[DashboardService] userProfileArr:", userProfileArr);
    } catch (err) {
      console.error("[DashboardService] Error in userService.getProfile:", err);
      return null;
    }

    if (!userProfileArr || !userProfileArr[0]) {
      console.log("[DashboardService] userProfileArr is missing or invalid!");
      return null;
    }

    const userProfile = Array.isArray(userProfileArr) ? userProfileArr[0] : userProfileArr;
    console.log("[DashboardService] userProfile:", userProfile);
    console.log("[DashboardService] leetcode_username:", userProfile.leetcode_username);
    console.log("[DashboardService] codeforces_username:", userProfile.codeforces_username);
    console.log("[DashboardService] codechef_username:", userProfile.codechef_username);
    // Default stats
    let leetcodeStats = {
      leetcode_total: 0,
      leetcode_easy: 0,
      leetcode_medium: 0,
      leetcode_hard: 0
    };
    let leetcodeContest = {
      leetcode_recent_contest_rating: 0,
      leetcode_max_contest_rating: 0
    };

    if (userProfile && userProfile.leetcode_username) {
      try {
        console.log("[DashboardService] Fetching LeetCode data for:", userProfile.leetcode_username);
        const lcData = await leetcodeService.fetchUserComprehensiveData(userProfile.leetcode_username);
        console.log("[DashboardService] LeetCode data:", lcData);

        const acStats = lcData.problemsSolved?.solvedStats?.submitStatsGlobal?.acSubmissionNum || [];
        leetcodeStats.leetcode_total = acStats.find(x => x.difficulty === 'All')?.count || 0;
        leetcodeStats.leetcode_easy = acStats.find(x => x.difficulty === 'Easy')?.count || 0;
        leetcodeStats.leetcode_medium = acStats.find(x => x.difficulty === 'Medium')?.count || 0;
        leetcodeStats.leetcode_hard = acStats.find(x => x.difficulty === 'Hard')?.count || 0;

        const contest = lcData.contestRanking || {};
        leetcodeContest.leetcode_recent_contest_rating = contest.rating || 0;
        if (lcData.contestHistory && lcData.contestHistory.length > 0) {
          leetcodeContest.leetcode_max_contest_rating = Math.max(...lcData.contestHistory.map(c => c.rating || 0));
        } else {
          leetcodeContest.leetcode_max_contest_rating = contest.rating || 0;
        }
      } catch (e) {
        console.error("[DashboardService] Error fetching LeetCode data:", e);
        leetcodeStats = {
          leetcode_total: 0,
          leetcode_easy: 0,
          leetcode_medium: 0,
          leetcode_hard: 0
        };
        leetcodeContest = {
          leetcode_recent_contest_rating: 0,
          leetcode_max_contest_rating: 0
        };
      }
    }

    // Codeforces
    let codeforcesStats = { codeforces_total: 0 };
    let codeforcesContest = {
      codeforces_recent_contest_rating: 0,
      codeforces_max_contest_rating: 0
    };
    if (userProfile && userProfile.codeforces_username) {
      try {
        console.log("[DashboardService] Fetching Codeforces data for:", userProfile.codeforces_username);
        const submissions = await codeforcesService.getUserSubmissions(userProfile.codeforces_username);
        console.log("[DashboardService] Codeforces submissions:", submissions);

        const solvedSet = new Set();
        submissions.forEach(sub => {
          if (sub.verdict === "OK" && sub.problem && sub.problem.contestId && sub.problem.index) {
            solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
          }
        });
        codeforcesStats.codeforces_total = solvedSet.size;

        const userInfo = await codeforcesService.getUserInfo(userProfile.codeforces_username);
        console.log("[DashboardService] Codeforces userInfo:", userInfo);

        codeforcesContest.codeforces_recent_contest_rating = userInfo.rating || 0;
        codeforcesContest.codeforces_max_contest_rating = userInfo.maxRating || 0;
      } catch (e) {
        console.error("[DashboardService] Error fetching Codeforces data:", e);
        codeforcesStats = { codeforces_total: 0 };
        codeforcesContest = {
          codeforces_recent_contest_rating: 0,
          codeforces_max_contest_rating: 0
        };
      }
    }

    // Codechef
    let codechefStats = { codechef_total: 0 };
    let codechefContest = {
      codechef_stars: 0,
      codechef_recent_contest_rating: 0,
      codechef_max_contest_rating: 0
    };
    if (userProfile && userProfile.codechef_username) {
      try {
        console.log("[DashboardService] Fetching CodeChef data for:", userProfile.codechef_username);
        const ccData = await codechefService.extractProfileData(userProfile.codechef_username);
        console.log("[DashboardService] CodeChef data:", ccData);

        codechefStats.codechef_total = ccData.problemsSolved || 0;
        codechefContest.codechef_stars = ccData.stars || 0;
        codechefContest.codechef_recent_contest_rating = parseInt(ccData.rating) || 0;
        codechefContest.codechef_max_contest_rating = ccData.highestRating || 0;
      } catch (e) {
        console.error("[DashboardService] Error fetching CodeChef data:", e);
        codechefStats = { codechef_total: 0 };
        codechefContest = {
          codechef_stars: 0,
          codechef_recent_contest_rating: 0,
          codechef_max_contest_rating: 0
        };
      }
    }

    console.log("[DashboardService] Final stats:", {
      total_questions: [
        {
          ...leetcodeStats,
          ...codeforcesStats,
          ...codechefStats
        }
      ],
      contest_ranking_info: [
        {
          ...leetcodeContest,
          ...codeforcesContest,
          ...codechefContest
        }
      ]
    });

    // Return in the format expected by your frontend
    return {
      total_questions: [
        {
          ...leetcodeStats,
          ...codeforcesStats,
          ...codechefStats
        }
      ],
      contest_ranking_info: [
        {
          ...leetcodeContest,
          ...codeforcesContest,
          ...codechefContest
        }
      ]
    };
  }
}

module.exports = DashboardService;