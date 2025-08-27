# Expression of Interest Dashboard

A Google Apps Script application for managing expressions of interest with manual deployment workflow.

## Features

- **Manual Local Deployment**: Use `clasp push` and `clasp deploy` for development
- **Manual Release Management**: Trigger releases via GitHub Actions when ready
- **No Automatic Deployment**: Full control over when code is deployed to production

## Deployment Status

✅ **GitHub Actions**: Manual release workflow configured  
✅ **CLASP Integration**: Connected to Apps Script project  
✅ **Local Development**: Ready for `clasp push` and `clasp deploy`  

## Workflow

1. **Develop locally**: Make changes, test with `clasp push`
2. **Deploy when ready**: Use `clasp deploy --description "..."` 
3. **Create releases**: Use GitHub Actions "Manual Release" for production versions
4. **Version control**: All releases are tagged and documented

Last updated: August 27, 2025

