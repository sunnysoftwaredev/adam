import { ask } from '../gpt';

const PROMPT = (code: string): string => `...`; // Same prompt as before

type PullRequestInfo = {
  title: string,
  description: string,
  commitMessage: string,
  branchName: string,
  content: string,
};

// Generalized Pattern Extraction Function
const extractPattern = (str: string, pattern: RegExp) => str.match(pattern)?.[1];

const patterns = {
  title: /^👑 *([\s\S]*?) *👑\n/,
  description: /\n🥔 *([\s\S]*?) *🥔\n/,
  commitMessage: /\n🐴 *([\s\S]*?) *🐴\n/,
  branchName: /\n🦀 *([\s\S]*?) *🦀\n/,
  content: /\n🤖\s*([\s\S]*?) *🤖$/,
};

export default async (file: string): Promise<PullRequestInfo | undefined> => {
  const fullPrompt = PROMPT(file);
  let askResponse = await ask(fullPrompt);

  const title = extractPattern(askResponse, patterns.title);
  const description = extractPattern(askResponse, patterns.description);
  const commitMessage = extractPattern(askResponse, patterns.commitMessage);
  const branchName = extractPattern(askResponse, patterns.branchName);
  const content = extractPattern(askResponse, patterns.content);

  const incomplete = Object.values({ title, description, commitMessage, branchName, content }).includes(undefined);

  if (incomplete) {
    return undefined;
  }

  return {
    title,
    description,
    commitMessage,
    branchName,
    content,
  };
};
