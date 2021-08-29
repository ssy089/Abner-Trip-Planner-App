async function getServerData(givenData, givenRoute) {
  const serverResponse = await fetch('http://localhost:8081/' + givenRoute, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(givenData)
  });

  try {
    const responseData = await serverResponse.json();
    return responseData;
  }
  catch(error) {
    return error;
  }
}

function locationFound(cityInput, adminDivInput, countryInput, serverResponseData) { 
  const errorAdvice = 'Make sure that the name is spelled correctly, that the correct punctuation marks are included, and that abbreviations are avoided. Also, make sure that the given location data is all correct.';
  const notFoundRegExp = /The given ([a-z]*\s*[a-z]+) was not found\./i;
  const serverMessage = serverResponseData.message;
  const notFoundMatch = serverMessage.match(notFoundRegExp);

  if(serverMessage === 'An error occurred on the server while processing the data.') {
    document.getElementById('schedule-trip').insertAdjacentHTML('afterend', `<p class="error">${serverMessage}</p>`);
    return false;
  }
  else if(notFoundMatch !== null) {
    let elementId = '';
    switch (notFoundMatch[1]) {
      case 'city':
	elementId = 'city';
	break;
      case 'administrative division':
	elementId = 'admin-div';
	break;
      case 'country':
	elementId = 'country';
	break;
    }
    document.getElementById(elementId).insertAdjacentHTML('afterend', `<p class="error">${serverMessage} ${errorAdvice}`);
    return false;
  }
  return true;
}

function generateTripData(submitEvent) {
  submitEvent.preventDefault();
  
  /* Remove any currently displayed error messages. */
  const errorMessages = document.querySelectorAll('.error');
  for(let errorMessage of errorMessages) {
    errorMessage.remove();
  }

  const tripData = {
    title: '',
    city: '',
    administrativeDivision: '',
    country: '',
    latitude: 0.0,
    longitude: 0.0,
    startDate: '',
    endDate: '',
    activities: []
  };
  const cityInput = document.getElementById('city');
  const adminDivInput = document.getElementById('admin-div');
  const countryInput = document.getElementById('country');
  const tripTitleInput = document.getElementById('trip-title');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const givenInput = {
    city: cityInput.value,
    adminDiv: adminDivInput.value,
    country: countryInput.value
  };
  getServerData(givenInput, 'geographicCoordinates').then(function(data) {
    const locationWasFound = locationFound(cityInput, adminDivInput, countryInput, data);
    if(!locationWasFound) {
      return;
    }
    tripData.city = data.locationInfo.city;
    tripData.administrativeDivision = data.locationInfo.adminDiv;
    tripData.country = data.locationInfo.country;
    tripData.latitude = data.locationInfo.latitude;
    tripData.longitude = data.locationInfo.longitude;
    console.log(tripData);

  }).catch(function(error) {
    console.log(`Error: ${error}`);
    document.getElementById('schedule-trip').insertAdjacentHTML('afterend', '<p class="error">An error occurred while sending a request to the server</p>');
    return;
  }); 
}

export {
  getServerData,
  locationFound,
  generateTripData
};
