import * as fs from 'fs';
import * as path from 'path';
import { evaluateFile } from './agents/evaluation.agent';
import { EvaluationResult } from './model/evaluation-result.model';
import { FileEvaluationInput } from './model/evaluation-input.model';

const [, , inputFilePath, outputPath] = process.argv;

if (!inputFilePath || !outputPath) {
  console.error('Usage: evaluate <input_file_path> <output_folder_path>');
  process.exit(1);
}

const fullInputPath = path.resolve(inputFilePath);
const fullOutputPath = path.resolve(outputPath);
main(fullInputPath, fullOutputPath);

async function main(fileInputPath: string, fileOutputPath: string) {
  const data = JSON.parse(fs.readFileSync(fileInputPath, 'utf-8'));
  console.log('Evaluating results...');
  const dataLength = Object.keys(data).length;
  const evaluationResult: EvaluationResult = {
    evaluationTime: 0,
    fileEvaluationResults: [],
    date: new Date(),
    averageSpecificity: 0,
    averageCompetency: 0,
    averageEffectiveness: 0,
    averageScore: 0,
    totalFiles: dataLength,
    model: 'meta.llama3-70b-instruct-v1:0',
    evaluationModel: 'meta.llama3-70b-instruct-v1:0', // TODO take from env
    errors: [],
  };

  const start = new Date();
  for (const file of Object.keys(data))
    try {
      const res = await evaluateFile(
        file,
        data[file] as unknown as FileEvaluationInput
      );
      evaluationResult.fileEvaluationResults.push(res);
      evaluationResult.averageSpecificity += res.specificity;
      evaluationResult.averageCompetency += res.competency;
      evaluationResult.averageEffectiveness += res.effectiveness;
      evaluationResult.averageScore += res.averageScore;
    } catch (e) {
      evaluationResult.errors.push(
        `Error while evaluating file ${file}\n Reason: ${e}`
      );
    }

  const end = new Date();
  evaluationResult.evaluationTime = end.getTime() - start.getTime();

  evaluationResult.averageSpecificity /= dataLength;
  evaluationResult.averageCompetency /= dataLength;
  evaluationResult.averageEffectiveness /= dataLength;
  evaluationResult.averageScore /= dataLength;
  console.log('Evaluation Finished, writing results to file...');
  fs.writeFileSync(
    path.join(fileOutputPath, 'evaluation-result.json'),
    JSON.stringify(evaluationResult, null, 2),
    'utf-8'
  );
  console.log('Execution finished...');
}
