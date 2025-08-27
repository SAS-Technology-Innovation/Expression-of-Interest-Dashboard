# GitHub Actions Setup for CLASP Deployment

## Required GitHub Secrets

To use these workflows, you need to set up the following secrets in your GitHub repository:

### 1. GOOGLE_SERVICE_ACCOUNT_KEY (Recommended)

**This is the new recommended approach for CI/CD:**

#### Step-by-step Setup:

1. **Create a Google Cloud Platform project** (or use existing one)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing project

2. **Enable the Google Apps Script API**
   - Go to APIs & Services > Library
   - Search for "Google Apps Script API"
   - Click and Enable it

3. **Create a Service Account**
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Name: `clasp-deployment` (or any name you prefer)
   - Description: `Service account for CLASP deployment via GitHub Actions`
   - Click "Create and Continue"
   - Skip role assignment (we'll handle permissions differently)
   - Click "Done"

4. **Create and Download Service Account Key**
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Download the JSON file

5. **Share your Apps Script project with the Service Account**
   - Open your Google Apps Script project
   - Click "Share" button (top right)
   - Add the service account email (found in the JSON file) as an Editor
   - The email looks like: `clasp-deployment@your-project.iam.gserviceaccount.com`

6. **Add to GitHub Secrets**
   - Go to your repository > Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name: `GOOGLE_SERVICE_ACCOUNT_KEY`
   - Value: Copy and paste the **entire contents** of the downloaded JSON file

### 2. GITHUB_TOKEN

This is automatically provided by GitHub Actions, no setup required.

## Alternative: OAuth2 User Credentials (Not Recommended for CI/CD)

If you prefer to use your personal OAuth2 credentials:

#### Setup:
1. Run `clasp login` locally
2. Copy the contents of `~/.clasprc.json`
3. Add this as `CLASP_CREDENTIALS` secret in GitHub

**Note: This approach has limitations:**
- Access tokens expire frequently
- Less secure for automation
- May require frequent re-authentication

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
