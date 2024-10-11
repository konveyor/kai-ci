// vscode.spec.js
const { test, expect } = require('@playwright/test');
const { LaunchVSCodePage } = require('../pages/launch_vscode.page');
const path = require('path');

test.describe('VSCode Extension Installation from VSIX', () => {
   test('should install extension from a VSIX file in VSCode', async ({page}) => {
    
    // Path to the VSCode executable
    const vscodeExecutablePath = '/usr/bin/code';  // Change this to the actual path

    // Path to the VSIX file
    const vsixFilePath = path.resolve(__dirname, '/home/sshveta/Downloads/kai-vscode-plugin-0.0.3.vsix');  // Provide the path to your VSIX file

    // Create a new instance of the LaunchVSCodePage
    const launchVSCodePage = new LaunchVSCodePage();
    await new Promise(resolve => setTimeout(resolve, 20000)); // 20,000 milliseconds = 20 seconds
    // await page.pause(); 

    // Launch VSCode
    await launchVSCodePage.launchVSCode(vscodeExecutablePath);

    // Install the extension from the VSIX file
    await launchVSCodePage.installExtensionFromVSIX(vsixFilePath);
    await page.pause(); 
    // Optionally verify if the extension was installed successfully
    const uninstallButton = await launchVSCodePage.window.$('.extension-list-item .uninstall');
    expect(uninstallButton).not.toBeNull();

    // Close VSCode after installation
    await launchVSCodePage.closeVSCode();
  });
});

                                                                                                                                                                        