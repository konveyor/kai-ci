import { VSCode } from './e2e/pages/vscode.pages';

async function globalSetup() {
  console.log('Running global setup...');
  // Most commands require an open workspace
  const vscodeApp = await VSCode.init('https://github.com/konveyor-ecosystem/coolstore', 'coolstore');
  await vscodeApp.waitDefault();
  await vscodeApp.configureGenerativeAI();
  console.log('Completed global setup.');
  await vscodeApp.closeVSCode();
}

export default globalSetup;
