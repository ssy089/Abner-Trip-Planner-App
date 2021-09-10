import { checkForBlankFields } from '../src/client/js/app';

/* An input list with filled input values.
 * Note that the insertAdjacentHTML method
 * shown here is a placeholder for the Document
 * Object Model method of the same name.
 */
const inputList = [
  {
    value: 'An Exciting Trip',
    insertAdjacentHTML: function(position, errorMessage) {}
  },
  {
    value: 'Another Exciting Trip',
    insertAdjacentHTML: function(position, errorMessage) {}
  }
];

/* An input list containing a blank input value */
const badInputList = [
  {
    value: 'One Trip',
    insertAdjacentHTML: function(position, errorMessage) {}
  },
  {
    value: '',
    insertAdjacentHTML: function(position, errorMessage) {}
  }
];

describe('Test the checkForBlankFields Function', () => {
  test('Confirm that a Valid List Has No Blank Input Values', () => {
    expect(checkForBlankFields(inputList)).toBe(false);
  });

  test('Confirm that an Invalid List Has One or More Blank Input Values', () => {
    expect(checkForBlankFields(badInputList)).toBe(true);
  });
});
