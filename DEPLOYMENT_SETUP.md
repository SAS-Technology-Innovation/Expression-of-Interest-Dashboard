# GitHub Actions Setup for CLASP Deployment

## Required GitHub Secrets

To use these workflows, you need to set up the following secrets in your GitHub repository:

### 1. CLASP_CREDENTIALS

This should contain your Google Apps Script authentication credentials. You have two options:

#### Option A: Service Account (Recommended for CI/CD)
1. Create a Google Cloud Platform project
2. Enable the Google Apps Script API
3. Create a service account and download the JSON key file
4. Share your Apps Script project with the service account email
5. Copy the entire JSON content and add it as the `CLASP_CREDENTIALS` secret

#### Option B: OAuth2 Credentials
1. Run `clasp login` locally
2. Copy the contents of `~/.clasprc.json`
3. Add this as the `CLASP_CREDENTIALS` secret

### 2. GITHUB_TOKEN

This is automatically provided by GitHub Actions, no setup required.

## Setting up Secrets

1. Go to your repository on GitHub
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add `CLASP_CREDENTIALS` with your authentication JSON

## Workflow Features

### Automatic Deployment (`deploy-and-release.yml`)
- Triggers on every push to `main` branch
- Automatically generates version tags based on date and commit
- Creates GitHub releases with deployment details
- Includes commit history in release notes

### Manual Release (`manual-release.yml`)
- Manually triggered from GitHub Actions tab
- Allows custom version numbers
- Choose release type (patch/minor/major)
- Option to mark as pre-release
- More control over release timing

## Usage

### Automatic Releases
Just push to the `main` branch and the workflow will:
1. Deploy to Google Apps Script
2. Create a version tag
3. Generate a GitHub release

### Manual Releases
1. Go to **Actions** tab in your GitHub repository
2. Select **Manual Release and Deploy**
3. Click **Run workflow**
4. Fill in the version number and release type
5. Click **Run workflow**

## Version Naming Convention

- **Automatic**: `vYYYY.MM.DD-{short-commit-hash}`
- **Manual**: Custom version you specify (e.g., `v1.2.3`)

## Troubleshooting

### Common Issues:
1. **Authentication failed**: Check your `CLASP_CREDENTIALS` secret
2. **Project not found**: Make sure your `.clasp.json` file exists and has the correct project ID
3. **Permission denied**: Ensure the service account has access to your Apps Script project

### Testing Locally:
```bash
# Test CLASP authentication
clasp login

# Test push to Apps Script
clasp push

# Test deployment
clasp deploy --description "Test deployment"
```
