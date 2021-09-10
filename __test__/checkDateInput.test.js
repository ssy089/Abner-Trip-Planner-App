import { checkDateInput } from '../src/client/js/app';

/* An input list with valid date values.
 * Note that the insertAdjacentHTML method
 * shown here is a placeholder for the Document
 * Object model method of the same name.
 */
const inputList = [
  {
    value: '09/30/2022',
    insertAdjacentHTML: function(position, errorMessage) {}
  },
  {
    value: '10/15/2022',
    insertAdjacentHTML: function(position, errorMessage) {}
  }
];

/* An input list containing a date in the wrong format */
const badInputList1 = [
  {
    value: '07/02/2022',
    insertAdjacentHTML: function(position, errorMessage) {}
  },
  {
    value: '7/4/2022',
    insertAdjacentHTML: function(position, errorMessage) {}
  }
];

/* An input list containing an invalid (non-existent) date */
const badInputList2 = [
  {
    value: '02/13/2022',
    insertAdjacentHTML: function(position, errorMessage) {}
  },
  {
    value: '02/29/2022',
    insertAdjacentHTML: function(position, errorMessage) {}
  }
];

describe('Test the checkDateInput Function', () => {
  test('Accept Valid Date Input Values', () => {
    expect(checkDateInput(inputList)).toBe(true);
  });

  test('Reject Date Input Values that are Given in the Wrong Format', () => {
    expect(checkDateInput(badInputList1)).toBe(false);
  });

  test('Reject Date Input Values if a Given Date Does Not Exist', () => {
    expect(checkDateInput(badInputList2)).toBe(false);
  })
});
