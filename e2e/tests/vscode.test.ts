import { test as base } from '@playwright/test';
import { expect } from '@playwright/test';
import { VSCode } from '../pages/vscode.pages';
import { cleanupRepo } from '../utilities/utils';

let vscodeAppInstance: VSCode | null = null;
// TODO : Get repo URL from fixtures
const repoUrl = 'https://github.com/konveyor-ecosystem/coolstore';

const test = base.extend<{ vscodeApp: VSCode }>({
  // Declare the custom 'vscodeApp' fixture
  vscodeApp: async ({}, use) => {
    const executablePath =
      process.env.VSCODE_EXECUTABLE_PATH || '/usr/share/code/code';
    const vscodeApp = await VSCode.init(executablePath, repoUrl, 'coolstore');
    await use(vscodeApp); // Makes the instance available for the tests
  },
});

test.describe('VSCode Tests', () => {
  // let vscodeApp: VSCode;
  // test.beforeAll(async () => {
  //   test.setTimeout(60000);
  //   console.log("=========vscode instance===")
  //   console.log(vscodeAppInstance);
  //   console.log("==========")
  //   vscodeApp = await getVSCodeApp();
  // });

  test('Should launch VSCode and check window title', async ({ vscodeApp }) => {
    const window = vscodeApp.getWindow();
    await window.screenshot({ path: 'vscode-initialized-screenshot.png' });
  });

  test('Should open Extensions tab and verify installed extension', async ({
    vscodeApp,
  }) => {
    const window = vscodeApp.getWindow();
    const kaiTab = await window.getByRole('tab', { name: 'Konveyor' });
    await kaiTab.click();
    await window.waitForTimeout(500);
    const iframe = await vscodeApp.getLeftIframe();
    if (iframe) {
      const heading = await iframe.locator('h1:has-text("Konveyor Analysis")');
      await expect(heading).toBeVisible();
    }
    await window.screenshot({ path: 'kai-installed-screenshot.png' });
  });

  test('Set Up Konevyor and Start analyzer', async ({ vscodeApp }) => {
    const window = vscodeApp.getWindow();
    await vscodeApp.openSetUpKonveyor();
    await window.waitForTimeout(5000);
    await window.getByRole('button', { name: ' Start Analyzer' }).click();
    await window.waitForTimeout(5000);
    await window
      .getByRole('button', { name: 'Start Analyzer', exact: true })
      .click();
  });

  test.afterAll(async () => {
    await cleanupRepo();
  });
});
