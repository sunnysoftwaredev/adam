import childProcess from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import fetch from 'node-fetch';

const exec = promisify(childProcess.exec);

const REPO_DIR = path.join(__dirname, '.repository');

const repoURL = 'https://github.com/sunnysoftwaredev/adam.git';
const fileName = path.join(REPO_DIR, 'src/test.txt');
const newBranch = 'adam-test-branch-name';
const commitMessage = 'My test commit message';
const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

// Main function to perform operations
export const prTest = async () => {
  try {
    // 1. Clone the repository
    await exec(`git clone ${repoURL} "${REPO_DIR}"`);

    // // 2. Modify a file
    await fs.writeFile(fileName, 'Your new content goes here', 'utf8');

    // 3. Git add, commit, and push to a new branch
    await exec(`git -C "${REPO_DIR}" add "${fileName}"`);
    await exec(`git -C "${REPO_DIR}" checkout -b ${newBranch}`);
    await exec(`git -C "${REPO_DIR}" commit -m "${commitMessage}"`);
    await exec(`git -C "${REPO_DIR}" push -u origin ${newBranch}`);

    // 4. Create a pull request
    await createPullRequest();

    // 5. Cleanup
    await fs.rm(REPO_DIR, {
      recursive: true,
      force: true,
    });
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

// Function to create a pull request using GitHub API
const createPullRequest = async () => {
  const url = `https://api.github.com/repos/SunnySoftwareADAM/repo/pulls`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: "Pull Request Title",
        head: newBranch,
        base: "master",
        body: "Description of the changes."
      }),
    });

    const json = await response.json();
    console.log(json);
  } catch (error) {
    console.error('Error creating pull request:', error);
    throw error;
  }
};