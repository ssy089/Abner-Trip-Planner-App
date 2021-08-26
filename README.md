# Trip Planner App - Abner Vinaja

## Introduction
This repository contains my code for the capstone project in [Udacity's Front End Web Developer Nanodegree Program](https://www.udacity.com/course/front-end-web-developer-nanodegree--nd0011). This project creates a single-page travel application that allows the user to store 
information about their travel plans, and to see relevant weather information about their destination. This project incorporates the various
skills and tools that were taught in Udacity's Front End Web Developer Nanodegree Program:
- Build the webpage's structure using HTML, and style the page using [Sass](https://sass-lang.com/).
- Use JavaScript methods to manipulate the Document Object Model (DOM), and to provide functionality for the webpage.
- Incorporate several Application Programming Interfaces (APIs) in order to implement various types of data in the application.
- Use Node.js to create a local server, and use [Express.js](https://expressjs.com/) to handle middleware and routing functions. 
- Configure [Webpack](https://webpack.js.org/) to manage the project's source files and assets, and to set up development and production 
  environment configurations for the project.
- Implement [Jest](https://jestjs.io/) to execute unit tests for the project.

## Project Content
- The root of this project contains the configuration files for Node.js, Webpack, and [Babel](https://babeljs.io/).
- The "src/server" folder contains the server-side code for this project.
- The "src/client" folder contains the client-side code, Sass files, HTML files, and images for this project.

## Required Software
This project requires Node.js v14.15.5 or higher.

Note: In order for the project to generate its data, this project requires a username for the [GeoNames API](http://www.geonames.org/export/),
an API key for [Weatherbit's Weather API](https://www.weatherbit.io/api), and an API key for [Pixabay's API](https://pixabay.com/api/docs/)
(see each API's website to find out how to get a free API key). Then, to implement these API keys, create a .env file in the root directory of
the project, and add the following environment variables to the .env file: `GEONAMES_USERNAME`, `WEATHERBIT_API_KEY`, and `PIXABAY_API_KEY`.
For example, if your user name for the GeoNames API is sam123, your Weatherbit API key is 12345, and your Pixabay API key is 67890, 
you would set your environment variables as shown below.
```
GEONAMES_USERNAME=sam123
WEATHERBIT_API_KEY=12345
PIXABAY_API_KEY=67890
```

## Installation
If Node.js is not installed, go to [Node.js](https://nodejs.org/en/), download the
appropriate Node.js installation file for your operating system, and install Node.js using the default
installation settings. If you need to update your computer's version of Node.js, see this [article](https://www.whitesourcesoftware.com/free-developer-tools/blog/update-node-js/) for advice.
Once Node.js is installed, run the command `npm install` on your terminal, which will install all the modules
listed as dependencies and devDependencies in the package.json file.

## Execution

### Unit Testing
To execute the project's unit tests, open an instance of your terminal and run the command `npm run test`.

### Development Mode
To execute this project using its development environment settings, open an instance of your terminal and run the command
`npm run build-dev`. You should see the app's webpage being opened at [http://localhost:8080](http://localhost:8080). 
Then open up another instance of your terminal, and start the local server by running the command `npm run start`.

### Production Mode
To execute this project using its production environment settings, open an instance of your terminal and run the command
`npm run build-prod`. Then, run the command `npm run start` to start the local server. Finally, open your browser and enter 
the URL, [http://localhost:8081](http://localhost:8081), to open the project webpage.

## Known Issues/Bugs
The current code has no existing technical issues or bugs.

## Copyright and Licensing Information
This project is currently not under any license.

## Acknowledgements
The .gitignore file was generated from GitHub's .gitigonore template for Node.js projects.

The following APIs were used for the project:
- [GeoNames API](http://www.geonames.org/export/) - This was used to retrieve geographic coordinates for any given location.
- [Weatherbit's Weather API](https://www.weatherbit.io/api) - This was used to retrieve weather forecasts for any given location.
- [Pixabay's API](https://pixabay.com/api/docs/) - This was used to retrieve a photograph for any given location.
