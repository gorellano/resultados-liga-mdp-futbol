import { describe, it, expect, beforeEach } from 'vitest';
import { 
  calculatePollPercentages, 
  isPollExpired, 
  DEFAULT_POLL,
  getUserVote,
  recordUserVote,
  clearUserVote
} from '../lib/poll';
import type { Poll } from '../lib/types';

describe('Poll logic & utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('calculatePollPercentages', () => {
    it('should return 0% when there are 0 votes', () => {
      const stats = calculatePollPercentages(0, 0);
      expect(stats.total).toBe(0);
      expect(stats.yesPercent).toBe(0);
      expect(stats.noPercent).toBe(0);
    });

    it('should return 100% yes when all votes are yes', () => {
      const stats = calculatePollPercentages(15, 0);
      expect(stats.total).toBe(15);
      expect(stats.yesPercent).toBe(100);
      expect(stats.noPercent).toBe(0);
    });

    it('should return 100% no when all votes are no', () => {
      const stats = calculatePollPercentages(0, 20);
      expect(stats.total).toBe(20);
      expect(stats.yesPercent).toBe(0);
      expect(stats.noPercent).toBe(100);
    });

    it('should calculate accurate percentages for split votes', () => {
      const stats = calculatePollPercentages(75, 25);
      expect(stats.total).toBe(100);
      expect(stats.yesPercent).toBe(75);
      expect(stats.noPercent).toBe(25);
    });

    it('should handle uneven numbers and ensure percentages sum to 100', () => {
      const stats = calculatePollPercentages(2, 1);
      expect(stats.total).toBe(3);
      expect(stats.yesPercent + stats.noPercent).toBe(100);
    });
  });

  describe('isPollExpired', () => {
    it('should return false if expiration is in the future', () => {
      const poll: Poll = {
        ...DEFAULT_POLL,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // mañana
      };
      expect(isPollExpired(poll)).toBe(false);
    });

    it('should return true if expiration is in the past', () => {
      const poll: Poll = {
        ...DEFAULT_POLL,
        expires_at: new Date(Date.now() - 1000 * 60).toISOString(), // hace 1 min
      };
      expect(isPollExpired(poll)).toBe(true);
    });

    it('should return true when evaluated against a later reference date', () => {
      const poll: Poll = {
        ...DEFAULT_POLL,
        expires_at: '2026-09-20T23:59:59.000Z',
      };
      const afterExpiry = new Date('2026-09-21T00:00:01.000Z');
      expect(isPollExpired(poll, afterExpiry)).toBe(true);

      const beforeExpiry = new Date('2026-09-19T12:00:00.000Z');
      expect(isPollExpired(poll, beforeExpiry)).toBe(false);
    });
  });

  describe('User vote persistence', () => {
    const pollId = 'test-poll-123';

    it('should initially return null for user vote', () => {
      expect(getUserVote(pollId)).toBeNull();
    });

    it('should record and retrieve a user vote', () => {
      recordUserVote(pollId, 'yes');
      expect(getUserVote(pollId)).toBe('yes');

      recordUserVote(pollId, 'no');
      expect(getUserVote(pollId)).toBe('no');
    });

    it('should clear user vote', () => {
      recordUserVote(pollId, 'yes');
      expect(getUserVote(pollId)).toBe('yes');

      clearUserVote(pollId);
      expect(getUserVote(pollId)).toBeNull();
    });
  });
});
