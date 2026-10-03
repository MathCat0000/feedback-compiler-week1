# Publish the repository on GitHub

The local repository is prepared on the `main` branch with a first commit. A GitHub login is required to create the remote repository and push it; no GitHub credential is stored in this project.

Recommended repository name: `feedback-compiler-week1`

## Option A — GitHub CLI

Install and authenticate once:

```bash
brew install gh
gh auth login
```

Then run from this directory:

```bash
cd /path/to/feedback-compiler-week1
gh repo create feedback-compiler-week1 --public --source=. --remote=origin --push
```

The command creates the public repository, adds `origin`, and pushes `main`.

## Option B — GitHub web interface

1. Create an empty public repository named `feedback-compiler-week1` at [github.com/new](https://github.com/new). Do not add a README, license or `.gitignore`; those files already exist locally.
2. Replace `<YOUR_GITHUB_USERNAME>` below and run:

```bash
cd /path/to/feedback-compiler-week1
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/feedback-compiler-week1.git
git push -u origin main
```

For SSH instead:

```bash
git remote add origin git@github.com:<YOUR_GITHUB_USERNAME>/feedback-compiler-week1.git
git push -u origin main
```

Verify the connection:

```bash
git remote -v
git status --short --branch
```

After the push, use the repository URL in the external challenge submission or social post you publish. Publication copy is intentionally kept outside this repository.

## What is intentionally excluded

The public repository ignores local orchestration notes, graph caches, dependency folders, build output and private run artifacts. Public examples are synthetic or attributed public-data shapes; do not add client feedback, private transcripts, secrets or local session logs.
