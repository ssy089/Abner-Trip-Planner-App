# Evaluate Articles with NLP - Abner Vinaja

## Introduction
This repository contains my code for the fourth project in [Udacity's Front End Web Developer Nanodegree Program](https://www.udacity.com/course/front-end-web-developer-nanodegree--nd0011). This project creates a simple Natural Language Processing (NLP)
application that uses the [MeaningCloud Sentiment Analysis API](https://www.meaningcloud.com/developer/sentiment-analysis)
to generate a sentiment analysis of news articles and/or blog posts. In addition, this project uses [Webpack](https://webpack.js.org/)
to manage the project's source files and assets. The other main objectives of this project are:
- Set up development and production environment configurations for the project.
- Write the project's styles using [Sass](https://sass-lang.com/).
- Implement [Jest](https://jestjs.io/) to execute unit tests for the project.

## Project Content
- The root of this project contains the configuration files for Node.js, Webpack, and [Babel](https://babeljs.io/).
- The "src/server" folder contains the server-side code for this project.
- The "src/client" folder contains the client-side code, Sass files, HTML files, and images for this project.

## Required Software
This project requires Node.js v14.15.5 or higher.

Note that in order to gather sentiment analysis data, this project requires an API key for the MeaningCloud Sentiment Analysis API.
To implement this key, create a .env file in the root directory of the project, and add a `API_KEY` environment variable to
the .env file. For example, if your API key is 12345, you set the `API_KEY` variable as `API_KEY=12345`. You can sign up for a free 
API key at the [MeaningCloud Sentiment Analysis API website](https://www.meaningcloud.com/developer/sentiment-analysis).

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
Other than the .gitignore file, all files in this project were developed from scratch. However, the project's architecture is based off of the
architecture presented by Udacity's [starter code](https://github.com/udacity/fend/tree/refresh-2019/projects/evaluate-news-nlp) for the project.
