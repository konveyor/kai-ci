import { VSCode } from './e2e/pages/vscode.pages';

async function globalSetup() {
  console.log('Running global setup...');
  const TIMEOUT = 1600000;

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Global setup timed out')), TIMEOUT)
  );

  try {
    await Promise.race([
      (async () => {
        const vscodeApp = await VSCode.init();
        await vscodeApp.configureGenerativeAI();
        console.log('Completed global setup.');
        await vscodeApp.closeVSCode();
      })(),
      timeoutPromise,
    ]);
  } catch (err) {
    console.error('Global setup failed:', err);
    process.exit(1);
  }
}

export default globalSetup;
