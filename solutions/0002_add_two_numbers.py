/**
 * Problem: Add Two Numbers (Medium)
 * Last Updated: 2026-09-06T11:00:38.277Z
 */

# LeetCode 0002: Add Two Numbers
# Time: O(N), Space: O(N)
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def addTwoNumbers(l1, l2):
    dummy = ListNode(0)
    curr, carry = dummy, 0
    while l1 or l2 or carry:
        val = (l1.val if l1 else 0) + (l2.val if l2 else 0) + carry
        carry = val // 10
        curr.next = ListNode(val % 10)
        curr = curr.next
        l1 = l1.next if l1 else None
        l2 = l2.next if l2 else None
    return dummy.next

// Verified solution run #2
