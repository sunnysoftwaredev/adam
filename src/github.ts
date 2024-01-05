import childProcess from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import fetch from 'node-fetch';

const exec = promisify(childProcess.exec);

const GITHUB_TOKEN = process.env.GH_PERSONAL_ACCESS_TOKEN;
const GITHUB_USERNAME = process.env.GH_USERNAME;
const GITHUB_EMAIL = process.env.GH_EMAIL;

type Update = {
  fileName: string,
  content: string,
};

type PullRequestOptions = {
  repository: string;
  baseBranchName: string;
  branchName: string;
  commitMessage: string;
  title: string;
  description: string;
  updates: Update[];
  repositoryDirectory: string;
};

type Fork = {
  owner: {
    login: string;
  };
  full_name: string;
};

const forkRepository = async (options: PullRequestOptions) => {
  const url = `https://api.github.com/repos/${options.repository}/forks`;
  try {
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    let forks: Fork[] = await response.json();
    const existingFork = forks.find(fork => fork.owner.login === GITHUB_USERNAME);
    if (!existingFork) {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      const forkResponse = await response.json();
      return forkResponse.full_name;
    }
    return existingFork.full_name;
  } catch (error) {
    console.error('Error forking repository:', error);
    throw error;
  }
};

const cloneForkedRepository = async (options: PullRequestOptions, forkFullName: string) => {
  await exec(`git clone https://${GITHUB_TOKEN}@github.com/${forkFullName}.git "${options.repositoryDirectory}"`);
};

const setUpstreamRemote = async (options: PullRequestOptions) => {
  await exec(`git -C "${options.repositoryDirectory}" remote add upstream https://github.com/${options.repository}.git`);
  await exec(`git -C "${options.repositoryDirectory}" fetch upstream`);
};

const updateFork = async (options: PullRequestOptions) => {
  await exec(`git -C "${options.repositoryDirectory}" fetch upstream`);
  await exec(`git -C "${options.repositoryDirectory}" checkout ${options.baseBranchName}`);
  await exec(`git -C "${options.repositoryDirectory}" reset --hard upstream/${options.baseBranchName}`);
  await exec(`git -C "${options.repositoryDirectory}" push -f origin ${options.baseBranchName}`);
};

const updateFiles = async (options: PullRequestOptions) => {
  await Promise.all(options.updates.map(update => {
    const filePath = path.join(options.repositoryDirectory, update.fileName);
    return fs.writeFile(filePath, update.content, 'utf8');
  }));
};

const commitAndPush = async (options: PullRequestOptions, forkFullName: string) => {
  await exec(`git -C "${options.repositoryDirectory}" config user.name "${GITHUB_USERNAME}"`);
  await exec(`git -C "${options.repositoryDirectory}" config user.email "${GITHUB_EMAIL}"`);
  await exec(`git -C "${options.repositoryDirectory}" remote set-url origin https://${GITHUB_TOKEN}@github.com/${forkFullName}.git`);
  await exec(`git -C "${options.repositoryDirectory}" checkout -b ${options.branchName}`);
  await exec(`git -C "${options.repositoryDirectory}" add .`);
  await exec(`git -C "${options.repositoryDirectory}" commit -m "${options.commitMessage}"`);
  await exec(`git -C "${options.repositoryDirectory}" push -u origin ${options.branchName}`);
};

const createPullRequest = async (options: PullRequestOptions, forkFullName: string) => {
  const url = `https://api.github.com/repos/${options.repository}/pulls`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: options.title,
        head: `${forkFullName.split('/')[0]}:${options.branchName}`,
        base: options.baseBranchName,
        body: options.description,
      }),
    });
    const json = await response.json();
  } catch (error) {
    console.error('Error creating pull request:', error);
    throw error;
  }
};

const deleteRepository = async (options: PullRequestOptions) => {
  await fs.rm(options.repositoryDirectory, {
    recursive: true,
    force: true,
  });
};

export const createGithubPullRequest = async (
  options: Omit<PullRequestOptions, 'repositoryDirectory'>,
) => {
  try {
    const fullOptions: PullRequestOptions = {
      ...options,
      repositoryDirectory: path.join(__dirname, `.repository${Math.random().toString().substring(2)}`),
    }
    const forkFullName = await forkRepository(fullOptions);
    await cloneForkedRepository(fullOptions, forkFullName);
    await setUpstreamRemote(fullOptions);
    await updateFork(fullOptions);
    await updateFiles(fullOptions);
    await commitAndPush(fullOptions, forkFullName);
    await createPullRequest(fullOptions, forkFullName);
    await deleteRepository(fullOptions);
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
};

type GetFileOptions = {
  repository: string;
  branchName: string;
  fileName: string;
};

export const getGithubFile = async (options: GetFileOptions): Promise<string> => {
  const url = `https://raw.githubusercontent.com/${options.repository}/${options.branchName}/${options.fileName}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching file:', error);
    throw error;
  }
};

type GetFilesOptions = {
  repository: string;
  branchName: string;
};

export const getGithubFiles = async (options: GetFilesOptions): Promise<string[]> => {
  const fetchDirectoryContents = async (path: string = ''): Promise<string[]> => {
    const url = `https://api.github.com/repos/${options.repository}/contents/${path}?ref=${options.branchName}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contents = await response.json();
    let files: string[] = [];

    for (const item of contents) {
      if (item.type === 'file') {
        files.push(item.path);
      } else if (item.type === 'dir') {
        const subdirectoryFiles = await fetchDirectoryContents(item.path);
        files = files.concat(subdirectoryFiles);
      }
    }

    return files;
  };

  try {
    return await fetchDirectoryContents();
  } catch (error) {
    console.error('Error fetching repository files:', error);
    throw error;
  }
};
