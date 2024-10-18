import * as os from 'os';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

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

/**
 * Downloads a file from the given URL and saves it to the specified destination.
 * @param fileUrl The URL of the file to download.
 * @param outputLocationPath The local file path where the file will be saved.
 * @returns Promise that resolves when the download is complete.
 */
export async function downloadFile(
  fileUrl: string,
  outputLocationPath: string
): Promise<void> {
  outputLocationPath = '/home/sshveta/Work/kai-ci/konveyor-linux-0.0.1.vsix';
  const writer = fs.createWriteStream(outputLocationPath);
  console.log('==================output path======');
  console.log(outputLocationPath);

  const response = await axios({
    url: fileUrl,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

export async function downloadLatestKAIPlugin() {
  const url = buildDownloadUrl();
  const outputPath = process.env.VSIX_FILE_PATH || '';
  console.log('========path=====');
  console.log(outputPath);

  try {
    await downloadFile(url, outputPath);
    console.log('File downloaded successfully!');
  } catch (err) {
    console.error('Error downloading the file:', err);
  }
}

/**
 * Builds the download URL for the KAI plugin with today's date
 * and depending on operating system.
 * @returns The generated URL string with the current date and os.
 */
export function buildDownloadUrl(): string {
  const pluginUrl =
    process.env.PLUGIN_URL ||
    'https://github.com/konveyor/editor-extensions/releases/download/';
  const version = process.env.PLUGIN_VERSION || 'v0.0.1-dev+';

  const platform = getOSInfo();
  const fileName = `konveyor-${platform}-0.0.1.vsix`;

  // Get today's date
  const today = new Date();

  // Format date as YYYYMMDD
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
  const day = String(today.getDate()).padStart(2, '0');
  // Resulting format YYYYMMDD
  const formattedDate = `${year}${month}${day}`;

  // Build the full URL
  const url = `${pluginUrl}${version}${formattedDate}/${fileName}`;
  return url;
}
