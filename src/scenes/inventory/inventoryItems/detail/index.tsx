import * as React from 'react'
import { inject, observer } from 'mobx-react'

import { Card, Col, Form, Input, Row, Select, Tabs, Button, Modal, Table, Typography } from 'antd'
import { isGrantedAny, L, LNotification } from '@lib/abpUtility'
import { renderDate, formatCurrency } from '@lib/helper'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons/lib'
import rules from './validation'
import AppConsts, { appPermissions, fileTypeGroup, moduleIds } from '@lib/appconst'
import Stores from '@stores/storeIdentifier'
import WrapPageScroll from '@components/WrapPageScroll'
import { validateMessages } from '@lib/validation'
import AppComponentBase from '@components/AppComponentBase'
import AuditLogStore from '@stores/common/auditLogStore'
import CommentStore from '@stores/common/commentStore'
import FileStore from '@stores/common/fileStore'
import ReminderStore from '@stores/common/reminderStore'
import InventoryItemsStore from '@stores/inventory/inventoryItemsStore'
import InventoryCategoryStore from '@stores/inventory/inventoryCategoryStore'
import InventoryLocationStore from '@stores/inventory/inventoryLocationStore'
import Reminder from '@components/Reminder'
import NumberInput from '@components/Inputs/NumberInput'
import withRouter from '@components/Layout/Router/withRouter'
import FileUploadWrapV2 from '@components/FileUploadV2'
import NoRole from '@components/ComponentNoRole'

const { formVerticalLayout, timeUnits } = AppConsts
const moduleId = moduleIds.inventory
const confirm = Modal.confirm
const { TabPane } = Tabs
const Option = Select.Option as any
const { Text } = Typography

const tabKeys = {
  tabInfo: 'INVENTORY_ITEMS_TAB_INFO',
  tabHistory: 'INVENTORY_ITEMS_TAB_HISTORY'
}

export interface IInventoryItemsFormProps {
  params: any
  navigate: any
  inventoryItemsStore: InventoryItemsStore
  inventoryCategoryStore: InventoryCategoryStore
  inventoryLocationStore: InventoryLocationStore
  fileStore: FileStore
  auditLogStore: AuditLogStore
  commentStore: CommentStore
  reminderStore: ReminderStore
  sources: any
  location: any
  targetLanguages: any
}

@inject(
  Stores.InventoryItemsStore,
  Stores.FileStore,
  Stores.CommentStore,
  Stores.AuditLogStore,
  Stores.SessionStore,
  Stores.ReminderStore,
  Stores.InventoryCategoryStore,
  Stores.InventoryLocationStore
)
@observer
class InventoryItemDetail extends AppComponentBase<IInventoryItemsFormProps> {
  state = {
    isDirty: false,
    userId: undefined,
    tabActiveKey: tabKeys.tabInfo,
    filterResidentUnits: {},
    projectId: undefined,
    files: [] as any,
    assets: [],
    maxResultCount: 10,
    skipCount: 0
  }
  formRef: any = React.createRef()

  async componentDidMount() {
    this.isGranted(appPermissions.inventory.detail) &&
      (await Promise.all([
        this.getDetail(this.props.params?.id),
        this.props.inventoryCategoryStore.filterOptions({}),
        this.props.inventoryLocationStore.filterOptions({}),
        this.handleSearchHistories()
      ]))
    this.props.location.search === '?history' && this.setState({ tabActiveKey: tabKeys.tabHistory })
  }

  getDetail = async (id?) => {
    const { inventoryItemsStore, reminderStore } = this.props
    if (!id) {
      await inventoryItemsStore.createInventory()
      reminderStore.resetReminder()
    } else {
      await inventoryItemsStore.get(id)
      await reminderStore.getReminder(moduleId, id)
    }
    this.formRef.current.setFieldsValue({
      ...inventoryItemsStore.editInventoryItem
    })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  onSave = () => {
    const { inventoryItemsStore, reminderStore } = this.props
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      values.assetIds = this.state.assets.map((item: any) => item.value)
      this.setState({ loading: true })
      if (inventoryItemsStore.editInventoryItem?.id) {
        await inventoryItemsStore.update(
          {
            ...inventoryItemsStore.editInventoryItem,
            ...values
          },
          this.state.files
        )
        await reminderStore.updateReminder(moduleId, inventoryItemsStore.editInventoryItem?.id, timeUnits.hours, true)
        inventoryItemsStore.setLoading(false)
      } else {
        await inventoryItemsStore.create(values, this.state.files)
        if (reminderStore.editReminder.isActive) {
          await reminderStore.updateReminder(
            moduleId,
            this.props.inventoryItemsStore.editInventoryItem.id,
            timeUnits.hours,
            true
          )
        }
        inventoryItemsStore.setLoading(false)
      }
      this.setState({ loading: false })
      form.resetFields()
      this.props.navigate(-1)
    })
  }

  onCancel = () => {
    if (this.state.isDirty) {
      confirm({
        title: LNotification('ARE_YOU_SURE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          this.props.navigate(-1)
        }
      })
      return
    }
    this.props.inventoryItemsStore.createInventory()
    this.props.navigate(-1)
  }

  renderActions = (isLoading?) => {
    const { tabActiveKey } = this.state

    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {tabActiveKey === tabKeys.tabInfo &&
            isGrantedAny(appPermissions.planMaintenance.create, appPermissions.planMaintenance.update) && (
              <Button type="primary" onClick={this.onSave} loading={isLoading} shape="round">
                {L('BTN_SAVE')}
              </Button>
            )}
        </Col>
      </Row>
    )
  }

  onRemoveFile = (file: any) => {
    const index = this.state.files.indexOf(file)
    const newFileList = [...this.state.files]
    newFileList.splice(index, 1)
    this.setState({ files: newFileList })
  }

  beforeUploadFile = (file) => {
    this.setState({ files: [...this.state.files, file] })
    return false
  }

  renderEmailOptions = (items) => {
    const children: any = []
    items.forEach((item, index) => {
      children.push(<Option key={index}>{item}</Option>)
    })
    return children
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => {
      await this.handleSearchHistories()
    })
  }

  handleSearchHistories = async () => {
    const inventoryId = this.props.params?.id
    if (inventoryId) {
      await this.props.inventoryItemsStore.getAllInventoryHistories({
        inventoryId
      })
    }
  }

  renderInformation = () => {
    const {
      inventoryCategoryStore: { inventoryCategoryOptions },
      inventoryLocationStore: { inventoryLocationOptions },
      inventoryItemsStore: { editInventoryItem }
    } = this.props
    return (
      <Card>
        <Row gutter={[16, 0]}>
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item label={L('NAME')} {...formVerticalLayout} name="name" rules={rules.name}>
              <Input />
            </Form.Item>
          </Col>
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item
              label={L('INVENTORY_CATEGORY')}
              {...formVerticalLayout}
              name="categoryId"
              rules={rules.categoryId}>
              <Select style={{ width: '100%' }}>
                {inventoryCategoryOptions.map((item, indexParent) => (
                  <Select.OptGroup key={indexParent} label={item.label}>
                    {item.childs.map((subItem) => (
                      <Select.Option key={subItem.id} value={subItem.value}>
                        {subItem.label}
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item label={L('INVENTORY_TOBE_USED_AT')} {...formVerticalLayout} name="locationUseAt">
              <Input />
            </Form.Item>
          </Col>
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item label={L('INVENTORY_LOCATION')} {...formVerticalLayout} name="locationId">
              <Select style={{ width: '100%' }}>{this.renderOptions(inventoryLocationOptions)}</Select>
            </Form.Item>
          </Col>
          {editInventoryItem?.id ? (
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item label={L('INVENTORY_QUANTITY')} {...formVerticalLayout} name="quantity">
                <NumberInput disabled min={0} />
              </Form.Item>
            </Col>
          ) : null}
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item label={L('INVENTORY_MIN_BALANCE')} {...formVerticalLayout} name="minimumBalance">
              <NumberInput min={0} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 0]}>
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item label={L('INVENTORY_LOCATON_RACK')} {...formVerticalLayout} name="locationRackNo">
              <Input />
            </Form.Item>
          </Col>
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item label={L('INVENTORY_LOCATON_ROW')} {...formVerticalLayout} name="locationRowNo">
              <Input />
            </Form.Item>
          </Col>
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item label={L('INVENTORY_LOCATON_OTHER')} {...formVerticalLayout} name="locationOther">
              <Input />
            </Form.Item>
          </Col>
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item label={L('INVENTORY_RATING')} {...formVerticalLayout} name="rating">
              <Input />
            </Form.Item>
          </Col>
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item label={L('INVENTORY_COLOUR_CODE')} {...formVerticalLayout} name="colourCode">
              <Input />
            </Form.Item>
          </Col>
          <Col sm={{ span: 24, offset: 0 }}>
            <Form.Item label={L('DESCRIPTION')} {...formVerticalLayout} name="description">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>
        <Reminder moduleId={moduleId} parentId={this.props.params?.id} timeUnit={timeUnits.days} />
        <Row gutter={[24, 24]}>
          <Col md={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
            <FileUploadWrapV2
              parentId={this.props.inventoryItemsStore.editInventoryItem.documentId}
              fileStore={this.props.fileStore}
              onRemoveFile={this.onRemoveFile}
              beforeUploadFile={this.beforeUploadFile}
              acceptedFileTypes={[...fileTypeGroup.images, ...fileTypeGroup.documents]}></FileUploadWrapV2>
          </Col>
        </Row>
      </Card>
    )
  }

  renderStockType = (stockType: string) =>
    stockType === 'STOCK' ? (
      <Text type="secondary">{L('INVENTORY_STOCK_IN')}</Text>
    ) : (
      <Text type="danger">{L('INVENTORY_STOCK_OUT')}</Text>
    )

  renderHistories = () => {
    const columns = [
      {
        title: L('INVENTORY_TYPE'),
        dataIndex: 'type',
        key: 'type',
        width: 150,
        render: (type, row) => (
          <div className="text-muted small">
            <div>{this.renderStockType(type)}</div>
            <CalendarOutlined className="mr-1" /> {renderDate(row.creationTime)}
            <div>
              <UserOutlined className="mr-1" /> {row.creatorUser?.displayName}
            </div>
          </div>
        )
      },
      {
        title: L('INVENTORY_QUANTITY'),
        dataIndex: 'quantity',
        key: 'quantity',
        width: 80,
        render: (quantity) => quantity
      },
      {
        title: L('INVENTORY_UNIT_PRICE'),
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        width: 80,
        render: (unitPrice) => <>{formatCurrency(unitPrice)}</>
      },
      {
        title: L('INVENTORY_TOTAL_VALUE'),
        dataIndex: 'cost',
        key: 'cost',
        width: 80,
        render: (cost) => <>{formatCurrency(cost)}</>
      },
      {
        title: L('DESCRIPTION'),
        dataIndex: 'description',
        key: 'description',
        width: 180,
        ellipsis: true,
        render: (description) => description
      }
    ]
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Table
            size="middle"
            className="custom-ant-table"
            rowKey={(record) => record.id}
            columns={columns}
            dataSource={this.props.inventoryItemsStore.inventoryHistories.items}
            onChange={this.handleTableChange}
          />
        </Col>
      </Row>
    )
  }

  render() {
    const {
      inventoryItemsStore: { isLoading, editInventoryItem }
    } = this.props

    return this.isGranted(appPermissions.inventory.detail) ? (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Card style={{ minHeight: 750 }}>
          <Form
            ref={this.formRef}
            layout={'vertical'}
            onFinish={this.onSave}
            onAbort={this.onCancel}
            onValuesChange={() => this.setState({ isDirty: true })}
            validateMessages={validateMessages}
            initialValues={this.props.inventoryItemsStore.editInventoryItem}
            size="middle">
            {!editInventoryItem.id ? (
              this.renderInformation()
            ) : (
              <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab}>
                <Tabs.TabPane tab={L(tabKeys.tabInfo)} key={tabKeys.tabInfo}>
                  {this.renderInformation()}
                </Tabs.TabPane>
                <TabPane tab={L(tabKeys.tabHistory)} key={tabKeys.tabHistory} disabled={!editInventoryItem?.id}>
                  {this.renderHistories()}
                </TabPane>
              </Tabs>
            )}
          </Form>
        </Card>
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(InventoryItemDetail)
