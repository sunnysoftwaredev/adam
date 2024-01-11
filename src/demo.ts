import { createGithubPullRequest, getGithubFile, getGithubFiles } from './github';
import refactor from './prompts/refactor';

const REPOSITORY_ENV = process.env.REPOSITORY;
const BASE_BRANCH_NAME_ENV = process.env.BRANCH;

if (REPOSITORY_ENV === undefined) {
  throw new Error('The REPOSITORY_ENV environment variable is required.');
}

if (BASE_BRANCH_NAME_ENV === undefined) {
  throw new Error('The BASE_BRANCH_NAME_ENV environment variable is required.');
}

const refactorFile = async (fileName: string): Promise<void> => {
  console.log(`Attempting to refactor ${fileName}`);
  const file = await getGithubFile({
    repository: REPOSITORY_ENV,
    branchName: BASE_BRANCH_NAME_ENV,
    fileName,
  });
  const pullRequestInfo = await refactor(file);
  if (pullRequestInfo === undefined) {
    return;
  }
  await createGithubPullRequest({
    repository: REPOSITORY_ENV,
    baseBranchName: BASE_BRANCH_NAME_ENV,
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

export default async (): Promise<void> => {
  const files = await getGithubFiles({
    repository: REPOSITORY_ENV,
    branchName: BASE_BRANCH_NAME_ENV,
  });
  const filesToRefactor = files
    // Only TypeScript files
    .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
    // Randomize the order
    .sort(() => Math.random() > 0.5 ? -1 : 1)
    // Limit to 10 files
    .slice(0, 10);
  await Promise.all(filesToRefactor.map(refactorFile));
};
