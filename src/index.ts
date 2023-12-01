import './dotenv';
import { prTest } from './github';
import refactor from './prompts/refactor';
import path from 'path';

const main = async (): Promise<void> => {
  // const refactored = await refactor(path.join(__dirname, '../src/gpt.ts'));
  // console.log(refactored);
  await prTest();
};

main();