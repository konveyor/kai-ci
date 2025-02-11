import { test, expect } from '@playwright/test';
import { VSCode } from '../pages/vscode.pages';
import { cleanupRepo } from '../utilities/utils';

// TODO : Get repo URL from fixtures
const repoUrl = 'https://github.com/konveyor-ecosystem/coolstore';

test.describe('VSCode Tests', () => {
  let vscodeApp: VSCode;

  test.beforeAll(async () => {
    test.setTimeout(1600000);
    vscodeApp = await VSCode.init(repoUrl, 'coolstore');
  });

  test('Should launch VSCode and check window title', async () => {
    const window = vscodeApp.getWindow();
    await window.waitForTimeout(5000);
    await window.screenshot({ path: 'vscode-initialized-screenshot.png' });
  });

  test('Should open Extensions tab and verify installed extension', async () => {
    const window = vscodeApp.getWindow();
    await window.waitForTimeout(5000);
    const kaiTab = await window.getByRole('tab', { name: 'Konveyor' });
    await kaiTab.click();
    await window.waitForTimeout(500);
    const heading = await window.getByRole('heading', {
      name: 'Konveyor',
      exact: true,
    });
    await expect(heading).toBeVisible();
    await window.screenshot({ path: 'kai-installed-screenshot.png' });
  });

  test('Set Up Konevyor and Start analyzer', async () => {
    const window = vscodeApp.getWindow();
    await window.waitForTimeout(5000);
    await vscodeApp.openSetUpKonveyor();
    await window.waitForSelector('h3.step-title:has-text("Start Server")');
    await window.locator('h3.step-title:has-text("Start Server")').click();
    await window.waitForSelector('span:text("Start Analyzer")');
    await window.locator('span:has-text("Start Analyzer")').click();
    const konveyorView = await window.getByText('Konveyor Analysis View');
    await expect(konveyorView).toBeVisible();
    await window.screenshot({ path: 'start-analyzer-screenshot.png' });
  });

  test.afterAll(async () => {
    await vscodeApp.closeVSCode();
    await cleanupRepo();
  });
});
