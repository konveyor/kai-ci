import * as os from 'os';

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

export function getKAIPluginPath(): string {
  const vsixFilePath = process.env.VSIX_FILE_PATH;
  const pluginFilePath = vsixFilePath + getKAIPluginName();
  return pluginFilePath;
}

export function getKAIPluginName(): string {
  const vsixFileName =
    process.env.VSIX_FILE_NAME || 'konveyor-linux-0.0.1.vsix';
  return vsixFileName.replace(/(konveyor-)(\w+)(-.*)/, `$1${getOSInfo()}$3`);
}
