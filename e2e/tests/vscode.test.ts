import { expect, test } from '../fixtures/test-repo-fixture';
import { VSCode } from '../pages/vscode.pages';
import { LeftBarItems } from '../enums/left-bar-items.enum';
import { SCREENSHOTS_FOLDER } from '../utilities/consts';

test.describe('Install KAI plugin and start server', () => {
  let vscodeApp: VSCode;

  test.beforeAll(async ({ testRepoData }) => {
    test.setTimeout(1600000);
    const repoInfo = testRepoData['coolstore'];
    vscodeApp = await VSCode.open(repoInfo.repoUrl, repoInfo.repoName);
  });

  test.beforeEach(async () => {
    const testName = test.info().title.replace(' ', '-');
    console.log(`Starting ${testName} at ${new Date()}`);
    await vscodeApp.getWindow().screenshot({
      path: `${SCREENSHOTS_FOLDER}/before-${testName}.png`,
    });
  });

  test('Should open Extensions tab and verify installed extension', async () => {
    const window = vscodeApp.getWindow();
    await vscodeApp.openLeftBarElement(LeftBarItems.Konveyor);
    const heading = window.getByRole('heading', {
      name: 'Konveyor',
      exact: true,
    });
    await expect(heading).toBeVisible();
    await vscodeApp.getWindow().waitForTimeout(10000);
    await window.screenshot({
      path: `${SCREENSHOTS_FOLDER}/kai-installed-screenshot.png`,
    });
  });

  test('Create Profile and Set Sources and targets', async ({
    testRepoData,
  }) => {
    await vscodeApp.waitDefault();
    const repoInfo = testRepoData['coolstore'];
    await vscodeApp.createProfile(repoInfo.sources, repoInfo.targets);
  });

  test('Set Up Konveyor and Start analyzer', async () => {
    const window = vscodeApp.getWindow();
    await vscodeApp.openSetUpKonveyor();
    await vscodeApp.waitDefault();
    await vscodeApp.configureGenerativeAI();
    await vscodeApp.waitDefault();
    await vscodeApp.openSetUpKonveyor();
    await window.locator('h3.step-title:text("Open Analysis Panel")').click();
    await window
      .getByRole('button', { name: 'Open Analysis Panel', exact: true })
      .click();
    await vscodeApp.startServer();
    await vscodeApp.getWindow().screenshot({
      path: `${SCREENSHOTS_FOLDER}/server-started.png`,
    });
  });

  test.afterEach(async () => {
    const testName = test.info().title.replace(' ', '-');
    console.log(`Finished ${testName} at ${new Date()}`);
    await vscodeApp.getWindow().screenshot({
      path: `${SCREENSHOTS_FOLDER}/after-${testName}.png`,
    });
  });

  test.afterAll(async () => {
    await vscodeApp.closeVSCode();
  });
});
