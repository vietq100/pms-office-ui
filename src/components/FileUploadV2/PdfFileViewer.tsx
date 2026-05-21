import * as React from 'react'
import { Viewer, Worker } from '@react-pdf-viewer/core'
import type { PageLayout } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'

import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

interface AddMarginExampleProps {
  src: string
}

const PdfViewer: React.FC<AddMarginExampleProps> = ({ src }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin()
  const pageLayout: PageLayout = {
    transformSize: ({ size }) => ({ height: size.height + 30, width: size.width + 30 })
  }

  return (
    <div className="full-width d-flex justify-content-center" style={{ overflow: 'auto', maxHeight: '100vh' }}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.9.179/build/pdf.worker.min.js">
        <Viewer fileUrl={src} pageLayout={pageLayout} plugins={[defaultLayoutPluginInstance]} />
      </Worker>
    </div>
  )
}

export default PdfViewer
