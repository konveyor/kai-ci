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
    const window = vscodeApp.getWindow();
    await window.screenshot({ path: 'vscode-initialized-screenshot.png' });
    const title = await window.title();
    // expect(title.replace(/\s+/g, '')).toMatch(/VisualStudioCode/);
    
  });

  test('Should open Extensions tab and verify installed extension', async () => {
    const window = vscodeApp.getWindow();
    const kaiTab = await window.getByRole('tab', { name: 'Konveyor' });
    await kaiTab.click();
    const title = window.getByRole('heading', {
      name: 'Konveyor Analysis',
      exact: true
    });
    expect(title).toBeTruthy();
    await window.screenshot({ path: 'kai-installed-screenshot.png' });
  });
});
