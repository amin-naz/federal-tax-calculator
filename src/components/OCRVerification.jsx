import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { FileText, CheckCircle, AlertTriangle, Edit } from 'lucide-react'

const OCRVerification = ({ data, onVerify }) => {
  const [formData, setFormData] = useState({
    wages: data?.data?.wages || '',
    federal_tax_withheld: data?.data?.federal_tax_withheld || '',
    social_security_wages: data?.data?.social_security_wages || '',
    social_security_tax: data?.data?.social_security_tax || '',
    medicare_wages: data?.data?.medicare_wages || '',
    medicare_tax: data?.data?.medicare_tax || ''
  })

  const [errors, setErrors] = useState({})

  const handleInputChange = (field, value) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '')
    
    setFormData(prev => ({
      ...prev,
      [field]: numericValue
    }))

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate required fields
    if (!formData.wages || parseFloat(formData.wages) < 0) {
      newErrors.wages = 'Wages must be a positive number'
    }

    if (!formData.federal_tax_withheld || parseFloat(formData.federal_tax_withheld) < 0) {
      newErrors.federal_tax_withheld = 'Federal tax withheld must be a positive number'
    }

    // Validate optional fields if provided
    const optionalFields = ['social_security_wages', 'social_security_tax', 'medicare_wages', 'medicare_tax']
    optionalFields.forEach(field => {
      if (formData[field] && (isNaN(parseFloat(formData[field])) || parseFloat(formData[field]) < 0)) {
        newErrors[field] = 'Must be a positive number'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      // Convert string values to numbers
      const processedData = {}
      Object.keys(formData).forEach(key => {
        processedData[key] = formData[key] ? parseFloat(formData[key]) : 0
      })
      
      onVerify(processedData)
    }
  }

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.8) {
      return <Badge variant="default" className="bg-green-500">High Confidence</Badge>
    } else if (confidence >= 0.5) {
      return <Badge variant="secondary">Medium Confidence</Badge>
    } else {
      return <Badge variant="destructive">Low Confidence</Badge>
    }
  }

  const formatFieldLabel = (field) => {
    const labels = {
      wages: 'Box 1: Wages, Tips, Other Compensation',
      federal_tax_withheld: 'Box 2: Federal Income Tax Withheld',
      social_security_wages: 'Box 3: Social Security Wages',
      social_security_tax: 'Box 4: Social Security Tax Withheld',
      medicare_wages: 'Box 5: Medicare Wages and Tips',
      medicare_tax: 'Box 6: Medicare Tax Withheld'
    }
    return labels[field] || field
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText size={24} />
          Verify Extracted Data
        </CardTitle>
        <CardDescription>
          Review the information extracted from your W-2 form. Edit any incorrect values before proceeding.
        </CardDescription>
        {data?.confidence && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-600">OCR Confidence:</span>
            {getConfidenceBadge(data.confidence)}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {data?.confidence < 0.5 && (
          <Alert className="mb-6">
            <AlertTriangle size={16} />
            <AlertDescription>
              The OCR confidence is low. Please carefully review and correct the extracted values below.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(formData).map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field} className="text-sm font-medium">
                {formatFieldLabel(field)}
                {(field === 'wages' || field === 'federal_tax_withheld') && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id={field}
                  type="text"
                  value={formData[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  placeholder="0.00"
                  className={`pl-8 ${errors[field] ? 'border-red-500' : ''}`}
                />
                <Edit size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors[field] && (
                <p className="text-sm text-red-500">{errors[field]}</p>
              )}
            </div>
          ))}
        </div>

        {data?.raw_text && (
          <div className="mt-6">
            <Label className="text-sm font-medium mb-2 block">Raw OCR Text (for debugging)</Label>
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 max-h-32 overflow-y-auto">
              {data.raw_text}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Button onClick={handleSubmit} className="px-8">
            <CheckCircle size={16} className="mr-2" />
            Continue to Tax Information
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            * Required fields for tax calculation
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default OCRVerification

