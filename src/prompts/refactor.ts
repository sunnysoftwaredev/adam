import fs from 'fs';
import { ask } from '../gpt';
import { promisify } from 'util';

const PROMPT = (code: string): string => `Hello! Below is a TypeScript file.

Please consider if there are any ways that you would refactor it to improve readability or performance (without sacrificing the other).

It is okay if not. But, if you do have suggestions, please respond with a one-paragraph explanation of what you would change (and why), and then a copy of the full file after making your changes. Nothing else. One paragraph, then the new file (if applicable).

I am providing the code within triple-tick-quotes. Please do the same with your code.

\`\`\`
${code}
\`\`\``;

type Response = {
  paragraph: string;
  patch?: string;
};

const readFile = promisify(fs.readFile);

export default async (filepath: string): Promise<string> => {
  const fileContents = await readFile(filepath, 'utf8');
  const fullPrompt = PROMPT(fileContents);
  const askResponse = await ask(fullPrompt);
  // TODO: parse response from `ask` into the Response type
  return askResponse;
}