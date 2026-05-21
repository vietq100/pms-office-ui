import { DownloadOutlined, InboxOutlined } from '@ant-design/icons'
import { L, LNotification } from '@lib/abpUtility'
import { Button, Col, Modal, Row } from 'antd'
import Dragger from 'antd/es/upload/Dragger'
import React from 'react'
import { FormInstance } from 'antd/lib/form'
import last from 'lodash/last'
import { notifyError, notifySuccess } from '@lib/helper'
import PlanMaintenanceStore from '@stores/planMaintenance/planMaintenanceStore'
import Stores from '@stores/storeIdentifier'
import { inject, observer } from 'mobx-react'

interface Props {
  visible: boolean
  onClose: () => void
  onOk: (file, packageId) => Promise<any>
  planMaintenanceStore?: PlanMaintenanceStore
}

interface State {
  file?: any
  uploading?: boolean
  fileName?: string
}
@inject(Stores.PlanMaintenanceStore)
@observer
export default class PlanMaintenanceImportModal extends React.PureComponent<Props, State> {
  form = React.createRef<FormInstance>()

  constructor(props) {
    super(props)
    this.state = {
      file: null,
      uploading: false,
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
      await this.form?.current?.validateFields()
      const formData = this.form.current?.getFieldsValue() || {}
      if (!file) return notifyError(L('ERROR'), L('FEE_IMPORT_FILE_REQUIRED'))
      await this.props.onOk(file, Number(formData.packageId))
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
        title={L('FEE_IMPORT_MODAL_TITLE')}
        cancelText={L('BTN_CANCEL')}
        onCancel={() => {
          this.setState({ file: null, fileName: '' })
          onClose()
        }}
        onOk={this.handleUpload}
        confirmLoading={this.state.uploading}>
        <Row gutter={[8, 16]}>
          <Col span={24}>
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
          </Col>
          <Col span={24}>
            {this.state.fileName && (
              <span style={{ lineHeight: 2 }}>
                {L('FEE_UPLOADED_FILE')} <b>{this.state.fileName}</b>
              </span>
            )}
            <Button
              type="primary"
              style={{ width: '100%' }}
              shape="round"
              onClick={this.props.planMaintenanceStore?.downloadTemplate}>
              {L('BTN_DOWNLOAD_TEMPLATE')}
              <DownloadOutlined style={{ fontSize: '130%' }} />
            </Button>
          </Col>
        </Row>
      </Modal>
    )
  }
}
