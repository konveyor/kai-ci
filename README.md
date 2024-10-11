# kai-ci
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

- Launch Visual Studio Code as an Electron application.
- Install extensions from VSIX files.
- Basic test structure using Playwright's page object model.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js installed (version 14 or later).
- Playwright installed. You can install it using npm.
- Visual Studio Code installed on your system.

## Installation

1. **Clone the Repository**

   git clone https://github.com/konveyor/kai-ci
   cd kai-ci

2. **Install Dependencies**

   Install the required packages using npm:

   # npm install

3. **Install Playwright Browsers**
   To ensure Playwright is set up correctly, run:
   # npx playwright install

## Usage
Configuration

    Modify the vscode.spec.js file to specify the correct path to your VSIX file and VSCode executable.

    # const vscodeExecutablePath = '/path/to/your/VSCode/executable';
    # const vsixFilePath = '/path/to/your/extension.vsix';

## Running Tests
    To run the automated tests, use the following command:

    # npx playwright test

    This command will execute all tests defined in your repository. You can also run a specific test file:

    # npx playwright test vscode.spec.js
