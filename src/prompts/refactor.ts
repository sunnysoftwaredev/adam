import { ask } from '../gpt';

const PROMPT = (code: string): string => `Hello! Please assume the role of an experienced and talented software engineer named ADAM ...
${code}
...
\`\`\``;

type PullRequestInfo = {
  title: string,
  description: string,
  commitMessage: string,
  branchName: string,
  content: string,
};

const titlePattern = /Title: ([\s\S]*?)\n\n/;
const descriptionPattern = /Description: ([\s\S]*?)\n\n/;
const commitMessagePattern = /Commit message: ([\s\S]*?)\n\n/;
const branchNamePattern = /Branch name: ([\s\S]*?)\n\n/;
const contentPattern = /File contents:\n