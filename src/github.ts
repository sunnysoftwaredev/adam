import childProcess from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import fetch from 'node-fetch';

const exec = promisify(childProcess.exec);

const REPO_DIR = path.join(__dirname, '.repository');
const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

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

const cloneForkedRepository = async (forkFullName: string) => {
  await exec(`git clone https://${GITHUB_TOKEN}@github.com/${forkFullName}.git "${REPO_DIR}"`);
};

const updateFiles = async (options: PullRequestOptions) => {
  await Promise.all(options.updates.map(update => {
    const filePath = path.join(REPO_DIR, update.fileName);
    return fs.writeFile(filePath, update.content, 'utf8');
  }));
};

const commitAndPush = async (options: PullRequestOptions, forkFullName: string) => {
  await exec(`git -C "${REPO_DIR}" remote set-url origin https://${GITHUB_TOKEN}@github.com/${forkFullName}.git`);
  await exec(`git -C "${REPO_DIR}" checkout -b ${options.branchName}`);
  await exec(`git -C "${REPO_DIR}" add .`);
  await exec(`git -C "${REPO_DIR}" commit -m "${options.commitMessage}"`);
  await exec(`git -C "${REPO_DIR}" push -u origin ${options.branchName}`);
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

const deleteRepository = async () => {
  await fs.rm(REPO_DIR, {
    recursive: true,
    force: true,
  });
};

export const createGithubPullRequest = async (options: PullRequestOptions) => {
  try {
    const forkFullName = await forkRepository(options);
    await cloneForkedRepository(forkFullName);
    await updateFiles(options);
    await commitAndPush(options, forkFullName);
    await createPullRequest(options, forkFullName);
    await deleteRepository();
  } catch (error) {
    console.error('An error occurred:', error);
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
