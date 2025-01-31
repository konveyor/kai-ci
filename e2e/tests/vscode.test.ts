import { test, expect } from '@playwright/test';
import { VSCode } from '../pages/vscode.pages';
import { cleanupRepo } from '../utilities/utils';
import { LeftBarItems } from '../enums/left-bar-items.enum';

// TODO : Get repo URL from fixtures
const repoUrl = 'https://github.com/konveyor-ecosystem/coolstore';

test.describe('VSCode Tests', () => {
  let vscodeApp: VSCode;

  test.beforeAll(async () => {
    test.setTimeout(1600000);
    vscodeApp = await VSCode.init(repoUrl, 'coolstore');
  });

  test('Should open Extensions tab and verify installed extension', async () => {
    const window = vscodeApp.getWindow();
    await window.waitForTimeout(5000);
    await vscodeApp.openLeftBarElement(LeftBarItems.Konveyor);
    const heading = window.getByRole('heading', {
      name: 'Konveyor',
      exact: true,
    });
    await expect(heading).toBeVisible();
    await window.screenshot({
      path: './screenshots/kai-installed-screenshot.png',
    });
  });

  test('Set Sources and targets', async () => {
    await vscodeApp.getWindow().waitForTimeout(5000);
    await vscodeApp.selectSourcesAndTargets([], ['quarkus']);
  });

  test('Set Up Konveyor and Start analyzer', async () => {
    const window = vscodeApp.getWindow();
    await window.waitForTimeout(5000);
    await vscodeApp.openSetUpKonveyor();
    await window.waitForTimeout(5000);
    await window.getByRole('button', { name: 'Start Server' }).click();
    await window.waitForTimeout(5000);
    await window
      .getByRole('button', { name: 'Start Analyzer', exact: true })
      .click();
  });

  test('Analyze coolstore app', async () => {
    await vscodeApp.runAnalysis();
    await expect(
      vscodeApp.getWindow().getByText('Analysis completed').first()
    ).toBeVisible({ timeout: 60000 });
    await vscodeApp
      .getWindow()
      .screenshot({ path: './screenshots/analysis-finished.png' });
  });

  test.afterAll(async () => {
    await vscodeApp.closeVSCode();
    await cleanupRepo();
  });
});
