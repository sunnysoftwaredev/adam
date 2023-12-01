import childProcess from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import fetch from 'node-fetch';

const exec = promisify(childProcess.exec);
const writeFileAsync = promisify(fs.writeFile);

const repoURL = 'https://github.com/username/repo.git';
const fileName = 'path/to/your/file.txt';
const newBranch = 'new-branch-name';
const commitMessage = 'Your commit message';
const githubToken = 'your_github_token';

// Main function to perform operations
const main = async () => {
  try {
    // 1. Clone the repository
    await exec(`git clone ${repoURL}`);

    // 2. Modify a file
    await writeFileAsync(fileName, 'Your new content goes here', 'utf8');

    // 3. Git add, commit, and push to a new branch
    await exec(`git add ${fileName}`);
    await exec(`git commit -m "${commitMessage}"`);
    await exec(`git checkout -b ${newBranch}`);
    await exec(`git push -u origin ${newBranch}`);

    // 4. Create a pull request
    await createPullRequest();
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

// Function to create a pull request using GitHub API
const createPullRequest = async () => {
  const url = `https://api.github.com/repos/username/repo/pulls`;

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

// Execute the main function
main();
