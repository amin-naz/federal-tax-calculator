import W2ClientOcr from '@/components/W2ClientOcr'

export default function App() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Federal Tax Estimator (Frontend-only)</h1>
      <p className="text-sm mb-4">Upload a W-2 (PDF or image). OCR runs entirely in your browser. Not tax advice.</p>
      <W2ClientOcr />
    </main>
  )
}

