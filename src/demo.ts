import { createGithubPullRequest, getGithubFile, getGithubFiles } from './github';
import refactor from './prompts/refactor';

// Get environment variables and throw error if they're not defined
const [REPOSITORY, BASE_BRANCH_NAME] = ['REPOSITORY', 'BRANCH'].map((varName) => {
  const val = process.env[varName];
  if (val === undefined) {
    throw new Error(`The ${varName} environment variable is required.`);
  }
  return val;
});

// Refactor given file
const refactorFile = async (fileName: string): Promise<void> => {
  console.log(`Attempting to refactor ${fileName}`);

  // Get the file from github
  const file = await getGithubFile({
    repository: REPOSITORY,
    branchName: BASE_BRANCH_NAME,
    fileName,
  });

  // Attempt refactoring the file
  const pullRequestInfo = await refactor(file);
  if (pullRequestInfo === undefined) {
    return;
  }

  // If refactoring is successful, create a pull request
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

  // Get all files present in the repository
  const files = await getGithubFiles({
    repository: REPOSITORY,
    branchName: BASE_BRANCH_NAME,
  });

  // Filter, randomize and limit the file set
  const filesToRefactor = files
    // Only TypeScript files
    .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
    // Randomize the order (produce a number between -1 and 1 to decide the sort order)
    .sort(() => Math.random() - 0.5)
    // Limit to 10 files
    .slice(0, 10);

  // Begin refactoring each file
  await Promise.all(filesToRefactor.map(refactorFile));
};