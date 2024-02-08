import { ask } from '../gpt';

const PROMPT = (code: string): string => `Hello! Please assume the role of an experienced and talented software engineer named ADAM.

// ... rest of the prompt text ...

${code}`;

type PullRequestInfo = {
  title: string,
  description: string,
  commitMessage: string,
  branchName: string,
  content: string,
};

const titlePattern = /^👑 *([\s\S]*?) *👑\n/;
const descriptionPattern = /\n🥔 *([\s\S]*?) *🥔\n/;
const commitMessagePattern = /\n🐴 *([\s\S]*?) *🐴\n/;
const branchNamePattern = /\n🦀 *([\s\S]*?) *🦀\n/;
const contentPattern = /\n🤖\s*([\s\S]*?) *🤖$/;

const extractor = (pattern: RegExp, response: string) => response.match(pattern)?.[1];

const isCompletePullRequestInfo = (info: Partial<PullRequestInfo>): info is PullRequestInfo => {
  return !!(info.title && info.description && info.commitMessage && info.branchName && info.content);
}

export default async (file: string): Promise<PullRequestInfo | undefined> => {
  const fullPrompt = PROMPT(file);
  const askResponse = await ask(fullPrompt);

  const pullRequestInfo: Partial<PullRequestInfo> = {
    title: extractor(titlePattern, askResponse),
    description: extractor(descriptionPattern, askResponse),
    commitMessage: extractor(commitMessagePattern, askResponse),
    branchName: extractor(branchNamePattern, askResponse),
    content: extractor(contentPattern, askResponse),
  };

  return isCompletePullRequestInfo(pullRequestInfo) ? pullRequestInfo : undefined;
};
