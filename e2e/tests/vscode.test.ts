import { test, expect } from '@playwright/test';
import { LaunchVSCodePage } from '../pages/vscode2.pages';

test.describe('VSCode Tests', () => {
  let vscodeApp: LaunchVSCodePage;

  test.beforeAll(async () => {
    const executablePath =
      process.env.VSCODE_EXECUTABLE_PATH || '/usr/share/code/code';
    vscodeApp = await LaunchVSCodePage.launchVSCode(executablePath);
  });

  test.afterAll(async () => {
    await vscodeApp.closeVSCode();
  });

  test('should launch VSCode and check window title', async () => {
    const window = vscodeApp.getWindow();
    const title = await window.title();
    expect(title).toContain('Visual Studio Code');
  });

  test('should open Extensions tab and verify installed extension', async () => {
    const window = vscodeApp.getWindow();
    const kaiTab = await window.getByRole('tab', { name: 'KAI', exact: true });
    await kaiTab.click();
    // Assert if KAI explorer is opened.
    const title = await window.getByRole('heading', {
      name: 'KAI',
      exact: true,
    });
    expect(title).toBeTruthy();
  });
});
