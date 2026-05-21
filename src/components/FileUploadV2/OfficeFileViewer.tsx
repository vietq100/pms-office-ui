// @uifabric/icons removed - not needed for iframe viewer


const OfficeFileViewer = ({ src }: any) => {
  const fileUrl = src

  return (
    <iframe
      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
      title="Office File Viewer"
      frameBorder="0"
      style={{ width: '45vw', height: '60vh' }}></iframe>
  )
}

export default OfficeFileViewer
