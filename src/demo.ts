import { createGithubPullRequest, getGithubFile, getGithubFiles } from './github';
import refactor from './prompts/refactor';

const GITHUB_TARGET_REPOSITORY = process.env.GITHUB_TARGET_REPOSITORY;
const GITHUB_BASE_BRANCH_NAME = process.env.GITHUB_BASE_BRANCH_NAME;

if (GITHUB_TARGET_REPOSITORY === undefined) {
  throw new Error('The GITHUB_TARGET_REPOSITORY environment variable is required.');
}

if (GITHUB_BASE_BRANCH_NAME === undefined) {
  throw new Error('The GITHUB_BASE_BRANCH_NAME environment variable is required.');
}

const refactorFile = async (fileName: string): Promise<void> => {
  console.log(`Attempting to refactor ${fileName}`);
  const file = await getGithubFile({
    repository: GITHUB_TARGET_REPOSITORY,
    branchName: GITHUB_BASE_BRANCH_NAME,
    fileName,
  });
  const pullRequestInfo = await refactor(file);
  if (pullRequestInfo === undefined) {
    return;
  }
  await createGithubPullRequest({
    repository: GITHUB_TARGET_REPOSITORY,
    baseBranchName: GITHUB_BASE_BRANCH_NAME,
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
    repository: GITHUB_TARGET_REPOSITORY,
    branchName: GITHUB_BASE_BRANCH_NAME,
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
