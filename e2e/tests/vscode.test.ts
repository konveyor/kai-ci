import { test, expect } from '@playwright/test';
import { VSCode } from '../pages/vscode.pages';
import { SCREENSHOTS_FOLDER } from '../utilities/consts';

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
      path: `${SCREENSHOTS_FOLDER}/before-${test.info().title.replace(' ', '-')}.png`,
    });
  });

  test('Analyze coolstore app', async () => {
    test.setTimeout(3600000);
    await vscodeApp.runAnalysis();
    console.log(new Date().toLocaleTimeString(), 'Analysis started');
    await vscodeApp.waitDefault();
    await vscodeApp.getWindow().screenshot({
      path: `${SCREENSHOTS_FOLDER}/analysis-running.png`,
    });
    await expect(
      vscodeApp.getWindow().getByText('Analysis completed').first()
    ).toBeVisible({ timeout: 1800000 });

    await vscodeApp.getWindow().screenshot({
      path: `${SCREENSHOTS_FOLDER}/analysis-finished.png`,
    });
  });

  test('Fix Issue with default (Low) effort', async () => {
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

  test('Fix all issues with default (Low) effort', async () => {
    test.setTimeout(3600000);
    await vscodeApp.openAnalysisView();
    const analysisView = await vscodeApp.getAnalysisIframe();
    await analysisView.locator('button#get-solution-button').first().click({ timeout: 300000 });
    const resolutionView = await vscodeApp.getResolutionIframe();
    const fixLocator = resolutionView.locator('button[aria-label="Apply fix"]');

    await expect(fixLocator.first()).toBeVisible({ timeout: 3600000 });
    const fixesNumber = await fixLocator.count();
    for (let i = 0; i < fixesNumber; i++) {
      await fixLocator.first().isVisible();
      await fixLocator.first().click({ force: true });
    }
  });

  test.afterEach(async () => {
    // This is for debugging purposes until the Windows tests are stable
    await vscodeApp.getWindow().screenshot({
      path: `${SCREENSHOTS_FOLDER}/after-${test.info().title.replace(' ', '-')}.png`,
    });
  });

  test.afterAll(async () => {
    await vscodeApp.closeVSCode();
  });
});
