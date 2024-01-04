import childProcess from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import fetch from 'node-fetch';
import {
  forkRepository,
  cloneForkedRepository,
  setUpstreamRemote,
  updateFork,
  commitAndPush,
  createPullRequest,
  deleteRepository
} from '../githubAccess';
import {
  writeFile,
  removeDirectory
} from '../fileManagement';

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

export const createGithubPullRequest = async (
  options: Omit<PullRequestOptions, 'repositoryDirectory'>,
) => {
  const fullOptions: PullRequestOptions = {
    ...options,
    repositoryDirectory: path.join(__dirname, `.repository${Math.random().toString().substring(2)}`),
  }
  const forkFullName = await forkRepository(fullOptions);
  await cloneForkedRepository(fullOptions, forkFullName);
  await setUpstreamRemote(fullOptions);
  await updateFork(fullOptions);
      
  for (const update of fullOptions.updates) {
    const filePath = path.join(fullOptions.repositoryDirectory, update.fileName);
    await writeFile(filePath, update.content, 'utf8');
  }

  await commitAndPush(fullOptions, forkFullName);
  await createPullRequest(fullOptions, forkFullName);

  // Cleaning up by deleting the repository directory
  await removeDirectory(fullOptions.repositoryDirectory);
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

  return await fetchDirectoryContents();
};