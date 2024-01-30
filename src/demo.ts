```typescript
import { createGithubPullRequest, getGithubFile, getGithubFiles } from './github';
import refactor from './prompts/refactor';

const REPOSITORY = process.env.REPOSITORY;
const BASE_BRANCH_NAME = process.env.BRANCH;

if (REPOSITORY === undefined) {
  throw new Error('The REPOSITORY environment variable is required.');
}

if (BASE_BRANCH_NAME === undefined) {
  throw new Error('The BRANCH environment variable is required.');
}

const refactorFile = async (fileName: string): Promise<void> => {
  try {
    console.log(`Attempting to refactor ${fileName}`);
    const file = await getGithubFile({
      repository: REPOSITORY,
      branchName: BASE_BRANCH_NAME,
      fileName,
    });
    const pullRequestInfo = await refactor(file);
    if (pullRequestInfo === undefined) {
      console.log(`No refactoring necessary for ${fileName}`);
      return;
    }
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '');
    const branchName = `adam/refactor-${fileName}-${timestamp}`;
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
    console.log(`✅ Successfully refactored and created a pull request for ${fileName}`);
  } catch (error) {
    console.error(`❌ Error refactoring file ${fileName}: ${error}`);
  }
};

export default async (): Promise<void> => {
  try {
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
  } catch (error) {
    console.error(`❌ Error retrieving files from ${REPOSITORY}: ${error}`);
  }
};
```
