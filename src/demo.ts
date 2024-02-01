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
    if (!pullRequestInfo) {
      console.log(`No refactoring necessary for ${fileName}`);
      return;
    }

    const uniqueSuffix = Math.random().toString().substring(2);
    const branchName = `adam/${pullRequestInfo.branchName}-${uniqueSuffix}`;
    await createGithubPullRequest({
      repository: REPOSITORY,
      baseBranchName: BASE_BRANCH_NAME,
      branchName,
      commitMessage: pullRequestInfo.commitMessage,
      title: pullRequestInfo.title,
      description: pullRequestInfo.description,
      updates: [{ fileName, content: pullRequestInfo.content }],
    });

    console.log(`✅ Refactored ${fileName}`);
  } catch (error) {
    console.error(`❌ Error refactoring ${fileName}:`, error);
  }
};

export default async (): Promise<void> => {
  try {
    const files = await getGithubFiles({
      repository: REPOSITORY,
      branchName: BASE_BRANCH_NAME,
    });
    const filesToRefactor = files
      .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    await Promise.all(filesToRefactor.map(refactorFile));
  } catch (error) {
    console.error('Error retrieving or refactoring files:', error);
  }
};
