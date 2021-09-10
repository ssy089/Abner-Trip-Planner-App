/*
 * Purpose: This function serves as an
 * iterative merge sort for the trips.
 * 
 * Parameters:
 * - tripList: A list of trips
 *
 * Return Value: A list of trips sorted by earliest start
 * date (smallest countdown), by earliest end date, and
 * by title.
 *
 * Note: This iterative merge sort
 * is based on the iterative merge sort
 * presented in the following webpage:
 * https://www.geeksforgeeks.org/iterative-merge-sort/ 
 * Last Date Accessed: 9/9/2021
 *
 */
function tripsIterativeMergeSort(tripList) {
  let n = tripList.length; //Size of the trip list.
  let mergedArray = tripList; //Array that will store the sorted list.

  let subArraySize = 0; //Size of each partial list that will be individually sorted.
  let leftArrayStart = 0; //Starting index for the leftmost partial list.

  /* Split the main array into approximately equal parts, individually sort those parts,
   * and merge the parts.
   */
  for(subArraySize = 1; subArraySize <= (n-1); subArraySize *= 2) {
    for(leftArrayStart = 0; leftArrayStart < (n - 1); leftArrayStart += 2*subArraySize) {
      let midPoint = Math.min(leftArrayStart + subArraySize - 1, n - 1);
      let rightArrayEnd = Math.min(leftArrayStart + 2*subArraySize - 1, n - 1);
      mergedArray = mergeTripArrays(mergedArray, leftArrayStart, midPoint, rightArrayEnd);
    }
  }
  return mergedArray;
}

/*
 * Purpose: This function serves as the
 * merge portion for an iterative merge
 * sort, which will be used on a list of trips.
 * 
 * Parameters:
 * - mergedArray: Array that contains the trips to sort
 * - leftArrayStart: Starting index for the left partial array.
 * - midPoint: Middle point that seperates the two partial arrays.
 * - rightArrayEnd: Final index for the right partial array.
 *
 * Return Value: A sorted combination of the two partial arrays.
 * This will be a list of trips sorted by earliest start
 * date (smallest countdown), by earliest end date, and
 * by title.
 *
 * Note: This merge function
 * is based on the iterative merge sort
 * presented in the following webpage:
 * https://www.geeksforgeeks.org/iterative-merge-sort/
 * Last Date Accessed: 9/9/2021
 *
 */
function mergeTripArrays(mergedArray, leftArrayStart, midPoint, rightArrayEnd) {
  /* Variables for going through the partial arrays and merged array. */
  let i = 0;
  let j = 0;
  let k = 0;
  let firstArraySize = midPoint - leftArrayStart + 1
  let secondArraySize = rightArrayEnd - midPoint;

  /* The two partial arrays */
  let leftArray = [];
  let rightArray = [];

  /* Put the array elements for each partial array
   * into their corresponding array.
   */
  for(i = 0; i < firstArraySize; i++) {
    leftArray[i] = mergedArray[leftArrayStart + i];
  }
  for(j = 0; j < secondArraySize; j++) {
    rightArray[j] = mergedArray[midPoint + 1 + j];
  }

  /* Set the variables to begin merging the arrays. */
  i = 0;
  j = 0;
  k = leftArrayStart;

  /* Compare the trips from both partial arrays while
   * they both have elements left.
   */
  while((i < firstArraySize) && (j < secondArraySize)) {
    /* Create Date objects to easily compare different end dates. */
    let firstEndDate = new Date(leftArray[i].endDate);
    let secondEndDate = new Date(rightArray[j].endDate);

    /* Compare the countdown values for each trip. If one is
     * less that the other, insert the appropriate trip
     * into the merged array.
     */
    if(leftArray[i].countdown < rightArray[j].countdown) {
      mergedArray[k] = leftArray[i];
      i++;
      k++;
    }
    else if(leftArray[i].countdown > rightArray[j].countdown) {
      mergedArray[k] = rightArray[j];
      j++;
      k++;
    }

    /* If the two trips had the same countdown value,
     * compare them using their end dates or titles.
     */
    else {
      /* If one trip's end date is later than the other trip's
       * end date, insert the appropriate trip into the merged
       * array.
       */
      if(firstEndDate.getTime() < secondEndDate.getTime()) {
        mergedArray[k] = leftArray[i];
        i++;
	k++;
      }
      else if(firstEndDate.getTime() > secondEndDate.getTime()) {
        mergedArray[k] = rightArray[j];
	j++;
	k++;
      }

      /* If both trips have the values for their countdown and
       * end date, compare their titles.
       */
      else {
        /* If one trip's title has a value less that is less
	 * than the value of the other trip's title (i.e. one
	 * title goes ahead of the other when sorted alphabetically),
	 * insert the appropriate trip into the merged array.
	 */
	if(leftArray[i].title < rightArray[j].title) {
	  mergedArray[k] = leftArray[i];
	  i++;
	  k++;
	}
	else if(leftArray[i].title > rightArray[j].title) {
          mergedArray[k] = rightArray[j];
          j++;
          k++;
        }
	/* If both trips have the same values for their countdown,
	 * end date, and title, insert both trips into the merged
	 * array.
	 */
        else {
          mergedArray[k] = leftArray[i];
          i++;
          k++;
          mergedArray[k] = rightArray[j];
          j++;
          k++;
        }
      }
    }
  }

  /* If there are any trips remaining in either
   * the left array or the right array, insert
   * those trips into the merged array.
   */
  while(i < firstArraySize) {
    mergedArray[k] = leftArray[i];
    i++;
    k++;
  }

  while(j < secondArraySize) {
    mergedArray[k] = rightArray[j];
    j++;
    k++;
  }
  return mergedArray;
}

/* Export the two functions for implementation and testing. */
module.exports = {
  mergeTripArrays,
  tripsIterativeMergeSort
};
