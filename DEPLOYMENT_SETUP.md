# GitHub Actions Setup for CLASP Deployment

## Deployment Strategy

This project uses **manual deployment only**:

- **Local Development**: Deploy locally using `clasp push` and `clasp deploy`
- **Manual Release**: Use GitHub Actions "Manual Release and Deploy" workflow for production releases
- **No Automatic Deployment**: Pushes to `main` branch do NOT trigger automatic deployments

## Required GitHub Secrets

To use the manual release workflow, you need to set up the following secrets:

### 1. CLASP_CREDENTIALS

**Use OAuth2 user credentials:**

#### Setup Steps

1. **Login to CLASP locally** (get fresh credentials)

   ```bash
   clasp logout  # Clear old credentials
   clasp login   # Login again to get fresh token
   ```

2. **Copy credentials to GitHub Secret**
   - Copy the contents of `~/.clasprc.json`
   - Go to repository > Settings > Secrets and variables > Actions
   - Create/update the `CLASP_CREDENTIALS` secret with the fresh credentials

3. **Fresh credentials format** (example)

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

### 2. GITHUB_TOKEN

This is automatically provided by GitHub Actions, no setup required.

## Setting up Secrets

1. Go to your repository on GitHub
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add `CLASP_CREDENTIALS` with your authentication JSON

## Workflow Features

### Manual Release (`manual-release.yml`)

- Manually triggered from GitHub Actions tab
- Allows custom version numbers
- Choose release type (patch/minor/major)
- Option to mark as pre-release
- More control over release timing
- Creates GitHub releases with deployment details

## Usage

### Local Development Workflow

```bash
# Make changes to your code
# ...

# Push changes to Apps Script (development)
clasp push

# Test your changes in Apps Script
# ...

# Create a deployment when ready
clasp deploy --description "Your deployment description"

# Commit and push to GitHub (no automatic deployment)
git add .
git commit -m "Your commit message"
git push origin main
```

### Production Release Workflow

1. **Ensure code is ready for production**
   - Test locally with `clasp push`
   - Commit all changes to `main` branch

2. **Create Manual Release**
   - Go to **Actions** tab in your GitHub repository
   - Select **Manual Release and Deploy**
   - Click **Run workflow**
   - Fill in the version number and release type
   - Click **Run workflow**

3. **Monitor Release**
   - Workflow will deploy to Apps Script
   - Creates a GitHub release with version tag
   - Includes commit history in release notes

## Version Naming Convention

- **Manual releases**: Custom version you specify (e.g., `v1.2.3`)
- **Local deployments**: Use descriptive deployment descriptions

## Troubleshooting

### Common Issues

1. **Authentication failed**: Refresh your `CLASP_CREDENTIALS` secret using steps above
2. **Project not found**: Make sure your `.clasp.json` file exists and has the correct project ID
3. **Permission denied**: Ensure you have edit access to the Apps Script project

### Testing Locally

```bash
# Test CLASP authentication
clasp status

# Test push to Apps Script
clasp push

# Test deployment
clasp deploy --description "Test deployment"
```

### Local CLASP Commands

```bash
# View current status
clasp status

# Push code to Apps Script
clasp push

# Pull code from Apps Script
clasp pull

# Create new deployment
clasp deploy --description "Production release v1.0.0"

# List deployments
clasp deployments

# View project info
clasp open
```
