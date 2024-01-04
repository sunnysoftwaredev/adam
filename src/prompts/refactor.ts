import { ask } from '../gpt';

const PROMPT = (code: string): string => `Hello! Please assume the role of an experienced and talented software engineer named ADAM.

Below is a TypeScript file.

Please consider if there are any ways that you would refactor it to improve readability or performance (without sacrificing the other).

I am providing the code within triple-tick-quotes. Please do the same with your code.

\`\`\`
${code}
\`\`\`

If you do not have any worthwhile suggestions, that is okay. Just reply by saying "No recommendations." (nothing else).

You should be concise but include all important details when you write commit messages, pull request titles and descriptions, branch names, etc. For branch names, you use simple kebab-case such as \`api-performance-enhancement\` which is usually going to be all lowercase.

When you reply with your {COMPLETE_UPDATED_FILE_CONTENTS}, do not abbreviate it with comments such as "Keep this part the same." Include the ENTIRE contents of the updated file.

If you do have a suggestion, please respond in EXACTLY the following format, and nothing additional (replacing curly brace parts with your corresponding response):

Title: {PULL_REQUEST_TITLE}

Description: {PULL_REQUEST_DESCRIPTION}

Commit message: {COMMIT_MESSAGE}

Branch name: {BRANCH_NAME}

File contents:
\`\`\`
{COMPLETE_UPDATED_FILE_CONTENTS}
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
const contentPattern = /File contents:\n```\n([\s\S]*?)```/;

const getTitle = (str: string) => str.match(titlePattern)?.[1].trim() || '';
const getDescription = (str: string) => str.match(descriptionPattern)?.[1].trim() || '';
const getCommitMessage = (str: string) => str.match(commitMessagePattern)?.[1].trim() || '';
const getBranchName = (str: string) => str.match(branchNamePattern)?.[1].trim() || '';
const getContent = (str: string) => str.match(contentPattern)?.[1].trim() || '';

export default async (file: string): Promise<PullRequestInfo | undefined> => {
  const fullPrompt = PROMPT(file);
  let askResponse = await ask(fullPrompt);
  if (askResponse === 'No recommendations.') {
    return undefined;
  }
  return {
    title: getTitle(askResponse),
    description: getDescription(askResponse),
    commitMessage: getCommitMessage(askResponse),
    branchName: getBranchName(askResponse),
    content: getContent(askResponse),
  };
};
