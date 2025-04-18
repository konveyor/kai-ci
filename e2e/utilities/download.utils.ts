import axios from 'axios';
import * as fs from 'fs';
import { getKAIPluginName } from './utils';

/**
 * Downloads a file from the given URL and saves it to the specified destination.
 * @param fileUrl The URL of the file to download.
 * @param outputLocationPath The local file path where the file will be saved.
 * @returns Promise that resolves when the download is complete.
 */
export async function downloadFile(): Promise<void> {
  const outputLocationPath = getKAIPluginName();
  const defaultUrl = process.env.DEFAULT_VSIX_DOWNLOAD_URL || '';

  const writer = fs.createWriteStream(outputLocationPath);
  const response = await fetchUrl(defaultUrl);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function fetchUrl(defaultUrl: string) {
  try {
    const response = await axios({
      url: defaultUrl,
      method: 'GET',
      responseType: 'stream',
    });
    return response;
  } catch (error) {
    console.error('Error fetching URL:', error);
    throw error;
  }
}

export async function downloadLatestKAIPlugin() {
  try {
    await downloadFile();
    console.log('File downloaded successfully!');
  } catch (err) {
    console.error('Error downloading the file:', err);
  }
}
