import {
  formatDate,
  formatDateTime,
  formatTimeAgo,
  truncateText,
  formatTaskCount,
  formatNumber
} from '@/utils/formatters';

describe('Formatter Utility Functions', () => {
  describe('Date formatting functions', () => {
    test('formatDate formats date correctly with default format', () => {
      const result = formatDate('2023-01-15T10:30:00Z');
      expect(result).toBe('Jan 15, 2023');
    });

    test('formatDate formats date with custom format', () => {
      const result = formatDate('2023-01-15T10:30:00Z', 'yyyy-MM-dd');
      expect(result).toBe('2023-01-15');
    });

    test('formatDate handles invalid date string', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('invalid-date');
    });

    test('formatDateTime formats date and time', () => {
      const result = formatDateTime('2023-01-15T10:30:00Z');
      expect(result).toContain('Jan 15, 2023');
      // The time format might be different depending on the locale, so just check it contains time
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('Time ago formatting', () => {
    beforeEach(() => {
      // Mock Date.now to have consistent tests
      const mockDate = new Date('2023-01-15T12:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('formatTimeAgo returns "just now" for recent dates', () => {
      const result = formatTimeAgo('2023-01-15T11:59:30Z'); // 30 seconds ago
      expect(result).toBe('just now');
    });

    test('formatTimeAgo returns minutes for recent dates', () => {
      const result = formatTimeAgo('2023-01-15T11:55:00Z'); // 5 minutes ago
      expect(result).toBe('5m ago');
    });

    test('formatTimeAgo returns hours for recent dates', () => {
      const result = formatTimeAgo('2023-01-15T10:00:00Z'); // 2 hours ago
      expect(result).toBe('2h ago');
    });

    test('formatTimeAgo returns days for recent dates', () => {
      const result = formatTimeAgo('2023-01-13T12:00:00Z'); // 2 days ago
      expect(result).toBe('2d ago');
    });

    test('formatTimeAgo falls back to formatDate for older dates', () => {
      const result = formatTimeAgo('2022-01-15T12:00:00Z'); // Over a year ago
      expect(result).toBe('Jan 15, 2022');
    });

    test('formatTimeAgo handles invalid date string', () => {
      const result = formatTimeAgo('invalid-date');
      expect(result).toBe('invalid-date');
    });
  });

  describe('Text formatting functions', () => {
    test('truncateText truncates text when longer than max length', () => {
      const longText = 'This is a very long text that will be truncated';
      const maxLength = 17; // We want the final result to be 20 chars: 17 + 3 for '...'
      const result = truncateText(longText, maxLength);
      // The result should be maxLength + 3 characters (the original text up to maxLength + '...')
      expect(result.length).toBe(maxLength + 3);
      // And should end with '...'
      expect(result).toMatch(/\.\.\.$/);
      expect(result.length).toBeLessThan(longText.length);
    });

    test('truncateText returns original text when shorter than max length', () => {
      const shortText = 'Short text';
      const result = truncateText(shortText, 20);
      expect(result).toBe(shortText);
    });

    test('truncateText returns exact length when equal to max length', () => {
      const text = 'Exact length text'; // 17 chars
      const result = truncateText(text, 17);
      expect(result).toBe(text);
    });
  });

  describe('Task count formatting', () => {
    test('formatTaskCount returns "No tasks" for 0', () => {
      expect(formatTaskCount(0)).toBe('No tasks');
    });

    test('formatTaskCount returns "1 task" for 1', () => {
      expect(formatTaskCount(1)).toBe('1 task');
    });

    test('formatTaskCount returns "X tasks" for other numbers', () => {
      expect(formatTaskCount(5)).toBe('5 tasks');
      expect(formatTaskCount(100)).toBe('100 tasks');
    });
  });

  describe('Number formatting', () => {
    test('formatNumber formats thousands', () => {
      expect(formatNumber(1000)).toBe('1.0K');
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(999999)).toBe('1000.0K');
    });

    test('formatNumber formats millions', () => {
      expect(formatNumber(1000000)).toBe('1.0M');
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(2500000)).toBe('2.5M');
    });

    test('formatNumber returns string for small numbers', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(42)).toBe('42');
      expect(formatNumber(999)).toBe('999');
    });
  });
});