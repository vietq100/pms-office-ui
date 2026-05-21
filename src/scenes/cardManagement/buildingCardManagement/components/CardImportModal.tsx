import { DownloadOutlined, InboxOutlined } from '@ant-design/icons'
import { L, LNotification, isGrantedAny } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import { notifyError, notifySuccess } from '@lib/helper'
import CardbuidingStore from '@stores/cardBuilding/cardbuidingStore'
import { Button, Divider, Modal } from 'antd'
import Dragger from 'antd/es/upload/Dragger'
import last from 'lodash/last'
import React from 'react'

interface Props {
  visible: boolean
  onClose: () => void
  onOk: (file) => Promise<any>
  cardbuidingStore: CardbuidingStore
}

interface State {
  file?: any
  uploading?: boolean
  fileName?: string
  isLoading: boolean
}

export default class CardImportModal extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      file: null,
      uploading: false,
      fileName: '',
      isLoading: false
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
      if (!file) return notifyError(L('ERROR'), L('FEE_IMPORT_FILE_REQUIRED'))
      this.setState({ uploading: true })
      this.setState({ isLoading: true })
      await this.props.onOk(file)
      notifySuccess(LNotification('SUCCESS'), LNotification(L('FEE_IMPORTED_FEE_SUCCESS')))
      this.setState({ isLoading: false })
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
        title={L('CARD_IMPORT_MODAL_TITLE')}
        cancelText={L('BTN_CANCEL')}
        onCancel={() => {
          this.setState({ file: null, fileName: '' })
          onClose()
        }}
        onOk={this.handleUpload}
        footer={[
          <>
            <Button
              onClick={() => {
                this.setState({ file: null, fileName: '' })
                onClose()
              }}>
              {L('BTN_CANCEL')}
            </Button>
            <Button type="primary" loading={this.state.isLoading} onClick={this.handleUpload}>
              {L('BTN_SAVE')}
            </Button>
          </>
        ]}
        confirmLoading={this.state.uploading}
        okButtonProps={{
          disabled: !isGrantedAny(appPermissions.feeGenerate.create),
          className: !isGrantedAny(appPermissions.feeGenerate.create) ? 'd-none' : ''
        }}>
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
          onClick={this.props.cardbuidingStore?.downloadTemplate}>
          {L('DOWNLOAD_TEMPLATE')}
          <DownloadOutlined style={{ fontSize: '130%' }} />
        </Button>
      </Modal>
    )
  }
}
