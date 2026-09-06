/**
 * Problem: Number of Islands (BFS/DFS) (Medium)
 * Last Updated: 2026-09-06T09:42:47.583Z
 */

// LeetCode 0200: Number of Islands
function numIslands(grid) {
  let count = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(grid, r, c);
      }
    }
  }
  return count;
}
function dfs(g, r, c) {
  if (r<0||c<0||r>=g.length||c>=g[0].length||g[r][c]==='0') return;
  g[r][c] = '0';
  dfs(g,r+1,c); dfs(g,r-1,c); dfs(g,r,c+1); dfs(g,r,c-1);
}

// Verified solution run #3
