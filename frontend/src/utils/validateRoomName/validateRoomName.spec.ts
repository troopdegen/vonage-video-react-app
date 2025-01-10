import { describe, it, expect } from 'vitest';
import validateRoomName from './validateRoomName';

describe('validateRoomName', () => {
  const testCases = [
    { input: 'room_name', expected: true },
    { input: 'room+name', expected: true },
    { input: 'another-room_name', expected: true },
    { input: '123roomname', expected: true },
    { input: 'room@name', expected: false },
    { input: 'room#name', expected: false },
    { input: 'room$name', expected: false },
  ];

  testCases.forEach(({ input, expected }) => {
    it(`should return ${expected} for "${input}"`, () => {
      const result = validateRoomName(input);
      expect(result).toBe(expected);
    });
  });
});
