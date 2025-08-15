import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Upload, FileText, Calculator, CheckCircle } from 'lucide-react'
import W2Upload from './components/W2Upload.jsx'
import OCRVerification from './components/OCRVerification.jsx'
import TaxInformation from './components/TaxInformation.jsx'
import TaxResults from './components/TaxResults.jsx'
import './App.css'

const STEPS = [
  { id: 1, title: 'Upload W-2', icon: Upload, description: 'Upload your W-2 form image' },
  { id: 2, title: 'Verify Data', icon: FileText, description: 'Review and edit extracted information' },
  { id: 3, title: 'Tax Info', icon: Calculator, description: 'Provide additional tax information' },
  { id: 4, title: 'Results', icon: CheckCircle, description: 'View your tax calculation' }
]

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [w2Data, setW2Data] = useState(null)
  const [taxData, setTaxData] = useState({
    filing_status: 'single',
    deductions: { itemized: false },
    credits: {},
    adjustments: {}
  })
  const [taxResults, setTaxResults] = useState(null)

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100

  const handleW2Upload = (data) => {
    setW2Data(data)
    setCurrentStep(2)
  }

  const handleOCRVerification = (verifiedData) => {
    setW2Data(verifiedData)
    setCurrentStep(3)
  }

  const handleTaxSubmission = (additionalData) => {
    setTaxData({ ...taxData, ...additionalData })
    setCurrentStep(4)
  }

  const handleStartOver = () => {
    setCurrentStep(1)
    setW2Data(null)
    setTaxData({
      filing_status: 'single',
      deductions: { itemized: false },
      credits: {},
      adjustments: {}
    })
    setTaxResults(null)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <W2Upload onUpload={handleW2Upload} />
      case 2:
        return <OCRVerification data={w2Data} onVerify={handleOCRVerification} />
      case 3:
        return <TaxInformation w2Data={w2Data} onSubmit={handleTaxSubmission} />
      case 4:
        return <TaxResults w2Data={w2Data} taxData={taxData} onStartOver={handleStartOver} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Federal Tax Calculator</h1>
          <p className="text-gray-600 mt-2">Calculate your federal taxes using W-2 OCR technology</p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors
                    ${isCompleted ? 'bg-green-500 text-white' : 
                      isActive ? 'bg-blue-500 text-white' : 
                      'bg-gray-200 text-gray-500'}
                  `}>
                    <Icon size={20} />
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400 max-w-20">
                      {step.description}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-center text-gray-500 text-sm">
            This calculator provides estimates for educational purposes only. 
            Consult a tax professional for official tax advice.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App

