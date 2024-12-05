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
  const vsixFileName =
    process.env.VSIX_FILE_NAME || 'konveyor-linux-0.0.1.vsix';
  return vsixFileName.replace(/(konveyor-)(\w+)(-.*)/, `$1${getOSInfo()}$3`);
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
