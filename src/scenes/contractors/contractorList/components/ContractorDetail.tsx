import React from 'react'

import { Col, Form, Row, Select, Card, Button, Input, Tabs, Table, Popover, Upload, Modal } from 'antd'

import rules from './validation'
import withRouter from '@components/Layout/Router/withRouter'
import AppConsts, { appPermissions, appStatusColors } from '@lib/appconst'
import { inject, observer } from 'mobx-react'
import AppComponentBase from '@components/AppComponentBase'
import { isGranted, isGrantedAny, L, LNotification } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import { validateMessages } from '@lib/validation'
import FileStore from '@stores/common/fileStore'

import DataTable from '@components/DataTable'
import { renderDateTime } from '@lib/helper'
import ContractorStore from '@stores/contractor/contractorStore'
import Stores from '@stores/storeIdentifier'
import ProjectStore from '@stores/project/projectStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import ContractorEmployeeList from '../../contractorEmployee'
import Paragraph from 'antd/es/typography/Paragraph'
import '../../../../styles/custom-ant.less'
import columnsDocument from './columnsDocument'
import { v4 as uuid } from 'uuid'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteOutlined,
  EditFilled,
  FileExcelOutlined,
  PhoneOutlined,
  UploadOutlined
} from '@ant-design/icons'
import { EditableCell } from '@components/DataTableV2/EditableCell'
import NoRole from '@components/ComponentNoRole'

const { formVerticalLayout, align } = AppConsts
const tabKeys = {
  tabInfo: 'CONTRACTOR_INFO',
  tabEmployeeList: 'CONTRACTOR_EMPLOYEE_LIST',
  tabDocument: 'CONTRACTOR_DOCUMENT',
  tabHistory: 'CONTRACTIOR_HISTORY'
}
const confirm = Modal.confirm
export interface IContractorFormProps {
  navigate: any
  params: any
  fileStore: FileStore
  contractorStore: ContractorStore
  projectStore: ProjectStore
}

@inject(Stores.ContractorStore, Stores.FileStore, Stores.ProjectStore)
@observer
class ContractorDetail extends AppComponentBase<IContractorFormProps> {
  formDocumentRef: any = React.createRef()

  state = {
    modalDocumentVisible: false,
    tabActiveKey: tabKeys.tabInfo,
    maxResultCount: 10,
    skipCount: 0,
    uniqueId: '',
    document: [] as any,
    visibleAction: false
  }
  formRef: any = React.createRef()
  async componentDidMount() {
    isGranted(appPermissions.contractor.detail) &&
      (await Promise.all([
        this.getDetail(),
        this.props.contractorStore.getListFirm(),
        this.props.contractorStore.getListDocumentType()
      ]))
  }

  async getDetail() {
    if (this.props.params.id) {
      await this.props.contractorStore.get(this.props.params?.id)

      this.setState({
        document: this.props.contractorStore?.editContractor.contractorDocuments
      })

      this.formRef.current?.setFieldsValue({
        ...this.props.contractorStore?.editContractor,
        firmIds: this.props.contractorStore?.editContractor.contractorFirms,
        projectIds: this.props.contractorStore.editContractor.contractorProjects
      })
      this.formDocumentRef.current?.setFieldsValue({
        ...this.props.contractorStore?.editContractor
      })
    }

    this.setState({ visibleAction: false })
  }

  findProject = async (keyword) => {
    await this.props.projectStore.filterOptions({ keyword })
  }

  onSave = () => {
    this.formRef.current.validateFields().then(async (values: any) => {
      if (!this.props.params.id) {
        await this.props.contractorStore.create({
          ...values
        })
      } else {
        await this.props.contractorStore.update({
          ...this.props.contractorStore.editContractor,
          ...values
        })
      }
      this.props.navigate(portalLayouts.contractorList.path)
    })
  }

  onCancel = () => {
    this.props.navigate(portalLayouts.contractorList.path)
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
    if (tabKey === tabKeys.tabHistory) {
      this.getAll()
    }
  }
  getAll = async () => {
    await this.props.contractorStore.getAllContractorActivity({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      contractorId: this.props.params.id
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  isEditing = (record: any) => record.uniqueId === this.state.uniqueId

  handleAddRow = () => {
    this.setState({ visibleAction: true })
    this.formDocumentRef.current.resetFields()
    const newRow = { uniqueId: uuid() }

    const newData = [...this.state.document]

    newData.unshift(newRow)

    this.setState({ document: newData })
    this.setState({ uniqueId: newRow.uniqueId })
  }

  saveRow = async (id: any, uniqueId: any) => {
    const values = await this.formDocumentRef.current.validateFields()
    if (id === undefined) {
      values.contractorId = this.props.params.id
      await this.props.contractorStore.createDocument({
        ...values
      })
    } else {
      values.id = id
      values.uniqueId = uniqueId
      values.contractorId = this.props.params.id
      {
        await this.props.contractorStore.updateDocument({
          ...values
        })
      }
    }

    this.setState({ visibleAction: false })
    this.setState({ uniqueId: '' })
    this.getAllDocument()
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }
  getAllDocument = async () => {
    if (this.props.params.id) {
      await this.props.contractorStore.get(this.props.params?.id)

      this.setState({
        document: this.props.contractorStore?.editContractor.contractorDocuments
      })
    }
  }
  handleCreateDocument = async (file, uniqueId: any) => {
    const files = [file]

    await this.props.contractorStore.uploadContractor(uniqueId, files)

    this.getAllDocument()

    return false
  }

  onDeleFileDocument = async (guiId) => {
    await this.handleDelectFileDocument(guiId)
    this.getAllDocument()
  }

  handleDelectFileDocument = async (guiId) => {
    await this.props.fileStore.delete(guiId)
  }

  onDeleteDocument = async (item) => {
    confirm({
      title: LNotification(L('DO_YOU_WANT_TO_DELETE_CONTRACTOR_DOCUMENT_ITEM')),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        if (item.file) {
          this.handleDelectFileDocument(item.file.guid)
        }
        await this.props.fileStore.deleteDocument(item.id)

        this.getAllDocument()
      }
    })
  }
  handleDownload = (file) => {
    window.open(file.fileUrl, '_blank')
  }
  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {isGrantedAny(appPermissions.contractor.create, appPermissions.contractor.update) && (
            <Button
              type="primary"
              onClick={this.onSave}
              disabled={this.props.params?.id && !isGranted(appPermissions.contractor.update)}
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
    const {
      contractorStore: { listContractorWO }
    } = this.props
    const columns = [
      {
        title: L('CONTRACTOR_NAME'),
        dataIndex: 'contractorName',
        key: 'name',
        width: 150,
        ellipsis: true,
        render: (name) => <div className="pl-2">{name}</div>
      },
      {
        title: L('CONTRACTOR_SUBJECT'),
        dataIndex: 'subject',
        key: 'subject',
        width: 300,
        render: (subject) => (
          <>
            <Popover trigger="click" content={subject}>
              {' '}
              <Paragraph
                ellipsis={{
                  rows: 1
                }}>
                <label className="pl-2">{subject}</label>
              </Paragraph>
            </Popover>
          </>
        )
      },
      {
        title: L('CONTRACTOR_TIME_IN_OUT'),
        dataIndex: 'checkInTime',
        key: 'checkInTime',
        width: 150,
        align: align.center,

        render: (checkInTime, item) => <>{renderDateTime(checkInTime) + ' - ' + renderDateTime(item.checkOutTime)}</>
      },
      {
        title: L('CONTRACTOR_STATUS'),
        dataIndex: 'status',
        key: 'status',
        width: 150,
        align: align.center,
        render: (status) => <>{status?.name}</>
      }
    ]
    const columnsDocumentUpload = columnsDocument(
      {
        title: L('DOCUMENT_FILE'),
        dataIndex: 'file',
        key: 'file',
        width: 90,
        ellipsis: true,
        render: (file) => (
          <div>
            <a
              style={{
                boxShadow: '1px 1px 1px #44350D',
                color: '#44350D',
                marginTop: 5
              }}
              onClick={() => this.handleDownload(file)}>
              <Popover trigger="hover" content={file?.originalFileName}>
                <Paragraph
                  style={{ paddingTop: 10 }}
                  ellipsis={{
                    rows: 1
                  }}>
                  <label className="pl-2"> {file?.originalFileName}</label>
                </Paragraph>
              </Popover>
            </a>
          </div>
        )
      },
      {
        title: L('FILE_DOCUMENT_ACTION'),
        dataIndex: 'action',
        key: 'action',
        fixed: align.right,
        align: align.right,
        width: 40,
        render: (action, row) => {
          return this.state.uniqueId === row.uniqueId ? (
            <div>
              <Button
                type="text"
                icon={<CheckCircleFilled style={{ color: appStatusColors.success }} />}
                onClick={() => this.saveRow(row.id, row.uniqueId)}
              />
              <Button
                type="text"
                icon={<CloseCircleFilled style={{ color: appStatusColors.error }} />}
                onClick={() => {
                  this.setState({ visibleAction: false })
                  this.getAllDocument()
                  this.setState({ uniqueId: '' })
                }}
              />
            </div>
          ) : (
            <Row>
              <Col span={6}>
                {isGrantedAny(appPermissions.contractor.update) && (
                  <Upload
                    showUploadList={false}
                    accept=".csv
              .xlsx,
              .pdf,
              .doc,
              .docx,
              .png,
              .jpg,
              .jpeg"
                    maxCount={1}
                    beforeUpload={(value) => this.handleCreateDocument(value, row.uniqueId)}
                    //  onRemove={(value) => this.onRemoveFile(value)}
                  >
                    <Button icon={<UploadOutlined />} />
                  </Upload>
                )}
              </Col>
              {row?.file?.guid
                ? isGrantedAny(appPermissions.contractor.update) && (
                    <Col span={6}>
                      <Button
                        onClick={() => {
                          this.onDeleFileDocument(row?.file?.guid)
                        }}
                        icon={<FileExcelOutlined />}
                      />
                    </Col>
                  )
                : isGrantedAny(appPermissions.contractor.update) && (
                    <Button icon={<FileExcelOutlined />} disabled={true} />
                  )}
              {isGrantedAny(appPermissions.contractor.update) && (
                <Col span={6}>
                  <Button
                    icon={<EditFilled />}
                    onClick={() => {
                      this.formDocumentRef.current.setFieldsValue({
                        ...row
                      })
                      this.setState({ uniqueId: row.uniqueId })
                    }}
                  />
                </Col>
              )}
              {isGrantedAny(appPermissions.contractor.delete) && (
                <Col span={6}>
                  <Button icon={<DeleteOutlined />} onClick={() => this.onDeleteDocument(row)} />
                </Col>
              )}
            </Row>
          )
        }
      },
      this.props.contractorStore?.listDocumentType,
      this.isEditing
    )
    return isGranted(appPermissions.contractor.detail) ? (
      <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab} type="card">
        <Tabs.TabPane tab={L(tabKeys.tabInfo)} key={tabKeys.tabInfo}>
          <Card bordered={false} style={{ minHeight: 700 }}>
            <WrapPageScroll renderActions={() => this.renderActions(false)}>
              <Form
                initialValues={{ contractorContacts: [{}] }}
                ref={this.formRef}
                layout={'vertical'}
                onFinish={this.onSave}
                onAbort={this.onCancel}
                onValuesChange={() => this.setState({ isDirty: true })}
                validateMessages={validateMessages}
                size="middle">
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('CONTRACTOR_DETAIL_INPUT_NAME')}
                      {...formVerticalLayout}
                      name="contractorName"
                      rules={rules.contactName}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item name="firmIds" label={L('CONTRACTOR_DETAIL_SELECT_FIRM')} rules={rules.firmId}>
                      <Select allowClear showArrow mode="multiple" style={{ width: '100%' }} filterOption={false}>
                        {this.renderOptions(this.props.contractorStore.listFirm)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('CONTRACTOR_DETAIL_INPUT_PHONE')}
                      {...formVerticalLayout}
                      name="phoneNumber"
                      rules={rules.phoneNumber}>
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('CONTRACTOR_DETAIL_INPUT_ADDRESS')}
                      {...formVerticalLayout}
                      name="address"
                      rules={rules.remark}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('CONTRACTOR_DETAIL_INPUT_TAX')} {...formVerticalLayout} name="tax">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col sm={{ span: 24, offset: 0 }}>
                    <Form.Item
                      label={L('CONTRACTOR_DETAIL_INPUT_DESCRIPTION')}
                      {...formVerticalLayout}
                      name="description"
                      rules={rules.remark}>
                      <Input.TextArea rows={2} />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </WrapPageScroll>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={L(tabKeys.tabEmployeeList)}
          key={tabKeys.tabEmployeeList}
          disabled={this.props.params?.id ? false : true}>
          <Card bordered={false} style={{ minHeight: 700 }}>
            <ContractorEmployeeList />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={L(tabKeys.tabDocument)}
          key={tabKeys.tabDocument}
          disabled={this.props.params?.id ? false : true}>
          <Card bordered={false} style={{ minHeight: 700 }}>
            <Row gutter={[8, 8]}>
              <Col sm={{ span: 24, offset: 0 }} style={{ textAlign: 'right' }}>
                {isGrantedAny(appPermissions.contractor.create) && (
                  <Button
                    disabled={this.state.visibleAction}
                    type="primary"
                    shape="default"
                    size="middle"
                    style={{ marginTop: 10 }}
                    onClick={this.handleAddRow}>
                    {L('ADD_NEW')}
                  </Button>
                )}
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                {isGrantedAny(appPermissions.contractor.update, appPermissions.contractor.create) && (
                  <Form
                    ref={this.formDocumentRef}
                    layout={'vertical'}
                    size="middle"
                    validateMessages={validateMessages}>
                    <Table
                      size="small"
                      className="custom-ant-table"
                      components={{
                        body: {
                          cell: EditableCell
                        }
                      }}
                      bordered
                      dataSource={this.state.document || []}
                      columns={columnsDocumentUpload}
                      rowKey={(record) => record.uniqueId}
                      scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
                    />
                  </Form>
                )}
              </Col>
            </Row>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={L(tabKeys.tabHistory)}
          key={tabKeys.tabHistory}
          disabled={this.props.params?.id ? false : true}>
          <Card bordered={false} style={{ minHeight: 700 }}>
            <DataTable
              pagination={{
                pageSize: this.state.maxResultCount,
                current: this.currentPage,
                total: listContractorWO === undefined ? 0 : listContractorWO.totalCount,
                onChange: this.handleTableChange
              }}>
              <Table
                size="middle"
                className="custom-ant-table"
                rowKey={(record) => record.key}
                columns={columns}
                pagination={false}
                loading={false}
                dataSource={listContractorWO?.items || []}
                scroll={{ x: 900, scrollToFirstRowOnChange: true }}
              />
            </DataTable>
          </Card>
        </Tabs.TabPane>
      </Tabs>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(ContractorDetail)
