import {
  _electron as electron,
  ElectronApplication,
  FrameLocator,
  Page,
} from 'playwright';
import { execSync } from 'child_process';
import { downloadLatestKAIPlugin } from '../utilities/download.utils';
import {
  cleanupRepo,
  getKAIPluginName,
  getOSInfo,
  getVscodeExecutablePath,
} from '../utilities/utils';
import * as path from 'path';
import { LeftBarItems } from '../enums/left-bar-items.enum';
import { expect } from '@playwright/test';

export class Application {
  protected readonly app?: ElectronApplication;
  protected readonly window?: Page;

  protected constructor(app: ElectronApplication, window: Page) {
    this.app = app;
    this.window = window;
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

  public async pasteContent(content: string) {
    await this.app.evaluate(({ clipboard }, content) => {
      clipboard.writeText(content);
    }, content);
    await this.window.keyboard.press('Control+v');
  }

  public async waitDefault() {
    await this.window.waitForTimeout(process.env.CI ? 5000 : 500);
  }
}
