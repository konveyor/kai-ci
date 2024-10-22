import axios from 'axios';
import * as fs from 'fs';
import { getKAIPluginPath, getOSInfo, getKAIPluginName } from './utils';

/**
 * Downloads a file from the given URL and saves it to the specified destination.
 * @param fileUrl The URL of the file to download.
 * @param outputLocationPath The local file path where the file will be saved.
 * @returns Promise that resolves when the download is complete.
 */
export async function downloadFile(): Promise<void> {
  const outputLocationPath = getKAIPluginPath();
  const fileUrl = buildDownloadUrl();

  const writer = fs.createWriteStream(outputLocationPath);

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
  try {
    await downloadFile();
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
  const version = process.env.PLUGIN_VERSION || 'v0.0.1-dev%2B';
  const fileName = getKAIPluginName();

  const today = new Date();

  // Format date as YYYYMMDD
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}${month}${day}`;

  // Build the full URL
  const url = `${pluginUrl}${version}${formattedDate}/${fileName}`;
  return url;
}
