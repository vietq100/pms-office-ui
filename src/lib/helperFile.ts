import { saveAs } from 'file-saver' // path to file-saver

// Download file
export function base64toBlob(base64Data, contentType) {
  contentType = contentType || ''
  const sliceSize = 1024
  const byteCharacters = atob(base64Data)
  const bytesLength = byteCharacters.length
  const slicesCount = Math.ceil(bytesLength / sliceSize)
  const byteArrays = new Array(slicesCount)
  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize
    const end = Math.min(begin + sliceSize, bytesLength)

    const bytes = new Array(end - begin)
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0)
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes)
  }
  return new Blob(byteArrays, { type: contentType })
}

export function FileToBase64(file: File) {
  const reader: FileReader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onerror = () => {
      reader.abort()
      reject(new Error('Error parsing file'))
    }
    reader.readAsBinaryString(file)
    reader.onloadend = () => {
      const base64StringFile = btoa(reader.result as string) // eslint-disable-line no-undef
      resolve({
        base64StringFile,
        fileName: file.name,
        mimeType: file.type
      })
    }
    // reader.readAsArrayBuffer(file);
  })
}
export function downloadFile(data, fileName) {
  const url = window.URL.createObjectURL(data)
  const a = document.createElement('a')
  document.body.appendChild(a)
  a.setAttribute('style', 'display: none')
  a.href = url
  a.download = fileName
  a.click()
  window.URL.revokeObjectURL(url)
  a.remove() // remove the element
}

export const downloadExcel = (data, fileName) => {
  const blob = new Blob([data], {
    type: 'vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
  })
  saveAs(blob, `${fileName}.xlsx`)
}

export function downloadFromStream(blobContent, fileName) {
  const blob = new Blob([blobContent], { type: 'application/octet-stream' })
  saveAs(blob, fileName)
}
