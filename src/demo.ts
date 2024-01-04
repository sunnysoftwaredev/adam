import { createGithubPullRequest, getGithubFile } from './github';
import refactor from './prompts/refactor';

const REPOSITORY = 'sunnysoftwaredev/adam';
const BASE_BRANCH_NAME = 'master';
const FILE_NAME = 'src/prompts/refactor.ts';

export default async (): Promise<void> => {
  const file = await getGithubFile({
    repository: REPOSITORY,
    branchName: BASE_BRANCH_NAME,
    fileName: FILE_NAME,
  });
  
  const pullRequestInfo = await refactor(file);
    
  if (!pullRequestInfo) {
    throw new Error('Pull request information is undefined.');
  }
  
  const { branchName, commitMessage, title, description, content } = pullRequestInfo;
  
  await createGithubPullRequest({
    repository: REPOSITORY,
    baseBranchName: BASE_BRANCH_NAME,
    branchName: `adam/${branchName}`,
    commitMessage,
    title,
    description,
    updates: [
      {
        fileName: FILE_NAME,
        content,
      }
    ],
  });
};