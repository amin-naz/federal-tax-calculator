import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { CheckCircle, AlertCircle, DollarSign, TrendingUp, RotateCcw, Loader2 } from 'lucide-react'

const TaxResults = ({ w2Data, taxData, onStartOver }) => {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    calculateTax()
  }, [])

  const calculateTax = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/tax/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taxData)
      })

      const result = await response.json()

      if (result.success) {
        setResults(result)
      } else {
        setError(result.error || 'Failed to calculate tax')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (rate) => {
    return `${rate.toFixed(1)}%`
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 size={48} className="animate-spin mx-auto text-blue-500" />
            <p className="text-lg font-medium">Calculating your federal tax...</p>
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle size={16} />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-center mt-6">
            <Button onClick={calculateTax} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!results) return null

  const { calculation, breakdown, summary } = results

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Result Card */}
      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <CheckCircle size={28} className="text-green-500" />
            Tax Calculation Complete
          </CardTitle>
          <CardDescription>
            Based on your W-2 information and tax details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`text-6xl font-bold ${calculation.is_refund ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(calculation.refund_or_owed)}
            </div>
            <div className="space-y-2">
              {calculation.is_refund ? (
                <Badge variant="default" className="bg-green-500 text-lg px-4 py-2">
                  Expected Refund
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  Amount Owed
                </Badge>
              )}
              <p className="text-gray-600">
                {calculation.is_refund 
                  ? 'You overpaid your taxes and should receive a refund'
                  : 'You owe additional federal income tax'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign size={20} />
            Tax Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Filing Status:</span>
                <span className="font-medium">{summary.filing_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gross Income:</span>
                <span className="font-medium">{formatCurrency(calculation.gross_income)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Adjusted Gross Income:</span>
                <span className="font-medium">{formatCurrency(calculation.adjusted_gross_income)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Deduction ({calculation.deduction_type}):</span>
                <span className="font-medium">{formatCurrency(calculation.total_deduction)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxable Income:</span>
                <span className="font-medium">{formatCurrency(calculation.taxable_income)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tax Before Credits:</span>
                <span className="font-medium">{formatCurrency(calculation.tax_before_credits)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Credits:</span>
                <span className="font-medium">{formatCurrency(calculation.total_credits)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax After Credits:</span>
                <span className="font-medium">{formatCurrency(calculation.tax_after_credits)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Federal Tax Withheld:</span>
                <span className="font-medium">{formatCurrency(calculation.federal_tax_withheld)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>{calculation.is_refund ? 'Refund:' : 'Amount Owed:'}</span>
                <span className={calculation.is_refund ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(calculation.refund_or_owed)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={20} />
            Tax Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatPercentage(summary.effective_tax_rate)}
              </div>
              <div className="text-sm text-gray-600">Effective Tax Rate</div>
              <div className="text-xs text-gray-500 mt-1">
                Total tax ÷ AGI
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(summary.marginal_tax_rate)}
              </div>
              <div className="text-sm text-gray-600">Marginal Tax Rate</div>
              <div className="text-xs text-gray-500 mt-1">
                Rate on next dollar earned
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Bracket Breakdown */}
      {breakdown.tax_brackets && breakdown.tax_brackets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tax Bracket Breakdown</CardTitle>
            <CardDescription>
              How your tax was calculated across different income brackets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {breakdown.tax_brackets.map((bracket, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{bracket.bracket} Tax Bracket</div>
                    <div className="text-sm text-gray-600">{bracket.income_range}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(bracket.tax)}</div>
                    <div className="text-sm text-gray-600">
                      on {formatCurrency(bracket.taxable_income_in_bracket)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credits Applied */}
      {breakdown.credits && breakdown.credits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tax Credits Applied</CardTitle>
            <CardDescription>
              Credits that reduced your tax liability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {breakdown.credits.map((credit, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">{credit.name}</div>
                    <div className="text-sm text-gray-600">{credit.description}</div>
                  </div>
                  <div className="font-medium text-green-600">
                    -{formatCurrency(credit.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center space-x-4">
            <Button onClick={onStartOver} variant="outline" className="flex items-center gap-2">
              <RotateCcw size={16} />
              Calculate Another Return
            </Button>
          </div>
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              This is an estimate for educational purposes only. Consult a tax professional for official advice.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TaxResults

