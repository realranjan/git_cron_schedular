/**
 * Problem: Best Time to Buy and Sell Stock (Easy)
 * Last Updated: 2026-09-06T09:42:47.583Z
 */

# LeetCode 0121: Best Time to Buy & Sell Stock
def maxProfit(prices):
    min_price, max_profit = float('inf'), 0
    for price in prices:
        min_price = min(min_price, price)
        max_profit = max(max_profit, price - min_price)
    return max_profit

// Verified solution run #1
