/* eslint-disable max-len */
import React from 'react'

import { Card, Col, Form, Row, Input, Button, Modal, Switch, Select, DatePicker, Tabs, Table, Tag } from 'antd'
import { styles } from '@lib/formLayout'
import { validateMessages } from '@lib/validation'
import AppConsts, { appPermissions, fileTypeGroup, dateFormat } from '@lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { isGrantedAny, L, LError, LNotification } from '@lib/abpUtility'
import debounce from 'lodash/debounce'
import AppComponentBase from '@components/AppComponentBase'
import WrapPageScroll from '@components/WrapPageScroll'
import CurrencyInput from '@components/Inputs/CurrencyInput'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { IAssetDetailFormProps, IAssetDetailFormState } from './assetDetail.d'
import { isValidEmail, notifyError, renderDate } from '@lib/helper'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons/lib'
import rules from './validation'
import './asset-detail.less'
import TagsInput from '@components/Inputs/TagsInput'
import withRouter from '@components/Layout/Router/withRouter'
import FileUploadWrapV2 from '@components/FileUploadV2'
import NoRole from '@components/ComponentNoRole'

const { formVerticalLayout, formHorizontalLayout, dataType } = AppConsts
const { confirm } = Modal
const { TabPane } = Tabs
const Option = Select.Option as any
const tabKeys = {
  tabInfo: 'ASSET_TAB_INFO',
  tabMaintenanceHistories: 'ASSET_TAB_MAINTENANCE_HISTORY'
}
@inject(
  Stores.AssetStore,
  Stores.AssetTypeStore,
  Stores.PlanMaintenanceStore,
  Stores.CompanyStore,
  Stores.FileStore,
  Stores.StaffStore,
  Stores.ProjectStore,
  Stores.SessionStore
)
@observer
class AssetDetail extends AppComponentBase<IAssetDetailFormProps, IAssetDetailFormState> {
  formRef: any = React.createRef()

  state = {
    isDirty: false,
    tabActiveKey: tabKeys.tabInfo,
    files: [] as any,
    isActiveReminder: false,
    idDocument: undefined
  }

  async componentDidMount() {
    this.isGranted(appPermissions.asset.detail) && (await this.init(this.props.params?.code))
    this.isGranted(appPermissions.asset.detail) &&
      (await Promise.all([this.props.assetTypeStore.filterOptions({}), this.getAllCompany(), this.findEmployees('')]))
  }

  async init(code?) {
    const { assetStore, planMaintenanceStore } = this.props
    if (code) {
      await assetStore.getByCode(code)
    } else {
      await assetStore.createAssetModel()
      await assetStore.setEditAsset('projectId', this.props.sessionStore.project.id)
    }
    const { editAsset } = assetStore
    await planMaintenanceStore.setFilter('assetIds', editAsset.id)
    await planMaintenanceStore.setFilter('projectId', editAsset?.projectId)
    await planMaintenanceStore.getAll()
    this.setState({ idDocument: editAsset.documentId })
    this.setState(
      { isActiveReminder: editAsset.reminder.isActive },
      this.formRef.current.setFieldsValue({
        ...editAsset
      })
    )
  }

  getAllCompany = async () => {
    await this.props.companyStore.getAll({})
  }

  findEmployees = async (keyword) => {
    await this.props.staffStore.getAll({ keyword })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  changeStatusReminder = async (checked) => {
    await this.changeReminder('isActive', checked)
    this.setState({ isActiveReminder: checked })
  }

  changeReminder = async (key, value) => {
    if (key === 'emails' && !isValidEmail(value)) {
      notifyError(L('ERROR'), LError('INVALID_FORMAT_{0}', 'Email'))
      return
    }

    await this.props.assetStore.setReminder(key, value)
  }

  renderEmailOptions = (items) => {
    const children: any = []
    items.forEach((item, index) => {
      children.push(<Option key={index}>{item}</Option>)
    })
    return children
  }

  onSave = () => {
    const { assetStore, navigate } = this.props
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (assetStore.editAsset?.code) {
        await assetStore.update({ ...assetStore.editAsset, ...values }, this.state.files)
      } else {
        await assetStore.create(values, this.state.files)
      }
      navigate(-1)
      // if (params?.code) {
      //   navigate(
      //     portalLayouts.assetDetail.path.replace(
      //       ':code',
      //       assetStore.editAsset?.code
      //     )
      //   )
      // } else {
      //   navigate(portalLayouts.assets.path)
      // }
    })
  }

  onCancel = () => {
    if (this.state.isDirty) {
      confirm({
        title: LNotification('ARE_YOU_SURE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          const { navigate } = this.props
          navigate(portalLayouts.assets.path)
        }
      })
      return
    }
    const { navigate } = this.props
    navigate(portalLayouts.assets.path)
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
  handleSearchAssetType = debounce(async (keyWord) => await this.props.assetTypeStore.filterOptions({ keyWord }), 300)

  handleSearchCompany = debounce(async (keyWord) => await this.props.companyStore.getAll({ keyWord }), 300)

  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {isGrantedAny(appPermissions.asset.create, appPermissions.asset.update) && (
            <Button
              type="primary"
              disabled={this.props.params?.id && !this.isGranted(appPermissions.asset.update)}
              onClick={this.onSave}
              loading={isLoading}
              shape="round">
              {L('BTN_SAVE')}
            </Button>
          )}
        </Col>
      </Row>
    )
  }

  renderTabInfo = () => {
    const {
      assetTypeStore,

      staffStore,
      fileStore
    } = this.props

    return (
      <Card bordered={false} className="asset-detail">
        <Row gutter={16}>
          <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item label={L('ASSET_TYPE')} {...formVerticalLayout} name="assetTypeId" rules={rules.assetTypeId}>
              <Select
                showArrow
                showSearch
                allowClear
                onSearch={(value) => this.handleSearchAssetType(value)}
                filterOption={false}
                style={styles.width100}>
                {this.renderOptions(assetTypeStore.assetTypeOptions)}
              </Select>
            </Form.Item>
          </Col>
          {/* <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item label={L('ASSET_COMPANY')} {...formVerticalLayout} name="companyId">
              <Select
                showArrow
                showSearch
                allowClear
                style={styles.width100}
                onSearch={debounce(this.handleSearchCompany)}
                filterOption={false}>
                {companies.items.map((item: any, index) => (
                  <Select.Option key={index} value={item.id}>
                    {item.companyName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col> */}
          <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item label={L('ASSET_COMPANY')} {...formVerticalLayout} style={styles.width100} name="companyName">
              <Input onChange={({ target: { value } }) => value} style={styles.width100} />
            </Form.Item>
          </Col>
          <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item
              label={L('ASSET_NAME')}
              {...formVerticalLayout}
              style={styles.width100}
              name="assetName"
              rules={rules.assetName}>
              <Input onChange={({ target: { value } }) => value} style={styles.width100} />
            </Form.Item>
          </Col>
          <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item label={L('ASSET_SERIAL_NUMBER')} {...formVerticalLayout} name="serialNumber">
              <Input onChange={({ target: { value } }) => value} />
            </Form.Item>
          </Col>
          <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item label={L('ASSET_PRICE')} {...formVerticalLayout} name="price">
              <CurrencyInput />
            </Form.Item>
          </Col>
          <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item
              label={L('ASSET_PURCHASED_DATE')}
              {...formVerticalLayout}
              name="purchasedDate"
              style={styles.width100}>
              <DatePicker format={dateFormat} placeholder={L('ASSET_PURCHASED_DATE')} style={styles.width100} />
            </Form.Item>
          </Col>
          <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item
              label={L('ASSET_WARRANTY_DATE')}
              {...formVerticalLayout}
              name="warrantDate"
              style={styles.width100}>
              <DatePicker format={dateFormat} placeholder={L('ASSET_WARRANTY_DATE')} style={styles.width100} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <Form.Item
              label={L('ASSET_DESCRIPTION')}
              {...formVerticalLayout}
              name="description"
              style={styles.width100}>
              <Input.TextArea onChange={({ target: { value } }) => value} rows={3} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={{ span: 12 }} sm={{ span: 12 }}>
            <Form.Item
              label={L('ASSET_REMINDER')}
              {...formHorizontalLayout}
              name={['reminder', 'isActive']}
              valuePropName="checked">
              <Switch onChange={this.changeStatusReminder} />
            </Form.Item>{' '}
          </Col>
        </Row>
        {this.state.isActiveReminder && (
          <Row gutter={16} className="reminder-box">
            <Col md={{ span: 12 }} sm={{ span: 12 }}>
              <Form.Item
                label={L('ASSET_REMINDER_BEFORE')}
                {...formHorizontalLayout}
                name={['reminder', 'reminderInDay']}
                style={styles.width100}>
                <Input
                  onChange={({ target: { value } }) => value}
                  suffix={L('ASSET_REMINDER_IN_DAY')}
                  style={styles.width100}
                />
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 12 }}>
              <Form.Item
                label={L('ASSET_ADD_USER_TO_NOTIFICATION')}
                {...formHorizontalLayout}
                style={{ ...styles.width100 }}
                name={['reminder', 'userIds']}>
                <Select
                  showArrow
                  showSearch
                  allowClear
                  onSearch={debounce(this.findEmployees)}
                  filterOption={false}
                  style={styles.width100}
                  mode="multiple">
                  {staffStore.staffs.items?.map((item: any, index) => (
                    <Select.Option key={index} value={item.id}>
                      {item.displayName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 12 }}>
              <Form.Item
                label={L('ASSET_ADD_EMAIL_TO_THE_NOTIFICATION')}
                {...formHorizontalLayout}
                style={styles.width100}
                name={['reminder', 'emails']}>
                {/*<Select mode="tags" style={styles.width100} onChange={(value) => this.changeReminder('emails', value)}>*/}
                {/*  {editAsset.reminder && this.renderEmailOptions(editAsset.reminder.emails)}*/}
                {/*</Select>*/}
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
          </Row>
        )}
        <Row gutter={16}>
          <Col md={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
            <FileUploadWrapV2
              parentId={this.state.idDocument}
              fileStore={fileStore}
              onRemoveFile={this.onRemoveFile}
              beforeUploadFile={this.beforeUploadFile}
              acceptedFileTypes={[...fileTypeGroup.images, ...fileTypeGroup.documents]}></FileUploadWrapV2>
          </Col>
        </Row>
      </Card>
    )
  }

  renderTag = (value, color) => (
    <Tag className="cell-round mr-0" color={color}>
      {value}
    </Tag>
  )

  handleTableChange = () => {
    throw new Error('Not implement')
  }

  renderMaintenanceHistories = () => {
    const columns = [
      {
        title: `${L('PLANED_MAINTENANCE_NAME')}/${L('DESCRIPTION')}`,
        dataIndex: 'name',
        key: 'name',
        width: 150,
        render: (name, row) => (
          <div className="small">
            <div>
              <strong>{name}</strong>
            </div>
            <div>{row.description}</div>
          </div>
        )
      },
      {
        title: `${L('PLANED_MAINTENANCE_STATUS')}/${L('PLANED_MAINTENANCE_PRIORITY')}`,
        dataIndex: 'status',
        key: 'status',
        width: 80,
        render: (status, row) => (
          <div>
            {this.renderTag(status?.name, status?.colorCode || 'black')} /{' '}
            {this.renderTag(row.priority?.name, row.priority?.colorCode || 'black')}
          </div>
        )
      },
      {
        title: L('PLANED_MAINTENANCE_ASSIGNED_TO'),
        dataIndex: 'assignedUsers',
        key: 'assignedUsers',
        width: 150,
        render: (assignedUsers) => (
          <div className="text-muted small">
            <UserOutlined className="mr-1" />
            {assignedUsers?.length > 0 &&
              assignedUsers.map((item) => <label key={item?.id}>{item?.displayName}, </label>)}
          </div>
        )
      },
      {
        title: `${L('PLANED_MAINTENANCE_START_DATE')}/${L('PLANED_MAINTENANCE_END_DATE')}`,
        dataIndex: 'startDate',
        key: 'startDate',
        width: 150,
        render: (startDate, row) => (
          <div className="small">
            <CalendarOutlined className="mr-1" /> {renderDate(startDate)}
            {row.endDate && (
              <div>
                <CalendarOutlined className="mr-1" /> {renderDate(row.endDate)}
              </div>
            )}
          </div>
        )
      },
      {
        title: L('CREATED_AT'),
        dataIndex: 'creationTime',
        key: 'creationTime',
        width: 150,
        ellipsis: true,
        render: (text, row) => (
          <div className="small">
            <CalendarOutlined className="mr-1" /> {renderDate(text)}
            <div>
              <UserOutlined className="mr-1" /> {row.creatorUser?.displayName}
            </div>
          </div>
        )
      }
    ]
    return (
      <Card bordered={false} style={{ minHeight: 750 }}>
        <Row>
          <Col sm={{ span: 24, offset: 0 }}>
            <Table
              size="middle"
              className="custom-ant-table"
              rowKey={(record) => record.id}
              columns={columns}
              dataSource={this.props.planMaintenanceStore.pagedResult.items}
              onChange={this.handleTableChange}
            />
          </Col>
        </Row>
      </Card>
    )
  }

  public render() {
    return this.isGranted(appPermissions.asset.detail) ? (
      <WrapPageScroll renderActions={() => this.renderActions(this.props.assetStore.isLoading)}>
        <Form
          layout="vertical"
          initialValues={this.props.assetStore.editAsset}
          ref={this.formRef}
          validateMessages={validateMessages}
          size="middle">
          <Tabs type="card" activeKey={this.state.tabActiveKey} onTabClick={this.changeTab}>
            <TabPane tab={L(tabKeys.tabInfo)} key={tabKeys.tabInfo}>
              {this.renderTabInfo()}
            </TabPane>
            {this.props.params.code && (
              <TabPane tab={L(tabKeys.tabMaintenanceHistories)} key={tabKeys.tabMaintenanceHistories}>
                {this.renderMaintenanceHistories()}
              </TabPane>
            )}
          </Tabs>
        </Form>
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(AssetDetail)
