import { test, expect } from '@playwright/test';
import { VSCode } from '../pages/vscode.pages';

test.describe('VSCode Tests', () => {
  let vscodeApp: VSCode;

  test.beforeAll(async () => {
    const executablePath =
      process.env.VSCODE_EXECUTABLE_PATH || '/usr/share/code/code';
    vscodeApp = await VSCode.init(executablePath);
  });

  test('Should launch VSCode and check window title', async () => {
    test.setTimeout(60000);
    const window = vscodeApp.getWindow();
    const title = await window.title();
    expect(title).toContain('Visual Studio Code');
  });

  test('Should open Extensions tab and verify installed extension', async () => {
    const window = vscodeApp.getWindow();
    const kaiTab = await window.getByRole('tab', { name: 'Konveyor' });
    await kaiTab.click();
    // Assert if KAI explorer is opened.
    const title = window.getByRole('heading', {
      name: 'KAI',
      exact: true,
    });
    expect(title).toBeTruthy();
  });
});
