import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Calculator, User, Receipt, Gift } from 'lucide-react'

const TaxInformation = ({ w2Data, onSubmit }) => {
  const [formData, setFormData] = useState({
    filing_status: 'single',
    deductions: {
      itemized: false,
      salt: '',
      mortgage_interest: '',
      charitable: '',
      medical: ''
    },
    credits: {
      child_tax_credit: '',
      child_care_credit: '',
      education_credit: '',
      earned_income_credit: ''
    },
    adjustments: {
      traditional_ira: '',
      student_loan_interest: '',
      hsa_contribution: '',
      educator_expenses: ''
    }
  })

  const [errors, setErrors] = useState({})

  const handleFilingStatusChange = (value) => {
    setFormData(prev => ({
      ...prev,
      filing_status: value
    }))
  }

  const handleDeductionChange = (field, value) => {
    if (field === 'itemized') {
      setFormData(prev => ({
        ...prev,
        deductions: {
          ...prev.deductions,
          [field]: value
        }
      }))
    } else {
      const numericValue = value.replace(/[^0-9.]/g, '')
      setFormData(prev => ({
        ...prev,
        deductions: {
          ...prev.deductions,
          [field]: numericValue
        }
      }))
    }
  }

  const handleCreditChange = (field, value) => {
    let processedValue = value
    
    if (field === 'child_tax_credit') {
      // For child tax credit, this represents number of children
      processedValue = value.replace(/[^0-9]/g, '')
    } else {
      // For other credits, this is a dollar amount
      processedValue = value.replace(/[^0-9.]/g, '')
    }

    setFormData(prev => ({
      ...prev,
      credits: {
        ...prev.credits,
        [field]: processedValue
      }
    }))
  }

  const handleAdjustmentChange = (field, value) => {
    const numericValue = value.replace(/[^0-9.]/g, '')
    setFormData(prev => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        [field]: numericValue
      }
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    // Basic validation - no specific errors for optional fields
    // Just ensure numeric values are valid if provided

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    // Prepare data for tax calculation
    const taxCalculationData = {
      wages: w2Data.wages,
      federal_tax_withheld: w2Data.federal_tax_withheld,
      filing_status: formData.filing_status,
      deductions: {
        itemized: formData.deductions.itemized,
        ...(formData.deductions.itemized && {
          salt: parseFloat(formData.deductions.salt) || 0,
          mortgage_interest: parseFloat(formData.deductions.mortgage_interest) || 0,
          charitable: parseFloat(formData.deductions.charitable) || 0,
          medical: parseFloat(formData.deductions.medical) || 0
        })
      },
      credits: {
        child_tax_credit: parseInt(formData.credits.child_tax_credit) || 0,
        child_care_credit: parseFloat(formData.credits.child_care_credit) || 0,
        education_credit: parseFloat(formData.credits.education_credit) || 0,
        earned_income_credit: parseFloat(formData.credits.earned_income_credit) || 0
      },
      adjustments: {
        traditional_ira: parseFloat(formData.adjustments.traditional_ira) || 0,
        student_loan_interest: parseFloat(formData.adjustments.student_loan_interest) || 0,
        hsa_contribution: parseFloat(formData.adjustments.hsa_contribution) || 0,
        educator_expenses: parseFloat(formData.adjustments.educator_expenses) || 0
      }
    }

    onSubmit(taxCalculationData)
  }

  const filingStatuses = [
    { value: 'single', label: 'Single' },
    { value: 'married_filing_jointly', label: 'Married Filing Jointly' },
    { value: 'married_filing_separately', label: 'Married Filing Separately' },
    { value: 'head_of_household', label: 'Head of Household' },
    { value: 'qualifying_widow', label: 'Qualifying Widow(er)' }
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator size={24} />
          Additional Tax Information
        </CardTitle>
        <CardDescription>
          Provide your filing status and any deductions or credits to complete your tax calculation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filing Status */}
        <div className="mb-8">
          <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
            <User size={18} />
            Filing Status
          </Label>
          <Select value={formData.filing_status} onValueChange={handleFilingStatusChange}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select your filing status" />
            </SelectTrigger>
            <SelectContent>
              {filingStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs for Deductions, Credits, and Adjustments */}
        <Tabs defaultValue="deductions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deductions" className="flex items-center gap-2">
              <Receipt size={16} />
              Deductions
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <Gift size={16} />
              Credits
            </TabsTrigger>
            <TabsTrigger value="adjustments" className="flex items-center gap-2">
              <Calculator size={16} />
              Adjustments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deductions" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="itemized"
                  checked={formData.deductions.itemized}
                  onCheckedChange={(checked) => handleDeductionChange('itemized', checked)}
                />
                <Label htmlFor="itemized" className="text-sm font-medium">
                  Itemize deductions instead of taking the standard deduction
                </Label>
              </div>

              {formData.deductions.itemized && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="salt">State and Local Taxes (SALT)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="salt"
                        type="text"
                        value={formData.deductions.salt}
                        onChange={(e) => handleDeductionChange('salt', e.target.value)}
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mortgage_interest">Mortgage Interest</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="mortgage_interest"
                        type="text"
                        value={formData.deductions.mortgage_interest}
                        onChange={(e) => handleDeductionChange('mortgage_interest', e.target.value)}
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="charitable">Charitable Contributions</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="charitable"
                        type="text"
                        value={formData.deductions.charitable}
                        onChange={(e) => handleDeductionChange('charitable', e.target.value)}
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medical">Medical Expenses</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="medical"
                        type="text"
                        value={formData.deductions.medical}
                        onChange={(e) => handleDeductionChange('medical', e.target.value)}
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="credits" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="child_tax_credit">Number of Qualifying Children</Label>
                <Input
                  id="child_tax_credit"
                  type="text"
                  value={formData.credits.child_tax_credit}
                  onChange={(e) => handleCreditChange('child_tax_credit', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="child_care_credit">Child Care Expenses</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="child_care_credit"
                    type="text"
                    value={formData.credits.child_care_credit}
                    onChange={(e) => handleCreditChange('child_care_credit', e.target.value)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education_credit">Education Credit Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="education_credit"
                    type="text"
                    value={formData.credits.education_credit}
                    onChange={(e) => handleCreditChange('education_credit', e.target.value)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="earned_income_credit">Earned Income Credit</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="earned_income_credit"
                    type="text"
                    value={formData.credits.earned_income_credit}
                    onChange={(e) => handleCreditChange('earned_income_credit', e.target.value)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="adjustments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="traditional_ira">Traditional IRA Contribution</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="traditional_ira"
                    type="text"
                    value={formData.adjustments.traditional_ira}
                    onChange={(e) => handleAdjustmentChange('traditional_ira', e.target.value)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_loan_interest">Student Loan Interest</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="student_loan_interest"
                    type="text"
                    value={formData.adjustments.student_loan_interest}
                    onChange={(e) => handleAdjustmentChange('student_loan_interest', e.target.value)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hsa_contribution">HSA Contribution</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="hsa_contribution"
                    type="text"
                    value={formData.adjustments.hsa_contribution}
                    onChange={(e) => handleAdjustmentChange('hsa_contribution', e.target.value)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="educator_expenses">Educator Expenses</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="educator_expenses"
                    type="text"
                    value={formData.adjustments.educator_expenses}
                    onChange={(e) => handleAdjustmentChange('educator_expenses', e.target.value)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-center">
          <Button onClick={handleSubmit} className="px-8">
            <Calculator size={16} className="mr-2" />
            Calculate Federal Tax
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default TaxInformation

