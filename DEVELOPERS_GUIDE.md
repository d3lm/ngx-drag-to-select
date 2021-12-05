# Developers Guide

This guide helps you setting up, building and running the library as well as the demo app on your own machine.

## Prerequisites

- Install [Git](https://git-scm.com) and [NodeJS 10+](https://nodejs.org)
- Install [Yarn](https://yarnpkg.com/en/)
- Install [Angular CLI](https://cli.angular.io)

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

## Run tests

Verify that all tests pass on your machine, before you start working. For that, simply run

```
yarn test
yarn e2e
```

**That's it!** When all tests pass, you can open your favourite browser at `localhost:4200` and see the demo app in action.

## NPM Scripts

- `start`: Build and serve demo app in watch mode
- `serve:ssr`: Serve application using dynamic Universal
- `build`: Build client and server bundles
- `build:ssr`: Build client and server bundles as well as server and prerendering scripts
- `build:ghpages`: Build app for GitHub Pages
- `build:prerender`: Build all bundles and statically prerender application
- `build:prerender-ghpages`: Build all bundles and statically prerender application for GitHub Pages
- `build:app`: Build demo demo app for production
- `build:server`: Build server bundle for production
- `build:lib`: Build entire library only. This command will build the code, styles and ultimately copy the build artifacts to `dist/ngx-drag-to-select`
- `build:lib:code`: Build library code only
- `build:lib:sass`: Compile sass files and copy them to `dist/ngx-drag-to-select`
- `deploy`: Deploy demo app to GitHub Pages
- `copy:styles`: Copy source sass files to `dist/ngx-drag-to-select/sass`
- `generate:prerender`: Statically prerender application
- `webpack:server`: Build express server and prerendering script
- `format:base`: Run prettier without options
- `format:check`: Run prettier and list files that don't comply with prettier's formatting
- `format:fix`: Fix formatting issues
- `style`: Check linting and formatting
- `style:fix`: Fix linting and formatting errors
- `lint:check`: Check for linting errors
- `lint:fix`: Fix linting errors
- `clean`: Remove dist folder
- `test`: Run unit tests (Jest)
- `test:watch`: Run unit tests in watch mode
- `e2e`: Run end-to-end test suite (Cypress)
- `cypress:open`: Open Cypress
- `cypress:run`: Run Cypress in headless mode

## Folder Structure

The most important folders are `cypress`, `app` and `projects`. Inside `cypress` you'll find all of the e2e tests. The `app` folder contains all the code for the demo app and `projects` contains the code for the library.

Build artifacts related to the lib can be found in `dist/lib`.

```
dist
cypress
projects
├── ngx-drag-to-select
|   ├── src
|   |   ├── lib
|   |   |   └── *.ts
|   |   ├── scss
|   |   |   └── *.scss
|   |   └── public_api.ts
|   ├── package.json
|   └── ...
src
├── app
├── assets
├── environments
└── ...
```
