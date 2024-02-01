import { createGithubPullRequest, getGithubFile, getGithubFiles } from './github';
import refactor from './prompts/refactor';

const DEFAULT_REPOSITORY = 'default/repository';
const DEFAULT_BASE_BRANCH_NAME = 'main';

const refactorFile = async (
  fileName: string,
  repository: string = DEFAULT_REPOSITORY,
  baseBranchName: string = DEFAULT_BASE_BRANCH_NAME
): Promise<void> => {
  console.log(`Attempting to refactor ${fileName}`);
  const file = await getGithubFile({
    repository,
    branchName: baseBranchName,
    fileName,
  });
  const pullRequestInfo = await refactor(file);
  if (pullRequestInfo === undefined) {
    return;
  }
  await createGithubPullRequest({
    repository,
    baseBranchName,
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

export default async (repository: string = DEFAULT_REPOSITORY, baseBranchName: string = DEFAULT_BASE_BRANCH_NAME): Promise<void> => {
  if (repository === undefined || baseBranchName === undefined) {
    throw new Error('The REPOSITORY and BRANCH environment variables are required.');
  }

  const files = await getGithubFiles({
    repository,
    branchName: baseBranchName,
  });
  const filesToRefactor = files
    // Only TypeScript files
    .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
    // Randomize the order
    .sort(() => Math.random() > 0.5 ? -1 : 1)
    // Limit to 10 files
    .slice(0, 10);
  await Promise.all(filesToRefactor.map(file => refactorFile(file, repository, baseBranchName)));
};
