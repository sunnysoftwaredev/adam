import { createGithubPullRequest, getGithubFile, getGithubFiles } from './github';
import refactor from './prompts/refactor';

const REPOSITORY = process.env.REPOSITORY;
const BASE_BRANCH_NAME = process.env.BRANCH;

function throwIfNoEnv(envVariable: string | undefined, errorMsg: string) {
  if (envVariable === undefined) {
    throw new Error(errorMsg);
  }
}

throwIfNoEnv(REPOSITORY, 'The REPOSITORY environment variable is required.');
throwIfNoEnv(BASE_BRANCH_NAME, 'The BRANCH environment variable is required.');

const refactorAndCreatePullRequest = async (fileName: string): Promise<void> => {
  console.log(`Attempting to refactor ${fileName}`);
  const file = await getGithubFile({
    repository: REPOSITORY,
    branchName: BASE_BRANCH_NAME,
    fileName,
  });
  const pullRequestInfo = await refactor(file);
  if (pullRequestInfo === undefined) {
    return;
  }
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

export default async (): Promise<void> => {
  const files = await getGithubFiles({
    repository: REPOSITORY,
    branchName: BASE_BRANCH_NAME,
  });

  const filesToRefactor = files
    .filter(file => file.endsWith('.ts'))
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);

  await Promise.all(filesToRefactor.map(refactorAndCreatePullRequest));
};