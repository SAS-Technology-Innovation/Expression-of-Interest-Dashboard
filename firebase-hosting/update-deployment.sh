#!/bin/bash

# Update Firebase Hosting with New Apps Script Deployment
# Usage: ./update-deployment.sh <new-deployment-id>

set -e

if [ -z "$1" ]; then
    echo "Usage: ./update-deployment.sh <new-deployment-id>"
    echo "Example: ./update-deployment.sh AKfycbz0_27f8wp0mIcnhSypSpp90PPA7Z9uqyqjegwP-OEBSCY57wt1761vgw2g_niLTD6mHA"
    exit 1
fi

NEW_DEPLOYMENT_ID="$1"
NEW_URL="https://script.google.com/macros/s/${NEW_DEPLOYMENT_ID}/exec"

echo "🔄 Updating Firebase Hosting with new Apps Script deployment..."
echo "📝 New Deployment ID: ${NEW_DEPLOYMENT_ID}"
echo "🔗 New URL: ${NEW_URL}"
echo ""

# Update index.html
echo "📄 Updating public/index.html..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|https://script.google.com/macros/s/.*/exec|${NEW_URL}|g" public/index.html
else
    # Linux
    sed -i "s|https://script.google.com/macros/s/.*/exec|${NEW_URL}|g" public/index.html
fi

# Update firebase.json
echo "⚙️  Updating firebase.json..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|https://script.google.com/macros/s/.*/exec|${NEW_URL}|g" firebase.json
else
    # Linux
    sed -i "s|https://script.google.com/macros/s/.*/exec|${NEW_URL}|g" firebase.json
fi

echo "✅ Files updated successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Review the changes:"
echo "   git diff"
echo ""
echo "2. Deploy to Firebase:"
echo "   firebase deploy"
echo ""
echo "3. Test the new URLs:"
echo "   - https://your-project-id.web.app"
echo "   - https://your-project-id.web.app/app"
echo ""
echo "4. Commit the changes:"
echo "   git add ."
echo "   git commit -m \"Update Firebase hosting to deployment ${NEW_DEPLOYMENT_ID}\""
echo "   git push"
echo ""
echo "🎉 Firebase Hosting will now redirect to your latest deployment!"
