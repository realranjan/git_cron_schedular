/**
 * Problem: Climbing Stairs (DP) (Easy)
 * Last Updated: 2026-09-06T09:42:47.583Z
 */

// LeetCode 0070: Climbing Stairs
function climbStairs(n) {
  if (n <= 2) return n;
  let first = 1, second = 2;
  for (let i = 3; i <= n; i++) {
    const third = first + second;
    first = second;
    second = third;
  }
  return second;
}

// Verified solution run #4
