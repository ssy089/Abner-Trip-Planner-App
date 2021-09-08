import { getDaysElapsed } from '../src/client/js/app';

describe('Test the getDaysElapsed Function', () => {
  test('Correctly Calculate the Number of Days Between Two Given Dates', () => {
    const firstDate = new Date(2021, 11, 1);
    const secondDate = new Date(2021, 11, 31);
    expect(getDaysElapsed(firstDate, secondDate)).toBe(30);
  });
});
