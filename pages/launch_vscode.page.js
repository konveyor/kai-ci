// launch_vscode.page.js
const { _electron: electron } = require('playwright');
const path = require('path');
const fs = require('fs');

class LaunchVSCodePage {
  constructor() {
    this.vscodeApp = null;
    this.window = null;
  }

  async launchVSCode(executablePath) {
    this.vscodeApp = await electron.launch({
      executablePath: executablePath, // Path to VSCode executable
    });

  }

  async installExtensionFromVSIX(vsixFilePath) {
        if (!fs.existsSync(vsixFilePath)) {
      throw new Error(`VSIX file not found at path: ${vsixFilePath}`);
    }

    await this.window.click('.activity-bar a[title="Extensions"]');
    await this.window.waitForSelector('.extensions-viewlet');

    // Click on the "More Actions" (three dots menu) in the Extensions view
    await this.window.click('.extensions-viewlet .action-item .codicon-ellipsis');

    // Click on "Install from VSIX..."
    await this.window.click('.context-view .menu-item span:has-text("Install from VSIX...")');

    const inputSelector = 'input[type="file"]'; 
    await this.window.setInputFiles(inputSelector, vsixFilePath);

    await this.window.waitForSelector('.extension-list-item .uninstall', { timeout: 60000 });
  }

  async closeVSCode() {
    // Close the VSCode application
    await this.vscodeApp.close();
  }
}

module.exports = { LaunchVSCodePage };