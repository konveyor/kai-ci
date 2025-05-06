import fs from 'fs';
import { TEST_OUTPUT_FOLDER } from './consts';
import { AnalysisResult, Violation } from '../../kai-evaluator/model/analysis-result.model';
import { getOSInfo } from './utils';
import { execSync } from 'child_process';
import path from 'path';

export async function prepareEvaluationData(model: string) {
  console.log('Saving coolstore directory to output...');
  fs.cpSync('coolstore', `${TEST_OUTPUT_FOLDER}/coolstore-${model.replace(/[.:]/g, "-")}`, {
    recursive: true,
  });

  const analysisData = await getFirstAnalysisFileContent();
  const incidentsMap: Record<string, any> = {};

  for (const analysis of analysisData as AnalysisResult[]) {
    for (const violation of Object.values(analysis.violations) as Violation[]) {
      for (const incident of violation.incidents) {
        if (!incidentsMap[incident.uri]) {
          incidentsMap[incident.uri] = { incidents: [] };
        }
        incidentsMap[incident.uri].incidents.push(incident);
      }
    }
  }

  for (const fileUri of Object.keys(incidentsMap)) {
    const filePath = fileUri.replace(
      getOSInfo() === 'windows' ? 'file:///' : 'file://',
      ''
    );
    incidentsMap[fileUri].updatedContent = fs.readFileSync(filePath, 'utf-8');
  }

  console.log('Resetting coolstore repo...');
  execSync(`cd coolstore && git checkout .`);

  for (const fileUri of Object.keys(incidentsMap)) {
    const filePath = fileUri.replace(
      getOSInfo() === 'windows' ? 'file:///' : 'file://',
      ''
    );
    incidentsMap[fileUri].originalContent = fs.readFileSync(filePath, 'utf-8');
  }

  fs.writeFileSync(
    path.join(TEST_OUTPUT_FOLDER, 'incidents-map.json'),
    JSON.stringify(incidentsMap, null, 2),
    'utf-8'
  );

  console.log('Incidents mapping finished.');
}

async function getFirstAnalysisFileContent() {
  const konveyorFolder = 'coolstore/.vscode/konveyor';
  const files = await fs.promises.readdir(konveyorFolder);

  const analysisFiles = files.filter((file) =>
    /^analysis_\d{8}T\d{6}\.json$/.test(file)
  );

  if (!analysisFiles.length) {
    console.error('No analysis file found.');
    return [];
  }

  analysisFiles.sort((a, b) => {
    const dateA = a.match(/\d{8}T\d{6}/)?.[0] ?? '';
    const dateB = b.match(/\d{8}T\d{6}/)?.[0] ?? '';
    return dateA.localeCompare(dateB);
  });

  const fileContent = await fs.promises.readFile(
    path.join(konveyorFolder, analysisFiles[0]),
    'utf-8'
  );

  return JSON.parse(fileContent);
}

