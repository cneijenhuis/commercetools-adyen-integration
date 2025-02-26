<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  

- [Contribution Guide](#contribution-guide)
  - [Contents](#contents)
  - [Prerequisites](#prerequisites)
  - [Development](#development)
      - [E2E tests (Extension module only)](#e2e-tests-extension-module-only)
        - [Debugging](#debugging)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Contribution Guide

## Contents
- [Prerequisites](#prerequisites)
- [Development](#development)

## Prerequisites

Minimum requirements are:
 - **Node.js** version 14.
 - **Npm** version 6.
 
You can install all dependencies using `npm` with following command:

```
npm install
```

## Development
While developing project you can use some predefined commands for running tests, running linter or generating coverage. 
 
- Execute `npm run test` to run all tests and print the code coverage report.
- Execute `npm run unit` to run Unit tests.
- Execute `npm run integration` to run Integration tests. (environment variables for [extension](../extension/docs/HowToRun.md#environment-variables) and [notification](../notification/docs/HowToRun.md#environment-variables) needs to be set)
- Execute `npm run lint` to show lint errors in the code.



#### E2E tests (Extension module only)
Following additional environment variables must be provided in order to run the E2E tests.

| Name | Content | Required |
| --- | --- | --- |
|`ADYEN_CLIENT_KEY` | Client-side key that is required to render a Component. See [Adyen documentation](https://docs.adyen.com/development-resources/client-side-authentication#get-your-client-key). | YES |

- Execute `npm run e2e` to run E2e tests.

##### Debugging

E2E tests using [puppeteer](https://github.com/puppeteer/puppeteer) library for testing payment sandbox UI's on the Chrome browser. Refer to puppeteer [debugging tips](https://github.com/puppeteer/puppeteer#debugging-tips) documentation such as turning off headless mode and using nodejs debugger, which might be useful to develop new UI integration or troubleshooting UI flow.
Addition to the tips provided by puppeteer, if you're using IntelliJ Idea, you could also debug using the build-in Mocha test runner since the tests using Mocha.
