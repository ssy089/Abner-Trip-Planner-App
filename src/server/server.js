/* Setup environemnt variables using the .env file. */
const dotenv = require('dotenv');
dotenv.config();

/* Middleware and dependencies for the application */
const bodyParser = require('body-parser'); //Used for parsing request bodies
const cors = require('cors');              //Used for enabling CORS requests
const express = require('express');        //Used for creating the server
const fetch = require('node-fetch');       //Used for implementing the Fetch API
const port = 8081;                         //Port number for the server

const GEONAMES_USERNAME = process.env.GEONAMES_USERNAME;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const WEATHERBIT_API_KEY = process.env.WEATHERBIT_API_KEY;

const geonamesBaseURL = `http:\/\/api.geonames.org\/search?username=${GEONAMES_USERNAME}&type=json`;
const pixabayBaseURL = `https:\/\/pixabay.com\/api\/?key=${PIXABAY_API_KEY}&safesearch=true&image_type=photo`;
const weatherbit_current_baseURL = `http:\/\/api.weatherbit.io\/v2.0\/current?key=${WEATHERBIT_API_KEY}`;
const weatherbit_forecast_baseURL = `http:\/\/api.weatherbit.io\/v2.0\/forecast\/daily?key=${WEATHERBIT_API_KEY}`;

const listOfTrips = [];
let currentlySelectedTrip = {};

/* Create an application instance and set the middleware. */
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

/* Point the application instance to the folder containing the webpage files. */
app.use(express.static('./dist'));

/* Start the local server. */
const server = app.listen(port, function() {
  console.log('Travel App is running on http://localhost:8081');
});

async function getAPIData(givenBaseURL, givenQuery) {
  const apiResponse = await fetch(givenBaseURL + givenQuery);

  try {
    const responseData = await apiResponse.json();
    return responseData;
  }
  catch(error) {
    return error;
  }
}

app.post('/geographicCoordinates', function(req, res) {
  const cityComponents = req.body.city.split(/ +/);
  const givenQuery = `&name_equals=${cityComponents.join('+')}`;
  getAPIData(geonamesBaseURL, givenQuery).then(function(data) {
    if(data.totalResultsCount === 0) {
      res.status = 200;
      res.json({message: 'The given city was not found.'});
    }
    let cityFound = false;
    let adminDivFound = false;
    let countryFound = false;
    let resultFound = [];
    
    const cityStringPattern = cityComponents.join(',* ');
    const cityRegExp = new RegExp(cityStringPattern, 'i');
    const adminDivComponents = req.body.adminDiv.split(/ +/);
    const adminDivStringPattern = adminDivComponents.join(',* ');
    const adminDivRegExp = new RegExp(adminDivStringPattern, 'i');
    const countryComponents = req.body.country.split(/ +/);
    const countryStringPattern = countryComponents.join(',* ');
    const countryRegExp = new RegExp(countryStringPattern, 'i');

    for(let geoname of data.geonames) {
      let cityMatch = false;
      let adminDivMatch = false;
      let countryMatch = false;
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
      if(cityMatch && (adminDivMatch && countryMatch)) {
        resultFound.push(geoname);
	break;
      }
    }
    res.status = 200;
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
  }).catch(function(error) {
    console.log(`Error: ${error}`);
    res.status = 500;
    res.json({message: 'An error occurred on the server while processing the data.'});
  });
});

app.post('/listOfTrips', function(req, res) {
  listOfTrips.push(req.body.someTrip);
  currentlySelectedTrips = req.body.someTrip;
  res.status = 200;
  res.json({tripList: listOfTrips});
});

app.post('/weatherForecast', function(req, res) {
  const givenQuery = `&lat=${req.body.latitude}&lon=${req.body.longitude}`;
  getAPIData(weatherbit_forecast_baseURL, givenQuery).then(function(weatherData) {
    res.status = 200;
    res.json({message: 'The weather data for the given coordinates has been retrieved.', weatherInfo: weatherData.data});
  }).catch(function(error) {
    console.log(`Error: ${error}`);
    res.status = 500;
    res.json({message: 'An error occurred on the server while processing the data.'});
  });
});

app.post('/pixabayImages', function(req, res) {
  let givenQuery = '';
  if(req.body.id !== '') {
    givenQuery = `&id=${req.body.imageID}`;
    getAPIData(pixabayBaseURL, givenQuery).then(function(retrievedImage) {
      const imageData = {largeImageURL: retrievedImage.hits[0].largeImageURL};
      res.status = 200;
      res.json({message: 'The requested image was retrieved.', imageInfo: imageData});
    }).catch(function(error) {
      console.log(`Error: ${error}`);
      res.status = 500;
      res.json({message: 'An error occurred on the server while processing the data.'});
    });
  }
  else {
    const photoType = req.body.photoType;
    const city = req.body.city;
    const adminDiv = req.body.adminDiv;
    const country = req.body.country;
    givenQuery = `&category=${photoType}&q=${city},${adminDiv},${country}`.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    getAPIData(pixabayBaseURL, givenQuery).then(function(retrievedImages1) {
      givenQuery = `&category=${photoType}&q=${city},${adminDiv}`.normalize("NFD").replace(/\p{Diacritic}/gu, "");
      getAPIData(pixabayBaseURL, givenQuery).then(function(retrievedImages2) {
        givenQuery = `&category=${photoType}&q=${country}`.normalize("NFD").replace(/\p{Diacritic}/gu, "");
        getAPIData(pixabayBaseURL, givenQuery).then(function(retrievedImages3) {
	  if(retrievedImages1.hits.length !== 0) {
            if(retrievedImages1.hits.length > 1) {
              res.status = 200;
              res.json({
                message: 'An image was found for the given location.', 
                imageID: retrievedImages1.hits[1].id,
                foundLocation: `${city}, ${adminDiv}, ${country}`,
                largeImageURL: retrievedImages1.hits[0].largeImageURL,
                user: retrievedImages1.hits[0].user,
                userID: retrievedImages1.hits[0].user_id
              });
            }
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
          else if(retrievedImages2.hits.length !== 0) {
            if(retrievedImages2.hits.length > 1) {
              res.status = 200;
              res.json({
                message: 'An image was found for the given location.', 
                imageID: retrievedImages2.hits[1].id,
                foundLocation: `${city}, ${adminDiv}, ${country}`,
                largeImageURL: retrievedImages2.hits[0].largeImageURL,
                user: retrievedImages2.hits[0].user,
                userID: retrievedImages2.hits[0].user_id
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
	  else if(retrievedImages3.hits.length !== 0) {
            if(retrievedImages3.hits.length > 1) {
              res.status = 200;
              res.json({
                message: 'An image was found for the given location.', 
                imageID: retrievedImages3.hits[1].id,
                foundLocation: country,
                largeImageURL: retrievedImages3.hits[0].largeImageURL,
                user: retrievedImages3.hits[0].user,
                userID: retrievedImages3.hits[0].user_id
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
	}).catch(function(error) {
	  console.log(`Error Name: ${error.name}, Error Message: ${error.message}`);
          res.status = 500;
          res.json({message: 'An error occurred on the server while processing the data.'});
        });
      }).catch(function(error) {
        console.log(`Error Name: ${error.name}, Error Message: ${error.message}`);
        res.status = 500;
        res.json({message: 'An error occurred on the server while processing the data.'});
      });
    }).catch(function(error) {
      console.log(`Error Name: ${error.name}, Error Message: ${error.message}`);
      res.status = 500;
      res.json({message: 'An error occurred on the server while processing the data.'});
    });     
  }
});
