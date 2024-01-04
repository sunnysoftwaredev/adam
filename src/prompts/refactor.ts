import { ask } from '../gpt';

const PROMPT = (code: string): string => `Hello! Please assume the role of an experienced...
...and so forth...

type PullRequestInfo = {
  title: string,
  description: string,
  commitMessage: string,
  branchName: string,
  content: string,
};

const extractionUtil = (str: string, title: string) => new RegExp(`${title}: ([\\s\\S]*?)\\n\\n`).exec(str)?.[1].trim() || '';

export default async (file: string): Promise<PullRequestInfo | undefined> => {
  const fullPrompt = PROMPT(file);
  let askResponse = await ask(fullPrompt);
  if (askResponse === 'No recommendations.') {
    return undefined;
  }
  return {
    title: extractionUtil(askResponse, 'Title'),
    description: extractionUtil(askResponse, 'Description'),
    commitMessage: extractionUtil(askResponse, 'Commit message'),
    branchName: extractionUtil(askResponse, 'Branch name'),
    content: extractionUtil(askResponse, 'File contents:\n