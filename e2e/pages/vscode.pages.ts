import {
  _electron as electron,
  ElectronApplication,
  Frame,
  FrameLocator,
  Page,
} from 'playwright';
import { execSync } from 'child_process';
import { downloadLatestKAIPlugin } from '../utilities/download.utils';
import { getKAIPluginName } from '../utilities/utils';

class VSCode {
  private readonly vscodeApp?: ElectronApplication;
  private readonly window?: Page;

  private constructor(vscodeApp: ElectronApplication, window: Page) {
    this.vscodeApp = vscodeApp;
    this.window = window;
  }

  /**
   * launches VSCode with KAI plugin installed.
   * @param executablePath path to the vscode binary
   */
  public static async init(executablePath: string): Promise<VSCode> {
    try {
      const vsixFilePath = getKAIPluginName();
      if (vsixFilePath) {
        console.log(`Installing extension from VSIX file: ${vsixFilePath}`);
        await VSCode.installExtensionFromVSIX(vsixFilePath);
      } else {
        console.warn(
          'VSIX_FILE_PATH environment variable is not set. Skipping extension installation.'
        );
      }

      // Launch VSCode as an Electron app
      const vscodeApp = await electron.launch({
        executablePath: executablePath,
      });

      const window = await vscodeApp.firstWindow();

      return new VSCode(vscodeApp, window);
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
      execSync(`code --install-extension "${vsixFilePath}"`, {
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

  /**
   * Iterates through all frames and returns the
   * left panel frame for further interactions.
   */
  public async getLeftIframe(): Promise<FrameLocator | null> {
    if (!this.window) {
      throw new Error('VSCode window is not initialized.');
    }

    const iframeLocators = this.window.locator('iframe');
    const iframeCount = await iframeLocators.count();

    for (let i = 0; i < iframeCount; i++) {
      const iframeLocator = iframeLocators.nth(i);
      const outerIframe = await iframeLocator.contentFrame();
      if (outerIframe) {
        const iframe2 = outerIframe.locator('iframe[title="Konveyor"]');
        const iframe2Count = await iframe2.count();
        if (iframe2Count > 0) {
          const innerIframe = await iframe2.contentFrame();
          return innerIframe;
        }
      }
    }

    // Return null if the iframe is not found
    console.log('Iframe with title "Konveyor" not found.');
    return null;
  }
}

export { VSCode };
