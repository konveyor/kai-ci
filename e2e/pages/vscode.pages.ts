import { _electron as electron, ElectronApplication, Page } from 'playwright';
import { execSync } from 'child_process';
import { downloadLatestKAIPlugin } from '../utilities/download.utils';
import { getKAIPluginPath } from '../utilities/utils';

class LaunchVSCodePage {
  private vscodeApp?: ElectronApplication;
  private window?: Page;

  private constructor(vscodeApp: ElectronApplication, window: Page) {
    this.vscodeApp = vscodeApp;
    this.window = window;
  }

  public static async launchVSCode(
    executablePath: string
  ): Promise<LaunchVSCodePage> {
    try {
      const vsixFilePath = getKAIPluginPath();
      console.log(`Installing extension from VSIX file: ${vsixFilePath}`);
      await LaunchVSCodePage.installExtensionFromVSIX(vsixFilePath);

      // Launch VSCode as an Electron app
      const vscodeApp = await electron.launch({
        executablePath: executablePath,
      });

      // Get the main window
      const window = await vscodeApp.firstWindow();

      // Return an instance of LaunchVSCodePage
      return new LaunchVSCodePage(vscodeApp, window);
    } catch (error) {
      console.error('Error launching VSCode:', error);
      throw error;
    }
  }

  /**
   * Installs an extension from a VSIX file using the VSCode CLI.
   * This method is static because it is independent of the instance.
   */
  private static async installExtensionFromVSIX(
    vsixFilePath: string
  ): Promise<void> {
    await downloadLatestKAIPlugin();

    try {
      // Execute command to install VSIX file using VSCode CLI
      console.log(`Installing extension from ${vsixFilePath}...`);
      execSync(`code --install-extension ${vsixFilePath}`, {
        stdio: 'inherit',
      });
      console.log('Extension installed successfully.');
    } catch (error) {
      console.error('Error installing the VSIX extension:', error);
      throw error;
    }
  }

  /**
   * Closes the VSCode instance.
   */
  public async closeVSCode(): Promise<void> {
    try {
      if (this.vscodeApp) {
        await this.vscodeApp.close();
        console.log('VSCode closed successfully.');
      }
    } catch (error) {
      console.error('Error closing VSCode:', error);
    }
  }

  /**
   * Returns the main window for further interactions.
   */
  public getWindow(): Page {
    if (!this.window) {
      throw new Error('VSCode window is not initialized.');
    }
    return this.window;
  }
}

export { LaunchVSCodePage };
