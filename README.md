# Gastronomy API

Gastronomy API is a RESTful API that provides meal and cocktail recipes.  

Features include:

* Visitors can find meal and cocktail recipes including a list of required ingredients, tasting notes, and user reviews.
* Visitors can sign-up for a user account.
* Users can save the recipes they like to their account.
* Users can write reviews for meal and cocktail recipes.
* Creators can manage meals, cocktails, and ingredients.
* Admins can register creator accounts.
* Admins can oversee the service as a whole.

## Project Details

The project is divided into two parts: __api__ and __web client__.

## Installation

### Prerequisites

* Node.js (v14 and higher)
* PostgreSQL (v12 and higher recommended)

### Install

* Clone the repository to your local environment or download the code.
* cd to /api directory.
* Run `npm install` command.
* Run `npm build` command.

### Set up configuration files

Configuration files can be found in /config directory.

* Make sure there is a `default.toml` file in the /config directory.
* `default.toml` is enough for running the API in the __development__ mode.
* `production.toml` is used to provide overrides for the __production__ mode.
* `test.toml` is used to provide overrides for the __test__ mode (required to run jest tests).
* Configure the needed files for your environment.

### Run

* Run `npm start` command to start the API.

## Documentation

### Overview of resources and endpoints

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
