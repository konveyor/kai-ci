import { test, expect } from '@playwright/test';
import { VSCode } from '../pages/vscode.pages';
import { cleanupRepo, getOSInfo } from '../utilities/utils';

// TODO : Get repo URL from fixtures
const repoUrl = 'https://github.com/konveyor-ecosystem/coolstore';

test.describe('VSCode Tests', () => {
  let vscodeApp: VSCode;

  test.beforeAll(async () => {
    test.setTimeout(60000);
    vscodeApp = await VSCode.init(repoUrl, 'coolstore');
  });

  test('Should launch VSCode and check window title', async () => {
    const window = vscodeApp.getWindow();

    await window.screenshot({ path: 'vscode-initialized-screenshot.png' });
  });

  test('Should open Extensions tab and verify installed extension', async () => {
    const window = vscodeApp.getWindow();
    await window.waitForTimeout(5000);
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

  test('Set Up Konveyor and Start analyzer', async () => {
    const window = vscodeApp.getWindow();
    await vscodeApp.openSetUpKonveyor();
    await window.waitForTimeout(5000);
    await window.getByRole('button', { name: 'Start Server' }).click();
    await window
      .getByRole('button', { name: 'Start Analyzer', exact: true })
      .click();
  });

  test('Analyze coolstore app', async () => {
    test.setTimeout(1200000);
    await vscodeApp.runAnalysis();
    await expect(
      vscodeApp.getWindow().getByText('Analysis completed').first()
    ).toBeVisible({ timeout: 60000 });
  });

  test.afterAll(async () => {
    await cleanupRepo();
  });
});
