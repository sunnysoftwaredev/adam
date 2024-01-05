import { createGithubPullRequest, getGithubFile, getGithubFiles } from './github';
import refactor from './prompts/refactor';

const REPOSITORY = process.env.REPOSITORY;
const BASE_BRANCH_NAME = process.env.BRANCH;
const REQUIRED_ENV_VARS = ['REPOSITORY', 'BRANCH'];

REQUIRED_ENV_VARS.forEach((varName) => {
    if (process.env[varName] === undefined) {
        throw new Error(`The ${varName} environment variable is required.`);
    }
});

const createPullRequest = async (
    fileName: string,
    pullRequestInfo: ReturnType<typeof refactor>,
) => {
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
            },
        ],
    });
    console.log(`✅ Refactored ${fileName}`);
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
    await createPullRequest(fileName, pullRequestInfo);
};

export default async (): Promise<void> => {
    const files = await getGithubFiles({
        repository: REPOSITORY,
        branchName: BASE_BRANCH_NAME,
    });
    const filesToRefactor = files
        .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
    await Promise.all(filesToRefactor.map(refactorFile));
};