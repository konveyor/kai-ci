import {
  _electron as electron,
  ElectronApplication,
  FrameLocator,
  Page,
} from 'playwright';
import { execSync } from 'child_process';
import { downloadLatestKAIPlugin } from '../utilities/download.utils';
import {
  getKAIPluginName,
  getOSInfo,
  getVscodeExecutablePath,
} from '../utilities/utils';
import * as path from 'path';
import { LeftBarItems } from '../enums/left-bar-items.enum';
import { expect } from '@playwright/test';

export class VSCode {
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
      console.log(`Cloning coolstore repo from ${repoUrl}`);
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

      console.log('Launching vscode ... ');
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
    const extensionId = 'konveyor.editor-extensions-vscode';

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

    try {
      console.log(`Installing extension from ${vsixFilePath}...`);
      await downloadLatestKAIPlugin();
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
      const outerIframe = iframeLocator.contentFrame();
      if (outerIframe) {
        const iframe2 = outerIframe.locator('iframe[title="Konveyor"]');
        const iframe2Count = await iframe2.count();
        if (iframe2Count > 0) {
          return iframe2.contentFrame();
        }
      }
    }

    // Return null if the iframe is not found
    console.log('Iframe with title "Konveyor" not found.');
    return null;
  }

  private async executeQuickCommand(command: string) {
    await this.window.keyboard.press('Control+Shift+P');
    const input = this.window.getByPlaceholder(
      'Type the name of a command to run.'
    );
    await input.fill(`>${command}`);
    await input.press('Enter');
    await this.window.waitForTimeout(500);
  }

  public async selectSourcesAndTargets(sources: string[], targets: string[]) {
    const window = this.window;
    await this.executeQuickCommand('sources and targets');

    const sourceInput = window.getByPlaceholder('Choose one or more source');
    await expect(sourceInput).toBeVisible();
    for (const source of sources) {
      await sourceInput.fill(source);
      await window
        .getByRole('checkbox', { name: `${source}` })
        .nth(1)
        .click();
      await window.waitForTimeout(1000);
    }
    await sourceInput.press('Enter');

    const targetInput = window.getByPlaceholder('Choose one or more target');
    await expect(targetInput).toBeVisible();
    for (const target of targets) {
      await targetInput.fill(target);
      await window
        .getByRole('checkbox', { name: `${target}` })
        .nth(1)
        .click();
      await window.waitForTimeout(1000);
    }

    await targetInput.press('Enter');
    await window.keyboard.press('Enter');
  }

  /**
   * Opens command palette by doing ctrl+shift+P
   * and then typing "Welcome" and then "Set Up".
   */
  public async openSetUpKonveyor() {
    const window = this.getWindow();
    await this.executeQuickCommand('welcome: open walkthrough');
    await window.keyboard.type('set up konveyor');
    await window.keyboard.press('Enter');
  }

  public async openLeftBarElement(name: LeftBarItems) {
    const window = this.getWindow();
    const navLi = window.locator(`a[aria-label="${name}"]`).locator('..');
    if ((await navLi.getAttribute('aria-expanded')) === 'false') {
      await navLi.click();
    }
  }

  public async runAnalysis() {
    await this.openLeftBarElement(LeftBarItems.Konveyor);
    await this.window.getByText('Konveyor Issues').dblclick();
    await this.window
      .locator('a[aria-label="Open Konveyor Analysis View"]')
      .click();
    const analysisView = await this.getKonveyorIframe();
    const runAnalysisBtnLocator = analysisView.getByRole('button', {
      name: 'Run Analysis',
    });
    await expect(runAnalysisBtnLocator).toBeEnabled({ timeout: 10000 });
    await runAnalysisBtnLocator.click();
  }

  /**
   * Returns the iframe that contains the main Konveyor view
   * @return Promise<FrameLocator>
   */
  private async getKonveyorIframe(): Promise<FrameLocator> {
    return this.window
      .locator('iframe')
      .first()
      .contentFrame()
      .getByTitle('Konveyor Analysis View')
      .contentFrame();
  }
}
