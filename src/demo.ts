import { createGithubPullRequest, getGithubFile, getGithubFiles } from './github';
import refactor from './prompts/refactor';

const REPOSITORY = 'sunnysoftwaredev/adam';
const BASE_BRANCH_NAME = 'master';

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
  const files = await getGithubFiles({
    repository: REPOSITORY,
    branchName: BASE_BRANCH_NAME,
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
