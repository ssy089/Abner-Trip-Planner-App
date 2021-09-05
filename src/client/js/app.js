function accessTripData(clickEvent) {
  clickEvent.preventDefault();
  
  const tripButtons = document.getElementById('trip-info-access');

  const accessErrorMessages = tripButtons.getElementsByClassName('error');
  for(let errorMessage of accessErrorMessages) {
    errorMessage.remove();
  }
  
  if(clickEvent.target.id === 'cancel-all') {
    document.getElementById('trip-schedule-table').innerHTML = '<div class="custom-table-headers custom-table-row"><div class="custom-table-entry">Title</div><div class="custom-table-entry">City</div><div class="custom-table-entry">Admin. Division</div><div class="custom-table-entry">Country</div><div class="custom-table-entry">Start Date</div><div class="custom-table-entry">End Date</div></div>';
    deleteServerData({deleteTrips: 'all'}, 'listOfTrips').then(function(data) {}).catch(function(error) {
      console.log(`Error: ${error}`);
      document.getElementById('trip-info-buttons').insertAdjacentHTML('afterend', '<p class="error">The selected data could not be deleted from the server.');
    });
  }
  else if(clickEvent.target.id === 'cancel-trip') {
    const canceledTrips = document.getElementById('trip-schedule-table').getElementsByClassName('selected-data-row');
    if(canceledTrips.length === 0) {
      document.getElementById('trip-info-buttons').insertAdjacentHTML('afterend', '<p class="error">One or more rows must be selected in order to delete trip data.</p>');
      return;
    }
    const canceledData = [];
    for(let canceledTrip of canceledTrips) {
      let tripData = canceledTrip.children;
      let givenTitle = tripData[0].textContent;
      let givenCity = tripData[1].textContent;
      let givenStartDateComponents = tripData[4].textContent.split('/'); 
      let givenStartDate = new Date(givenStartDateComponents[2], `${parseInt(givenStartDateComponents[0]) - 1}`, givenStartDateComponents[1]);
      let givenEndDateComponents = tripData[5].textContent.split('/');
      let givenEndDate = new Date(givenEndDateComponents[2], `${parseInt(givenEndDateComponents[0]) - 1}`, givenEndDateComponents[1]);
      let someTrip = {
        title: givenTitle,
	city: givenCity,
	startDate: givenStartDate,
	endDate: givenEndDate
      };
      canceledData.push(someTrip);
      canceledTrip.remove();
    }
    deleteServerData({deleteTrips: canceledData}, 'listOfTrips').then(function(data) {}).catch(function(error) {
      console.log(`Error: ${error}`);
      document.getElementById('trip-info-buttons').insertAdjacentHTML('afterend', '<p class="error">The selected data could not be deleted from the server.');
    });
  }
  else if(clickEvent.target.id === 'display-info') {
    const selectedTripRow = document.getElementById('trip-schedule-table').querySelector('.selected-data-row');
    if(selectedTripRow === null) {
      document.getElementById('trip-info-buttons').insertAdjacentHTML('afterend', '<p class="error">A row must be selected in order to display its information.</p>');
      return;
    }
    const selectedTripData = selectedTripRow.children;
    let givenStartDateComponents = selectedTripData[4].textContent.split('/'); 
    let givenStartDate = new Date(givenStartDateComponents[2], `${parseInt(givenStartDateComponents[0]) - 1}`, givenStartDateComponents[1]);
    let givenEndDateComponents = selectedTripData[5].textContent.split('/');
    let givenEndDate = new Date(givenEndDateComponents[2], `${parseInt(givenEndDateComponents[0]) - 1}`, givenEndDateComponents[1]);
    const tripData = {
      title: selectedTripData[0].textContent,
      city: selectedTripData[1].textContent,
      startDate: givenStartDate,
      endDate: givenEndDate
    };
    getServerData({someTrip: tripData, method: 'retrieve'}, 'listOfTrips').then(function(data) {
      console.log(data);
      const imageQuery = {
        id: data.selectedTrip.imageData.imageID,
	city: data.selectedTrip.city,
	adminDiv: data.selectedTrip.administrativeDivision,
	country: data.selectedTrip.country
      };
      findLocationPhotograph(imageQuery).then(function(imageRetrieved) {
	displaySelectedTrip(data.selectedTrip, imageRetrieved.imageInfo.largeImageURL);
      }).catch(function(error) {
        console.log(`Error: ${error}`);
        document.getElementById('trip-info-buttons').insertAdjacentHTML('afterend', '<p class="error">The image for the selected data could not be retrieved.');
      });
    }).catch(function(error) {
      console.log(`Error: ${error}`);
      document.getElementById('trip-info-buttons').insertAdjacentHTML('afterend', '<p class="error">The selected data could not be retrieved from the server.');
    });
  }
}

function addActivity(submitEvent) {
  submitEvent.preventDefault();

  const activityErrors = document.querySelector('.activity-planner').querySelectorAll('.error');
  for(let activityError of activityErrors) {
    activityError.remove();
  }

  const descriptionBox = document.getElementById('activity-description');
  const givenTime = document.getElementById('activity-time');
  const givenDate = document.getElementById('activity-date');

  const anyBlankFields = checkForBlankFields([descriptionBox, givenTime, givenDate]);
  if(anyBlankFields) {
    return;
  }

  const dateRegExp = new RegExp('[0-1]*[0-9]:[0-5][0-9] (AM|PM)', 'i');
  if(givenTime.value.match(dateRegExp) === null) {
    const errorText = '<p class="error">Please enter the time in the specified format (e.g. 1:00 PM). Make sure to remove leading zeros, and make sure that there is one space between the numbers and the AM/PM option.</p>';
    givenTime.insertAdjacentHTML('afterend', errorText);
    return;
  }
  const validDate = checkDateInput([givenDate]);
  if(!validDate) {
    return;
  }
  
  if(descriptionBox.value.length > 250) {
    descriptionBox.insertAdjacentHTML('afterend', '<p class="error">Please enter 250 characters or less.</p>');
    return;
  }

  const newActivity = {
    description: descriptionBox.value,
    setTime: givenTime.value,
    setDate: givenDate.value
  };
  getServerData({givenActivity: newActivity}, 'tripActivities').then(function(data) {
    if(data.message === 'There is no trip that is currently displayed.') {
      document.submitEvent.target.insertAdjacentHTML('afterend', '<p class="error">Select and display a trip in order to add activities for the trip.');
    }
    else {
      const activityRows = displayPlannedActivities(data.listOfActivities);
      document.getElementById('planned-activities-table').innerHTML = activityRows;
    }
  }).catch(function(error) {
    console.log(`Error: ${error}`);
    submitEvent.target.insertAdjacentHTML('afterend', '<p class="error">An error occurred while sending a request to the server</p>');
  });
}

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

async function deleteServerData(givenData, givenRoute) {
  const serverResponse = await fetch('http://localhost:8081/' + givenRoute, {
    method: 'DELETE',
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

function deleteActivityData(deleteInfo) {
  deleteInfo.preventDefault();
  
  const activityErrorMessages = document.querySelector('.activity-planner').querySelectorAll('.error');
  for(let activityErrorMessage of activityErrorMessages) {
    activityErrorMessage.remove();
  }
  
  if(deleteInfo.target.id === 'clear-activities') { 
    deleteServerData({selectedData: 'all'}, 'tripActivities').then(function(data) {
      if(data.message === 'There is no trip that is currently displayed.') {
        document.getElementById('activity-info-buttons').insertAdjacentHTML('afterend', '<p class="error">Select a trip in order to cancel activities.</p>');
      }
      else {
        document.getElementById('planned-activities-table').innerHTML = '<div class="custom-table-headers custom-table-row"><div class="description-box custom-table-entry">Description</div><div class="custom-table-entry">Time</div><div class="custom-table-entry">Date</div></div><div class="data-row custom-table-row"><div class="description-box custom-table-entry"></div><div class="custom-table-entry"></div><div class="custom-table-entry"></div></div>';
      }
    }).catch(function(error) {
      console.log(`Error: ${error}`);
      document.getElementById('activity-info-buttons').insertAdjacentHTML('afterend', '<p class="error">The selected data could not be deleted from the server.');
    });
  }
  else if(deleteInfo.target.id === 'cancel-activity') { 
    const canceledActivities = document.getElementById('planned-activities-table').getElementsByClassName('selected-data-row');
    const canceledData = [];
    for(let canceledActivity of canceledActivities) {
      let activityData = canceledActivity.children;
      let givenDescription = activityData[0].textContent;
      let givenTime = activityData[1].textContent;
      let givenDate = activityData[2].textContent;
      let someActivity = {
        description: givenDescription,
	setDate: givenDate,
	setTime: givenTime
      };
      canceledData.push(someActivity);
    }
    deleteServerData({selectedData: canceledData}, 'tripActivities').then(function(data) {
      if(data.message === 'There is no trip that is currently displayed.') {
        document.getElementById('activity-info-buttons').insertAdjacentHTML('afterend', '<p class="error">Select a trip in order to cancel activities.</p>');
      }
      else {
        for(let canceledActivity of canceledActivities) {
          canceledActivity.remove();
        }
      }
    }).catch(function(error) {
      console.log(`Error: ${error}`);
      document.getElementById('activity-info-buttons').insertAdjacentHTML('afterend', '<p class="error">The selected data could not be deleted from the server.');
    });
  }
}

function displayImageData(selectedTrip, temporaryImageURL) {
  const imageDisplayData = {
    url: '',
    attributionMessage: ''
  };

  if(selectedTrip === null) {
    imageDisplayData.url = 'images/globe-3411506_1920.jpg';
    imageDisplayData.attributionMessage = 'Image by <cite><a target="_blank" href="https://pixabay.com/users/kreatikar-8562930/">Mudassar Iqbal</a></cite> from <cite><a target="_blank" href="https://pixabay.com/">Pixabay</a></cite>';
    return imageDisplayData;
  }
  
  if(selectedTrip.imageData.imageID === null) {
    imageDisplayData.url = 'images/NoImageFound.png';
    imageDisplayData.attributionMessage = 'Sorry, no images were found for this location.'
  }
  else {
    imageDisplayData.url = temporaryImageURL;
    imageDisplayData.attributionMessage = `${selectedTrip.imageData.imageLocation}. Image by <cite><a target="_blank" href="https:\/\/pixabay.com\/users\/${selectedTrip.imageData.user}-${selectedTrip.imageData.userID}\/">${selectedTrip.imageData.user}</a></cite> from <cite><a target="_blank" href="https://pixabay.com/">Pixabay</a></cite>`;
  }
  return imageDisplayData;
}

function displayPlannedActivities(activitiesList) {
  if(activitiesList.length === 0) {
    return '<div class="custom-table-row custom-table-headers"><div class="custom-table-entry description-box">Description</div><div class="custom-table-entry">Time</div><div class="custom-table-entry">Date</div></div><div class="custom-table-row data-row"><div class="custom-table-entry description-box"></div><div class="custom-table-entry"></div><div class="custom-table-entry"></div></div>';
  }

  let activitiesHTML = '<div class="custom-table-row custom-table-headers"><div class="custom-table-entry description-box">Description</div><div class="custom-table-entry">Time</div><div class="custom-table-entry">Date</div></div>';
  const activities = activitiesList;
  for(let activity of activities) {
    activitiesHTML += '<div class="data-row custom-table-row">';
    activitiesHTML += `<div class="description-box custom-table-entry">${activity.description}</div>`;
    activitiesHTML += `<div class="custom-table-entry">${activity.setTime}</div>`;
    activitiesHTML += `<div class="custom-table-entry">${activity.setDate}</div>`;
    activitiesHTML += '</div>';
  }
  return activitiesHTML;
}

function displayWeatherData(weatherForecasts) {
  return '<div class="forecast-box"></div>';
}

function displaySelectedTrip(selectedTrip, temporaryImageURL) {
  const plannedActivities = document.getElementById('planned-activities-table');
  const weatherDisplay = document.querySelector('.weather-display');
  const locationImage = document.querySelector('img');
  const imageCaption = document.querySelector('figcaption');
  
  let plannedActivitiesRows = '';
  let weatherForecastDisplay = '';
  let selectedImage = '';
  let attributionMessage = '';
  let tripTitle = '';
  let dateRange = '';
  let tripLocation = '';
  let imageDisplayData = '';

  if(selectedTrip !== null) {
    imageDisplayData = displayImageData(selectedTrip, temporaryImageURL);
    selectedImage = imageDisplayData.url;
    attributionMessage = imageDisplayData.attributionMessage;
    plannedActivitiesRows = displayPlannedActivities(selectedTrip.activities);
    weatherForecastDisplay = displayWeatherData(selectedTrip.weatherForecasts);
    
    tripTitle = selectedTrip.title;
    const selectedTripStartDate = new Date(selectedTrip.startDate);
    const selectedTripEndDate = new Date(selectedTrip.endDate);
    const startDateString = `${selectedTripStartDate.getMonth() + 1}\/${selectedTripStartDate.getDate()}\/${selectedTripStartDate.getFullYear()}`;
    const endDateString = `${selectedTripEndDate.getMonth() + 1}\/${selectedTripEndDate.getDate()}\/${selectedTripEndDate.getFullYear()}`;
    dateRange = `${startDateString} - ${endDateString}`;
    tripLocation = `${selectedTrip.city}, ${selectedTrip.administrativeDivision}, ${selectedTrip.country}`;
  }
  else {
    plannedActivitiesRows = displayPlannedActivities([]);
    weatherForecastDisplay = displayWeatherData([]);
    imageDisplayData = displayImageData(null);
    selectedImage = imageDisplayData.url;
    attributionMessage = imageDisplayData.attributionMessage;
    tripTitle = 'Imagine an Amazing Trip!';
    tripLocation = 'Choose Your Destination!';
    dateRange = 'See How Long You Will Stay!';
  }
  
  const tripTitleHeader = document.getElementById('trip-title-header');
  const tripDestinationHeader = document.getElementById('trip-destination-header');
  const tripDurationHeader = document.getElementById('trip-duration-header');

  tripTitleHeader.innerHTML = tripTitle;
  tripDestinationHeader.innerHTML = tripLocation;
  tripDurationHeader.innerHTML = dateRange; 
  plannedActivities.innerHTML = plannedActivitiesRows;
  weatherDisplay.innerHTML = weatherForecastDisplay;
  locationImage.setAttribute('src', selectedImage);
  imageCaption.innerHTML = attributionMessage;
}

function displayTripData(sortedListOfTrips, selectedTrip, temporaryImageURL) {
  const tripSchedule = document.getElementById('trip-schedule-table');
  
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
 
  tripSchedule.innerHTML = tripTableRows;

  displaySelectedTrip(selectedTrip, temporaryImageURL);
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
    console.log(imageQuery);
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

function loadTripData() {
  getServerData({someTrip: null, method: 'retrieve'}, 'listOfTrips').then(function(data) {
    displayTripData(data.tripList, null, null);
  }).catch(function(error) {
    console.log(`Error: ${error}`);
    document.querySelector('.trip-schedule').insertAdjacentHTML('afterbegin', '<p class="error">The data could not be loaded from the server.');
  });
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

  if(tripTitleInput.value.length > 100) {
    tripTitleInput.insertAdjacentHTML('afterend', '<p class="error">Please enter 100 characters or less.</p>');
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
	getServerData({someTrip: tripData, method: 'insert'}, 'listOfTrips').then(function(serverData) {
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
  accessTripData,
  addActivity,
  checkForBlankFields,
  checkDateInput,
  deleteActivityData,
  deleteServerData,
  displayPlannedActivities,
  displaySelectedTrip,
  displayTripData,
  displayWeatherData,
  getDaysElapsed,
  getServerData,
  loadTripData,
  processWeatherData,
  locationFound,
  generateTripData,
  findLocationPhotograph
};
