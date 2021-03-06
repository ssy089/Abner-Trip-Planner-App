/* Import the functions that provide the iterative merge sort for the trip list. */
const mergeTripArrays = require('../src/server/sortTrips').mergeTripArrays;
const tripsIterativeMergeSort = require('../src/server/sortTrips').tripsIterativeMergeSort;

/* Create an unsorted array of trips (with the minimal information needed for sorting). */
const someArray = [
  {
    countdown: 20,
    endDate: 'Fri Oct 01 2021 00:00:00 GMT-0500 (Central Daylight Time)',
    title: 'Shopping at San Marcos'
  },
  {
    countdown: 181,
    endDate: 'Mon Mar 28 2022 00:00:00 GMT-0500 (Central Daylight Time)',
    title: 'Japan Trip'
  },
  {
    countdown: 500,
    endDate: 'Wed Jan 25 2023 00:00:00 GMT-0600 (Central Standard Time)',
    title: 'Dallas Tour'
  },
  {
    countdown: 85,
    endDate: 'Mon Dec 8 2021 00:00:00 GMT-0600 (Central Standard Time)',
    title: 'Decorating the House'
  },
  {
    countdown: 85,
    endDate: 'Mon Dec 13 2021 00:00:00 GMT-0600 (Central Standard Time)',
    title: 'Holiday Shopping'
  },
  {
    countdown: 500,
    endDate: 'Wed Jan 25 2023 00:00:00 GMT-0600 (Central Standard Time)',
    title: 'Fort Worth Tour'
  } 
];

/* Create an array containing the sorted version of the first array. */
const mergeSortedArray = [
  {
    countdown: 20,
    endDate: 'Fri Oct 01 2021 00:00:00 GMT-0500 (Central Daylight Time)',
    title: 'Shopping at San Marcos'
  },
  {
    countdown: 85,
    endDate: 'Mon Dec 8 2021 00:00:00 GMT-0600 (Central Standard Time)',
    title: 'Decorating the House'
  },
  {
    countdown: 85,
    endDate: 'Mon Dec 13 2021 00:00:00 GMT-0600 (Central Standard Time)',
    title: 'Holiday Shopping'
  },
  {
    countdown: 181,
    endDate: 'Mon Mar 28 2022 00:00:00 GMT-0500 (Central Daylight Time)',
    title: 'Japan Trip'
  },
  {
    countdown: 500,
    endDate: 'Wed Jan 25 2023 00:00:00 GMT-0600 (Central Standard Time)',
    title: 'Dallas Tour'
  },
  {
    countdown: 500,
    endDate: 'Wed Jan 25 2023 00:00:00 GMT-0600 (Central Standard Time)',
    title: 'Fort Worth Tour'
  }
];

describe('Tests for the Iterative Merge Sort that is Used on the Trips List', () => {
  
  test('Test the mergeTripsArrays Function (This is the Merge Portion of the Merge Sort))', () => { 
    expect(mergeTripArrays(someArray, 0, 2, 5)).toEqual(mergeSortedArray);
  });

  test('Test the tripsIterativeMergeSort Function (This is the Complete Merge Sort)', () => {
    expect(tripsIterativeMergeSort(someArray)).toEqual(mergeSortedArray);
  });
});
