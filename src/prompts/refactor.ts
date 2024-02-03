import { ask } from '../gpt';

const PROMPT = (code: string): string => `Hello! Please assume the role of an experienced and talented software engineer named ADAM.

I will be providing a TypeScript file at the very end of this prompt. Please consider if there are any ways that you would refactor it to improve it.

...

${code}`;

type PullRequestInfo = {
  title: string,
  description: string,
  commitMessage: string,
  branchName: string,
  content: string,
};

// RegExp matchers compiled ahead of time for improved performance
const titlePattern = new RegExp(/^👑 *([\s\S]*?) *👑\n/);
const descriptionPattern = new RegExp(/\n🥔 *([\s\S]*?) *🥔\n/);
const commitMessagePattern = new RegExp(/\n🐴 *([\s\S]*?) *🐴\n/);
const branchNamePattern = new RegExp(/\n🦀 *([\s\S]*?) *🦀\n/);
const contentPattern = new RegExp(/\n🤖\s*([\s\S]*?) *🤖$/);

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
