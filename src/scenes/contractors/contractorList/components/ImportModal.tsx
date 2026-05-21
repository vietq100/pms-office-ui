import { DownloadOutlined, InboxOutlined } from '@ant-design/icons'
import { L } from '@lib/abpUtility'
import { Button, Col, Modal, Row } from 'antd'
import React from 'react'
import last from 'lodash/last'
import { notifyError } from '@lib/helper'
import withRouter from '@components/Layout/Router/withRouter'
import { AppComponentListBase } from '@components/AppComponentBase'
import Dragger from 'antd/es/upload/Dragger'
import Stores from '@stores/storeIdentifier'
import { inject } from 'mobx-react'
import ContractorStore from '@stores/contractor/contractorStore'

interface Props {
  contractorStore: ContractorStore
  visible: boolean
  onClose: () => void
  onOk: (file) => Promise<any>
}

interface State {
  file?: any
  uploading?: boolean
  listPackage: any[]
  fileName?: string
}

@inject(Stores.ContractorStore)
class ImportContactorModal extends AppComponentListBase<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      file: null,
      uploading: false,
      listPackage: [],
      fileName: ''
    }
  }

  handleFileChange = (fileUpload) => {
    const { fileList, file } = fileUpload
    const latestFile: any = last(fileList) || {}
    this.setState({ file: latestFile.originFileObj, fileName: file.name })
  }

  handleUpload = async () => {
    try {
      this.setState({ uploading: true })
      const { file } = this.state
      if (!file) {
        this.setState({ uploading: false })
        return notifyError(L('ERROR'), L('CONTRACTOR_WO_IMPORT_FILE_REQUIRED'))
      }
      await this.props.onOk(file)
      // notifySuccess(
      //   LNotification('SUCCESS'),
      //   LNotification(L('PARKING_IMPORTED_FILE_SUCCESS'))
      // )
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
        title={L('CONTRACTOR_WO_IMPORT_MODAL_TITLE')}
        cancelText={L('BTN_CANCEL')}
        onCancel={() => {
          this.setState({ file: null, fileName: '' })
          onClose()
        }}
        onOk={this.handleUpload}
        confirmLoading={this.state.uploading}>
        <Row gutter={[8, 16]}>
          <Col span={24}>
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
                <p className="ant-upload-text">{L('RESIDENT_IMPORT_DESCRIPTION')}</p>
              </Dragger>
            </div>

            {this.state.fileName && (
              <span style={{ lineHeight: 2 }}>
                <b>{this.state.fileName}</b>
              </span>
            )}
          </Col>
          <Col span={24} className="mb-2 mt-1">
            <Button
              type="primary"
              style={{ width: '100%' }}
              shape="round"
              onClick={this.props?.contractorStore.downloadTemplate}>
              {this.L('DOWNLOAD_TEMPLATE')}
              <DownloadOutlined style={{ fontSize: '130%' }} />
            </Button>
          </Col>
        </Row>
      </Modal>
    )
  }
}
export default withRouter(ImportContactorModal)
