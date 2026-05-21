import { DownloadOutlined, InboxOutlined } from '@ant-design/icons'
import { L } from '@lib/abpUtility'
import { Button, Col, Divider, Form, Modal, Row } from 'antd'
import Dragger from 'antd/es/upload/Dragger'
import React from 'react'
import { FormInstance } from 'antd/lib/form'
import last from 'lodash/last'
import { notifyError } from '@lib/helper'
import withRouter from '@components/Layout/Router/withRouter'
import { AppComponentListBase } from '@components/AppComponentBase'
import { inject } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import FormCheckbox from '@components/FormItem/FormCheckbox'
import ResidentStore from '@stores/member/resident/residentStore'

interface Props {
  residentStore: ResidentStore
  visible: boolean
  onClose: () => void
  onOk: (file, values) => Promise<any>
}

interface State {
  file?: any
  uploading?: boolean
  listPackage: any[]
  fileName?: string
}
@inject(Stores.ResidentStore)
class ImportUserModal extends AppComponentListBase<Props, State> {
  form = React.createRef<FormInstance>()

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
      await this.form?.current?.validateFields()
      const formData = this.form.current?.getFieldsValue() || {}
      if (!file) {
        this.setState({ uploading: false })
        return notifyError(L('ERROR'), L('RESIDENT_IMPORT_FILE_REQUIRED'))
      }
      await this.props.onOk(file, formData)
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
        title={L('RESIDENT_IMPORT_MODAL_TITLE')}
        cancelText={L('BTN_CANCEL')}
        onCancel={() => {
          this.setState({ file: null, fileName: '' })
          onClose()
        }}
        onOk={this.handleUpload}
        confirmLoading={this.state.uploading}>
        <Row gutter={[8, 16]}>
          <Col span={24}>
            <Form ref={this.form} layout={'vertical'} size="middle">
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
              <FormCheckbox label={L('IS_INCLUDE_UNIT')} name="isIncludedUnit" />
              <FormCheckbox label={L('IS_IMPORT_ALL_PPACKAGE')} name="isImportAllPackage" />
            </Form>
          </Col>
          <Divider />
          <Col span={24}>
            <Button
              type="primary"
              style={{ width: '100%' }}
              shape="round"
              onClick={this.props?.residentStore.downloadTemplate}>
              {this.L('DOWNLOAD_TEMPLATE')}
              <DownloadOutlined style={{ fontSize: '130%' }} />
            </Button>
          </Col>
        </Row>
      </Modal>
    )
  }
}
export default withRouter(ImportUserModal)
