
const leetcodeService = require('./leetcodeService');
const codeforcesService = require('./codeforcesService');
const codechefService = require('./codechefService');
const userService = require('./userService'); // For getting usernames


class DashboardService {
  static async getDashboardData(userId) {
const userProfileArr = await userService.getProfile(userId);
const userProfile = Array.isArray(userProfileArr) ? userProfileArr[0] : userProfileArr;
  // console.log("User Profile: at backend ", userProfile);
    let leetcodeStats = {
      leetcode_total: 0,
      leetcode_easy: 0,
      leetcode_medium: 0,
      leetcode_hard: 0
    };
    let leetcodeContest = {
      leetcode_recent_contest_rating: null,
      leetcode_max_contest_rating: null
    };
    if (userProfile && userProfile.leetcode_username) {
  // console.log("Calling LeetCode Service for username:", userProfile.leetcode_username);
      try {
  // console.log("DASHBOARD LeetCode username:", userProfile.leetcode_username);
        const lcData = await leetcodeService.fetchUserComprehensiveData(userProfile.leetcode_username);
  // console.log("DASHBOARD LeetCode Data:", lcData);
        const acStats = lcData.problemsSolved?.solvedStats?.submitStatsGlobal?.acSubmissionNum || [];
  // console.log("DASHBOARD LeetCode acStats:", acStats);
        leetcodeStats.leetcode_total = acStats.find(x => x.difficulty === 'All')?.count || 0;
        leetcodeStats.leetcode_easy = acStats.find(x => x.difficulty === 'Easy')?.count || 0;
        leetcodeStats.leetcode_medium = acStats.find(x => x.difficulty === 'Medium')?.count || 0;
        leetcodeStats.leetcode_hard = acStats.find(x => x.difficulty === 'Hard')?.count || 0;

        // Contest rating info
        const contest = lcData.contestRanking || {};
        leetcodeContest.leetcode_recent_contest_rating = contest.rating || null;
        if (lcData.contestHistory && lcData.contestHistory.length > 0) {
          leetcodeContest.leetcode_max_contest_rating = Math.max(...lcData.contestHistory.map(c => c.rating || 0));
        } else {
          leetcodeContest.leetcode_max_contest_rating = contest.rating || null;
        }
  // console.log("LeetCode Stats:", leetcodeStats);
  // console.log("LeetCode Contest:", leetcodeContest);
      } catch (e) {
  // console.error("LeetCode fetch error:", e);
      }
    }
    // Codeforces
    let codeforcesStats = { codeforces_total: 0 };
    let codeforcesContest = {
      codeforces_recent_contest_rating: null,
      codeforces_max_contest_rating: null
    };
    if (userProfile && userProfile.codeforces_username) {
  // console.log("Calling Codeforces Service for username:", userProfile.codeforces_username);
      try {
        const submissions = await codeforcesService.getUserSubmissions(userProfile.codeforces_username);
  // console.log("Codeforces Submissions:", submissions);
        const solvedSet = new Set();
        submissions.forEach(sub => {
          if (sub.verdict === "OK" && sub.problem && sub.problem.contestId && sub.problem.index) {
            solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
          }
        });
        codeforcesStats.codeforces_total = solvedSet.size;

        const userInfo = await codeforcesService.getUserInfo(userProfile.codeforces_username);
  // console.log("Codeforces User Info:", userInfo);
        codeforcesContest.codeforces_recent_contest_rating = userInfo.rating || null;
        codeforcesContest.codeforces_max_contest_rating = userInfo.maxRating || null;
  // console.log("Codeforces Stats:", codeforcesStats);
  // console.log("Codeforces Contest:", codeforcesContest);
      } catch (e) {}
    }

    // Codechef
    let codechefStats = { codechef_total: 0 };
    let codechefContest = {
      codechef_stars: null,
      codechef_recent_contest_rating: null,
      codechef_max_contest_rating: null
    };
    if (userProfile && userProfile.codechef_username) {
  // console.log("Calling Codechef Service for username:", userProfile.codechef_username);
      try {
        const ccData = await codechefService.extractProfileData(userProfile.codechef_username);
  // console.log("Codechef Profile Data:", ccData);
        codechefStats.codechef_total = ccData.problemsSolved || 0;
        codechefContest.codechef_stars = ccData.stars || null;
        codechefContest.codechef_recent_contest_rating = parseInt(ccData.rating) || null;
        codechefContest.codechef_max_contest_rating = ccData.highestRating || null;
  // console.log("Codechef Stats:", codechefStats);
  // console.log("Codechef Contest:", codechefContest);
      } catch (e) {}
    }

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