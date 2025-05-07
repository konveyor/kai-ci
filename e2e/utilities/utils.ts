import * as os from 'os';
import * as fs from 'fs';
import { execSync } from 'child_process';
import * as path from 'path';
import type { TestInfo } from '@playwright/test';
import { rm } from 'node:fs/promises';

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
  return process.env.VSIX_FILE_NAME || 'konveyor-v0.1.0.vsix';
}

export async function cleanupRepo(repoDir: string) {
  if (!repoDir) {
    console.debug(`Directory ${repoDir} does not exist, skipping cleanup.`);
    return;
  }
  const repoPath = path.resolve(process.cwd(), repoDir);
  if (!fs.existsSync(repoPath)) {
    console.debug(
      `cleanupRepo: Directory ${repoPath} does not exist. Skipping cleanup.`
    );
    return;
  }

  try {
    await rm(repoPath, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 5000,
    });
    console.debug(`cleanupRepo: Successfully deleted directory ${repoPath}`);
  } catch (error) {
    console.error('Error while cleaning up cloned repository:', error);
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
  return getOSInfo() == 'windows'
    ? process.env.WINDOWS_VSCODE_EXECUTABLE_PATH
    : process.env.VSCODE_EXECUTABLE_PATH || '/usr/share/code/code';
}

export function getRepoName(testInfo: TestInfo): string {
  const repoName = path.basename(testInfo.file).replace('.test.ts', '');
  return repoName.split('_')[1];
}
