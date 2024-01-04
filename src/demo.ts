import { createGithubPullRequest, getGithubFile, getGithubFiles } from './github';
import refactor from './prompts/refactor';

const REPOSITORY = process.env.REPOSITORY;
const BASE_BRANCH_NAME = process.env.BRANCH;

if (!REPOSITORY) {
  throw new Error('The REPOSITORY environment variable is required.');
}

if (!BASE_BRANCH_NAME) {
  throw new Error('The BRANCH environment variable is required.');
}

// Function to refactor a single file
const refactorFile = async (fileName: string): Promise<void> => {
  console.log(`Attempting to refactor ${fileName}`);

  const file = await getGithubFile({
    repository: REPOSITORY,
    branchName: BASE_BRANCH_NAME,
    fileName,
  });

  const pullRequestInfo = await refactor(file);

  // If there is no pull request information, return
  if (!pullRequestInfo) {
    return;
  }

  // After receiving the PR info, create the pull request
  await createGithubPullRequest({
    repository: REPOSITORY,
    baseBranchName: BASE_BRANCH_NAME,
    branchName: `adam/${pullRequestInfo.branchName}-${Math.random().toString().substring(2)}`,
    commitMessage: pullRequestInfo.commitMessage,
    title: pullRequestInfo.title,
    description: pullRequestInfo.description,
    updates: [
      {
        fileName,
        content: pullRequestInfo.content,
      }
    ],
  });

  console.log(`✅ Refactored ${fileName}`);
};

// Main asynchronous function to get the list of files and refactor them
export default async (): Promise<void> => {
  const files = await getGithubFiles({
    repository: REPOSITORY,
    branchName: BASE_BRANCH_NAME,
  });

  const filesToRefactor = files
    .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))   // Only TypeScript files
    .sort(() => Math.random() > 0.5 ? -1 : 1)  // Randomize the order
    .slice(0, 10);  // Limit to 10 files

  await Promise.all(filesToRefactor.map(refactorFile));
};