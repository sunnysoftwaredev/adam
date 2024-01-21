```typescript
import { createGithubPullRequest, getGithubFile, getGithubFiles } from './github';
import { getLatestCommitSHA } from './git'; // Assumed existence of a 'getLatestCommitSHA' helper function
import refactor from './prompts/refactor';

const REPOSITORY = process.env.REPOSITORY;
const BASE_BRANCH_NAME = process.env.BRANCH;

if (REPOSITORY === undefined) {
  throw new Error('The REPOSITORY environment variable is required.');
}

if (BASE_BRANCH_NAME === undefined) {
  throw new Error('The BRANCH environment variable is required.');
}

const generateUniqueBranchName = (baseName: string): string => {
  const commitSHA = getLatestCommitSHA(REPOSITORY).slice(0, 8);
  return `adam/${baseName}-${commitSHA}`;
};

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
  const branchName = generateUniqueBranchName(pullRequestInfo.branchName);
  await createGithubPullRequest({
    repository: REPOSITORY,
    baseBranchName: BASE_BRANCH_NAME,
    branchName,
    commitMessage: pullRequestInfo.commitMessage,
    title: pullRequestInfo.title,
    description: pullRequestInfo.description,
    updates: [
      {
        fileName,
        content: pullRequestInfo.content,
      },
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
```
