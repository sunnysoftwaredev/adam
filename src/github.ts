```typescript
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
  fullName: string; // Renamed from full_name to fullName
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
      const forkResponse: Fork = await response.json(); // Updated to use Fork type
      return forkResponse.fullName; // Changed to use the renamed property
    }
    return existingFork.fullName; // Changed to use the renamed property
  } catch (error) {
    console.error('Error forking repository:', error);
    throw error;
  }
};

// ... Rest of the unchanged code ...

export const createGithubPullRequest = async (
  options: Omit<PullRequestOptions, 'repositoryDirectory'>,
) => {
  // ... Unchanged code ...
};

export const getGithubFile = async (options: GetFileOptions): Promise<string> => {
  // ... Unchanged code ...
};

export const getGithubFiles = async (options: GetFilesOptions): Promise<string[]> => {
  // ... Unchanged code ...
};
```
