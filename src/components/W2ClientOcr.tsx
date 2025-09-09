import React, { useState } from 'react'
import { createWorker } from 'tesseract.js'
import { parseW2Text } from '@/lib/w2Parser'
import { taxFromTaxable, effectiveRate } from '@/lib/tax'

// pdf.js setup
// NOTE: pdfjs worker is loaded from CDN to avoid bundling hassles.
const pdfjsCdn = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.min.js'
const pdfjsWorkerCdn = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.js'

type OCRResult = {
  rawText: string
  parsed: ReturnType<typeof parseW2Text>
}

async function renderPdfToImages(file: File): Promise<HTMLCanvasElement[]> {
  // load pdf.js dynamically
  const pdfjsLib: any = await new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) return resolve((window as any).pdfjsLib)
    const s = document.createElement('script')
    s.src = pdfjsCdn
    s.onload = () => resolve((window as any).pdfjsLib)
    s.onerror = reject
    document.head.appendChild(s)
  })

  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerCdn

  const ab = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: ab }).promise
  const canvases: HTMLCanvasElement[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 2 }) // 2x for better OCR
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: ctx, viewport }).promise
    canvases.push(canvas)
  }
  return canvases
}

async function canvasToText(worker: any, canvas: HTMLCanvasElement) {
  const dataUrl = canvas.toDataURL('image/png')
  const { data } = await worker.recognize(dataUrl, { tessedit_char_blacklist: '[]{}' })
  return data.text as string
}

export default function W2ClientOcr() {
  const [busy, setBusy] = useState(false)
  const [ocr, setOcr] = useState<OCRResult | null>(null)
  const [adjustments, setAdjustments] = useState(0)
  const [est, setEst] = useState<any>(null)
  const [log, setLog] = useState<string>('')

  async function handleFile(f: File) {
    setBusy(true); setLog('Initializing OCR...')
    const worker = await createWorker({ logger: m => setLog(m.status + (m.progress ? ` ${Math.round(m.progress*100)}%` : '')) })
    await worker.loadLanguage('eng')
    await worker.initialize('eng')

    try {
      let pagesText: string[] = []

      if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
        setLog('Rendering PDF...')
        const canvases = await renderPdfToImages(f)
        setLog('Running OCR on pages...')
        for (const c of canvases) {
          pagesText.push(await canvasToText(worker, c))
        }
      } else {
        setLog('Running OCR on image...')
        const dataUrl = URL.createObjectURL(f)
        const { data } = await worker.recognize(dataUrl)
        pagesText.push(data.text)
      }

      const rawText = pagesText.join('\n\n')
      const parsed = parseW2Text(rawText)
      setOcr({ rawText, parsed })
      setLog('Done.')
    } finally {
      await worker.terminate()
      setBusy(false)
    }
  }

  function estimateFromParsed() {
    if (!ocr) return
    const wages = ocr.parsed.wages ?? 0
    const taxable = Math.max(0, wages - adjustments)
    const { tax, breakdown } = taxFromTaxable(taxable)
    const withheld = ocr.parsed.federal_tax_withheld ?? 0
    setEst({
      wages, taxable, tax, withheld,
      refund_positive_owe_negative: +(withheld - tax).toFixed(2),
      breakdown, effective_rate: effectiveRate(tax, wages),
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">W-2 OCR (Browser-only)</h2>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          disabled={busy}
          className="mt-2"
        />
        {busy && <p className="text-sm mt-2">Working… {log}</p>}
      </div>

      {ocr && (
        <div className="rounded-xl border p-4">
          <h3 className="font-semibold">Parsed fields</h3>
          <pre className="bg-gray-50 p-3 rounded">{JSON.stringify(ocr.parsed, null, 2)}</pre>

          <details className="mt-2">
            <summary className="cursor-pointer text-sm">Show raw OCR text</summary>
            <pre className="bg-gray-50 p-3 rounded max-h-64 overflow-auto whitespace-pre-wrap">
              {ocr.rawText}
            </pre>
          </details>

          <div className="mt-4 flex gap-3 items-center">
            <label className="text-sm">Adjustments</label>
            <input
              type="number"
              step="0.01"
              value={adjustments}
              onChange={(e) => setAdjustments(parseFloat(e.target.value || '0'))}
              className="border rounded px-2 py-1"
            />
            <button onClick={estimateFromParsed} className="border rounded px-3 py-1">
              Estimate Tax
            </button>
          </div>

          {est && (
            <div className="mt-3">
              <h4 className="font-semibold">Estimate</h4>
              <pre className="bg-gray-50 p-3 rounded">{JSON.stringify(est, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

