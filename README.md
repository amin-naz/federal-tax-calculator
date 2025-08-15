# Federal Tax Calculator - W-2 OCR

A modern web application for calculating federal taxes in the United States using W-2 form OCR technology.

## Features

- **W-2 OCR Processing**: Upload W-2 form images (PNG, JPG, PDF) and automatically extract tax information
- **Federal Tax Calculation**: Calculate 2025 federal income tax based on current tax brackets and rates
- **Multiple Filing Statuses**: Support for Single, Married Filing Jointly, Married Filing Separately, Head of Household, and Qualifying Widow(er)
- **Deductions & Credits**: Handle standard/itemized deductions and common tax credits
- **Responsive Design**: Works on desktop and mobile devices
- **Step-by-Step Interface**: Guided process from W-2 upload to tax calculation results

## Technology Stack

### Frontend
- **React 18** with modern hooks
- **Tailwind CSS** for styling
- **shadcn/ui** components for professional UI
- **Lucide React** icons
- **Vite** for build tooling

### Backend (for full functionality)
- **Python Flask** REST API
- **Tesseract OCR** for text extraction
- **OpenCV** for image preprocessing
- **PIL/Pillow** for image handling
- **pdf2image** for PDF processing

## Demo

This GitHub Pages deployment provides a frontend-only demo. For full OCR and tax calculation functionality, you'll need to deploy the backend service separately.

**Live Demo**: [GitHub Pages URL]

## Local Development

### Prerequisites
- Node.js 18+ and npm/pnpm
- Python 3.11+
- Tesseract OCR (for backend functionality)

### Frontend Setup
```bash
cd tax-calculator-frontend
pnpm install
pnpm run dev
```

### Backend Setup (Optional)
```bash
cd tax-calculator-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python src/main.py
```

## Deployment

### GitHub Pages (Frontend Only)
1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Select "Deploy from a branch" and choose `main` branch
4. The site will be available at `https://yourusername.github.io/repository-name`

### Full Stack Deployment
For complete functionality including OCR and tax calculations, deploy the backend to:
- Heroku
- Railway
- Render
- AWS/GCP/Azure
- Any Python hosting service

## Tax Calculation Features

### Supported Tax Year
- **2025 Tax Brackets** with inflation adjustments
- Current standard deduction amounts
- Updated tax rates (10%, 12%, 22%, 24%, 32%, 35%, 37%)

### Filing Statuses
- Single
- Married Filing Jointly
- Married Filing Separately
- Head of Household
- Qualifying Widow(er) with Dependent Child

### Deductions
- Standard deduction (recommended for most taxpayers)
- Itemized deductions:
  - State and Local Taxes (SALT) - capped at $10,000
  - Mortgage interest
  - Charitable contributions
  - Medical expenses (exceeding 7.5% of AGI)

### Tax Credits
- Child Tax Credit
- Child and Dependent Care Credit
- Education Credits (American Opportunity, Lifetime Learning)
- Earned Income Tax Credit

### Above-the-Line Deductions
- Traditional IRA contributions
- Student loan interest
- HSA contributions
- Educator expenses

## W-2 Form Processing

The OCR system can extract the following W-2 boxes:
- **Box 1**: Wages, tips, other compensation
- **Box 2**: Federal income tax withheld
- **Box 3**: Social security wages
- **Box 4**: Social security tax withheld
- **Box 5**: Medicare wages and tips
- **Box 6**: Medicare tax withheld

## Security & Privacy

- Files are processed securely and not stored permanently
- All calculations are performed client-side or on secure servers
- No personal tax information is retained after session ends

## Disclaimer

This calculator provides estimates for educational purposes only. Tax laws are complex and change frequently. Always consult a qualified tax professional for official tax advice and filing assistance.

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please read the contributing guidelines and submit pull requests for any improvements.

## Support

For issues or questions:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include screenshots for UI-related problems

---

**Note**: This application is for educational and estimation purposes only. It should not be used as a substitute for professional tax advice or official tax preparation software.

