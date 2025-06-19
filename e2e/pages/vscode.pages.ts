import { _electron as electron, FrameLocator } from 'playwright';
import { execSync } from 'child_process';
import { downloadLatestKAIPlugin } from '../utilities/download.utils';
import {
  cleanupRepo,
  generateRandomString,
  getKAIPluginName,
  getOSInfo,
  getVscodeExecutablePath,
} from '../utilities/utils';
import * as path from 'path';
import { LeftBarItems } from '../enums/left-bar-items.enum';
import { expect } from '@playwright/test';
import { Application } from './application.pages';
import { DEFAULT_PROVIDER } from '../fixtures/provider-configs.fixture';
import { SCREENSHOTS_FOLDER } from '../utilities/consts';

export class VSCode extends Application {
  public static async open(repoUrl?: string, repoDir?: string) {
    try {
      if (repoUrl) {
        if (repoDir) {
          await cleanupRepo(repoDir);
        }
        console.log(`Cloning repository from ${repoUrl}`);
        execSync(`git clone ${repoUrl}`);
      }
    } catch (error) {
      throw new Error('Failed to clone the repository');
    }

    const vscodeExecutablePath = getVscodeExecutablePath();
    const args = ['--disable-workspace-trust', '--skip-welcome'];
    if (repoDir) {
      args.push(path.resolve(repoDir));
    }

    const vscodeApp = await electron.launch({
      executablePath: vscodeExecutablePath,
      args,
    });

    const window = await vscodeApp.firstWindow();
    console.log('VSCode opened');
    return new VSCode(vscodeApp, window);
  }

  /**
   * launches VSCode with KAI plugin installed and repoUrl app opened.
   * @param repoDir path to repo
   */
  public static async init(repoDir?: string): Promise<VSCode> {
    try {
      await VSCode.installExtensionFromVSIX();
      return repoDir ? VSCode.open(repoDir) : VSCode.open();
    } catch (error) {
      console.error('Error launching VSCode:', error);
      throw error;
    }
  }

  /**
   * Installs an extension from a VSIX file using the VSCode CLI.
   * This method is static because it is independent of the instance.
   */
  private static async installExtensionFromVSIX(): Promise<void> {
    try {
      let vsixFilePath = getKAIPluginName();
      if (!vsixFilePath) {
        console.warn(
          'VSIX_FILE_PATH environment variable is not set. Skipping extension installation.'
        );
        return;
      }
      if (getOSInfo() === 'windows') {
        const basePath = process.cwd();
        vsixFilePath = path.resolve(basePath, vsixFilePath);
      }
      const installedExtensions = execSync('code --list-extensions', {
        encoding: 'utf-8',
      });
      if (installedExtensions.includes('konveyor.konveyor-ai')) {
        console.log(`KAI plugin already installed`);
        return;
      }
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
      if (this.app) {
        await this.app.close();
        console.log('VSCode closed successfully.');
      }
    } catch (error) {
      console.error('Error closing VSCode:', error);
    }
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
      const outerIframe = iframeLocator.contentFrame();
      if (outerIframe) {
        const iframe2 = outerIframe.locator(
          'iframe[title="Konveyor Analysis View"]'
        );
        return iframe2.contentFrame();
      }
    }
    // Return null if the iframe is not found
    console.info('Iframe with title "Konveyor" not found.');
    return null;
  }

  private async executeQuickCommand(command: string) {
    await this.waitDefault();
    await this.window.keyboard.press('Control+Shift+P');
    const input = this.window.getByPlaceholder(
      'Type the name of a command to run.'
    );
    await this.waitDefault();
    await input.fill(`>${command}`);
    await expect(
      this.window.locator('a.label-name span.highlight', { hasText: command })
    ).toBeVisible();

    await input.press('Enter');
    await this.window.waitForTimeout(1000);
  }

  public async selectSourcesAndTargets(sources: string[], targets: string[]) {
    // Opening analysis view due to https://github.com/konveyor/editor-extensions/issues/479
    await this.openAnalysisView();
    await this.waitDefault();
    const window = this.window;
    await this.executeQuickCommand('sources and targets');
    const targetInput = window.getByPlaceholder('Choose one or more target');
    await this.waitDefault();
    for (const target of targets) {
      await targetInput.fill(target);

      await window
        .getByRole('checkbox', { name: `${target}` })
        .nth(1)
        .click();
    }
    await targetInput.press('Enter');
    await this.waitDefault();
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
    await this.waitDefault();
    await window.keyboard.press('Enter');
  }

  /**
   * Opens command palette by doing ctrl+shift+P
   * and then typing "Welcome" and then "Set Up".
   */
  public async openSetUpKonveyor() {
    const window = this.getWindow();
    await this.waitDefault();
    await this.executeQuickCommand('welcome: open walkthrough');

    await window.keyboard.type('set up konveyor');
    await this.waitDefault();
    await window.keyboard.press('Enter');
  }

  public async openLeftBarElement(name: LeftBarItems) {
    const window = this.getWindow();

    const navLi = window.locator(`a[aria-label^="${name}"]`).locator('..');
    await expect(navLi).toBeVisible();
    if ((await navLi.getAttribute('aria-expanded')) === 'false') {
      await navLi.click();
    }
  }

  public async openAnalysisView(): Promise<void> {
    await this.openLeftBarElement(LeftBarItems.Konveyor);

    await this.window.getByText('Konveyor Issues').dblclick();

    await this.window
      .locator('a[aria-label="Open Konveyor Analysis View"]')
      .click();
  }

  public async startServer(): Promise<void> {
    await this.openAnalysisView();
    const analysisView = await this.getAnalysisIframe();
    await this.waitDefault();
    if (
      !(await analysisView.getByRole('button', { name: 'Stop' }).isVisible())
    ) {
      await analysisView.getByRole('button', { name: 'Start' }).isVisible();
      await analysisView.getByRole('button', { name: 'Start' }).click();
      await analysisView.getByRole('button', { name: 'Stop' }).isVisible();
    }
  }

  public async searchViolation(term: string): Promise<void> {
    const analysisView = await this.getAnalysisIframe();

    const toggleFilterButton = analysisView.locator(
      'button[aria-label="Show Filters"]'
    );
    const searchInput = analysisView.locator(
      'input[aria-label="Search violations and incidents"]'
    );
    if (await searchInput.isVisible()) {
      await searchInput.fill(term);
      return;
    }

    await toggleFilterButton.click();
    await searchInput.fill(term);
    await toggleFilterButton.click();
  }

  public async runAnalysis() {
    await this.window.waitForTimeout(15000);
    const analysisView = await this.getAnalysisIframe();
    const runAnalysisBtnLocator = analysisView.getByRole('button', {
      name: 'Run Analysis',
    });
    await expect(runAnalysisBtnLocator).toBeEnabled({ timeout: 600000 });

    await runAnalysisBtnLocator.click();
  }

  /**
   * Returns the iframe that contains the main Konveyor view
   * @return Promise<FrameLocator>
   */
  public async getAnalysisIframe(): Promise<FrameLocator> {
    return this.window
      .locator('iframe')
      .first()
      .contentFrame()
      .getByTitle('Konveyor Analysis View')
      .contentFrame();
  }

  /**
   * Returns the iframe that contains the main Konveyor view
   * @return Promise<FrameLocator>
   */
  public async getResolutionIframe(): Promise<FrameLocator> {
    return this.window
      .locator('iframe')
      .nth(1)
      .contentFrame()
      .getByTitle('Resolution Details')
      .contentFrame();
  }

  public async configureGenerativeAI(config: string = DEFAULT_PROVIDER.config) {
    await this.openSetUpKonveyor();
    await this.window
      .getByRole('button', { name: 'Configure Generative AI' })
      .click();
    await this.waitDefault();
    await this.window
      .getByRole('button', { name: 'Configure GenAI model settings file' })
      .click();
    await this.waitDefault();

    await this.window.keyboard.press('Control+a+Delete');
    await this.pasteContent(config);
    await this.window.keyboard.press('Control+s');
  }

  public async getManageProfileIframe(): Promise<FrameLocator> {
    const iframes = this.window.locator('iframe');
    const count = await iframes.count();

    for (let i = 0; i < count; i++) {
      const outerFrameLocator = this.window.frameLocator('iframe').nth(i);
      const innerFrameLocator = outerFrameLocator.frameLocator(
        'iframe[title="Manage Profiles"]'
      );

      try {
        await innerFrameLocator
          .getByRole('button', { name: '+ New Profile' })
          .waitFor({ timeout: 2000 });
        return innerFrameLocator;
      } catch {}
    }

    throw new Error('Manage Profiles iframe not found');
  }

  public async manageAnalysisProfile(
    sources: string[],
    targets: string[],
    profileName?: string
  ) {
    await this.executeQuickCommand('Manage Analysis Profiles');

    const manageProfileView = await this.getManageProfileIframe();
    await manageProfileView.getByRole('button', { name: '+ New Profile' }).click();

    const randomName = generateRandomString();
    const nameToUse = profileName ? `${profileName}-${randomName}` : randomName;
    await manageProfileView.getByRole('textbox', { name: 'Profile Name' }).fill(nameToUse);

    // Select Targets
    manageProfileView.getByRole('combobox', { name: 'Type to filter' }).first().click();
    for (const target of targets) {
      await manageProfileView.getByRole('option', { name: target, exact: true }).click();
    }
    await manageProfileView
      .locator('form div')
      .filter({ hasText: 'Target Technologies * cloud-' })
      .getByLabel('Menu toggle')
      .click();

    // Select Source
    manageProfileView.getByRole('combobox', { name: 'Type to filter' }).nth(1).click();
    for (const source of sources) {
      await manageProfileView.getByRole('option', { name: source, exact: true }).click();
    }
    await manageProfileView.getByRole('button', { name: 'Menu toggle' }).nth(1).click();

  }
}