const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

const git = simpleGit();

// ✅ Pre-configured public GitHub repository
const REPO_URL = 'https://github.com/iamkkronly843782/auto-git-commit.git';
const CLONE_DIR = './repo';

// ✅ Kaustav's GitHub identity
const GIT_USER_NAME = 'Kaustav';
const GIT_USER_EMAIL = 'kkray1345+8d8d8ds7s7s77ss7@gmail.com';

async function setupGitIdentity(projectGit) {
  await projectGit.addConfig('user.name', GIT_USER_NAME, undefined, 'local');
  await projectGit.addConfig('user.email', GIT_USER_EMAIL, undefined, 'local');
}

async function cloneOrPullRepo() {
  if (!fs.existsSync(CLONE_DIR)) {
    console.log('Cloning repository...');
    await git.clone(REPO_URL, CLONE_DIR);
  }
}

async function commitLoop() {
  await cloneOrPullRepo();
  const projectGit = simpleGit({ baseDir: CLONE_DIR });

  await setupGitIdentity(projectGit);

  while (true) {
    const now = new Date().toISOString();
    const filePath = path.join(CLONE_DIR, 'heartbeat.txt');
    fs.writeFileSync(filePath, `Updated at ${now}`);

    try {
      await projectGit.add('./*');
      await projectGit.commit(`Auto update at ${now}`);
      await projectGit.push('origin', 'main');
      console.log(`✅ Pushed at ${now}`);
    } catch (err) {
      console.error('❌ Push error:', err.message);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 seconds delay
  }
}

commitLoop().catch(console.error);
