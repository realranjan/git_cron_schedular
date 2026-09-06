/**
 * Problem: Two Sum (Easy)
 * Last Updated: 2026-09-06T11:00:38.277Z
 */

// LeetCode 0001: Two Sum
// Time: O(N), Space: O(N)
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff), i];
    map.set(nums[i], i);
  }
  return [];
}

// Verified solution run #1
