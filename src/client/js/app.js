/*
 * Purpose: This function handles the functionality
 * for any of the buttons that use the table of trips.
 * This function determines whether the clicked button
 * is for deleting or displaying trips, and then
 * performs the appropriate course of action.
 *
 * Parameters:
 * - clickEvent: An Event object for when a button is clicked.
 */
function accessTripData(clickEvent) {
  clickEvent.preventDefault(); //Prevent the page from reloading.

  /* Get the Element containing the three buttons that interact with the trip table data. */
  const tripButtons = document.getElementById('trip-info-access');
  
  /* Remove any error messages that correspond to previous interactions with the three buttons. */
  const accessErrorMessages = tripButtons.getElementsByClassName('error');
  for(let errorMessage of accessErrorMessages) {
    errorMessage.remove();
  }
  
  /* If the button to cancel all trips was clicked, remove all trips from the table and the server. */
  if(clickEvent.target.id === 'cancel-all') {
    /* Clear the table of scheduled trips. */
    document.getElementById('trip-schedule-table').innerHTML = '<div class="custom-table-headers custom-table-row"><div class="custom-table-entry">Title</div><div class="custom-table-entry">City</div><div class="custom-table-entry">Admin. Division</div><div class="custom-table-entry">Country</div><div class="custom-table-entry">Start Date</div><div class="custom-table-entry">End Date</div></div>';
    
    /* Clear the list of trips on the server. Post an error message on the user interface if an error occurred. */
    deleteServerData({deleteTrips: 'all'}, 'listOfTrips').then(function(data) {}).catch(function(error) {
      console.log(`Error: ${error}`);
      document.getElementById('trip-info-buttons').insertAdjacentHTML('afterend', '<p class="error">The selected data could not be deleted from the server.');
    });
  }

  /* If the button for canceling one or more selected trips was called, delete the selected trips. */ 
  else if(clickEvent.target.id === 'cancel-trip') {
    /* Get the list of selected rows from the trip table. Check if there are any selected rows. */
    const canceledTrips = document.getElementById('trip-schedule-table').querySelectorAll('.selected-data-row');
    if(canceledTrips.length === 0) {
      document.getElementById('trip-info-buttons').insertAdjacentHTML('afterend', '<p class="error">One or more rows must be selected in order to delete trip data.</p>');
      return;
    }

    /* Collect data to identify which trips the server should delete, and remove the selected trips from the table. */
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

    /* Delete the selected trip(s) from the server. Post an error message on the user interface if an error occurred. */
    deleteServerData({deleteTrips: canceledData}, 'listOfTrips').then(function(data) {}).catch(function(error) {
      console.log(`Error: ${error}`);
      document.getElementById('trip-info-buttons').insertAdjacentHTML('afterend', '<p class="error">The trips could not be deleted from the server.');
    });
  }

  /* If the button for displaying a trip was called, display the information for the selected trip. */
  else if(clickEvent.target.id === 'display-info') {
    /* Get the selected trip. Ensure that one trip is selected. */
    const selectedTripRows = document.getElementById('trip-schedule-table').querySelectorAll('.selected-data-row');
    if(selectedTripRows.length > 1) {
      document.getElementById('trip-info-buttons').insertAdjacentHTML('afterend', '<p class="error">Please select only one trip to diplay.</p>');
      return;
    } 
    if(selectedTripRows.length === 0) {
      document.getElementById('trip-info-buttons').insertAdjacentHTML('afterend', '<p class="error">A trip must be selected in order to display its information.</p>');
      return;
    }

    const selectedTripRow = selectedTripRows[0];
    /* Get the data from the selected row on the trip table. This will be used to get the trip's entire data. */
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

    /* Get the selected trip's entire data from the server. */ 
    getServerData({someTrip: tripData, method: 'retrieve'}, 'listOfTrips').then(function(data) {
      /* Set the data for getting the trip's location image. */
      const imageQuery = {
        id: data.selectedTrip.imageData.imageID,
	city: data.selectedTrip.city,
	adminDiv: data.selectedTrip.administrativeDivision,
	country: data.selectedTrip.country
      };
      /* Retrieve an image for the trip's location, and then display the selected trip. */
      findLocationPhotograph(imageQuery).then(function(imageRetrieved) {
        /* Check if an error occurred on the server while retrieving the trip's location image. */
	if(imageRetrieved.message === 'An error occurred on the server while processing the data.') {
	  document.getElementById('trip-info-buttons').insertAdjacentHTML('afterend', '<p class="error">An error occurred on the server while retrieving the location image.</p>');
	  return;
	}
        
	displaySelectedTrip(data.selectedTrip, imageRetrieved.imageInfo.largeImageURL);
      
      /* If any errors occurred while retrieving the image, post an error message on the user interface. */
      }).catch(function(error) {
        console.log(`Error: ${error}`);
        document.getElementById('trip-info-buttons').insertAdjacentHTML('afterend', '<p class="error">The image for the selected data could not be retrieved.');
      });

    /* If any error occurred while retrieving the trip's entire data, post an error message on the user interface. */
    }).catch(function(error) {
      console.log(`Error: ${error}`);
      document.getElementById('trip-info-buttons').insertAdjacentHTML('afterend', '<p class="error">The selected data could not be retrieved from the server.');
    });
  }
}

/*
 * Purpose: This function handles the functionality
 * for the button that adds a new activity to a trip.
 * This function collects the user input that serves
 * as data for the activity that will be added to the trip.
 *
 * Parameters:
 * - submitEvent: An event for when form containing
 *   the new activity's data is submitted (i.e. the
 *   button to add an activity is clicked).
 *
 */
function addActivity(submitEvent) {
  submitEvent.preventDefault(); //Prevent the page from reloading.

  /* Remove any error messages from previous attempts to add an activity. */
  const activityErrors = document.querySelector('.activity-planner').querySelectorAll('.error');
  for(let activityError of activityErrors) {
    activityError.remove();
  }

  /* Get the three input fields for the new activity. */
  const descriptionBox = document.getElementById('activity-description');
  const givenTime = document.getElementById('activity-time');
  const givenDate = document.getElementById('activity-date');

  /* Ensure that there are none of the fields are blank. */
  const anyBlankFields = checkForBlankFields([descriptionBox, givenTime, givenDate]);
  if(anyBlankFields) {
    return;
  }

  /* Ensure that the user provided a time in the proper format. */
  const dateRegExp = new RegExp('[0-1]*[0-9]:[0-5][0-9] (AM|PM)', 'i');
  if(givenTime.value.match(dateRegExp) === null) {
    const errorText = '<p class="error">Please enter the time in the specified format (e.g. 1:00 PM). Make sure to remove leading zeros, and make sure that there is one space between the numbers and the AM/PM option.</p>';
    givenTime.insertAdjacentHTML('afterend', errorText);
    return;
  }

  /* Ensure that the user provided a valid date in the proper format. */
  const validDate = checkDateInput([givenDate]);
  if(!validDate) {
    return;
  }

  /* Ensure that the user entered only up to 250 characters for the activity description. */
  if(descriptionBox.value.length > 250) {
    descriptionBox.insertAdjacentHTML('afterend', '<p class="error">Please enter 250 characters or less.</p>');
    return;
  }

  /* Set the data for the new activity. */
  const newActivity = {
    description: descriptionBox.value,
    setTime: givenTime.value,
    setDate: givenDate.value
  };

  /* Get the full list of activities for the currently selected trip. */
  getServerData({givenActivity: newActivity}, 'tripActivities').then(function(data) {
    /* If no trip is currently selected, post a message on the user interface. */
    if(data.message === 'There is no trip that is currently displayed.') {
      submitEvent.target.insertAdjacentHTML('afterend', '<p class="error">Select and display a trip in order to add activities for the trip.');
    }
    /* Otherwise, display the updated list of activities for the selected trip. */
    else {
      const activityRows = displayPlannedActivities(data.listOfActivities);
      document.getElementById('planned-activities-table').innerHTML = activityRows;
    }

  /* If any errors occurred while retrieving the list of activities from the server,
   * post an error message on the user interface.
   */
  }).catch(function(error) {
    console.log(`Error: ${error}`);
    submitEvent.target.insertAdjacentHTML('afterend', '<p class="error">An error occurred while sending a request to the server</p>');
  });
}

/*
 * Purpose: This function checks if any of the provided
 * user input fields was left blank. If so, it posts
 * an error message on the user interface.
 *
 * Parameters:
 * - listOfInputs: A list of Elements containing
 *   the user input for the activity input fields.
 *
 * Return Value: A boolean value indicating
 * if any input fields were left blank.
 *
 */
function checkForBlankFields(listOfInputs) {
  let blankFields = false;
  /* Check if any input field was left blank. If so,
   * post an error message for that input field.
   */
  for(let givenInput of listOfInputs) {
    if(givenInput.value.length === 0) {
      givenInput.insertAdjacentHTML('afterend', '<p class="error">This field is required.</p>');
      blankFields = true;
    }
  }
  return blankFields;
}

/*
 * Purpose: This function checks if all of the
 * provided dates that the user provided are
 * valid and in the proper format.
 *
 * Parameters:
 * - listOfInputs: A list of Elements corresponding
 *   to the user input fields that contain dates.
 *
 * Return Value: A boolean value indicating if all
 * the given dates were valid and in the right format.
 *
 */
function checkDateInput(listOfInputs) {
  let validDateInput = true;
  const dateFormat = /\d{2}\/\d{2}\/\d{4}/;
  let dateMatch = null;

  /* Check if each given date is in the right format. */
  for(let givenInput of listOfInputs) {
    dateMatch = givenInput.value.match(dateFormat);
    /* If the date is not in the proper format, post an error message on the user interface. */
    if(dateMatch === null) {
      givenInput.insertAdjacentHTML('afterend', '<p class="error">Please provide the date in the specified format.</p>');
      validDateInput = false;
    }

    /* Otherwise, check if the given date is valid/existent. */
    else {
      let dateNumbers = givenInput.value.split('/'); //Get the individual components of the given date.
      /* Create a Date object based on the given date's components. */
      let calculatedDate = new Date(dateNumbers[2], `${parseInt(dateNumbers[0]) - 1}`, dateNumbers[1]);
      /* Get the individual components of the Date object. */
      let calculatedDateNumbers = [`${parseInt(calculatedDate.getMonth()) + 1}`, calculatedDate.getDate(), calculatedDate.getFullYear()];
      
      /* Check if the components of the given date match the components
       * of the created Date object. If they don't all match, that means
       * that the given date is not valid (i.e. it does not exist).
       */
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

/*
 * Purpose: This function is used to delete
 * data from the local server. This function sends
 * an HTTP DELETE request to the local server, and
 * returns the server response to the function that called
 * this function.
 *
 * Parameters:
 * - givenData: Data that specifies what data the server should delete.
 * - givenRoute: A route for the server data that is to be deleted.
 *
 * Return Value: A JavaScript object containing the server response, or
 * or an Error object if an error occurred while sending the request.
 *
 */
async function deleteServerData(givenData, givenRoute) {
  /* Send an HTTP DELETE request to the server. */
  const serverResponse = await fetch('https://localhost/' + givenRoute, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(givenData)
  });

  /* If the deletion was successful, return the server response.
   * Otherwise, return the error that occurred.
   */
  try {
    const responseData = await serverResponse.json();
    return responseData;
  }
  catch(error) {
    return error;
  }
}

/*
 * Purpose: This function handles the funtionality
 * for the two buttons that are used to delete activities.
 * This function determines which button was clicked, and
 * then deletes the appropriate amount of activities from
 * the currently displayed trip.
 *
 * Parameters:
 * - deleteInfo: An Event object that is generated when 
 *   one of the buttons is clicked.
 *
 */
function deleteActivityData(deleteInfo) {
  deleteInfo.preventDefault(); //Prevent the page from reloading.
  
  /* Remove any error messages from previous interaction with the buttons. */
  const activityErrorMessages = document.querySelector('.activity-planner').querySelectorAll('.error');
  for(let activityErrorMessage of activityErrorMessages) {
    activityErrorMessage.remove();
  }
  
  /* If the button to clear all activities was clicked, delete all activities. */
  if(deleteInfo.target.id === 'clear-activities') { 
    
    /* Delete all activities from the activities list of the currently selected trip on the server. */
    deleteServerData({selectedData: 'all'}, 'tripActivities').then(function(data) {

      /* If no trip is currently selected, display an error message. Otherwise, clear the activities table. */
      if(data.message === 'There is no trip that is currently displayed.') {
        document.getElementById('activity-info-buttons').insertAdjacentHTML('afterend', '<p class="error">Select and display a trip in order to cancel activities.</p>');
      }
      else {
        document.getElementById('planned-activities-table').innerHTML = '<div class="custom-table-headers custom-table-row"><div class="custom-table-entry">Description</div><div class="custom-table-entry">Time</div><div class="custom-table-entry">Date</div></div><div class="data-row custom-table-row"><div class="description-box custom-table-entry"></div><div class="custom-table-entry"></div><div class="custom-table-entry"></div></div>';
      }

    /* If any error occurred while attempting to clear the activities list on the server, post an error message. */
    }).catch(function(error) {
      console.log(`Error: ${error}`);
      document.getElementById('activity-info-buttons').insertAdjacentHTML('afterend', '<p class="error">The selected data could not be deleted from the server.');
    });
  }

  /* If the button to delete one or more selected trips is clicked, delete the selected activities. */
  else if(deleteInfo.target.id === 'cancel-activity') {

    /* Get the selected activities, collect their data, and add them to list of canceled activities. */
    const canceledActivities = document.getElementById('planned-activities-table').querySelectorAll('.selected-data-row');
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

    /* Delete the selected activities from the activities list of the currently selected trip on the server. */
    deleteServerData({selectedData: canceledData}, 'tripActivities').then(function(data) {

      /* If no trip is currently selected, post an error message. Otherwise, delete the activities from the activities table. */
      if(data.message === 'There is no trip that is currently displayed.') {
        document.getElementById('activity-info-buttons').insertAdjacentHTML('afterend', '<p class="error">Select and display a trip in order to cancel activities.</p>');
      }
      else {
        for(let canceledActivity of canceledActivities) {
          canceledActivity.remove();
        }
      }

    /* If any error occurred while attempting to delete the data on the server, post an error message. */
    }).catch(function(error) {
      console.log(`Error: ${error}`);
      document.getElementById('activity-info-buttons').insertAdjacentHTML('afterend', '<p class="error">The selected data could not be deleted from the server.');
    });
  }
}

/*
 * Purpose: This function is used to set the HTML
 * that will be used to display an image and its
 * related information on the webpage.
 *
 * Parameters:
 * - selectedTrip: An object containing the selected trip's data
 * - temporaryImageURL: A string containing a temporary URL for an image
 *
 * Return Value: An object containing the HTML and text that will be used
 * to display an image and its related information on the webpage.
 *
 */
function displayImageData(selectedTrip, temporaryImageURL) {
  /* Object that will contain the HTML and text
   * that will be used for the image and its information.
   */
  const imageDisplayData = {
    url: '',
    attributionMessage: ''
  };

  /* If a trip has not been selected for display,
   * show a generic image.
   */
  if(selectedTrip === null) {
    imageDisplayData.url = 'images/globe-3411506_1920.jpg';
    imageDisplayData.attributionMessage = 'Image by <cite><a target="_blank" href="https://pixabay.com/users/kreatikar-8562930/">Mudassar Iqbal</a></cite> from <cite><a target="_blank" href="https://pixabay.com/">Pixabay</a></cite>';
    return imageDisplayData;
  }

  /* If the selected trip has no image for its location,
   * display an image that indicates the lack of a photograph.
   */
  if(selectedTrip.imageData.imageID === null) {
    imageDisplayData.url = 'images/NoImageFound.png';
    imageDisplayData.attributionMessage = 'Sorry, no images were found for this location.'
  }

  /* Otherwise, set the text and HTML to display the image
   * and its related trip information.
   */
  else {
    imageDisplayData.url = temporaryImageURL;
    imageDisplayData.attributionMessage = `${selectedTrip.imageData.imageLocation}. Image by <cite><a target="_blank" href="https:\/\/pixabay.com\/users\/${selectedTrip.imageData.user}-${selectedTrip.imageData.userID}\/">${selectedTrip.imageData.user}</a></cite> from <cite><a target="_blank" href="https://pixabay.com/">Pixabay</a></cite>`;
  }
  return imageDisplayData;
}

/*
 * Purpose: This function sets the HTML for
 * displaying a selected trip's activities in
 * the activities table on the webpage.
 *
 * Parameters:
 * - activitiesList: An array containing activities for a selected trip
 *
 * Return Value: A string containing the HTML for the activities table
 *
 */
function displayPlannedActivities(activitiesList) {
  /* If there are no activities for the currently selected trip,
   * return HTML that will set the activities table to have a blank row.
   */
  if(activitiesList.length === 0) {
    return '<div class="custom-table-row custom-table-headers"><div class="custom-table-entry">Description</div><div class="custom-table-entry">Time</div><div class="custom-table-entry">Date</div></div>';
  }

  /* Otherwise, add HTML that will add a row to the activities table for each activity. */
  let activitiesHTML = '<div class="custom-table-row custom-table-headers"><div class="custom-table-entry">Description</div><div class="custom-table-entry">Time</div><div class="custom-table-entry">Date</div></div>';
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

/*
 * Purpose: This function sets the HTML
 * for displaying the weather forecasts
 * of a selected trip.
 *
 * Parameters:
 * - weatherForecasts: An array containing weather forecasts.
 *
 * Return Value: A string containing HTML to either
 * display the weather forecasts, or to display a
 * blank background.
 *
 */
function displayWeatherData(weatherForecasts) {
  /* If there are no weather forecasts, return HTML for a blank background. */
  if(weatherForecasts === null) {
    return '<div class="forecast-box"></div>';
  }

  /* Otherwise, add HTML that will display each weather forecast's information. */
  let forecastBoxes = '';
  for(let weatherForecast of weatherForecasts) {
    let forecastBox = '<div class="forecast-box">';
    forecastBox += `<div class="forecast-date">${weatherForecast.forecastDate}</div>`;
    forecastBox += '<div class="main-weather-info"><img src="' + weatherForecast.iconImage + '" alt="' + weatherForecast.description + '">';
    forecastBox += `<div class="small-weather-info"><div><strong>MMT:</strong> ${weatherForecast.maxTemperature}\/${weatherForecast.minTemperature}</div>`;
    forecastBox += `<div><strong>RH:</strong> ${weatherForecast.relativeHumidity}</div>`;
    forecastBox += `<div><strong>AP:</strong> ${weatherForecast.averagePressure}</div>`;
    forecastBox += `<div><strong>MUV:</strong> ${weatherForecast.maxUVIndex}</div></div></div>`;
    forecastBox += `<div class="general-weather-info">${weatherForecast.description}</div>`;
    forecastBox += `<div class="general-weather-info"><strong>ATCC:</strong> ${weatherForecast.averageTotalCloudCoverage}</div>`;
    forecastBox += `<div class="general-weather-info"><strong>WDWS:</strong> ${weatherForecast.windDirection}, ${weatherForecast.windSpeed}</div>`;
    forecastBox += `<div class="general-weather-info"><strong>PoP:</strong> ${weatherForecast.probabilityOfPrecipitation}</div>`;
    
    /* If the weather forecast is cloudy or sunny, don't add any more information that will be displayed for the forecast. */
    if(weatherForecast.iconCode.match(/c0[1-4]d/i)) {
      forecastBox += `</div>`;
    }

    /* Otherwise, add the HTML to show the appropriate additional weather information. */
    else {
      forecastBox += '<h4>Addtional Weather Information</h4>';
      forecastBox += '<div class="additional-weather-info">';

      /* If the forecast includes thunder, add HTML to show the precipitation, wind gust speed, and visibility. */
      if(weatherForecast.iconCode.match(/t0[1-5]d/i)) {
        forecastBox += `<div><strong>Precip:</strong> ${weatherForecast.additionalData.precipitation}</div>`;
	forecastBox += `<div><strong>WGS:</strong> ${weatherForecast.additionalData.windGustSpeed}</div>`;
	forecastBox += `<div><strong>Vis:</strong> ${weatherForecast.additionalData.visibility}</div>`;
      }

      /* If the forecast includes rain or drizzle, add HTML to show the precipitation and visibility. */
      else if(weatherForecast.iconCode.match(/[frud]0[0-6]d/i)) {
        forecastBox += `<div><strong>Precip:</strong> ${weatherForecast.additionalData.precipitation}</div>`;
	
	/* If the forecast includes rain (not drizzle), add HTML to show the wind gust speed. */
	if(weatherForecast.iconCode.match(/[fru]0[0-6]d/i)) {
	  forecastBox += `<div><strong>WGS:</strong> ${weatherForecast.additionalData.windGustSpeed}</div>`;
	}
	forecastBox += `<div><strong>Vis:</strong> ${weatherForecast.additionalData.visibility}</div>`;
      }

      /* If the forecast includes snow, add HTML to show the amount of snow, snow depth, precipitation, wind
       * gust speed, and visibility.
       */
      else if(weatherForecast.iconCode.match(/s0[1-6]d/i)) {
        forecastBox += `<div><strong>Snow:</strong> ${weatherForecast.additionalData.snow}</div>`;
	forecastBox += `<div><strong>Snow Depth:</strong> ${weatherForecast.additionalData.snowDepth}</div>`;
	forecastBox += `<div><strong>Precip:</strong> ${weatherForecast.additionalData.precipitation}</div>`;
	forecastBox += `<div><strong>WGS:</strong> ${weatherForecast.additionalData.windGustSpeed}</div>`;
	forecastBox += `<div><strong>Vis:</strong> ${weatherForecast.additionalData.visibility}</div>`;
      }

      /* If the forecast includes anything that affects visibility (fog, mist, sand, haze, smoke, etc.),
       * include visibility and any other relevant information.
       */
      else if(weatherForecast.iconCode.match(/a0[1-6]d/)) {
        
	/* If the forecast includes fog or mist, add HTML to display low-level cloud coverage and
	 * precipitation.
	 */
	if(weatherForecast.iconCode.match(/a0[156]d/)) {

	  /* If the forecast includes freezing fog, add HTML to display the amount of snow that will fall. */
	  if(weatherForecast.iconCode === 'a06d') {
	    forecastBox += `<div><strong>Snow:</strong> ${weatherForecast.additionalData.snow}`;
	  }
	  forecastBox += `<div><strong>LLCC:</strong> ${weatherForecast.additionalData.lowLevelCloudCoverage}</div>`;
	  forecastBox += `<div><strong>Precip:</strong> ${weatherForecast.additionalData.precipitation}</div>`;
	}
	forecastBox += `<div><strong>Vis:</strong> ${weatherForecast.additionalData.visibility}`;
      }
      forecastBox += '</div></div>';
    }
    forecastBoxes += forecastBox;
  }
  return forecastBoxes;
}

/*
 * Purpose: This function sets the HTML that will display the information
 * for a selected trip. This function sets the HTML for displaying a selected
 * trip's basic information on the webpage. It also calls other functions to
 * set the HTML and text that will display the trip's image data, weather forecasts,
 * and activities. Once all the HTML has been set, this function adds the HTML
 * to the webpage.
 *
 * Parameters:
 * - selectedTrip: An object containing a selected trip's data
 * - temporaryImageURL: A string containing a temporary URL for the trip's image
 *
 * Note: This function relies on the following functions: displayImageData,
 * displayWeatherData, and displayPlannedActivities.
 *
 */
function displaySelectedTrip(selectedTrip, temporaryImageURL) {
  /* Variables for Elements that will display the activities, weather forecasts,
   * image, and image caption for the selected trip.
   */
  const plannedActivities = document.getElementById('planned-activities-table');
  const weatherDisplay = document.querySelector('.weather-display');
  const locationImage = document.querySelector('img');
  const imageCaption = document.querySelector('figcaption');

  /* Variables for HTML that will display the trip's information. */
  let plannedActivitiesRows = '';  //Rows for displaying the trip's activities in the activities table
  let weatherForecastDisplay = ''; //Weather forecasts for the trip
  let selectedImage = '';          //The image for the trip's location
  let attributionMessage = '';     //Text giving the proper attribution for the image's source.
  let tripTitle = '';              //Title for the trip
  let dateRange = '';              //The start and end date for the trip
  let tripLocation = '';           //The trip's location
  let imageDisplayData = '';       //HTML and text that will be used to display the image and its related information

  /* If a trip has been selected, set the HTML to display its data. */
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
    dateRange = `${startDateString} - ${endDateString}, ${selectedTrip.numberOfDays} Day(s). Days Until Trip Starts: ${selectedTrip.countdown}`;

    /* If the trip has expired (i.e. its end date has passed),
     * add its expired status to the trip's display.
     */
    if(selectedTrip.expired) {
      dateRange += ' (Expired)';
    }
    /* If the trip is not expired but it has already started
     * (i.e. its start date has passed but not its end date),
     * add its "In Progress" status to the trip's display.
     */
    else if(!(selectedTrip.expired) && (selectedTrip.countdown <= 0)) {
      dateRange += ' (Trip In Progress)';
    }
    
    tripLocation = `${selectedTrip.city}, ${selectedTrip.administrativeDivision}, ${selectedTrip.country}`;
  }

  /* If a trip is not selected, set HTML to display a generic image and generic text. */
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

  /* Get the main Elements that correspond to headers above the trip's image. */
  const tripTitleHeader = document.getElementById('trip-title-header');
  const tripDestinationHeader = document.getElementById('trip-destination-header');
  const tripDurationHeader = document.getElementById('trip-duration-header');

  /* Add the HTML to the webpage. */
  tripTitleHeader.innerHTML = tripTitle;
  tripDestinationHeader.innerHTML = tripLocation;
  tripDurationHeader.innerHTML = dateRange; 
  plannedActivities.innerHTML = plannedActivitiesRows;
  weatherDisplay.innerHTML = weatherForecastDisplay;
  locationImage.setAttribute('src', selectedImage);
  imageCaption.innerHTML = attributionMessage;
}

/*
 * Purpose: This function displays all currently scheduled trips
 * in the trips table. It also displays the information for
 * the currently selected trip.
 *
 * Parameters:
 * - sortedListOfTrips: An array of sorted trips
 * - selectedTrip: An object containing the data for the currently selected trip
 * - temporaryImageURL: A string containing a temporary URL for the selected trip's image
 *
 * Note: This function relies on the displaySelectedTrip function to display
 * the selected trip.
 */
function displayTripData(sortedListOfTrips, selectedTrip, temporaryImageURL) {
  const tripSchedule = document.getElementById('trip-schedule-table'); //Element for accessing the table of scheduled trips.

  /* Set the HTML for the table row that contains the column headers. */
  let tripTableRows = '<div class="custom-table-row custom-table-headers"><div class="custom-table-entry">Title</div><div class="custom-table-entry">City</div><div class="custom-table-entry">Admin. Division</div><div class="custom-table-entry">Country</div><div class="custom-table-entry">Start Date</div><div class="custom-table-entry">End Date</div></div>';

  /* Add a row for each trip in the list of trips. */
  for(let someTrip of sortedListOfTrips) {
    let tableRow = '<div class="custom-table-row data-row">';

    /* If the current trip has expired (i.e. its end date has passed), add expired-trip
     * to its class list.
     */
    if(someTrip.expired) {
      tableRow = '<div class="custom-table-row data-row expired-trip">';
    }
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
 
  tripSchedule.innerHTML = tripTableRows; //Add the rows to the trips table.

  displaySelectedTrip(selectedTrip, temporaryImageURL); //Display the information for the currently selected trip.
}

/*
 * Purpose: This function is used to find a
 * photograph for a specified location. This
 * function will send HTTP POST requests to the local
 * server, each of which will seek a distinct category
 * of photographs. If an image is found for one of
 * the categories, it will be returned to the function
 * that called this function. Otherwise, the server reponse
 * is returned.
 *
 * Parameters:
 * - imageData: An object containing the data for the desired photograph
 *
 * Return Value: A promise that contains either an image, or
 * a server message indicating that an image could not be found.
 *
 */
async function findLocationPhotograph(imageData) {
  /* Data for finding the desired image */
  const imageQuery = {
    id: imageData.id, 
    city: imageData.city, 
    adminDiv: imageData.adminDiv, 
    country: imageData.country,
    photoType: ''
  };
  const photoCategories = ['buildings', 'places', 'nature'];
  let serverResponse = null;

  /* Try to find a photograph for each category of photographs.
   * If one is found, break the loop and return the photograph
   * and its related data to the function that called this function.
   */
  for(let photoCategory of photoCategories) {
    imageQuery.photoType = photoCategory;
    serverResponse = await getServerData(imageQuery, 'pixabayImages');

    /* Check if an image was found for the given category.
     * If an error occurred on the server return the server message.
     * If an image was found, return that image and its data. If not,
     * continue to the next category. If an error occurred
     * while sending a request to the server, return it.
     */
    try {
      if(serverResponse.message === 'An error occurred on the server while processing the data.') {
        return Promise.resolve(serverResponse);
      }
      else if(serverResponse.imageID === null) {
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
  return Promise.resolve(serverResponse); //Return the server response if no image was found for any category.
}

/*
 * Purpose: This function determines the number of days
 * that there are between two given dates.
 *
 * Parameters:
 * - startDate: A Date object containing the earlier date
 * - endDate: A Date object containing the later date
 *
 * Return Value: An integer representing the number of days
 * between the two dates
 *
 */
function getDaysElapsed(startDate, endDate) {
  let elapsedTime = endDate.getTime() - startDate.getTime(); //Get the number of milliseconds between the two dates.
  /* Convert the number of milliseconds to seconds, then minutes, then hours, then days. */
  elapsedTime /= 1000;
  elapsedTime /= 60;
  elapsedTime /= 60;
  elapsedTime /= 24;
  return Math.ceil(elapsedTime);
}

/*
 * Purpose: This function gets data from the
 * local server based on the given query and route.
 * This function sends an HTTP POST request to the server,
 * and returns the server data to the function that
 * called this function.
 *
 * Parameters:
 * - givenData: An object containing the data that is used to retrieve data from the server
 * - givenRoute: A string denoting the server route that the client wants to get data from
 *
 * Return Value: An object containing the retrieved server response or an error
 *
 */
async function getServerData(givenData, givenRoute) {
  /* Send an HTTP POST request to the server. */
  const serverResponse = await fetch('https://localhost/' + givenRoute, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(givenData)
  });

  /* Return the server response. If an error occurred,
   * return instead the error.
   */
  try {
    const responseData = await serverResponse.json();
    return responseData;
  }
  catch(error) {
    return error;
  }
}

/*
 * Purpose: This function loads the rows for the
 * table of scheduled trips. This function provides
 * the functionality for the button that displays the trip rows.
 *
 * Parameters:
 * - clickEvent: An Event that is generated when the button
 *   that display the trip table rows is clicked.
 *
 */
function loadTripData(clickEvent) {
  clickEvent.preventDefault(); //Prevent the page from reloading.

  /* Get the current list of trips from the server, and display rows for them. */
  getServerData({someTrip: null, method: 'retrieve'}, 'listOfTrips').then(function(data) {
    displayTripData(data.tripList, null, null);

  /* If an error occurred while retrieving the list of trips, post an error message. */
  }).catch(function(error) {
    console.log(`Error: ${error}`);
    clickEvent.target.insertAdjacentHTML('afterend', '<p class="error">The data could not be loaded from the server.');
  });
}

/*
 * Purpose: This function sets the weather forecast
 * data for a trip. This function looks through the data returned
 * from the Weatherbit Weather API, and collects the relevant information
 * for each forecast.
 *
 * Parameters:
 * - weatherInfo: An array containing objects that contain weather forecast data
 *
 * Return Value: An array containing objects that contain significant weather data
 *
 */
function processWeatherData(weatherInfo) {
  const allWeatherForecasts = []; //List of forecasts with their relevant information.

  /* Collect relevant data for each forecast. */
  for(let weatherForecast of weatherInfo) {
    /* This object will contain all relevant data for a given forecast. */
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
      maxUVIndex: weatherForecast.uv.toFixed(2) + ' of 10',
      additionalData: {
        windGustSpeed: weatherForecast.wind_gust_spd.toFixed() + ' m/s',
	precipitation: weatherForecast.precip.toFixed() + ' mm',
	snow: weatherForecast.snow.toFixed() + ' mm',
	snowDepth: weatherForecast.snow_depth.toFixed() + 'mm',
	lowLevelCloudCoverage: weatherForecast.clouds_low + '%',
	visibility: weatherForecast.vis.toFixed() + ' km'
      }
    }

    /* Rewrite the forecast's date in a more common format. */
    const dateComponents = weatherForecast.valid_date.split('-');
    dailyForecast.forecastDate = `${dateComponents[1]}\/${dateComponents[2]}\/${dateComponents[0]}`;

    /* Write the wind direction in a presentable format. */
    const windDirectionComponents = weatherForecast.wind_cdir_full.split('-');
    dailyForecast.windDirection += `${windDirectionComponents[0].charAt().toUpperCase()}${windDirectionComponents[0].slice(1).toLowerCase()}`;
    /* If the wind direction includes multiple directions (e.g. South-Southwest),
     * add them to the string containing the wind direction.
     */
    if(windDirectionComponents.length > 1) {
      for(let someComponent of windDirectionComponents.slice(1)) {
        dailyForecast.windDirection += `-${someComponent.charAt().toUpperCase()}${someComponent.slice(1).toLowerCase()}`;
      }
    }

    /* Set the string denoting the weather forecast's icon,
     * based on its weather icon code. Regular expressions
     * are used to match multiple icon codes to an icon.
     */
    if(dailyForecast.iconCode.match(/t0[1-3](d|n)/)) {
      dailyForecast.iconImage = 'images/icon_t01d.png';
    }
    else if(dailyForecast.iconCode.match(/t0[4-5](d|n)/)) {
      dailyForecast.iconImage = 'images/icon_t04d.png';
    }
    else if(dailyForecast.iconCode.match(/d0[1-3](d|n)/)) {
      dailyForecast.iconImage = 'images/icon_d01d.png';
    }
    else if(dailyForecast.iconCode.match(/[fru]0[0124](d|n)/)) {
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

/*
 * Purpose: This function determines whether the location
 * specified by the user input was found. This is determined
 * by seeing if the server returned the geographic coordinates
 * for the specified location.
 *
 * Parameters:
 * - cityInput: An Element containing the user input that specifies a city
 * - adminDivInput: An Element containing the user input that specifies an administrative division
 * - countryInput: An Element containing the user input that specifies a country
 *
 * Return Value: A boolean value indicating whether the specified location was found.
 *
 */
function locationFound(cityInput, adminDivInput, countryInput, serverResponseData) {
  const errorAdvice = 'Make sure that the name is spelled correctly, that the correct punctuation marks are included, and that abbreviations are avoided. Also, make sure that the three location inputs all correspond to an actual location.';
  const notFoundRegExp = /The given ([a-z]*\s*[a-z]+) was not found\./i;
  const serverMessage = serverResponseData.message;
  const notFoundMatch = serverMessage.match(notFoundRegExp); //Check if the server response message indicates that the location was not found.

  /* Print the appropriate error message on the user interface if an error occurred on the server. */
  if(serverMessage === 'An error occurred on the server while processing the data.') {
    document.getElementById('schedule-trip').insertAdjacentHTML('afterend', `<p class="error">${serverMessage}</p>`);
    return false;
  }

  /* Determine which portion of the specified location was not found. */
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

    /* If there were not locations found that nearly matched the specified location,
     * post error messages for all three input fields that specify a location.
     */
    if(elementId === null) {
      document.getElementById('city').insertAdjacentHTML('afterend', `<p class="error">${serverMessage} ${errorAdvice}</p>`);
      document.getElementById('admin-div').insertAdjacentHTML('afterend', `<p class="error">${serverMessage} ${errorAdvice}</p>`);
      document.getElementById('country').insertAdjacentHTML('afterend', `<p class="error">${serverMessage} ${errorAdvice}</p>`);
      return false;
    }
    /* Otherwise, if one of the input field values did not match any of the results in the server data,
     * post an error message that identifies the input field whose value was not found in the data.
     */
    else {
      document.getElementById(elementId).insertAdjacentHTML('afterend', `<p class="error">${serverMessage} ${errorAdvice}</p>`);
      return false;
    }
  }
  return true;
}

/*
 * Purpose: This function generates data for a new trip
 * based on the user input fields. This function collects
 * the values from the input fields, and then gets geographic coordinates,
 * weather data, and image data from the server based on the user input.
 * The data for the trip is put together and added to the server,
 * and then the webpage is updated to display the trip's data.
 *
 * Parameters:
 * - submitEvent: An Event that is generated when the form containing user
 * input for the trip is submitted (i.e. the button to schedule a trip is clicked).
 *
 */
function generateTripData(submitEvent) {
  submitEvent.preventDefault(); //Prevent the page from reloading.
  
  /* Remove any error messages from previous interactions with the button to schedule trips. */
  const errorMessages = document.querySelectorAll('.error');
  for(let errorMessage of errorMessages) {
    errorMessage.remove();
  }

  /* This object will contain all of the data relevant to the trip. */
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

  /* Get the Elements for the user input fields. */
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

  /* Prevent the user from entering a title that is more than 100 characters. */
  if(tripTitleInput.value.length > 100) {
    tripTitleInput.insertAdjacentHTML('afterend', '<p class="error">Please enter 100 characters or less.</p>');
    return;
  }
  tripData.title = tripTitleInput.value;

  /* Check if the given dates are valid and in the right format. */
  const validDates = checkDateInput([startDateInput, endDateInput]);
  if(!validDates) {
    return;
  }

  /* Convert the given dates to Date objects, which will be converted into strings that can be easily converted to Date objects. */
  const startDateComponents = startDateInput.value.split('/');
  const endDateComponents = endDateInput.value.split('/');
  tripData.startDate = new Date(startDateComponents[2], `${parseInt(startDateComponents[0]) - 1}`, startDateComponents[1]);
  tripData.endDate = new Date(endDateComponents[2], `${parseInt(endDateComponents[0]) - 1}`, endDateComponents[1]);

  tripData.numberOfDays = getDaysElapsed(tripData.startDate, tripData.endDate);
  const todayDate = new Date();
  tripData.countdown = getDaysElapsed(todayDate, tripData.startDate);
  
  /* Check if the user provided an end date that is before the given start date. */
  if(getDaysElapsed(tripData.startDate, tripData.endDate) < 0) {
    endDateInput.insertAdjacentHTML('afterend', '<p class="error">The end date must be on the same day as the start date, or it must be a day after the start date.</p>');
    return;
  }

  /* Check if the trip has expired (i.e. its end date has passed). */
  if(getDaysElapsed(todayDate, tripData.endDate) < 0) {
    tripData.expired = true;
  }

  /* Data for getting the geographic coordinates of the trip's location */
  const givenInput = {
    city: cityInput.value,
    adminDiv: adminDivInput.value,
    country: countryInput.value
  };

  /* Get the geographic coordinates for the trip's location. */
  getServerData(givenInput, 'geographicCoordinates').then(function(data) {
    /* Check if the specified location was found. */
    const locationWasFound = locationFound(cityInput, adminDivInput, countryInput, data);
    if(!locationWasFound) {
      return;
    }
    /* Set the geographic data for the trip's location. */
    tripData.city = data.locationInfo.city;
    tripData.administrativeDivision = data.locationInfo.adminDiv;
    tripData.country = data.locationInfo.country;
    tripData.latitude = data.locationInfo.latitude;
    tripData.longitude = data.locationInfo.longitude;

    /* Get the weather forecasts for the trip's location. */
    getServerData({latitude: tripData.latitude, longitude: tripData.longitude}, 'weatherForecast').then(function(weatherData) {
      /* Check if an error occurred on the server while retrieving the weather forecasts. */
      if(weatherData.message === 'An error occurred on the server while processing the data.') {
        submitEvent.target.insertAdjacentHTML('afterend', '<p class="error">An error occurred on the server while retrieving the weather forecasts.</p>');
	return;
      }

      tripData.weatherForecasts = processWeatherData(weatherData.weatherInfo);
      
      /* Try to find a photograph for the trip's location. */
      findLocationPhotograph({id: '', city: tripData.city, adminDiv: tripData.administrativeDivision, country: tripData.country})
      .then(function(imageResults) {
        /* Check if an error occurred on the server while getting the trip's location image. */
	if(imageResults === 'An error occurred on the server while processing the data.') {
	  submitEvent.target.insertAdjacentHTML('afterend', '<p class="error">An error occurred on the server while getting the location image.</p>');
	  return;
	}
        
        /* Set the data for the trip's image. */
	tripData.imageData.imageID = imageResults.imageID;
	tripData.imageData.imageLocation = imageResults.foundLocation;
	tripData.imageData.user = imageResults.user;
	tripData.imageData.userID = imageResults.userID;

	/* Insert the object containing the trip's complete data into the list of trips on the server. */
	getServerData({someTrip: tripData, method: 'insert'}, 'listOfTrips').then(function(serverData) {
	  const sortedTrips = serverData.tripList;
	  displayTripData(sortedTrips, tripData, imageResults.largeImageURL); //Display the list of trips and the new trip's data.
	
	/* If any errors occur while inserting the new trip into the list of trips
	 * or while displaying the trip data, display an error message. 
	 */
	}).catch(function(error) {
	  console.log(`Error: ${error}`);
          document.getElementById('schedule-trip').insertAdjacentHTML('afterend', '<p class="error">An error occurred while sending a request to the server</p>');
          return;
	});
      
      /* If an error occurs while finding an image for the trip, display an error message. */
      }).catch(function(error) {
        console.log(`Error: ${error}`);
	document.getElementById('schedule-trip').insertAdjacentHTML('afterend', '<p class="error">An error occurred while sending a request to the server</p>');
        return;
      });

    /* If an error occurs while retrieving the trip's weather forecasts,
     * display an error message.
     */
    }).catch(function(error) {
      console.log(`Error: ${error}`);
      document.getElementById('schedule-trip').insertAdjacentHTML('afterend', '<p class="error">An error occurred while sending a request to the server</p>');
      return;
    });

  /* If an error occurred while searching for the specified location,
   * display an error message.
   */
  }).catch(function(error) {
    console.log(`Error: ${error}`);
    document.getElementById('schedule-trip').insertAdjacentHTML('afterend', '<p class="error">An error occurred while sending a request to the server</p>');
    return;
  }); 
}

/*
 * Purpose: This function is used to update data
 * on the local server. This function sends an HTTP
 * PUT request to the server, and returns the server
 * response to the function that called this function.
 *
 * Parameters:
 * - givenData: An object containing data that will be used to update data on the server
 * - givenRoute: A string denoting the server route that leads to the data that will be updated.
 *
 * Return Value: An object containing the server response or an Error.
 *
 */
async function updateServerData(givenData, givenRoute) {
  /* Send an HTTP PUT request to the server. */
  const serverResponse = await fetch('https://localhost/' + givenRoute, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(givenData)
  });

  /* Return the server response, or return an Error
   * if an error occurred.
   */
  try {
    const responseData = await serverResponse.json();
    return responseData;
  }
  catch(error) {
    return error;
  }
}

/*
 * Purpose: This function is used
 * to update the weather forecasts for the currently
 * selected trip.
 *
 * Parameters:
 * - clickEvent: An Event caused when the button to update
 *   the weather forecasts is clicked.
 *
 */
function updateWeatherForecasts(clickEvent) {
  clickEvent.preventDefault(); //Prevent the page from reloading.

  /* Remove any error messages from previous interaction with the button for updating weather forecasts. */
  const weatherErrors = document.querySelector('.weather-forecast').querySelectorAll('.error');
  for(let weatherError of weatherErrors) {
    weatherError.remove();
  }

  /* Get the currently selected element. */
  const selectedTripRow = document.getElementById('trip-schedule-table').querySelector('.selected-data-row');
  if(selectedTripRow === null) {
    clickEvent.target.insertAdjacentHTML('afterend', '<p class="error">A trip must be selected and displayed in order to update its weather information.</p>');
    return;
  }

  /* Get the data from the trip table that is needed to identify a trip. */
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

  /* Get the complete data for the selected trip. */
  getServerData({someTrip: tripData, method: 'retrieve'}, 'listOfTrips').then(function(data) {
    
    /* Get new weather forecasts for the selected trip. */
    getServerData({latitude: data.selectedTrip.latitude, longitude: data.selectedTrip.longitude}, 'weatherForecast').then(function(weatherData) {
      /* Display an error message if the weather forecasts could not be retrieved. */
      if(weatherData.message === 'An error occurred on the server while processing the data.') {
        clickEvent.target.insertAdjacentHTML('afterend', '<p class="error">An error occurred on the server while generating the weather forecasts.</p>');
      }

      /* Update the weather forecast list for the selected trip and display the new weather forecasts on the webpage. */
      else {
        const updatedForecasts = processWeatherData(weatherData.weatherInfo);
	updateServerData({newWeatherForecasts: updatedForecasts}, 'weatherForecast').then(function(updateResponse) {
	  displayWeatherData(updatedForecasts);
	
	/* Display an error message if an error occurred while updating the selected trip's weather forecasts. */
	}).catch(function(error) {
	  console.log(`Error: ${error}`);
	  clickEvent.target.insertAdjacentHTML('afterend', '<p class="error">An error occurred while updating the weather data on the server.</p>');
	});
      }
    
    /* Display an error message if any error occurred while getting new weather forecasts. */
    }).catch(function(error) {
      console.log(`Error: ${error}`);
      clickEvent.target.insertAdjacentHTML('afterend', '<p class="error">An error occurred while retrieving new weather data from the server.</p>');
    });
  
  /* Display an error message if any error occurred while getting the selected trip's complete data. */
  }).catch(function(error) {
    console.log(`Error: ${error}`);
    clickEvent.target.insertAdjacentHTML('afterend', '<p class="error">An error occurred while retrieving the trip data from the server.</p>');
  });
}

/* Export all function for implementation and/or testing. */
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
  findLocationPhotograph,
  updateServerData,
  updateWeatherForecasts
};
