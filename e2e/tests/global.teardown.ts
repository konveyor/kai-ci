import { test, test as setup } from '@playwright/test';
import * as fs from 'node:fs';
import path from 'path';
import { TESTS_OUTPUT_FOLDER } from '../utilities/consts';
import { getOSInfo } from '../utilities/utils';

setup.describe('global teardown', async () => {
  test('save coolstore folder as test output and map incidents and files', async () => {
    fs.cpSync('coolstore', `${TESTS_OUTPUT_FOLDER}/coolstore`, {
      recursive: true,
    });
    const analysisData = await getFirstAnalysisFileContent();
    const incidentsMap = {};
    analysisData.forEach((analysis) => {
      Object.values(analysis.violations).forEach((violation: any) => {
        violation.incidents.forEach((incident) => {
          if (!incidentsMap[incident.uri]) {
            incidentsMap[incident.uri] = { incidents: [] };
          }
          incidentsMap[incident.uri].incidents.push(incident);
        });
      });
    });

    Object.keys(incidentsMap).forEach((fileUri) => {
      incidentsMap[fileUri].updatedContent = fs.readFileSync(
        fileUri.replace(getOSInfo() === 'windows' ? 'file:///' : 'file://', ''),
        'utf-8'
      );
    });

    fs.writeFileSync(
      path.join(TESTS_OUTPUT_FOLDER, 'incidents-map.json'),
      JSON.stringify(incidentsMap, null, 2),
      'utf-8'
    );
  });
});

async function getFirstAnalysisFileContent() {
  const konveyorFolder = 'coolstore/.vscode/konveyor';

  const files = await fs.promises.readdir(konveyorFolder);

  const analysisFiles = files.filter((file) =>
    /^analysis_\d{8}T\d{6}\.json$/.test(file)
  );

  if (!analysisFiles.length) {
    console.error('No analysis file found.');
    return;
  }

  analysisFiles.sort((a, b) => {
    const dateA = a.match(/\d{8}T\d{6}/)?.[0];
    const dateB = b.match(/\d{8}T\d{6}/)?.[0];

    if (dateA && dateB) {
      return dateA.localeCompare(dateB);
    }
    return 0;
  });

  const fileContent = await fs.promises.readFile(
    path.join(konveyorFolder, analysisFiles[0]),
    'utf-8'
  );

  return JSON.parse(fileContent);
}
