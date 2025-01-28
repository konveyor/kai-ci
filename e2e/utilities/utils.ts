import * as os from 'os';
import * as fs from 'fs';
import * as util from 'util';
import { exec } from 'child_process';
import * as path from 'path';
import { execSync } from 'child_process';

const execPromise = util.promisify(exec);
const repoDir = path.resolve('coolstore');

// Function to get OS information
export function getOSInfo(): string {
  const platform: NodeJS.Platform = os.platform();

  switch (platform) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'macOS';
    case 'linux':
      return 'linux';
    default:
      return `Unknown OS: ${platform}`;
  }
}

export function getKAIPluginName(): string {
  const vsixFileName = process.env.VSIX_FILE_NAME || 'konveyor-v0.0.6.vsix';
  return vsixFileName;
}

export async function cleanupRepo() {
  if (fs.existsSync(repoDir)) {
    try {
      fs.rmSync(repoDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Error while cleaning up cloned repository:', error);
    }
  } else {
    console.warn(`Directory ${repoDir} does not exist, skipping cleanup.`);
  }
}

export async function uninstallExtension() {
  try {
    execSync('code --uninstall-extension konveyor.konveyor', {
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Error uninstalling Konveyor extension:', error);
  }
}

export function getVscodeExecutablePath() {
  const executablePath =
    getOSInfo() == 'windows'
      ? process.env.WINDOWS_VSCODE_EXECUTABLE_PATH
      : process.env.VSCODE_EXECUTABLE_PATH || '/usr/share/code/code';
  console.log(`VSCode executable path: ${executablePath}`);
  return executablePath;
}
