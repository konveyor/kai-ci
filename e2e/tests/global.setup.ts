import { expect, test, test as setup } from '@playwright/test';
import { LeftBarItems } from '../enums/left-bar-items.enum';
import { VSCode } from '../pages/vscode.pages';

// TODO : Get repo URL from fixtures
const repoUrl = 'https://github.com/konveyor-ecosystem/coolstore';

setup.describe(
  'install extension and configure provider settings',
  async () => {
    let vscodeApp: VSCode;

    test.beforeAll(async () => {
      test.setTimeout(1600000);
      vscodeApp = await VSCode.init(repoUrl, 'coolstore');
    });

    test.beforeEach(async () => {
      // This is for debugging purposes until the Windows tests are stable
      await vscodeApp.getWindow().screenshot({
        path: `${VSCode.SCREENSHOTS_FOLDER}/before-${test.info().title.replace(' ', '-')}.png`,
      });
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
      await vscodeApp.getWindow().waitForTimeout(10000);
      await window.screenshot({
        path: `${VSCode.SCREENSHOTS_FOLDER}/kai-installed-screenshot.png`,
      });
    });

    test('Set Sources and targets', async () => {
      await vscodeApp.getWindow().waitForTimeout(5000);
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
      await window.waitForTimeout(5000);
      await vscodeApp.openSetUpKonveyor();
      await window.waitForTimeout(5000);
      await window
        .getByRole('button', { name: 'Configure Generative AI' })
        .click();
      await window.waitForTimeout(5000);
      await window
        .getByRole('button', { name: 'Configure GenAI model settings file' })
        .click();
      await window.waitForTimeout(5000);

      await window.keyboard.press('Control+a+Delete');
      await vscodeApp.pasteContent(
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
      );
      await window.keyboard.press('Control+s');

      await window.waitForTimeout(5000);
      await vscodeApp.openSetUpKonveyor();
      await window.locator('h3.step-title:text("Open Analysis Panel")').click();
      await window
        .getByRole('button', { name: 'Open Analysis Panel', exact: true })
        .click();
      await vscodeApp.startServer();
      await vscodeApp.getWindow().screenshot({
        path: `${VSCode.SCREENSHOTS_FOLDER}/server-started.png`,
      });
    });
  }
);
