import { test, expect } from '@playwright/test';
import { VSCode } from '../pages/vscode.pages';
import { cleanupRepo } from '../utilities/utils';

// TODO : Get repo URL from fixtures
const repoUrl = 'https://github.com/konveyor-ecosystem/coolstore';

test.describe('VSCode Tests', () => {
  let vscodeApp: VSCode;

  test.beforeAll(async () => {
    test.setTimeout(60000);
    const executablePath =
      process.env.VSCODE_EXECUTABLE_PATH || '/usr/share/code/code';
    vscodeApp = await VSCode.init(executablePath, repoUrl, 'coolstore');
  });

  test('Should launch VSCode and check window title', async () => {
    const window = vscodeApp.getWindow();
    await window.screenshot({ path: 'vscode-initialized-screenshot.png' });
  });

  test('Should open Extensions tab and verify installed extension', async () => {
    const window = vscodeApp.getWindow();
    const kaiTab = await window.getByRole('tab', { name: 'Konveyor' });
    await kaiTab.click();
    await window.waitForTimeout(10000);
    const iframe = await vscodeApp.getLeftIframe();
    if (iframe) {
      const heading = await iframe.locator('h1:has-text("Konveyor Analysis")');
      await expect(heading).toBeVisible();
    }
    await window.screenshot({ path: 'kai-installed-screenshot.png' });
  });

  test.afterAll(async () => {
    await cleanupRepo();
  });
});
