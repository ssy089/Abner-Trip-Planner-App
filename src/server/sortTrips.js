function tripsIterativeMergeSort(tripList) {
  let n = tripList.length;
  let mergedArray = tripList;

  let subArraySize = 0;
  let leftArrayStart = 0;

  for(subArraySize = 1; subArraySize <= (n-1); subArraySize *= 2) {
    for(leftArrayStart = 0; leftArrayStart < (n - 1); leftArrayStart += 2*subArraySize) {
      let midPoint = Math.min(leftArrayStart + subArraySize - 1, n - 1);
      let rightArrayEnd = Math.min(leftArrayStart + 2*subArraySize - 1, n - 1);
      mergedArray = mergeTripArrays(mergedArray, leftArrayStart, midPoint, rightArrayEnd);
    }
  }
  return mergedArray;
}

function mergeTripArrays(mergedArray, leftArrayStart, midPoint, rightArrayEnd) {
  let i = 0;
  let j = 0;
  let k = 0;
  let firstArraySize = midPoint - leftArrayStart + 1
  let secondArraySize = rightArrayEnd - midPoint;

  let leftArray = [];
  let rightArray = [];

  for(i = 0; i < firstArraySize; i++) {
    leftArray[i] = mergedArray[leftArrayStart + i];
  }
  for(j = 0; j < secondArraySize; j++) {
    rightArray[j] = mergedArray[midPoint + 1 + j];
  }

  i = 0;
  j = 0;
  k = leftArrayStart;
  while((i < firstArraySize) && (j < secondArraySize)) {
    let firstEndDate = new Date(leftArray[i].endDate);
    let secondEndDate = new Date(rightArray[j].endDate);
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
    else {
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
      else {
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

export {
  mergeTripArrays,
  tripsIterativeMergeSort
};
