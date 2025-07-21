const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

// Load GitHub token from environment
const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error('❌ GITHUB_TOKEN not set');
  process.exit(1);
}

const REPO_URL = `https://${TOKEN}@github.com/iamkkronly843782/auto-git-commit.git`;
const CLONE_DIR = './repo';
const GIT_USER_NAME = 'Kaustav';
const GIT_USER_EMAIL = 'kkray1345+8d8d8ds7s7s77ss7@gmail.com';

async function setupGitIdentity(git) {
  await git.addConfig('user.name', GIT_USER_NAME, undefined, 'local');
  await git.addConfig('user.email', GIT_USER_EMAIL, undefined, 'local');
}

async function cloneRepoIfNeeded() {
  if (!fs.existsSync(CLONE_DIR)) {
    console.log('📦 Cloning repo...');
    await simpleGit().clone(REPO_URL, CLONE_DIR);
  }
}

async function commitAndPushLoop() {
  await cloneRepoIfNeeded();
  const git = simpleGit({ baseDir: CLONE_DIR });
  await setupGitIdentity(git);

  let runCount = 0;

  const interval = setInterval(async () => {
    const now = new Date().toISOString();
    const filePath = path.join(CLONE_DIR, 'heartbeat.txt');
    fs.writeFileSync(filePath, `Updated at ${now}`);

    try {
      await git.add('./*');
      await git.commit(`Auto commit: ${now}`);
      await git.push('origin', 'main');
      console.log(`✅ Commit pushed at ${now}`);
    } catch (err) {
      console.error('❌ Git push failed:', err.message);
    }

    runCount++;
    if (runCount >= 12) {
      console.log('♻️ Restarting service after 1 minute...');
      clearInterval(interval);
      process.exit(0); // Render will auto-restart the service
    }
  }, 5000); // every 5 sec
}

commitAndPushLoop().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
