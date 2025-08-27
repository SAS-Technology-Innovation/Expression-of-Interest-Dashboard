# GitHub Actions Setup for CLASP Deployment

## Required GitHub Secrets

To use these workflows, you need to set up the following secrets in your GitHub repository:

### 1. CLASP_CREDENTIALS (Updated)

**Use OAuth2 user credentials (recommended for now):**

#### Setup Steps:

1. **Login to CLASP locally** (get fresh credentials)
   ```bash
   clasp logout  # Clear old credentials
   clasp login   # Login again to get fresh token
   ```

2. **Copy credentials to GitHub Secret**
   - Copy the contents of `~/.clasprc.json`
   - Go to repository > Settings > Secrets and variables > Actions
   - Update the `CLASP_CREDENTIALS` secret with the fresh credentials

3. **Fresh credentials format** (example):
   ```json
   {
     "tokens": {
       "default": {
         "client_id": "1072944905499-...",
         "client_secret": "...",
         "type": "authorized_user",
         "refresh_token": "1//0g...",
         "access_token": "ya29.A0AS3H6N..."
       }
     }
   }
   ```

**Note**: If you get authentication errors, repeat step 1-2 to refresh the credentials.

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
