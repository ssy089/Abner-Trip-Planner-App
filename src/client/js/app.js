function checkForBlankFields(listOfInputs) {
  let blankFields = false;
  for(let givenInput of listOfInputs) {
    if(givenInput.value.length === 0) {
      givenInput.insertAdjacentHTML('afterend', '<p class="error">This field is required.</p>');
      blankFields = true;
    }
  }
  return blankFields;
}

function checkDateInput(listOfInputs) {
  let validDateInput = true;
  const dateFormat = /\d{2}\/\d{2}\/\d{4}/;
  let dateMatch = null;
  for(let givenInput of listOfInputs) {
    dateMatch = givenInput.value.match(dateFormat);
    if(dateMatch === null) {
      givenInput.insertAdjacentHTML('afterend', '<p class="error">Please provide the date in the specified format.</p>');
      validDateInput = false;
    }
    else {
      let dateNumbers = givenInput.value.split('/');
      let calculatedDate = new Date(dateNumbers[2], `${parseInt(dateNumbers[0]) - 1}`, dateNumbers[1]);
      let calculatedDateNumbers = [`${parseInt(calculatedDate.getMonth()) + 1}`, calculatedDate.getDate(), calculatedDate.getFullYear()];
      for(let i = 0; i < 3; i++) {
	if(parseInt(dateNumbers[i]) !== parseInt(calculatedDateNumbers[i])) {
          givenInput.insertAdjacentHTML('afterend', '<p class="error">The given date does not exist.</p>');
	  validDateInput = false;
	  return validDateInput;
        }
      }
    }
  }
  return validDateInput;
}

function displayPlannedActivities(givenTrip) {
  return '<div class="custom-table-row custom-table-headers"><div class="custom-table-entry description-box">Description</div><div class="custom-table-entry">Time</div><div class="custom-table-entry">Date</div></div><div class="custom-table-row data-row"><div class="custom-table-entry description-box"></div><div class="custom-table-entry"></div><div class="custom-table-entry"></div></div>';
}

function displayWeatherData(weatherForecasts) {
  return '<div class="forecast-box"></div>';
}

function displayTripData(sortedListOfTrips, selectedTrip, temporaryImageURL) {
  const tripSchedule = document.getElementById('trip-schedule-table');
  const plannedActivities = document.getElementById('planned-activities-table');
  const weatherDisplay = document.querySelector('.weather-display');
  const locationImage = document.querySelector('img');
  const imageCaption = document.querySelector('figcaption');
 
  let tripTableRows = '<div class="custom-table-row custom-table-headers"><div class="custom-table-entry">Title</div><div class="custom-table-entry">City</div><div class="custom-table-entry">Admin. Division</div><div class="custom-table-entry">Country</div><div class="custom-table-entry">Start Date</div><div class="custom-table-entry">End Date</div></div>';

  for(let someTrip of sortedListOfTrips) {
    let tableRow = '<div class="custom-table-row data-row">';
    let startDate = new Date(someTrip.startDate);
    let endDate = new Date(someTrip.endDate);
    tableRow += `<div class="custom-table-entry">${someTrip.title}</div>`;
    tableRow += `<div class="custom-table-entry">${someTrip.city}</div>`;
    tableRow += `<div class="custom-table-entry">${someTrip.administrativeDivision}</div>`;
    tableRow += `<div class="custom-table-entry">${someTrip.country}</div>`;
    tableRow += `<div class="custom-table-entry">${startDate.getMonth() + 1}\/${startDate.getDate()}\/${startDate.getFullYear()}</div>`;
    tableRow += `<div class="custom-table-entry">${endDate.getMonth() + 1}\/${endDate.getDate()}\/${endDate.getFullYear()}</div>`;
    tableRow += '</div>';
    tripTableRows += tableRow;
  }

  const plannedActivitiesRows = displayPlannedActivities(selectedTrip.activities);
  const weatherForecastDisplay = displayWeatherData(selectedTrip.weatherForecasts);

  let selectedImage = '';
  let attributionMessage = '';
  if(selectedTrip.imageData.imageID === null) {
    selectedImage = 'images/NoImageFound.png';
    attributionMessage = 'Sorry, no images were found for this location.'
  }
  else {
    selectedImage = temporaryImageURL;
    attributionMessage = `${selectedTrip.imageData.imageLocation}. Image by <cite><a target="_blank" href="https:\/\/pixabay.com\/users\/${selectedTrip.imageData.user}-${selectedTrip.imageData.userID}\/">${selectedTrip.imageData.user}</a></cite> from <cite><a target="_blank" href="https://pixabay.com/">Pixabay</a></cite>`;
  }
  
  const tripTitleHeader = document.getElementById('trip-title-header');
  const tripDestinationHeader = document.getElementById('trip-destination-header');
  const tripDurationHeader = document.getElementById('trip-duration-header');
  
  const selectedTripStartDate = new Date(selectedTrip.startDate);
  const selectedTripEndDate = new Date(selectedTrip.endDate);
  const startDateString = `${selectedTripStartDate.getMonth() + 1}\/${selectedTripStartDate.getDate()}\/${selectedTripStartDate.getFullYear()}`;
  const endDateString = `${selectedTripEndDate.getMonth() + 1}\/${selectedTripEndDate.getDate()}\/${selectedTripEndDate.getFullYear()}`;

  tripTitleHeader.innerHTML = selectedTrip.title;
  tripDestinationHeader.innerHTML = `${selectedTrip.city}, ${selectedTrip.administrativeDivision}, ${selectedTrip.country}`;
  tripDurationHeader.innerHTML = `${startDateString} - ${endDateString}`;
  tripSchedule.innerHTML = tripTableRows;
  plannedActivities.innerHTML = plannedActivitiesRows;
  weatherDisplay.innerHTML = weatherForecastDisplay;
  locationImage.setAttribute('src', selectedImage);
  imageCaption.innerHTML = attributionMessage;
}

async function findLocationPhotograph(imageData) {
  const imageQuery = {
    id: imageData.id, 
    city: imageData.city, 
    adminDiv: imageData.adminDiv, 
    country: imageData.country,
    photoType: ''
  };
  const photoCategories = ['buildings', 'places', 'nature'];
  let serverResponse = null;
  for(let photoCategory of photoCategories) {
    imageQuery.photoType = photoCategory;
    serverResponse = await getServerData(imageQuery, 'pixabayImages');

    try {
      if(serverResponse.imageID === null) {
        continue;
      }
      else {
        return Promise.resolve(serverResponse);
      }
    }
    catch(error) {
      return error;
    }
  }
  return Promise.resolve(serverResponse);
}

function getDaysElapsed(startDate, endDate) {
  let elapsedTime = endDate.getTime() - startDate.getTime();
  elapsedTime /= 1000;
  elapsedTime /= 60;
  elapsedTime /= 60;
  elapsedTime /= 24;
  return Math.ceil(elapsedTime);
}

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

function processWeatherData(weatherInfo) {
  const allWeatherForecasts = [];
  for(let weatherForecast of weatherInfo) {
    let dailyForecast = {
      forecastDate: '',
      description: weatherForecast.weather.description,
      iconCode: weatherForecast.weather.icon,
      iconImage: '',
      windSpeed: weatherForecast.wind_spd.toFixed() + ' m/s',
      windDirection: '',
      maxTemperature: weatherForecast.max_temp + '°C',
      minTemperature: weatherForecast.min_temp + '°C',
      probabilityOfPrecipitation: weatherForecast.pop + '%',
      averagePressure: weatherForecast.pres.toFixed() + ' mb',
      relativeHumidity: weatherForecast.rh + '%',
      averageTotalCloudCoverage: weatherForecast.clouds + '%',
      maxUVIndex: weatherForecast.uv,
      additionalData: {
        windGustSpeed: weatherForecast.wind_gust_spd.toFixed() + ' m/s',
	precipitation: weatherForecast.precip.toFixed() + ' mm',
	snow: weatherForecast.snow.toFixed() + ' mm',
	snowDepth: weatherForecast.snow_depth.toFixed() + 'mm',
	lowLevelCloudCoverage: weatherForecast.clouds_low + '%',
	visibility: weatherForecast.vis.toFixed() + ' km'
      }
    }
    const dateComponents = weatherForecast.valid_date.split('-');
    dailyForecast.forecastDate = `${dateComponents[1]}\/${dateComponents[2]}\/${dateComponents[0]}`;
    
    const windDirectionComponents = weatherForecast.wind_cdir_full.split('-');
    dailyForecast.windDirection += `${windDirectionComponents[0].charAt().toUpperCase()}${windDirectionComponents[0].slice(1).toLowerCase()}`;
    if(windDirectionComponents.length > 1) {
      for(let someComponent of windDirectionComponents.slice(1)) {
        dailyForecast.windDirection += `-${someComponent.charAt().toUpperCase()}${someComponent.slice(1).toLowerCase()}`;
      }
    }

    if(dailyForecast.iconCode.match(/t0[1-3](d|n)/)) {
      dailyForecast.iconImage = 'images/icon_t01d.png';
    }
    else if(dailyForecast.iconCode.match(/t0[4-5](d|n)/)) {
      dailyForecast.iconImage = 'images/icon_t04d.png';
    }
    else if(dailyForecast.iconCode.match(/d0[1-3](d|n)/)) {
      dailyForecast.iconImage = 'images/icon_d01d.png';
    }
    else if(dailyForecast.iconCode.match(/[fru][0124](d|n)/)) {
      dailyForecast.iconImage = 'images/icon_r01d.png';
    }
    else if(dailyForecast.iconCode.match(/r03(d|n)/)) {
      dailyForecast.iconImage = 'images/icon_r03d.png';
    }
    else if(dailyForecast.iconCode.match(/r0[4-6](d|n)/)) {
      dailyForecast.iconImage = 'images/icon_r05d.png';
    }
    else if(dailyForecast.iconCode.match(/s0[14](d|n)/)) {
      dailyForecast.iconImage = 'images/icon_s01d.png';
    }
    else if(dailyForecast.iconCode.match(/s0[23](d|n)/)) {
      dailyForecast.iconImage = 'images/icon_s02d.png';
    }
    else if(dailyForecast.iconCode.match(/s05(d|n)/)) {
      dailyForecast.iconImage = 'images/icon_s05d.png';
    }
    else if(dailyForecast.iconCode.match(/s06(d|n)/)) {
      dailyForecast.iconImage = 'images/icon_s06d.png';
    }
    else if(dailyForecast.iconCode.match(/a0[1-6](d|n)/)) {
      dailyForecast.iconImage = 'images/icon_a01d.png';
    }
    else if(dailyForecast.iconCode.match(/c01(d|n)/)) {
      dailyForecast.iconImage = 'images/icon_c01d.png';
    }
    else if(dailyForecast.iconCode.match(/c02(d|n)/)) {
      dailyForecast.iconImage = 'images/icon_c02d.png';
    }
    else if(dailyForecast.iconCode.match(/c03(d|n)/)) {
      dailyForecast.iconImage = 'images/icon_c03d.png';
    }
    else if(dailyForecast.iconCode.match(/c04(d|n)/)) {
      dailyForecast.iconImage = 'images/icon_c04d.png';
    }
    allWeatherForecasts.push(dailyForecast);
  }
  return allWeatherForecasts;
}

function locationFound(cityInput, adminDivInput, countryInput, serverResponseData) {
  const errorAdvice = 'Make sure that the name is spelled correctly, that the correct punctuation marks are included, and that abbreviations are avoided. Also, make sure that the three location inputs all correspond to an actual location.';
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
      case 'location':
        elementId  = null;
    }
    if(elementId === null) {
      document.getElementById('city').insertAdjacentHTML('afterend', `<p class="error">${serverMessage} ${errorAdvice}</p>`);
      document.getElementById('admin-div').insertAdjacentHTML('afterend', `<p class="error">${serverMessage} ${errorAdvice}</p>`);
      document.getElementById('country').insertAdjacentHTML('afterend', `<p class="error">${serverMessage} ${errorAdvice}</p>`);
      return false;
    }
    else {
      document.getElementById(elementId).insertAdjacentHTML('afterend', `<p class="error">${serverMessage} ${errorAdvice}</p>`);
      return false;
    }
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
    countdown: 0,
    expired: false,
    administrativeDivision: '',
    country: '',
    latitude: 0.0,
    longitude: 0.0,
    numberOfDays: 0,
    startDate: '',
    endDate: '',
    imageData: {
      imageID: '',
      imageLocation: '',
      user: '',
      userID: ''
    },
    activities: [],
    weatherForecasts: []
  };
  const cityInput = document.getElementById('city');
  const adminDivInput = document.getElementById('admin-div');
  const countryInput = document.getElementById('country');
  const tripTitleInput = document.getElementById('trip-title');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const anyBlankFields = checkForBlankFields([cityInput, adminDivInput, countryInput, tripTitleInput, startDateInput, endDateInput]);
  if(anyBlankFields) {
    return;
  }

  tripData.title = tripTitleInput.value;

  const validDates = checkDateInput([startDateInput, endDateInput]);
  if(!validDates) {
    return;
  }
  const startDateComponents = startDateInput.value.split('/');
  const endDateComponents = endDateInput.value.split('/');
  tripData.startDate = new Date(startDateComponents[2], `${parseInt(startDateComponents[0]) - 1}`, startDateComponents[1]);
  tripData.endDate = new Date(endDateComponents[2], `${parseInt(endDateComponents[0]) - 1}`, endDateComponents[1]);
  tripData.numberOfDays = getDaysElapsed(tripData.startDate, tripData.endDate);
  const todayDate = new Date();
  tripData.countdown = getDaysElapsed(todayDate, tripData.startDate);
  if(getDaysElapsed(todayDate, tripData.endDate) <= 0) {
    tripData.expired = true;
  }

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
    getServerData({latitude: tripData.latitude, longitude: tripData.longitude}, 'weatherForecast').then(function(weatherData) {
      tripData.weatherForecasts = processWeatherData(weatherData.weatherInfo);
      findLocationPhotograph({id: '', city: tripData.city, adminDiv: tripData.administrativeDivision, country: tripData.country})
      .then(function(imageResults) {
	tripData.imageData.imageID = imageResults.imageID;
	tripData.imageData.imageLocation = imageResults.foundLocation;
	tripData.imageData.user = imageResults.user;
	tripData.imageData.userID = imageResults.userID;
	getServerData({someTrip: tripData}, 'listOfTrips').then(function(serverData) {
	  const sortedTrips = serverData.tripList;
	  console.log(sortedTrips);
	  displayTripData(sortedTrips, tripData, imageResults.largeImageURL);
	}).catch(function(error) {
	  console.log(`Error: ${error}`);
          document.getElementById('schedule-trip').insertAdjacentHTML('afterend', '<p class="error">An error occurred while sending a request to the server</p>');
          return;
	});
      }).catch(function(error) {
        console.log(`Error: ${error}`);
	document.getElementById('schedule-trip').insertAdjacentHTML('afterend', '<p class="error">An error occurred while sending a request to the server</p>');
        return;
      });
    }).catch(function(error) {
      console.log(`Error: ${error}`);
      document.getElementById('schedule-trip').insertAdjacentHTML('afterend', '<p class="error">An error occurred while sending a request to the server</p>');
      return;
    });
  }).catch(function(error) {
    console.log(`Error: ${error}`);
    document.getElementById('schedule-trip').insertAdjacentHTML('afterend', '<p class="error">An error occurred while sending a request to the server</p>');
    return;
  }); 
}

export {
  checkForBlankFields,
  checkDateInput,
  displayPlannedActivities,
  displayTripData,
  displayWeatherData,
  getDaysElapsed,
  getServerData,
  processWeatherData,
  locationFound,
  generateTripData,
  findLocationPhotograph
};
