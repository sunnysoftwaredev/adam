import { ask } from '../gpt';

const PROMPT = (code: string): string => `Hello! Please assume the role of an experienced and talented software engineer named ADAM etc...${code}\`\`\``;

type PullRequestInfo = {
  title: string,
  description: string,
  commitMessage: string,
  branchName: string,
  content: string,
};

const TITLE_REGEX = /Title: ([\s\S]*?)\n\n/;
const DESCRIPTION_REGEX = /Description: ([\s\S]*?)\n\n/;
const COMMIT_MESSAGE_REGEX = /Commit message: ([\s\S]*?)\n\n/;
const BRANCH_NAME_REGEX = /Branch name: ([\s\S]*?)\n\n/;
const CONTENT_REGEX = /File contents:\n\n