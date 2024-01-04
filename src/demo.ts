import { createGithubPullRequest, getGithubFile, getGithubFiles } from './github';
import refactor from './prompts/refactor';

const REPOSITORY = process.env.REPOSITORY;
const BASE_BRANCH_NAME = process.env.BRANCH;

// Throw error if environment variables are not set
if (!REPOSITORY) throw new Error('The REPOSITORY environment variable is required.');
if (!BASE_BRANCH_NAME) throw new Error('The BRANCH environment variable is required.');

// New function to get file content for all files
const getFilesContent = async (fileNames: string[]): Promise<any> => {
    return await Promise.all(
        fileNames.map(fileName =>
            getGithubFile({
                repository: REPOSITORY,
                branchName: BASE_BRANCH_NAME,
                fileName,
            })
        )
    );
};

const refactorFile = async (file: any, fileName: string): Promise<void> => {
    console.log(`Attempting to refactor ${fileName}`);
    const pullRequestInfo = await refactor(file);
    if (pullRequestInfo) {
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
    }
};

export default async (): Promise<void> => {
    const files = await getGithubFiles({ repository: REPOSITORY, branchName: BASE_BRANCH_NAME });
    const filesToRefactor = files.filter(file => file.endsWith('.ts') || file.endsWith('.tsx')).sort(() => Math.random() > 0.5 ? -1 : 1).slice(0, 10);
    // Get file contents for these files
    const filesContents = await getFilesContent(filesToRefactor);
    // Perform refactoring using obtained file data
    await Promise.all(filesToRefactor.map((fileName, index) => refactorFile(filesContents[index], fileName)));
};