import { test, expect } from '@playwright/test';
import { VSCode } from '../pages/vscode.pages';

// TODO (abrugaro) : Get from data
const projectFolder = 'coolstore';

test.describe('VSCode Tests', () => {
  let vscodeApp: VSCode;

  test.beforeAll(async () => {
    test.setTimeout(1600000);
    vscodeApp = await VSCode.open(projectFolder);
    await vscodeApp.startServer();
  });

  test.beforeEach(async () => {
    // This is for debugging purposes until the Windows tests are stable
    await vscodeApp.getWindow().screenshot({
      path: `${VSCode.SCREENSHOTS_FOLDER}/before-${test.info().title.replace(' ', '-')}.png`,
    });
  });

  test('Analyze coolstore app', async () => {
    test.setTimeout(3600000);
    await vscodeApp.runAnalysis();
    await vscodeApp.waitDefault();
    await vscodeApp.getWindow().screenshot({
      path: `${VSCode.SCREENSHOTS_FOLDER}/analysis-running.png`,
    });
    await expect(
      vscodeApp.getWindow().getByText('Analysis completed').first()
    ).toBeVisible({ timeout: 1800000 });

    await vscodeApp.getWindow().screenshot({
      path: `${VSCode.SCREENSHOTS_FOLDER}/analysis-finished.png`,
    });
  });

  test('Fix Issue with default effort', async () => {
    test.setTimeout(3600000);
    await vscodeApp.openAnalysisView();
    const analysisView = await vscodeApp.getAnalysisIframe();
    await vscodeApp.searchViolation('InventoryEntity');
    await analysisView
      .locator('div.pf-v6-c-card__header-toggle')
      .nth(0)
      .click();
    await analysisView.locator('button#get-solution-button').nth(3).click();
    const resolutionView = await vscodeApp.getResolutionIframe();
    const fixLocator = resolutionView
      .locator('button[aria-label="Apply fix"]')
      .first();
    await expect(fixLocator).toBeVisible({ timeout: 60000 });
    await fixLocator.click({ force: true });
  });

  test.afterEach(async () => {
    // This is for debugging purposes until the Windows tests are stable
    await vscodeApp.getWindow().screenshot({
      path: `${VSCode.SCREENSHOTS_FOLDER}/after-${test.info().title.replace(' ', '-')}.png`,
    });
  });

  test.afterAll(async () => {
    await vscodeApp.closeVSCode();
  });
});
