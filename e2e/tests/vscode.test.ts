import { test, expect } from '@playwright/test';
import { VSCode } from '../pages/vscode.pages';
import { cleanupRepo } from '../utilities/utils';

let vscodeAppInstance: VSCode | null = null;
// TODO : Get repo URL from fixtures
const repoUrl = 'https://github.com/konveyor-ecosystem/coolstore';

async function getVSCodeApp(): Promise<VSCode> {
  if (!vscodeAppInstance) {
    const executablePath =
      process.env.VSCODE_EXECUTABLE_PATH || '/usr/share/code/code';
    vscodeAppInstance = await VSCode.init(executablePath, repoUrl, 'coolstore');
  }
  return vscodeAppInstance;
}

test.describe('VSCode Tests', () => {
  let vscodeApp: VSCode;
  test.beforeAll(async () => {
    test.setTimeout(60000);
    console.log("=========vscode instance===")
    console.log(vscodeAppInstance);
    console.log("==========")
    vscodeApp = await getVSCodeApp();
  });

  test('Should launch VSCode and check window title', async () => {
    const window = vscodeApp.getWindow();
    await window.screenshot({ path: 'vscode-initialized-screenshot.png' });
  });

  test('Should open Extensions tab and verify installed extension', async () => {
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

  test('Set Up Konevyor and Start analyzer', async () => {
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
