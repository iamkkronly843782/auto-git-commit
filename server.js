const simpleGit = require('simple-git');
const fs        = require('fs');
const path      = require('path');

// Read your token from the environment
const TOKEN     = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error('ERROR: GITHUB_TOKEN is not set.');
  process.exit(1);
}

// Embed the token into the clone URL
const REPO_URL  = `https://${TOKEN}@github.com/iamkkronly843782/auto-git-commit.git`;
const CLONE_DIR = './repo';

// Your Git identity
const GIT_USER_NAME  = 'Kaustav';
const GIT_USER_EMAIL = 'kkray1345+8d8d8ds7s7s77ss7@gmail.com';

async function setupGitIdentity(projectGit) {
  await projectGit.addConfig('user.name',  GIT_USER_NAME,  undefined, 'local');
  await projectGit.addConfig('user.email', GIT_USER_EMAIL, undefined, 'local');
}

async function cloneRepoIfNeeded() {
  if (!fs.existsSync(CLONE_DIR)) {
    console.log('Cloning repository with token authentication...');
    await simpleGit().clone(REPO_URL, CLONE_DIR);
  }
}

async function commitLoop() {
  await cloneRepoIfNeeded();
  const projectGit = simpleGit({ baseDir: CLONE_DIR });

  // Ensure commits are attributed properly
  await setupGitIdentity(projectGit);

  while (true) {
    const now      = new Date().toISOString();
    const filePath = path.join(CLONE_DIR, 'heartbeat.txt');

    fs.writeFileSync(filePath, `Updated at ${now}`);

    try {
      await projectGit.add('./*');
      await projectGit.commit(`Auto update at ${now}`);
      // Push back using the same token-embedded URL
      await projectGit.push('origin', 'main');
      console.log(`✅ Committed & pushed at ${now}`);
    } catch (err) {
      console.error('❌ Push failed:', err.message);
    }

    // Wait 5 seconds before the next iteration
    await new Promise(res => setTimeout(res, 5_000));
  }
}

commitLoop().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
