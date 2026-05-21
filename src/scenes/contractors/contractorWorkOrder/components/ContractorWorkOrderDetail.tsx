import React from 'react'

import { Col, Form, Row, Select, Card, Button, Input, Tabs, DatePicker } from 'antd'

import rules from './validation'

import withRouter from '@components/Layout/Router/withRouter'
import AppConsts, { appPermissions, dateFormat, fileTypeGroup } from '@lib/appconst'
import { inject, observer } from 'mobx-react'
import AppComponentBase from '@components/AppComponentBase'
import { isGranted, isGrantedAny, L } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import { validateMessages } from '@lib/validation'
import FileStore from '@stores/common/fileStore'
import ContractorStore from '@stores/contractor/contractorStore'
import Stores from '@stores/storeIdentifier'
import { portalLayouts } from '@components/Layout/Router/router.config'
import FileUploadWrapV2 from '@components/FileUploadV2'
import ApprovalHistory from './ApprovalHistory'
import NoRole from '@components/ComponentNoRole'

const { formVerticalLayout } = AppConsts
const tabKeys = {
  tabInfo: 'CONTRACTOR_INFO',
  tabDocument: 'CONTRACTOR_DOCUMENT',
  tabHistoryApproval: 'CONTRACTOR_HISTORY_APPROVAL'
}

export interface IContractorFormProps {
  navigate: any
  params: any
  fileStore: FileStore
  contractorStore: ContractorStore
}

@inject(Stores.ContractorStore, Stores.FileStore)
@observer
class ContractorListDetail extends AppComponentBase<IContractorFormProps> {
  formRef: any = React.createRef()
  state = {
    files: [] as any,
    modalDocumentVisible: false,
    selectedTimeSlot: [] as any,
    tabActiveKey: tabKeys.tabInfo,
    showInputReason: false,
    documentId: ''
  }

  async componentDidMount() {
    isGranted(appPermissions.contractorWO.detail) &&
      (await Promise.all([
        this.getDetail(),
        this.props.contractorStore.getAll({ maxResultCount: 1000, skipCount: 0 }),
        this.props.contractorStore.getListStatus()
      ]))
  }

  getDetail = async () => {
    if (this.props.params.id) {
      await this.props.contractorStore.getContractorActivity(this.props.params?.id)
      this.setState({
        documentId: this.props.contractorStore.editContractorActivity.uniqueId
      })
      this.formRef.current?.setFieldsValue({
        ...this.props.contractorStore.editContractorActivity
      })
      this.getAllDocument()
    }
  }

  onSave = () => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      delete values.status
      if (!this.props.params.id) {
        await this.props.contractorStore.createContractorActivity({
          ...values
        })
      } else {
        await this.props.contractorStore.updateContractorActivity({
          ...this.props.contractorStore.editContractorActivity,
          ...values
        })
      }
      this.props.navigate(portalLayouts.ContractorWorkOrders.path)
    })
  }

  onCancel = () => {
    this.props.navigate(portalLayouts.ContractorWorkOrders.path)
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
    if (tabKey === tabKeys.tabHistoryApproval) {
      this.props.contractorStore.GetStatusActivityByContractor(this.props.params?.id)
    }
  }

  handleCreateDocument = async (file) => {
    const fileUpload = [...this.state.files, file]
    if (this.props.contractorStore.editContractorActivity.uniqueId && file)
      await this.props.contractorStore.uploadContractorActivity(
        this.props.contractorStore.editContractorActivity.uniqueId,
        fileUpload
      )
    this.getAllDocument()
  }

  getAllDocument = async () => {
    await this.props.fileStore.getFiles(this.state.documentId)
    this.setState({ files: this.props.fileStore.currentFiles })
  }

  beforeShowDocument = (file) => {
    this.handleCreateDocument(file)

    return false
  }
  onCheckReason = (value) => {
    if (value === 3) {
      this.setState({ showInputReason: true })
    } else {
      this.setState({ showInputReason: false })
    }
  }

  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {isGrantedAny(appPermissions.contractorWO.create, appPermissions.contractorWO.update) && (
            <Button
              type="primary"
              onClick={this.onSave}
              disabled={this.props.params?.id && !isGranted(appPermissions.contractorWO.update)}
              loading={isLoading}
              shape="round">
              {L('BTN_SAVE')}
            </Button>
          )}
        </Col>
      </Row>
    )
  }

  render() {
    return isGranted(appPermissions.contractorWO.detail) ? (
      <Card bordered={false} style={{ minHeight: 750 }}>
        <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab}>
          <Tabs.TabPane tab={L(tabKeys.tabInfo)} key={tabKeys.tabInfo}>
            <WrapPageScroll renderActions={() => this.renderActions(false)}>
              <Form
                ref={this.formRef}
                layout={'vertical'}
                onFinish={this.onSave}
                onAbort={this.onCancel}
                onValuesChange={() => this.setState({ isDirty: true })}
                validateMessages={validateMessages}
                size="middle">
                <Row gutter={[16, 0]}>
                  {isGrantedAny(appPermissions.adminRole.update, appPermissions.adminRole.create) && (
                    <Col sm={{ span: 8, offset: 0 }}>
                      <Form.Item name="contractorId" label={L('CONTRACTOR_DETAIL_SELECT_NAME')} rules={rules.contracId}>
                        <Select allowClear showArrow style={{ width: '100%' }}>
                          {this.props.contractorStore.pagedResult.items.map((contractor) => (
                            <Select.Option key={contractor.id} value={contractor.id}>
                              {contractor.contractorName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  )}
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('CONTRACTOR_WORK_ORDER_NAME')}
                      {...formVerticalLayout}
                      name="subject"
                      rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('CONTRACTOR_WO_STATUS')}
                      {...formVerticalLayout}
                      name="statusId"
                      rules={rules.statusId}>
                      <Select
                        showSearch
                        allowClear
                        onChange={(value) => this.onCheckReason(value)}
                        className="full-width"
                        filterOption={false}>
                        {this.renderOptions(this.props.contractorStore.listStatus)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('CONTRACTOR_CHECK_IN_DATE')}
                      {...formVerticalLayout}
                      name="checkInTime"
                      rules={rules.checkIn}>
                      <DatePicker className="full-width" format={dateFormat} placeholder={L('SELECT_DATE')} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('CONTRACTOR_CHECK_OUT_DATE')}
                      {...formVerticalLayout}
                      name="checkOutTime"
                      rules={rules.checkOut}>
                      <DatePicker className="full-width" format={dateFormat} placeholder={L('SELECT_DATE')} />
                    </Form.Item>
                  </Col>

                  {this.state.showInputReason && (
                    <Col sm={{ span: 8, offset: 0 }}>
                      <Form.Item label={L('CONTRACTOR_WO_REASON')} {...formVerticalLayout} name="reason">
                        <Input />
                      </Form.Item>
                    </Col>
                  )}
                  <Col sm={{ span: 24, offset: 0 }}>
                    <Form.Item label={L('CONTRACTOR_DETAIL_INPUT_REMARK')} {...formVerticalLayout} name="remarks">
                      <Input.TextArea rows={3} />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </WrapPageScroll>
          </Tabs.TabPane>

          <Tabs.TabPane tab={L(tabKeys.tabDocument)} key={tabKeys.tabDocument} disabled={!this.props.params?.id}>
            {isGrantedAny(appPermissions.contractorWO.update, appPermissions.contractorWO.create) && (
              <FileUploadWrapV2
                fileDocument={this.state.files}
                parentId={this.state.documentId}
                fileStore={this.props.fileStore}
                beforeUploadFile={this.beforeShowDocument}
                acceptedFileTypes={fileTypeGroup.documentAndImage}
                specialModuleName="CONTRACTORACTIVITY"
              />
            )}
          </Tabs.TabPane>

          {this.props.params?.id && (
            <Tabs.TabPane tab={L(tabKeys.tabHistoryApproval)} key={tabKeys.tabHistoryApproval}>
              <ApprovalHistory listHistory={this.props.contractorStore.approvalHistory} />
            </Tabs.TabPane>
          )}
        </Tabs>
      </Card>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(ContractorListDetail)
