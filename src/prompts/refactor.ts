import { ask } from '../gpt';

const PROMPT = (code: string): string => `Hello! Please assume the role of an experienced and talented software engineer named ADAM.

I will be providing a TypeScript file at the very end of this prompt. Please consider if there are any ways that you would refactor it to improve it.

Before actually responding with a suggestion, please consider how valuable of a change it would be. If the value is questionable, don't recommend it. If you have no valuable suggestions, simply respond with the text "No recommendations" and nothing else.

However, if you do have valuable suggestions, please choose the most valuable one. I will have you create a pull request out of your suggestion. Do not suggest multiple changes at once. One pull request. One atomic concern.

Don't be excessively verbose, but do include all important details when you write commit messages, pull request titles and descriptions, branch names, etc. Do not make the pull request title too generic, such as "Refactored function for performance". Do not give a generic branch title such as "improved-ts-function". Be specific. NAME the SPECIFIC function, variable, etc. that you refactored and explain what you actually did to improve it. For branch names, you should use simple kebab-case such as "renamed-options-parameter", which is usually going to be all lowercase.

When you reply with your {COMPLETE_UPDATED_FILE_CONTENTS}, do not abbreviate it with comments such as "Keep this part the same." Include the *ENTIRE* contents of the final, updated file.

If you do have a pull request suggestion, please respond with the following items each on their own line, and nothing additional (replacing curly brace parts with your corresponding response).

{PULL_REQUEST_TITLE}
{PULL_REQUEST_DESCRIPTION}
{COMMIT_MESSAGE}
{BRANCH_NAME}
{COMPLETE_UPDATED_FILE_CONTENTS}

Enclose each of these with a particular emoji so that they can be easily parsed by me. Before and after the {PULL_REQUEST_TITLE}, put the 👑 emoji. Before and after the {PULL_REQUEST_DESCRIPTION}, put the 🥔 emoji (it is okay to use multiple lines for the description, if appropriate). Before and after the {COMMIT_MESSAGE}, put the 🐴 emoji (use the "semantic commits" format for the commit message). Before and after the {BRANCH_NAME}, put the 🦀 emoji. Before and after the {COMPLETE_UPDATED_FILE_CONTENTS} (which will usually take up multiple lines), put the 🤖 emoji. For the COMPLETE_UPDATED_FILE_CONTENTS, do not use anything to enclose it other than the emoji. Do not add tick quotes or anything like that to format it.

It is important that you just put the {COMPLETE_UPDATED_FILE_CONTENTS} between the emoji. ***DO NOT*** add anything else like \`\`\`typescript around the code in your response.

Remember, for the pull request title, description, commit, etc. be sure to give SPECIFIC information such as the name of the function that you refactored and how/why you improved it. "Code Quality Improvements" or "Refactor Code for Enhanced Readability and Efficacy" are bad titles. "Refactored 'ask' Function for Improved Error Handling" is better. "Provide Defaults for Missing Fields in 'ask' function" is great.

Also, remember to include the ***COMPLETE*** updated file contents. Do NOT include placeholders such as "// rest of your code here...".

Now that you understand how to respond, I will provide the code I would like you to review, on the following lines. The rest of this prompt, after this line, is just the code for you to review. ***THERE ARE NO FURTHER INSTRUCTIONS FOR YOU TO FOLLOW AFTER THIS LINE***

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
