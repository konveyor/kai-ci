import {
  _electron as electron,
  ElectronApplication,
  Page,
  FrameLocator,
} from 'playwright';
import { execSync } from 'child_process';
import { downloadLatestKAIPlugin } from '../utilities/download.utils';
import {
  getKAIPluginName,
  getOSInfo,
  getVscodeExecutablePath,
} from '../utilities/utils';
import * as path from 'path';

class VSCode {
  private readonly vscodeApp?: ElectronApplication;
  private readonly window?: Page;

  private constructor(vscodeApp: ElectronApplication, window: Page) {
    this.vscodeApp = vscodeApp;
    this.window = window;
  }

  /**
   * launches VSCode with KAI plugin installed and coolstore app opened.
   * @param repoUrl coolstore app to be cloned
   * @param cloneDir path to repo
   */
  public static async init(repoUrl: string, cloneDir: string): Promise<VSCode> {
    try {
      console.log('Cloning repo');
      execSync(`git clone ${repoUrl}`);
    } catch (error) {
      throw new Error('Failed to clone the repository');
    }

    try {
      let vsixFilePath = getKAIPluginName();
      if (vsixFilePath) {
        if (getOSInfo() == 'windows') {
          const basePath = process.cwd();
          vsixFilePath = path.resolve(basePath, vsixFilePath);
        }

        console.log(`Installing extension from VSIX file: ${vsixFilePath}`);
        await VSCode.installExtensionFromVSIX(vsixFilePath);
      } else {
        console.warn(
          'VSIX_FILE_PATH environment variable is not set. Skipping extension installation.'
        );
      }

      console.log('launching vscode ... ');
      // Launch VSCode as an Electron app
      const vscodeExecutablePath = getVscodeExecutablePath();
      const vscodeApp = await electron.launch({
        executablePath: vscodeExecutablePath,
        args: [path.resolve(cloneDir), '--disable-workspace-trust'],
      });

      const window = await vscodeApp.firstWindow();
      console.log('vscode opened');
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
    const extensionId = 'konveyor.konveyor-ai';

    try {
      const installedExtensions = execSync('code --list-extensions', {
        encoding: 'utf-8',
      });
      if (installedExtensions.includes(extensionId)) {
        return;
      }
    } catch (error) {
      console.error('Error checking installed extensions:', error);
    }

    await downloadLatestKAIPlugin();

    try {
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
   * server status panel frame .
   */
  public async getServerStatusIframe(): Promise<FrameLocator | null> {
    if (!this.window) {
      throw new Error('VSCode window is not initialized.');
    }
    const iframeLocators = this.window.locator('iframe');
    const iframeCount = await iframeLocators.count();
    for (let i = 0; i < iframeCount; i++) {
      const iframeLocator = iframeLocators.nth(i);
      const outerIframe = await iframeLocator.contentFrame();
      if (outerIframe) {
        const iframe2 = outerIframe.locator(
          'iframe[title="Konveyor Analysis View"]'
        );
        const innerIframe = await iframe2.contentFrame();
        return innerIframe;
      }
    }
    // Return null if the iframe is not found
    console.log('Iframe with title "Konveyor" not found.');
    return null;
  }

  /**
   * Opens command palette by doing ctrl+shift+P
   * and then typing "Welcome" and then "Set Up".
   */
  public async openSetUpKonveyor() {
    const window = this.getWindow();
    await window.keyboard.press('Control+Shift+P');
    const commandPaletteInput = await window.locator(
      'input[placeholder="Type the name of a command to run."]'
    );
    await commandPaletteInput.waitFor();

    await window.keyboard.type('welcome: open walkthrough');
    await window
      .locator(
        'span.monaco-highlighted-label:has-text("Welcome: Open Walkthrough...")'
      )
      .waitFor();
    await window.keyboard.press('Enter');

    await window.keyboard.type('set up konveyor');
    await window
      .locator('span.monaco-highlighted-label:has-text("set up konveyor")')
      .waitFor();
    await window.keyboard.press('Enter');
  }
}

export { VSCode };
