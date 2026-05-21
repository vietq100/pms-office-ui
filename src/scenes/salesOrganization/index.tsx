import React from 'react'
import { Button, Col, Form, Modal, Row, Select, Switch, Table, Tag } from 'antd'
import { DeleteOutlined, EditFilled, PlusOutlined } from '@ant-design/icons'
import { inject, observer } from 'mobx-react'
import { AppComponentListBase } from '@components/AppComponentBase'
import withRouter from '@components/Layout/Router/withRouter'
import { isGrantedAny, L } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import Stores from '@stores/storeIdentifier'
import SalesOrganizationStore from '@stores/project/salesOrganizationStore'
import type { SalesOrganizationDto } from '@models/Project/Company/CompanyModel'
import { validateMessages } from '@lib/validation'
import FormInput from '@components/FormItem/FormInput'

interface IProps {
  salesOrganizationStore?: SalesOrganizationStore
}

interface IState {
  isActive?: boolean
  modalVisible: boolean
  editingRecord?: SalesOrganizationDto
  saving: boolean
}

@inject(Stores.SalesOrganizationStore)
@observer
class SalesOrganizationPage extends AppComponentListBase<IProps, IState> {
  formRef: any = React.createRef()

  state: IState = {
    isActive: undefined,
    modalVisible: false,
    editingRecord: undefined,
    saving: false
  }

  async componentDidMount() {
    await this.getAll()
  }

  getAll = async () => {
    await this.props.salesOrganizationStore!.getAll(this.state.isActive)
  }

  onFilterChange = async (value: string) => {
    const isActive = value === '' ? undefined : value === 'true'
    this.setState({ isActive }, this.getAll)
  }

  openCreate = () => {
    this.formRef.current?.resetFields()
    this.formRef.current?.setFieldsValue({ isActive: true })
    this.setState({ modalVisible: true, editingRecord: undefined })
  }

  openEdit = (record: SalesOrganizationDto) => {
    this.formRef.current?.resetFields()
    this.formRef.current?.setFieldsValue(record)
    this.setState({ modalVisible: true, editingRecord: record })
  }

  handleSave = async () => {
    const values = await this.formRef.current?.validateFields()
    this.setState({ saving: true })
    try {
      const { editingRecord } = this.state
      if (editingRecord) {
        await this.props.salesOrganizationStore!.update({
          id: editingRecord.id,
          name: values.name,
          isActive: values.isActive
        })
      } else {
        await this.props.salesOrganizationStore!.create(values)
      }
      this.setState({ modalVisible: false })
      await this.getAll()
    } finally {
      this.setState({ saving: false })
    }
  }

  handleDelete = (id: number) => {
    Modal.confirm({
      title: L('CONFIRM_DELETE'),
      content: L('SALES_ORGANIZATION_DELETE_CONFIRM'),
      onOk: async () => {
        await this.props.salesOrganizationStore!.delete(id)
      }
    })
  }

  columns = [
    { title: L('SALES_ORGANIZATION_SALES_ORG'), dataIndex: 'salesOrg', key: 'salesOrg' },
    { title: L('SALES_ORGANIZATION_COMPANY_CODE'), dataIndex: 'companyCode', key: 'companyCode' },
    { title: L('SALES_ORGANIZATION_NAME'), dataIndex: 'name', key: 'name' },
    {
      title: L('STATUS'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) =>
        isActive ? <Tag color="success">{L('ACTIVE')}</Tag> : <Tag color="error">{L('INACTIVE')}</Tag>
    },
    {
      title: L('ACTION'),
      key: 'action',
      align: 'center' as const,
      render: (_: any, record: SalesOrganizationDto) => (
        <>
          {isGrantedAny(appPermissions.salesOrganization?.update) && (
            <Button
              size="small"
              shape="circle"
              icon={<EditFilled />}
              className="mr-1"
              onClick={() => this.openEdit(record)}
            />
          )}
          {isGrantedAny(appPermissions.salesOrganization?.delete) && (
            <Button
              size="small"
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => this.handleDelete(record.id)}
            />
          )}
        </>
      )
    }
  ]

  render() {
    const { salesOrganizations, isLoading } = this.props.salesOrganizationStore!
    const { modalVisible, editingRecord, saving } = this.state
    const isEdit = !!editingRecord

    return (
      <>
        <Row justify="space-between" align="middle" className="mb-2">
          <Col>
            <Select defaultValue="" style={{ width: 220 }} onChange={this.onFilterChange}>
              <Select.Option value="">{L('ALL')}</Select.Option>
              <Select.Option value="true">{L('ACTIVE')}</Select.Option>
              <Select.Option value="false">{L('INACTIVE')}</Select.Option>
            </Select>
          </Col>
          {isGrantedAny(appPermissions.salesOrganization?.create) && (
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={this.openCreate}>
                {L('BTN_ADD_NEW')}
              </Button>
            </Col>
          )}
        </Row>

        <Table
          size="small"
          bordered
          loading={isLoading}
          dataSource={salesOrganizations}
          columns={this.columns}
          rowKey="id"
          pagination={false}
        />

        <Modal
          open={modalVisible}
          title={isEdit ? L('SALES_ORGANIZATION_EDIT_TITLE') : L('SALES_ORGANIZATION_CREATE_TITLE')}
          width={520}
          onCancel={() => this.setState({ modalVisible: false })}
          footer={[
            <Button key="cancel" onClick={() => this.setState({ modalVisible: false })}>
              {L('BTN_CANCEL')}
            </Button>,
            <Button key="save" type="primary" loading={saving} onClick={this.handleSave}>
              {L('BTN_SAVE')}
            </Button>
          ]}
          destroyOnClose>
          <Form ref={this.formRef} layout="vertical" validateMessages={validateMessages}>
            <FormInput
              name="salesOrg"
              label={L('SALES_ORGANIZATION_SALES_ORG')}
              rule={[{ required: true }, { max: 4 }]}
            />
            <FormInput
              name="companyCode"
              label={L('SALES_ORGANIZATION_COMPANY_CODE')}
              rule={[{ required: true }, { max: 4 }]}
              disabled={isEdit}
            />
            <FormInput name="name" label={L('SALES_ORGANIZATION_NAME')} rule={[{ max: 200 }]} />
            <Form.Item name="isActive" label={L('STATUS')} valuePropName="checked">
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
      </>
    )
  }
}

export default withRouter(SalesOrganizationPage)
