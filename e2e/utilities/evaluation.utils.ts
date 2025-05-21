import fs from 'fs';
import { TEST_OUTPUT_FOLDER } from './consts';
import {
  AnalysisResult,
  Violation,
} from '../../kai-evaluator/model/analysis-result.model';
import { getOSInfo } from './utils';
import { execSync } from 'child_process';
import path from 'path';

export async function prepareEvaluationData(model: string) {
  console.log('Saving coolstore directory to output...');
  fs.cpSync(
    'coolstore',
    `${TEST_OUTPUT_FOLDER}/coolstore-${model.replace(/[.:]/g, '-')}`,
    { recursive: true }
  );

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
  execSync(`cd coolstore && git checkout . && cd ..`);

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
  console.log(`FILES INSIDE ${konveyorFolder}`);
  console.log(files);

  const analysisFiles = files.filter((file) => file.startsWith('analysis'));

  if (!analysisFiles.length) {
    console.error('No analysis file found.');
    return [];
  }

  const filesWithStats = await Promise.all(
    analysisFiles.map(async (file) => {
      const fullPath = path.join(konveyorFolder, file);
      const stats = await fs.promises.stat(fullPath);
      return { file, mtime: stats.mtime };
    })
  );

  filesWithStats.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());

  const fileContent = await fs.promises.readFile(
    path.join(konveyorFolder, filesWithStats[0].file),
    'utf-8'
  );
  console.log(`OLDEST FILE IS ${filesWithStats[0].file}`);
  console.log(`CONTENT IS:`);
  console.log(fileContent);

  return JSON.parse(fileContent);
}
