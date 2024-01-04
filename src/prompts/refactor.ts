import { ask } from '../gpt';

const PROMPT = (code: string): string => `Hello! Please assume the role of an experienced and talented software engineer named ADAM.
...

type PullRequestInfo = {
  title: string,
  description: string,
  commitMessage: string,
  branchName: string,
  content: string,
};

const PATTERN_MAP = {
  title: /Title: ([\s\S]*?)\n\n/,
  description: /Description: ([\s\S]*?)\n\n/,
  commitMessage: /Commit message: ([\s\S]*?)\n\n/,
  branchName: /Branch name: ([\s\S]*?)\n\n/,
  content: /File contents:\n\n