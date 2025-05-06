import * as path from 'path';
import { runEvaluation } from './core';

const [, , inputFilePath, outputPath] = process.argv;

if (!inputFilePath || !outputPath) {
  console.error('Usage: evaluate <input_file_path> <output_folder_path>');
  process.exit(1);
}

const fullInputPath = path.resolve(inputFilePath);
const fullOutputPath = path.resolve(outputPath);
runEvaluation(fullInputPath, fullOutputPath).then((r) =>
  console.log('Evaluation finished')
);
