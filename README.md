# VSCode Automation with Playwright

This repository contains automated tests using Playwright to launch Visual Studio Code (VSCode) and install a specified extension from a VSIX file.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Contributing](#contributing)
- [License](#license)

## Features

    Launch Visual Studio Code as an Electron application.
    Install extensions from VSIX files.
    Basic test structure using Playwright's Page Object Model.

## Prerequisites

Before you begin, ensure you have the following:

    Node.js (version 14 or later) installed.
    Playwright installed. You can install it using npm.
    Visual Studio Code installed on your system.

## Installation

1. **Clone the Repository**

`git clone https://github.com/konveyor/kai-ci`
`cd kai-ci`

2. **Install Dependencies**

Install the required packages using npm:

`npm install`


## Usage

    Create .env file and copy the content of .env.example into it and provide appropriate values:

    VSCODE_EXECUTABLE_PATH='/usr/share/code/code'
    VSIX_FILE_PATH='/home/sshveta/Downloads/kai-vscode-plugin-0.0.3.vsix'

## Running Tests

To run the automated tests, use the following command:

`npx playwright test`

This command will execute all tests in your repository. To run a specific test file:

`npx playwright test vscode.test.ts`

#### Code formatting using Prettier tool

1. Format code

    `npm run format`

2. Check formatting

    `npm run check`
