import { L, LNotification } from '@lib/abpUtility'
import { Button, Col, Divider, Form, Modal, Row } from 'antd'
import React from 'react'
import withRouter from '@components/Layout/Router/withRouter'
import { AppComponentListBase } from '@components/AppComponentBase'
import { inject } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import CashAdvanceStore from '@stores/finance/cashAdvanceStore'
import FormSelect from '@components/FormItem/FormSelect'
import feeService from '@services/fee/feeService'
import { OptionModel } from '@models/global'
import Dragger from 'antd/es/upload/Dragger'
import last from 'lodash/last'
import { DownloadOutlined, InboxOutlined } from '@ant-design/icons'
import { validateMessages } from '@lib/validation'
import { notifyError, notifySuccess } from '@lib/helper'
interface Props {
  cashAdvanceStore: CashAdvanceStore
  visible: boolean
  onClose: () => void
  onCloseAndRefresh: () => void
}

@inject(Stores.CashAdvanceStore)
class ImportCashAdvanceModal extends AppComponentListBase<Props> {
  form: any = React.createRef()
  state = {
    listPaymentMethod: [] as any,
    fileName: '',
    file: null,
    isLoading: false
  }

  componentDidUpdate = async (prevProps) => {
    if (prevProps.visible !== this.props.visible) {
      if (this.props.visible) {
        this.props.cashAdvanceStore.getPaymentChannels()
      }
    }
  }

  searchPaymentChannelList = async (paymentChannelId) => {
    const paymentMethodResult = await feeService.getPaymentMethodList({
      paymentChannelId
    })
    const dataRemap = (paymentMethodResult.items ?? []).map(
      (item) => new OptionModel(item.id, `${item.code} - ${item.beneficiaryName}(${item.accountNo})`)
    )
    this.setState({ listPaymentMethod: dataRemap })
  }

  onSave = async () => {
    try {
      const { file } = this.state
      await this.form?.current?.validateFields()
      const formData = this.form.current?.getFieldsValue() || {}
      if (!file) return notifyError(L('ERROR'), L('FEE_IMPORT_FILE_REQUIRED'))
      this.setState({ uploading: true })
      this.setState({ isLoading: true })

      await this.props.cashAdvanceStore.importFromExcel(
        file,
        Number(formData.cashChanelId),
        Number(formData.cashChannelExternalId)
      )
      notifySuccess(LNotification('SUCCESS'), LNotification(L('FEE_IMPORTED_FEE_SUCCESS')))
      this.setState({ isLoading: false })
      this.setState({ uploading: false, file: null, fileName: '', listPaymentMethod: [] })

      this.props.onCloseAndRefresh()
    } catch (e) {
      this.setState({ uploading: false })
      throw e
    }
  }
  handleFileChange = (fileUpload) => {
    const { fileList, file } = fileUpload
    const latestFile: any = last(fileList) || {}
    this.setState({ file: latestFile.originFileObj, fileName: file.name })
  }

  render(): React.ReactNode {
    const { visible, onClose } = this.props

    return (
      <Modal
        open={visible}
        destroyOnClose
        title={L('IMPORT_CASH_ADVANCE')}
        cancelText={L('BTN_CANCEL')}
        onCancel={() => {
          this.setState({ uploading: false, file: null, fileName: '', listPaymentMethod: [] }), onClose()
        }}
        onOk={this.onSave}
        confirmLoading={this.state.isLoading}>
        <Form ref={this.form} layout={'vertical'} size="middle" validateMessages={validateMessages}>
          <Row gutter={[4, 4]}>
            <Col md={{ span: 24 }}>
              <FormSelect
                label="DEPOSIT_PAYMENT_CHANNEL"
                name="cashChanelId"
                onChange={this.searchPaymentChannelList}
                options={this.props.cashAdvanceStore.paymentChannels}
                rule={[{ required: true }]}
              />
            </Col>
            <Col md={{ span: 24 }}>
              <FormSelect
                label="DEPOSIT_PAYMENT_CHANNEL_DETAIL"
                name="cashChannelExternalId"
                options={this.state.listPaymentMethod}
                // rule={rules.paymentChannel}
              />
            </Col>
          </Row>
        </Form>
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
          className="full-width"
          shape="round"
          onClick={this.props?.cashAdvanceStore.getTemplateImport}>
          {this.L('DOWNLOAD_TEMPLATE')}
          <DownloadOutlined style={{ fontSize: '130%' }} />
        </Button>
      </Modal>
    )
  }
}
export default withRouter(ImportCashAdvanceModal)
