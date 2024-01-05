import { createGithubPullRequest, getGithubFile, getGithubFiles } from './github';
import refactor from './prompts/refactor';

const REPOSITORY = process.env.REPOSITORY;
const BASE_BRANCH_NAME = process.env.BRANCH;

const checkEnvVar = (envVar: string, name: string) => {
  if (envVar === undefined) {
    throw new Error(`The ${name} environment variable is required.`);
  }
}

checkEnvVar(REPOSITORY, 'REPOSITORY');
checkEnvVar(BASE_BRANCH_NAME, 'BRANCH');

const refactorFile = async (fileName: string): Promise<void> => {
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
  const filesToRefactor = await getGithubFiles({
    repository: REPOSITORY,
    branchName: BASE_BRANCH_NAME,
    filterFunc: file => file.endsWith('.ts') || file.endsWith('.tsx'),
    randomize: true,
    limit: 10
  });
  
  await Promise.all(filesToRefactor.map(refactorFile));
};