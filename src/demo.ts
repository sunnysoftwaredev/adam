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
  if (pullRequestInfo === undefined) {
    return;
  }
  await createGithubPullRequest({
    repository: REPOSITORY,
    baseBranchName: BASE_BRANCH_NAME,
    branchName: `adam/${pullRequestInfo.branchName}`,
    commitMessage: pullRequestInfo.commitMessage,
    title: pullRequestInfo.title,
    description: pullRequestInfo.description,
    updates: [
      {
        fileName: FILE_NAME,
        content: pullRequestInfo.content,
      }
    ],
  });
};
