# Solution - Guy Shilo - 3.11.2021

Hello, this is my solution for the package manager tree view.
In order to run the application, please open two terminals and run: 
1. npm run start:server
1. npm run start:client

The browser will launch a React application in http://localhost:3001
You have an Autocomplete component, you can write the name of the package,
and then click on it, and it will be displayed.

If you have any questions do not hesitate to ask.

# Exercise

NodeJS has a managed packages environment called `npm`. A package is a
functional NodeJS module with versioning, documentation, dependencies (in the
form of other packages), and more.

This repository contains a basic NodeJS server with a `/package` endpoint. When
passed a package name and version, the endpoint returns the dependencies of that
package.

## For Non NodeJS / TypeScript Solutions

Although we are a company that is mainly working with TypeScript and NodeJS we do allow submitting solutions in other languages (although strongly recommend doing it by extending this repository using TypeScript). That being said, if you do choose to use a different language please make sure that there is a clear documentation on how to install dependencies, configure the system and run the solution in the readme file as if you are explaining to someone that never used the stack that you are submitting the solution with.

## Task

1. Update the `/package` endpoint, so that it returns all of the transitive
   dependencies for a package, not only the first order dependencies

2. Present these dependencies in a tree view that can be viewed from a Web Browser (you can use any technologies you find suitable)

## Prerequisites

* [Node v12 LTS](https://nodejs.org/download/release/latest-v12.x/)

## Getting Started

To install dependencies and start the server in development mode:

```sh
npm ci
npm start
```

Then we can try the `/package` endpoint. Here is an example that uses `curl` and
`jq`, but feel free to use any client.

```sh
curl -s http://localhost:3000/package/react/16.13.0 | jq .
```

Most of the code is boilerplate; the logic for the `/package` endpoint can be
found in [src/package.ts](src/package.ts), and some basic tests in
[test/package.test.ts](test/package.test.ts)

You can run the tests with

```sh
npm run test

# Or in watch mode
npm run test -- --watch
```

Good luck, and enjoy!

## Things to consider

- Look at the inner "dependencies" object of a package for analysis of
  first-order dependencies.

- npm returns dependency ranges that follow the
  [Semantic Versioning](https://semver.org/) specification, which you'll need to
  account for.

- The packages update from time to time, just as their dependencies do.

- What makes a good web service? API, performance, data storage, low latency,
  scalability, monitoring, a great web interface, you name it :)

- Consider the quality and structure of your codebase; is it maintainable?

- Consider production readiness (to some extent) and is it safe to deploy changes?
