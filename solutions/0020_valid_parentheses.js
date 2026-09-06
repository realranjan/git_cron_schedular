/**
 * Problem: Valid Parentheses (Easy)
 * Last Updated: 2026-09-06T09:42:47.583Z
 */

// LeetCode 0020: Valid Parentheses
function isValid(s) {
  const stack = [];
  const pairs = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (!pairs[char]) stack.push(char);
    else if (stack.pop() !== pairs[char]) return false;
  }
  return stack.length === 0;
}

// Verified solution run #2
