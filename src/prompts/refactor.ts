import { ask } from '../gpt';

const PROMPT = (code: string): string => `Hello! Please assume the role of an experienced and talented software engineer named ADAM.

...rest of the prompt here...

${code}`;

type PullRequestInfo = {
  title: string,
  description: string,
  commitMessage: string,
  branchName: string,
  content: string,
};

const titlePattern = /^👑\s*([\s\S]*?)\s*👑$/m;
const descriptionPattern = /^🥔\s*([\s\S]*?)\s*🥔$/m;
const commitMessagePattern = /^🐴\s*([\s\S]*?)\s*🐴$/m;
const branchNamePattern = /^🦀\s*([\s\S]*?)\s*🦀$/m;
const contentPattern = /^🤖\s*([\s\S]*?)\s*🤖$/m;

const getTitle = (str: string) => str.match(titlePattern)?.[1];
const getDescription = (str: string) => str.match(descriptionPattern)?.[1];
const getCommitMessage = (str: string) => str.match(commitMessagePattern)?.[1];
const getBranchName = (str: string) => str.match(branchNamePattern)?.[1];
const getContent = (str: string) => str.match(contentPattern)?.[1];

export default async (file: string): Promise<PullRequestInfo | undefined> => {
  const fullPrompt = PROMPT(file);
  let askResponse = await ask(fullPrompt);
  const title = getTitle(askResponse);
  const description = getDescription(askResponse);
  const commitMessage = getCommitMessage(askResponse);
  const branchName = getBranchName(askResponse);
  const content = getContent(askResponse);
  const incomplete = title === undefined
    || description === undefined
    || commitMessage === undefined
    || branchName === undefined
    || content === undefined;
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
