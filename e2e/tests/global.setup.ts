import { expect, test, test as setup } from '@playwright/test';
import { LeftBarItems } from '../enums/left-bar-items.enum';
import { VSCode } from '../pages/vscode.pages';
import { COOLSTORE_REPO_URL, SCREENSHOTS_FOLDER } from '../utilities/consts';

setup.describe(
  'install extension and configure provider settings',
  async () => {
    let vscodeApp: VSCode;

    test.beforeAll(async () => {
      test.setTimeout(1600000);
      vscodeApp = await VSCode.init(COOLSTORE_REPO_URL, 'coolstore');
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

    test('Set Sources and targets', async () => {
      await vscodeApp.waitDefault();
      await vscodeApp.selectSourcesAndTargets(
        [],
        [
          'cloud-readiness',
          'jakarta-ee',
          'jakarta-ee8',
          'jakarta-ee9',
          'quarkus',
        ]
      );
    });

    test('Set Up Konveyor and Start analyzer', async () => {
      const window = vscodeApp.getWindow();
      await vscodeApp.openSetUpKonveyor();
      await vscodeApp.waitDefault();
      await window
        .getByRole('button', { name: 'Configure Generative AI' })
        .click();
      await vscodeApp.waitDefault();
      await window
        .getByRole('button', { name: 'Configure GenAI model settings file' })
        .click();
      await vscodeApp.waitDefault();

      await window.keyboard.press('Control+a+Delete');
      /*await vscodeApp.pasteContent(
        [
          'models:',
          '  OpenAI: &active',
          '    environment:',
          `      OPENAI_API_KEY: "${process.env.OPENAI_API_KEY}"`,
          '    provider: "ChatOpenAI"',
          '    args:',
          '      model: "gpt-4o"',
          'active: *active',
        ].join('\n')
      );*/
      await vscodeApp.pasteContent(
        [
          'models:',
          '  AmazonBedrock: &active',
          '    provider: "ChatBedrock"',
          '    args:',
          '      model_id: "meta.llama3-70b-instruct-v1:0"',
          'active: *active',
        ].join('\n')
      );
      await window.keyboard.press('Control+s');

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
  }
);
