import { createGithubPullRequest, getGithubFile, getGithubFiles } from './github';
import refactor from './prompts/refactor';
import { createHash } from 'crypto';

const REPOSITORY = process.env.REPOSITORY;
const BASE_BRANCH_NAME = process.env.BRANCH;

if (REPOSITORY === undefined) {
  throw new Error('The REPOSITORY environment variable is required.');
}

if (BASE_BRANCH_NAME === undefined) {
  throw new Error('The BRANCH environment variable is required.');
}

const generateBranchHash = (fileName: string, fileContent: string) => {
  return createHash('md5').update(fileName + fileContent).digest('hex').substring(0, 12);
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
  
  const branchHash = generateBranchHash(fileName, pullRequestInfo.content);
  const deterministicBranchName = `adam/refactor-${branchHash}`;

  await createGithubPullRequest({
    repository: REPOSITORY,
    baseBranchName: BASE_BRANCH_NAME,
    branchName: deterministicBranchName,
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
    .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
    .sort(() => Math.random() > 0.5 ? -1 : 1)
    .slice(0, 10);
  await Promise.all(filesToRefactor.map(refactorFile));
};
