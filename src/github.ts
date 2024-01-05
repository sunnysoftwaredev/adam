
import childProcess from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import fetch from 'node-fetch';

const exec = promisify(childProcess.exec);

const getEnvVariable = (variableName: string): string => {
  const variable = process.env[variableName];
  if (!variable) {
    throw new Error(`${variableName} not set in environment!`);
  }
  return variable;
};

const GITHUB_TOKEN = getEnvVariable('GH_PERSONAL_ACCESS_TOKEN');
const GITHUB_USERNAME = getEnvVariable('GH_USERNAME');
const GITHUB_EMAIL = getEnvVariable('GH_EMAIL');

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

// rest of your code here... 
