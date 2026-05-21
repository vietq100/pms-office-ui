import React from 'react'
import { Button, Col, Form, Modal, Row, Select, Switch, Table, Tag } from 'antd'
import { DeleteOutlined, EditFilled, PlusOutlined } from '@ant-design/icons'
import { inject, observer } from 'mobx-react'
import { AppComponentListBase } from '@components/AppComponentBase'
import withRouter from '@components/Layout/Router/withRouter'
import { isGrantedAny, L } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import Stores from '@stores/storeIdentifier'
import CustomerGroupStore from '@stores/project/customerGroupStore'
import type { CustomerGroupDto } from '@services/project/customerGroupService'
import { validateMessages } from '@lib/validation'
import FormInput from '@components/FormItem/FormInput'

interface IProps {
  customerGroupStore?: CustomerGroupStore
}

interface IState {
  isActive?: boolean
  modalVisible: boolean
  editingRecord?: CustomerGroupDto
  saving: boolean
}

@inject(Stores.CustomerGroupStore)
@observer
class CustomerGroupPage extends AppComponentListBase<IProps, IState> {
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
    await this.props.customerGroupStore!.getAll(this.state.isActive)
  }

  onFilterChange = (value: string) => {
    const isActive = value === '' ? undefined : value === 'true'
    this.setState({ isActive }, this.getAll)
  }

  openCreate = () => {
    this.formRef.current?.resetFields()
    this.formRef.current?.setFieldsValue({ isActive: true })
    this.setState({ modalVisible: true, editingRecord: undefined })
  }

  openEdit = (record: CustomerGroupDto) => {
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
        await this.props.customerGroupStore!.update({
          id: editingRecord.id,
          name: values.name,
          isActive: values.isActive
        })
      } else {
        await this.props.customerGroupStore!.create(values)
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
      content: L('CUSTOMER_GROUP_DELETE_CONFIRM'),
      onOk: async () => {
        await this.props.customerGroupStore!.delete(id)
        await this.getAll()
      }
    })
  }

  columns = [
    { title: L('CUSTOMER_GROUP_CODE'), dataIndex: 'code', key: 'code' },
    { title: L('CUSTOMER_GROUP_NAME'), dataIndex: 'name', key: 'name' },
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
      render: (_: any, record: CustomerGroupDto) => (
        <>
          {isGrantedAny(appPermissions.customerGroup?.update) && (
            <Button
              size="small"
              shape="circle"
              icon={<EditFilled />}
              className="mr-1"
              onClick={() => this.openEdit(record)}
            />
          )}
          {isGrantedAny(appPermissions.customerGroup?.delete) && (
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
    const { customerGroups, isLoading } = this.props.customerGroupStore!
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
          {isGrantedAny(appPermissions.customerGroup?.create) && (
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
          dataSource={customerGroups}
          columns={this.columns}
          rowKey="id"
          pagination={false}
        />

        <Modal
          open={modalVisible}
          title={isEdit ? L('CUSTOMER_GROUP_EDIT_TITLE') : L('CUSTOMER_GROUP_CREATE_TITLE')}
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
              name="code"
              label={L('CUSTOMER_GROUP_CODE')}
              rule={[{ required: true }, { max: 2 }]}
              disabled={isEdit}
            />
            <FormInput name="name" label={L('CUSTOMER_GROUP_NAME')} rule={[{ required: true }, { max: 200 }]} />
            <Form.Item name="isActive" label={L('STATUS')} valuePropName="checked">
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
      </>
    )
  }
}

export default withRouter(CustomerGroupPage)
