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

const fetchAPIWithAuth = async (url: string, method: string, body = null) => {
  const options = {
    method: method,
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) })
  };

  const response = await fetch(url, options);
 
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const forkRepository = async (options: PullRequestOptions): Promise<string> => {
  const url = `https://api.github.com/repos/${options.repository}/forks`;

  const forks: Fork[] = await fetchAPIWithAuth(url, 'GET');

  const existingFork = forks.find(fork => fork.owner.login === GITHUB_USERNAME);

  if (!existingFork) {
    const forkResponse = await fetchAPIWithAuth(url, 'POST');
    return forkResponse.full_name;
  }

  return existingFork.full_name;
};

const manageRepository = async (options: PullRequestOptions, forkFullName: string) => {
  await cloneForkedRepository(options, forkFullName);
  await setUpstreamRemote(options);
  await updateFork(options);
  await updateFiles(options);
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
    await manageRepository(fullOptions, forkFullName);
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

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.text();
};

type GetFilesOptions = {
  repository: string;
  branchName: string;
};

export const getGithubFiles = async (options: GetFilesOptions): Promise<string[]> => {
  const fetchDirectoryContents = async (path: string = ''): Promise<string[]> => {
    const url = `https://api.github.com/repos/${options.repository}/contents/${path}?ref=${options.branchName}`;

    const contents = await fetchAPIWithAuth(url, 'GET');
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

  return await fetchDirectoryContents();
};