import { VSCode } from './e2e/pages/vscode.pages';
import { getOSInfo } from './e2e/utilities/utils';

async function globalSetup() {

  console.log('Running global setup...');
  const vscodeApp = await VSCode.init();

  await vscodeApp.configureGenerativeAI();
  console.log('Completed global setup.');
  await vscodeApp.closeVSCode();
}

export default globalSetup;
