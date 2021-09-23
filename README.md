# GastronomyAPI
Gastronomy API is a RESTful API that provides meal and cocktail recipes.

## Status
The project is currently in active development stage. There is no stable release version available as of yet.

## Installation
### Prerequisites:
* Node.js (v14 and higher)
* PostgreSQL (v12 and higher recommended)
### Install:
* Clone the repository to your local environment or download the code
* Run `npm install` command
* Run `npm build` command
### Set up configuration files:
Configuration files can be found in /config directory.
* Make sure there is a `default.toml` file in the /config directory.
* `default.toml` is enough for running the API in the __development__ mode.
* `production.toml` is used to provide overrides for the __production__ mode.
* `test.toml` is used to provide overrides for the __test__ mode (required to run jest tests).
* Configure the needed files for your environment.
### Run:
* Run `npm start` command to start the API.

## Documentation
### Overview of resources and endpoints:
There are 5 main resources:
1. Ingredients
1. Meals
1. Cocktails
1. Users
1. Members

## Author
* [Nikita Mezhenskyi](https://github.com/nmezhenskyi)

## License
This project is licensed under BSD-3-Clause License.
