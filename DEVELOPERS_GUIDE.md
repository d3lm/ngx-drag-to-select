# Developers Guide

This guide helps you setting up, building and running the library as well as the demo app on your own machine.

## Prerequisites

* Install [Git](https://git-scm.com) and [NodeJS 8+](https://nodejs.org)
* Install [Yarn](https://yarnpkg.com/en/)
* Install [Angular CLI](https://cli.angular.io)

## Installation

Let's install the library on your machine.

### Cloning the repository

First we need to clone the [ngx-drag-to-select repository](https://github.com/d3lm/ngx-drag-to-select):

```
$ git clone https://github.com/d3lm/ngx-drag-to-select
```

### Installing dependencies

Once cloned, we need to install all dependencies. For that we can simply run

```
yarn install
```

## Building the app

Now that everything's set up, we can build and run it locally.

```
yarn start
```

This will build the demo app as well as the libary for development.

**That's it!** You can now open your favourite browser at `localhost:4200` and use the app.

## NPM Scripts

* `start`: Build and serve demo app in watch mode
* `build:app`: Build demo demo app for production
* `build:lib`: Build library only
* `build:lib:sass`: Compile sass files and copy them to `dist/lib`
* `packagr`: Runs ng-packagr
* `copy:styles`: Copy source sass files to `dist/lib/sass`
* `format:base`: Run prettier without options
* `format:check`: Run prettier and list files that don't comply with prettier's formatting
* `format:fix`: Fix formatting issues
* `style`: Check linting and formatting
* `style:fix`: Fix linting and formatting errors
* `test`: Run test suite including e2e tests
* `lint:check`: Check for linting errors
* `lint:fix`: Fix linting errors
* `e2e`: Run end-to-end test suite

## Folder Structure

The most important folders are `app` and `lib`. Both can be found in `src`. The `app` folder contains all the code for the demo app and `lib` contains the code for the library.

Build artifacts related to the lib can be found in `dist/lib`.

```
dist
e2e
src
├── app
├── assets
├── environments
└── lib
    ├── scss
    ├── src
    |   ├── *.html
    |   ├── *.scss
    |   └── *.ts
    ├── public_api.ts
    └── package.json
```
