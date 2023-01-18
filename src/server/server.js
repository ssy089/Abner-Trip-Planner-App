/* Import the functions that are used to sort the list of trips. */
const mergeTripArrays = require('./sortTrips').mergeTripArrays;
const tripsIterativeMergeSort = require('./sortTrips').tripsIterativeMergeSort;

/* Setup environemnt variables using the .env file. */
const dotenv = require('dotenv');
dotenv.config();

/* Middleware and dependencies for the application */
const bodyParser = require('body-parser'); //Used for parsing request bodies
const cors = require('cors');              //Used for enabling CORS requests
const express = require('express');        //Used for creating the server
const fetch = require('node-fetch');       //Used for implementing the Fetch API
const port = 80;                         //Port number for the server

/* Set the API keys for the GeoNames API, Weatherbit Weather API, and Pixabay API. */
const GEONAMES_USERNAME = process.env.GEONAMES_USERNAME;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const WEATHERBIT_API_KEY = process.env.WEATHERBIT_API_KEY;

/* Set the base URLs that will be used to fetch data from the APIs. */
const geonamesBaseURL = `http:\/\/api.geonames.org\/search?username=${GEONAMES_USERNAME}&type=json`;
const pixabayBaseURL = `https:\/\/pixabay.com\/api\/?key=${PIXABAY_API_KEY}&safesearch=true&image_type=photo`;
const weatherbit_forecast_baseURL = `http:\/\/api.weatherbit.io\/v2.0\/forecast\/daily?key=${WEATHERBIT_API_KEY}`;

let listOfTrips = [];              //List of scheduled trips
let currentlySelectedTrip = null;  //Trip that is currently being displayed on the webpage
let currentlySelectedIndex = null; //Index of the currently selected trip

/* Create an application instance and set the middleware. */
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

/* Point the application instance to the folder containing the webpage files. */
app.use(express.static('./dist'));

/* Start the local server. */
const server = app.listen(port, function() {
  console.log('Trip Planner App is running on http://localhost');
});

/*
 * Purpose: This function retrieves data from an API.
 * This function makes an HTTP POST request to an API, 
 * and returns the data to the client.
 *
 * Parameters:
 * - givenBaseURL: A string containing the base URL for an API request.
 * - givenQuery: A string containing the query for the API request.
 *
 */
async function getAPIData(givenBaseURL, givenQuery) {
  const apiResponse = await fetch(givenBaseURL + givenQuery); //Fetch data from the specified API.

  /* If the call to the API was successful,
   * return the data as a Javascript object.
   * Otherwise, return an error;
   */
  try {
    const responseData = await apiResponse.json();
    return responseData;
  }
  catch(error) {
    return error;
  }
}

/* DELETE route for client requests that need to delete one or more trip activities */
app.delete('/tripActivities', function(req, res) {
  const selectedData = req.body.selectedData; //Data selected for deletion 

  /* If there is no currently selected trip, notify the client. */
  if(currentlySelectedTrip === null) {
    res.status = 200;
    res.json({message: 'There is no trip that is currently displayed.'});
  }

  /* Otherwise, delete one or more activities. */
  else {
    const activities = currentlySelectedTrip.activities; //List of activities for the currently selected trip

    /* If the client requested to delete all activities, clear the activities list. */
    if(selectedData === 'all') {
      currentlySelectedTrip.activities = [];
    }
    /* Otherwise, delete the specified activities. */
    else { 
      let i = 0;
      let j = 0;
      for(i = 0; i < selectedData.length; i++) {
        for(j = 0; j < activities.length; j++) {
          if((selectedData[i].description === activities[j].description) && ((selectedData[i].setTime == activities[j].setTime) && (selectedData[i].setDate && activities[j].setDate))) {
	    activities.splice(j, 1);
	    break;
	  }
        }
      }
      currentlySelectedTrip.activities = activities;
    }
    res.status = 200;
    res.json({message: 'The data was deleted.'});
  }
});

/* POST route for client requests that want to add an activity to the currently selected trip's activities list. */
app.post('/tripActivities', function(req, res) {

  /* If no trip is currently being display by the webpage, notify the client. */
  if(currentlySelectedTrip === null) {
    res.status = 200;
    res.json({message: 'There is no trip that is currently displayed.'});
  }
  /* Otherwise, add the activity to the currently selected trip's list of activities and return the list. */
  else {
    currentlySelectedTrip.activities.push(req.body.givenActivity);
    res.status = 200;
    res.json({message: "The activities list was updated", listOfActivities: currentlySelectedTrip.activities});
  }
});

/* POST route for client requests that need to get the geographic coordinates for a given location */
app.post('/geographicCoordinates', function(req, res) {
  const cityComponents = req.body.city.split(/ +/); //Split the city string if it contains spaces, and then concatenate the parts with '+'.
  const givenQuery = `&name_equals=${cityComponents.join('+')}`; //Set the query to look for the city.

  /* Get the geographic coordinates using the GeoNames API. */
  getAPIData(geonamesBaseURL, givenQuery).then(function(data) {

    /* Notify the user if no data could be found for the given city. */
    if(data.totalResultsCount.length === 0) {
      res.status = 200;
      res.json({message: 'The given city was not found.'});
    }

    /* Variables to indicate if the specified city, administrative division,
     * and country were found.
     */
    let cityFound = false;
    let adminDivFound = false;
    let countryFound = false;
    let resultFound = []; //Array to contain data of the found location
    
    /* Break up the strings for the city, administrative division,
     * and country. Then, make a regular expression for each item.
     * The regular expression will be used to check the data.
     */
    const cityStringPattern = cityComponents.join(',* ');
    const cityRegExp = new RegExp(cityStringPattern, 'i');
    const adminDivComponents = req.body.adminDiv.split(/ +/);
    const adminDivStringPattern = adminDivComponents.join(',* ');
    const adminDivRegExp = new RegExp(adminDivStringPattern, 'i');
    const countryComponents = req.body.country.split(/ +/);
    const countryStringPattern = countryComponents.join(',* ');
    const countryRegExp = new RegExp(countryStringPattern, 'i');

    /* Look through the list of geographic data results. */
    for(let geoname of data.geonames) {
      /* Variables to indicate if the data matches the
       * city, administrative division, and country
       * specified by the client.
       */
      let cityMatch = false;
      let adminDivMatch = false;
      let countryMatch = false;
      
      /* Check if the information in the data matches the
       * city, administrative divison, and country that
       * are specified by the client.
       */
      if(geoname.name.match(cityRegExp)) {
        cityMatch = true;
	cityFound = true;
      }
      if(geoname.adminName1.match(adminDivRegExp)) {
        adminDivMatch = true;
	adminDivFound = true;
      }
      if(geoname.countryName.match(countryRegExp)) {
        countryMatch = true;
	countryFound = true;
      }

      /* Check if all three user specifications were met
       * (i.e. the specified location was found).
       */
      if(cityMatch && (adminDivMatch && countryMatch)) {
        resultFound.push(geoname);
	break;
      }
    }
    res.status = 200;
    
    /* If the location was not found, notify the user
     * which portion of the specified location was not found.
     */
    if(resultFound.length === 0) {
      if(!cityFound) {
	res.json({message: 'The given city was not found.'});
      }
      else if(!adminDivFound) {
        res.json({message: 'The given administrative division was not found.'});
      }
      else if(!countryFound) {
        res.json({message: 'The given country was not found.'});
      }
      else {
        res.json({message: 'The given location was not found.'});
      }
    }
    /* Otherwise, send the geographic data to the client. */
    else {
      res.json({
        message: 'The given location has been located.',
	locationInfo: {
	  city: resultFound[0].name,
	  adminDiv: resultFound[0].adminName1,
	  country: resultFound[0].countryName,
	  latitude: resultFound[0].lat,
	  longitude: resultFound[0].lng
	}
      });
    }
  /* Catch any errors that occur while attempting to call the GeoNames API,
   * and notify the client.
   */
  }).catch(function(error) {
    console.log(`Error: ${error}`);
    res.status = 500;
    res.json({message: 'An error occurred on the server while processing the data.'});
  });
});

/* DELETE route for client request that want to delete one or more trips. */
app.delete('/listOfTrips', function(req, res) {
  const tripsToDelete = req.body.deleteTrips; //List of trips to delete

  /* If the user wants to delete all scheduled trips, clear the list of trips. */
  if(tripsToDelete === 'all') {
    listOfTrips = [];
    currentlySeletedIndex = null;
    currentlySelectedTrip = null;
  }
  /* Otherwise, delete the specified trips from the list of trips. */
  else {
    let i = 0;
    let j = 0;
    for(i = 0; i < tripsToDelete.length; i++) {
      for(j = 0; j < listOfTrips.length; j++) {
        /* If a match is found for the specified trip, delete it from the list of trips. */
        if(((tripsToDelete[i].title === listOfTrips[j].title) && (tripsToDelete[i].city === listOfTrips[j].city)) && ((tripsToDelete[i].startDate === listOfTrips[j].startDate) && (tripsToDelete[i].endDate === listOfTrips[j].endDate))) {
	  /* If a trip is currently being displayed on the webpage, check if the trip that is currently going
	   * to be deleted is the currently selected trip. If so, update the variables for the currently selected trip.
	   */
	  if(currentlySelectedTrip !== null) {
	    if(((currentlySelectedTrip.title === listOfTrips[j].title) && (currentlySelectedTrip.city === listOfTrips[j].city)) && ((currentlySelectedTrip.startDate === listOfTrips[j].startDate) && (currentlySelectedTrip.endDate === listOfTrips[j].endDate))) {
	      currentlySelectedTrip = null;
	      currentlySelectedIndex = null;
	    }
	  }
	  listOfTrips.splice(j, 1); 
	  break;
	}
      }
    }
  }
  res.status = 200;
  res.json({message: 'The data was deleted'});
});

/* POST route for client requests that want to add a trip to the list of trips, and/or retrieve the list of trips */
app.post('/listOfTrips', function(req, res) {
  /* If a trip was given, determine whether to add the trip and/or send the list of trips. */ 
  if(req.body.someTrip !== null) { 
    currentlySelectedTrip = req.body.someTrip;

    /* If the client wants to insert a trip, add the specified trip to the list of trips. */
    if(req.body.method === 'insert') { 
      listOfTrips.push(req.body.someTrip);
      listOfTrips = tripsIterativeMergeSort(listOfTrips);
    }

    /* Find the specified trip in the list of trips. */
    for(let i = 0; i < listOfTrips.length; i++) {
      /* Once the specified trip is found, set the variables for the currently selected trip. */
      if(((currentlySelectedTrip.title === listOfTrips[i].title) && (currentlySelectedTrip.city === listOfTrips[i].city)) && ((currentlySelectedTrip.startDate === listOfTrips[i].startDate) && (currentlySelectedTrip.endDate === listOfTrips[i].endDate))) {
        currentlySelectedIndex = i;
	currentlySelectedTrip = listOfTrips[i];
	break;
      }
    }
    res.status = 200;
    res.json({tripList: listOfTrips, selectedTrip: currentlySelectedTrip});
  }
  /* Otherwise, just send the list of trips. */
  else {
    res.status = 200;
    res.json({tripList: listOfTrips});
  }
});

/* POST route for client requests that want to get weather forecasts for a specified location. */
app.post('/weatherForecast', function(req, res) {
  const givenQuery = `&lat=${req.body.latitude}&lon=${req.body.longitude}`; //Use the given geographic coordinates for the query.
  
  /* Get the forecasts from the Weatherbit Weather API. */
  getAPIData(weatherbit_forecast_baseURL, givenQuery).then(function(weatherData) {
    res.status = 200;
    res.json({message: 'The weather data for the given coordinates has been retrieved.', weatherInfo: weatherData.data});

  /* If any errors occurred while attempting to call the Weatherbit Weather API, notify the client. */
  }).catch(function(error) {
    console.log(`Error: ${error}`);
    res.status = 500;
    res.json({message: 'An error occurred on the server while processing the data.'});
  });
});

/* PUT route for any client requests that want to update the weather forecasts for the currently selected trip. */
app.put('/weatherForecast', function(req, res) {
  currentlySelectedTrip.weatherForecasts = req.body.newWeatherForecasts; //Update the forecasts for the currently selected trip.
  listOfTrips[currentlySelectedIndex].weatherForecasts = req.body.newWeatherForecasts; //Make the same update in the list of trips.
  res.status = 200;
  res.json({message: 'The weather forecasts for the currently selected trip have been updated.'});
});

/* POST route for any client requests that want to get a photograph of a specified location. */
app.post('/pixabayImages', function(req, res) {
  let givenQuery = ''; //Query to be used when calling the Pixabay API

  /* If the client specified an image's ID, use that ID to find an image. */
  if(req.body.id !== '') {
    givenQuery = `&id=${req.body.id}`;
    /* Call the Pixabay API, using the image ID to find a specific image. */
    getAPIData(pixabayBaseURL, givenQuery).then(function(retrievedImage) {
      const imageData = {largeImageURL: retrievedImage.hits[0].largeImageURL}; //Data to be returned to the client.
      res.status = 200;
      res.json({message: 'The requested image was retrieved.', imageInfo: imageData, imageID: req.body.id});

    /* If any errors occurred while calling the Pixabay API, notify the client. */
    }).catch(function(error) {
      console.log(`Error: ${error}`);
      res.status = 500;
      res.json({message: 'An error occurred on the server while processing the data.'});
    });
  }
  /* Otherwise, use the geographic data to find an image for the desired location. */
  else {
    /* Variables to be used in the image query */
    const photoType = req.body.photoType;
    const city = req.body.city;
    const adminDiv = req.body.adminDiv;
    const country = req.body.country;

    /* First find any images that correspond to the specified city, administrative division, and country. */
    givenQuery = `&category=${photoType}&q=${city},${adminDiv},${country}`.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    getAPIData(pixabayBaseURL, givenQuery).then(function(retrievedImages1) {

      /* Second, find any images that correspond to the specified city and administrative division. */
      givenQuery = `&category=${photoType}&q=${city},${adminDiv}`.normalize("NFD").replace(/\p{Diacritic}/gu, "");
      getAPIData(pixabayBaseURL, givenQuery).then(function(retrievedImages2) {

        /* Third, find any images that correspond to the specified country. */
        givenQuery = `&category=${photoType}&q=${country}`.normalize("NFD").replace(/\p{Diacritic}/gu, "");
        getAPIData(pixabayBaseURL, givenQuery).then(function(retrievedImages3) {

	  /* If any images were found that correspond to the specified city, administrative division,
	   * and city, send an image to the user.
	   */
	  if(retrievedImages1.hits.length !== 0) {
            /* If more than one image was found, send the second image
	     * instead of the first image. This will take advantage
	     * of the variety of results.
	     */
	    if(retrievedImages1.hits.length > 1) {
              res.status = 200;
              res.json({
                message: 'An image was found for the given location.', 
                imageID: retrievedImages1.hits[1].id,
                foundLocation: `${city}, ${adminDiv}, ${country}`,
                largeImageURL: retrievedImages1.hits[1].largeImageURL,
                user: retrievedImages1.hits[1].user,
                userID: retrievedImages1.hits[1].user_id
              });
            }
	    /* Otherwise, send the only result. */
            else {
              res.status = 200;
              res.json({
                message: 'An image was found for the given location.',
                imageID: retrievedImages1.hits[0].id,
                foundLocation: `${city}, ${adminDiv}, ${country}`,
                largeImageURL: retrievedImages1.hits[0].largeImageURL,
                user: retrievedImages1.hits[0].user,
                userID: retrievedImages1.hits[0].user_id
              });
            }
          }
	  /* Otherwise, see if any images were found that correspond
	   * to the given city and administrative division. If so,
	   * send an image to the client.
	   */
          else if(retrievedImages2.hits.length !== 0) {
            /* If more than one image was found for the given city and
	     * administrative division, send the second result.
	     * this will take advantage of the variety of the results.
	     * Otherwise, send the only result.
	     */
	    if(retrievedImages2.hits.length > 1) {
              res.status = 200;
              res.json({
                message: 'An image was found for the given location.', 
                imageID: retrievedImages2.hits[1].id,
                foundLocation: `${city}, ${adminDiv}, ${country}`,
                largeImageURL: retrievedImages2.hits[1].largeImageURL,
                user: retrievedImages2.hits[1].user,
                userID: retrievedImages2.hits[1].user_id
              });
            }
            else {
              res.status = 200;
              res.json({
                message: 'An image was found for the given location.',
                imageID: retrievedImages2.hits[0].id,
                foundLocation: `${city}, ${adminDiv}, ${country}`,
                largeImageURL: retrievedImages2.hits[0].largeImageURL,
                user: retrievedImages2.hits[0].user,
                userID: retrievedImages2.hits[0].user_id
              });
            }
          }
	  /* If no images were found for the specified city,
	   * try to instead to send an image of the corresponding
	   * country. If so, select an image to send.
	   */
	  else if(retrievedImages3.hits.length !== 0) {
            /* If more than one image was found, send the second
	     * image. This will take advantage of the variety of
	     * the results. Otherwise, send the only result.
	     */
	    if(retrievedImages3.hits.length > 1) {
              res.status = 200;
              res.json({
                message: 'An image was found for the given location.', 
                imageID: retrievedImages3.hits[1].id,
                foundLocation: country,
                largeImageURL: retrievedImages3.hits[1].largeImageURL,
                user: retrievedImages3.hits[1].user,
                userID: retrievedImages3.hits[1].user_id
              });
            }
            else {
              res.status = 200;
              res.json({
                message: 'An image was found for the given location.',
                imageID: retrievedImages3.hits[0].id,
                foundLocation: country,
                largeImageURL: retrievedImages3.hits[0].largeImageURL,
                user: retrievedImages3.hits[0].user,
                userID: retrievedImages3.hits[0].user_id
              });
            }
          }
	  /* Otherwise, notify the client that no images could
	   * be found for the specified city or for the corresponding
	   * country.
	   */
	  else {
	    res.status = 200;
            res.json({
              message: 'An image could not be found for the given location.',
              imageID: null,
              foundLocation: null,
              largeImageURL: null,
              user: null,
              userID: null
            });
          }

	/* Catch any errors that occurred while
	 * finding images for the specified country,
	 * and notify the client.
	 */
	}).catch(function(error) {
	  console.log(`Error Name: ${error.name}, Error Message: ${error.message}`);
          res.status = 500;
          res.json({message: 'An error occurred on the server while processing the data.'});
        });
      /* Catch any errors that occurred while
       * finding images for the specified city and
       * administrative division, and notify the client.
       */
      }).catch(function(error) {
        console.log(`Error Name: ${error.name}, Error Message: ${error.message}`);
        res.status = 500;
        res.json({message: 'An error occurred on the server while processing the data.'});
      });
    /* Catch any errors that occurred while
     * finding images for the specified city and
     * administrative division, and notify the client.
     */
    }).catch(function(error) {
      console.log(`Error Name: ${error.name}, Error Message: ${error.message}`);
      res.status = 500;
      res.json({message: 'An error occurred on the server while processing the data.'});
    });     
  }
});
