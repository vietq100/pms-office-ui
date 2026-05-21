import { DownloadOutlined, InboxOutlined } from '@ant-design/icons'
import { L, LNotification } from '@lib/abpUtility'
import { Button, Divider, Modal } from 'antd'
import Dragger from 'antd/es/upload/Dragger'
import React from 'react'

import { FormInstance } from 'antd/lib/form'
import last from 'lodash/last'
import { notifyError, notifySuccess } from '@lib/helper'
import MeterReadingStore from '@stores/meterReading/meterReadingStore'

interface Props {
  visible: boolean
  currentPackage: any
  onClose: () => void
  onOk: (file, packageId, description) => Promise<any>
  meterReadingStore: MeterReadingStore
}

interface State {
  file?: any
  uploading?: boolean
  fileName?: string
}

export default class MeterImportModal extends React.PureComponent<Props, State> {
  form = React.createRef<FormInstance>()

  constructor(props) {
    super(props)
    this.state = {
      file: null,
      uploading: false
    }
  }

  handleFileChange = (fileUpload) => {
    const { fileList, file } = fileUpload
    const latestFile: any = last(fileList) || {}
    this.setState({ file: latestFile.originFileObj, fileName: file.name })
  }

  handleUpload = async () => {
    try {
      const { file } = this.state
      await this.form?.current?.validateFields()
      const formData = this.form.current?.getFieldsValue() || {}
      if (!file) return notifyError(L('ERROR'), L('FEE_IMPORT_FILE_REQUIRED'))
      this.setState({ uploading: true })
      await this.props.onOk(file, Number(formData.packageId), formData.description)
      notifySuccess(LNotification('SUCCESS'), LNotification(L('FEE_IMPORTED_FEE_SUCCESS')))
      this.setState({ uploading: false, file: null, fileName: '' })
    } catch (e) {
      this.setState({ uploading: false })
      throw e
    }
  }

  render(): React.ReactNode {
    const { visible, onClose } = this.props

    return (
      <Modal
        open={visible}
        destroyOnClose
        title={L('IMPORT_METER_WATER')}
        cancelText={L('BTN_CANCEL')}
        onCancel={() => {
          this.setState({ file: null, fileName: '' })
          onClose()
        }}
        onOk={this.handleUpload}
        confirmLoading={this.state.uploading}>
        <strong>
          {L('METER_WATER_IMPORT_TITLE')} {L(' ')} {this.props.currentPackage}
        </strong>
        <div className="mt-3">
          <Dragger
            name="file"
            accept=".xls, .xlsx"
            beforeUpload={() => false}
            onChange={this.handleFileChange}
            showUploadList={false}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">{L('FEE_IMPORT_DESCRIPTION')}</p>
          </Dragger>
        </div>
        {this.state.fileName && (
          <span style={{ lineHeight: 2 }}>
            {L('FEE_UPLOADED_FILE')} <b>{this.state.fileName}</b>
          </span>
        )}
        <Divider />
        <Button
          type="primary"
          style={{ width: '100%' }}
          shape="round"
          onClick={this.props.meterReadingStore?.downloadTemplate}>
          {L('DOWNLOAD_TEMPLATE')}
          <DownloadOutlined style={{ fontSize: '130%' }} />
        </Button>
      </Modal>
    )
  }
}
