import fs from 'fs';
import { ask } from '../gpt';
import { promisify } from 'util';

const REDUCE_PROMPT = (code: string): string => {
  return `Hello! Below is a TypeScript file.\n\nPlease consider if there are any ways that you would refactor it to improve readability or performance (without sacrificing the other).\n\nIt is okay if not. But, if you do have suggestions, please respond with a one-paragraph explanation of what you would change (and why), and then a copy of the full file after making your changes. Nothing else. One paragraph, then the new file (if applicable).\n\nI am providing the code within triple-tick-quotes. Please do the same with your code.\n\n\`\`\`\n${code}\n\`\`\``;  
}

type Response = {
  paragraph: string;
  patch?: string;
};

const readFile = promisify(fs.readFile);

export default async (filepath: string): Promise<string> => {
  const fileContents = await readFile(filepath, 'utf8');
  const fullPrompt = REDUCE_PROMPT(fileContents);
  const askResponse = await ask(fullPrompt);
  // TODO: parse response from `ask` into the Response type
  return askResponse;
}