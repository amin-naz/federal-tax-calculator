# GitHub Pages Deployment Guide

This guide will help you deploy the Federal Tax Calculator to GitHub Pages.

## Quick Setup

### 1. Create a New Repository
1. Go to GitHub and create a new repository
2. Name it something like `federal-tax-calculator` or `w2-tax-calculator`
3. Make it public (required for free GitHub Pages)

### 2. Upload Files
1. Download or clone this repository
2. Upload all files to your new GitHub repository
3. Ensure the main branch contains all the files

### 3. Enable GitHub Pages
1. Go to your repository settings
2. Scroll down to "Pages" section
3. Under "Source", select "GitHub Actions"
4. The deployment will start automatically

### 4. Access Your Site
- Your site will be available at: `https://yourusername.github.io/repository-name`
- It may take a few minutes for the first deployment

## Manual Deployment (Alternative)

If you prefer manual deployment:

1. **Build the project locally:**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy the `dist` folder:**
   - Go to repository settings → Pages
   - Select "Deploy from a branch"
   - Choose `main` branch and `/` (root) folder
   - Upload the contents of the `dist` folder to your repository

## Custom Domain (Optional)

To use a custom domain:

1. Create a `CNAME` file in the repository root
2. Add your domain name (e.g., `taxcalculator.yourdomain.com`)
3. Configure DNS settings with your domain provider
4. Point your domain to GitHub Pages servers

## Important Notes

### Frontend-Only Limitations
Since GitHub Pages only supports static sites, this deployment includes:
- ✅ Full UI and user interface
- ✅ Tax calculation logic (client-side)
- ❌ W-2 OCR processing (requires backend server)
- ❌ File upload processing (requires backend server)

### For Full Functionality
To enable OCR features, you'll need to:
1. Deploy the backend separately (Heroku, Railway, Render, etc.)
2. Update the API endpoints in the frontend code
3. Configure CORS settings on your backend

### Demo Mode
The GitHub Pages version can run in demo mode with:
- Sample W-2 data for testing
- All tax calculation features
- Responsive design and UI components

## Troubleshooting

### Build Fails
- Check that all dependencies are listed in `package.json`
- Ensure Node.js version compatibility (18+)
- Review GitHub Actions logs for specific errors

### Site Not Loading
- Verify GitHub Pages is enabled in settings
- Check that `index.html` is in the repository root
- Ensure `.nojekyll` file is present

### Routing Issues
- Single Page Applications (SPAs) may need additional configuration
- Consider adding a `404.html` that redirects to `index.html`

## File Structure

```
repository/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── src/                        # React source code
├── public/                     # Static assets
├── dist/                       # Built files (auto-generated)
├── index.html                  # Entry point
├── package.json                # Dependencies and scripts
├── vite.config.js             # Build configuration
├── .nojekyll                  # GitHub Pages configuration
├── README.md                  # Project documentation
└── DEPLOYMENT.md              # This file
```

## Support

If you encounter issues:
1. Check GitHub Actions logs for build errors
2. Verify all files are properly uploaded
3. Ensure GitHub Pages is enabled in repository settings
4. Review the GitHub Pages documentation

## Next Steps

After successful deployment:
1. Test all functionality on the live site
2. Consider setting up a backend service for OCR features
3. Add analytics or monitoring if needed
4. Share your deployed tax calculator!

---

**Happy calculating!** 🧮💰

