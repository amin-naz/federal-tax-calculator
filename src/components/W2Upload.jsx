import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Upload, FileImage, AlertCircle, Loader2 } from 'lucide-react'

const W2Upload = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file) => {
    setError('')
    
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PNG, JPG, JPEG, or PDF file.')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.')
      return
    }

    setSelectedFile(file)
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/ocr/process-w2', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        onUpload(result)
      } else {
        setError(result.error || 'Failed to process W-2 form')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setUploading(false)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload size={24} />
          Upload Your W-2 Form
        </CardTitle>
        <CardDescription>
          Upload an image or PDF of your W-2 form. We'll use OCR technology to extract the tax information automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle size={16} />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${selectedFile ? 'border-green-400 bg-green-50' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="space-y-4">
              <FileImage size={48} className="mx-auto text-green-500" />
              <div>
                <p className="text-lg font-medium text-green-700">File Selected</p>
                <p className="text-sm text-gray-600">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload size={48} className="mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Drop your W-2 form here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports PNG, JPG, JPEG, and PDF files up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="mt-6 flex justify-center">
            <Button 
              onClick={handleUpload} 
              disabled={uploading}
              className="px-8"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  Process W-2 Form
                </>
              )}
            </Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Your uploaded files are processed securely and are not stored permanently.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default W2Upload

