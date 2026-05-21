import React from 'react'

import { Col, Form, Row, Card, Input, Button, Modal, Tabs, Table } from 'antd'
import { validateMessages } from '@lib/validation'
import AppConsts, { appPermissions } from '../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AnnouncementStore from '../../../stores/announcement/announcementStore'
import AppComponentBase from '../../../components/AppComponentBase'
import ProjectStore from '../../../stores/project/projectStore'
import CKEditorInput from '@components/Inputs/CKEditorInput'
import { isGrantedAny, L, LNotification } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import Select from '@components/Select'
import unitService from '@services/project/unitService'
import UnitStore from '@stores/project/unitStore'
import buildingService from '@services/project/buildingService'
import ResidentStore from '@stores/member/resident/residentStore'
import { getAnnouncementUserColumns } from '../columns'
import FileStore from '@stores/common/fileStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import rules from './validation'
import withRouter from '@components/Layout/Router/withRouter'
import FileUploadWrapV2 from '@components/FileUploadV2'
const { formVerticalLayout, announcementTypes, announcementStatus } = AppConsts
const confirm = Modal.confirm

export interface IAnnouncementFormProps {
  params: any
  navigate: any
  announcementStore: AnnouncementStore
  projectStore: ProjectStore
  unitStore: UnitStore
  residentStore: ResidentStore
  fileStore: FileStore
}

const tabKeys = {
  announcementContent: 'TAB_ANNOUNCEMENT_CONTENT',
  announcementUsers: 'TAB_ANNOUNCEMENT_USERS'
}

@inject(Stores.AnnouncementStore, Stores.ProjectStore, Stores.UnitStore, Stores.ResidentStore, Stores.FileStore)
@observer
class AnnouncementDetail extends AppComponentBase<IAnnouncementFormProps> {
  formRef: any = React.createRef()

  get languages() {
    return abp.localization.languages.filter((val: any) => {
      return !val.isDisabled
    })
  }

  state = {
    isDirty: false,
    buildings: [] as any,
    files: [] as any,
    filterUnit: {} as any,
    announcementMethods: [],
    announcementToUsers: [],
    tabActiveKey: tabKeys.announcementContent
  }

  async componentDidMount() {
    const { projectStore, unitStore, residentStore } = this.props
    const announcementMethods = Object.keys(announcementTypes).map((key) => {
      return { label: L(key.toUpperCase()), value: announcementTypes[key] }
    })
    this.setState({ announcementMethods })
    await Promise.all([
      unitStore.getUnitTypes(),
      residentStore.getMemberRoles(),
      residentStore.getMemberTypes(),
      projectStore.filterOptions({}),
      this.init(this.props.params?.id)
    ])
  }

  async init(id?) {
    if (!id) {
      await this.props.announcementStore.createAnnouncement()
    } else {
      await this.props.announcementStore.get(id)
    }

    this.formRef.current.setFieldsValue({
      ...this.props.announcementStore.editAnnouncement
    })
  }

  getProjectBuilding = async (projectId) => {
    if (!projectId) {
      this.setState({
        buildings: [],
        filterUnit: { ...this.state.filterUnit, projectId }
      })
      this.formRef.current?.setFieldsValue({ buildingId: undefined })
      return
    }
    const { items } = await buildingService.getAll({ projectId })
    this.handleUnitSearch('')
    this.setState({
      buildings: items,
      filterUnit: { ...this.state.filterUnit, projectId }
    })
    this.formRef.current?.setFieldsValue({ buildingId: undefined })
  }

  handleUnitSearch = async (keyword) => {
    const form = this.formRef.current
    if (!form) {
      return
    }
    const projectId = form.getFieldValue('projectId')
    const buildingId = form.getFieldValue('buildingId')
    const unitTypeId = form.getFieldValue('unitTypeId')
    const units = await unitService.filterOptions({
      ...this.state.filterUnit,
      projectId,
      buildingId,
      typeId: unitTypeId,
      keyword
    })

    this.setState({ units })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  refreshUsers = async () => {
    const form = this.formRef.current
    const filter = form.getFieldValue('filter')
    await this.props.announcementStore.getAnnouncementUsers(filter)
    this.setState({ tabActiveKey: tabKeys.announcementUsers })
  }

  publishAnnouncement = async () => {
    const { editAnnouncement } = this.props.announcementStore
    if (!editAnnouncement || !editAnnouncement.id) {
      return
    }
    await this.props.announcementStore.publishAnnouncement(editAnnouncement.id)
  }

  onRemoveFile = (file) => {
    const index = this.state.files.indexOf(file)
    const newFileList = [...this.state.files]
    newFileList.splice(index, 1)
    this.setState({ files: newFileList })
  }

  beforeUploadFile = (file) => {
    this.setState({ files: [...this.state.files, file] })
    return false
  }

  onSave = () => {
    setTimeout(() => {
      const form = this.formRef.current

      form.validateFields().then(async (values: any) => {
        await this.props.announcementStore.create(
          {
            ...this.props.announcementStore.editAnnouncement,
            ...values
          },
          this.state.files
        )

        if (this.props.announcementStore.editAnnouncement?.id) {
          const { navigate } = this.props
          navigate(
            portalLayouts.announcementDetail.path.replace(':id', this.props.announcementStore.editAnnouncement.id)
          )
        }
      })
    }, 200)
  }

  onCancel = () => {
    const { navigate } = this.props
    if (this.state.isDirty) {
      confirm({
        title: LNotification('ARE_YOU_SURE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          navigate(portalLayouts.announcement.path)
        }
      })
      return
    }
    navigate(portalLayouts.announcement.path)
  }

  renderActions = (isLoading?) => {
    const { editAnnouncement, isLoadingLogUser } = this.props.announcementStore
    const form = this.formRef.current
    const projectId = form?.getFieldValue(['filter', 'projectId'])
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {!editAnnouncement.id && (
            <Button
              className="mr-1"
              onClick={this.refreshUsers}
              loading={isLoadingLogUser}
              shape="round"
              disabled={!projectId || isLoading}>
              {L('BTN_REFRESH_USERS')}
            </Button>
          )}
          {isGrantedAny(appPermissions.announcement.create, appPermissions.announcement.update) &&
            editAnnouncement.id &&
            editAnnouncement.statusCode === announcementStatus.readyForPublish && (
              <Button
                type="primary"
                className="mr-1"
                onClick={this.publishAnnouncement}
                loading={isLoading}
                shape="round">
                {L('BTN_PUBLISH')}
              </Button>
            )}
          {isGrantedAny(appPermissions.announcement.create, appPermissions.announcement.update) &&
            !editAnnouncement?.id && (
              <Button type="primary" onClick={this.onSave} loading={isLoading} shape="round" disabled={!projectId}>
                {L('BTN_SAVE')}
              </Button>
            )}
        </Col>
      </Row>
    )
  }

  public render() {
    const { isLoading, editAnnouncement, announcementUserLogs } = this.props.announcementStore
    const { buildings, announcementMethods } = this.state
    const {
      projectStore,
      unitStore: { unitTypes },
      residentStore: { memberRoles, memberTypes }
    } = this.props
    const columns = getAnnouncementUserColumns()
    const projects = projectStore.projectOptions

    return (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Form ref={this.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
          {!editAnnouncement.id && (
            <Card bordered={false}>
              <Row gutter={[16, 0]}>
                <Col span={8}>
                  <Form.Item name={['filter', 'projectId']} label={L('NEWS_PROJECT')} rules={rules.projectId}>
                    <Select
                      allowClear
                      showArrow
                      showSearch
                      style={{ width: '100%' }}
                      filterOption={false}
                      onChange={this.getProjectBuilding}>
                      {projects.map((project) => (
                        <Select.Option key={project.id} value={project.id}>
                          {project.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={['filter', 'buildingIds']} label={L('BUILDING')} rules={rules.buildingIds}>
                    <Select
                      allowClear
                      showArrow
                      style={{ width: '100%' }}
                      onChange={() => this.handleUnitSearch('')}
                      mode="multiple">
                      {buildings.map((building) => (
                        <Select.Option key={building.id} value={building.id}>
                          {building.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={['filter', 'unitTypeIds']} label={L('FILTER_UNIT_TYPE')}>
                    <Select allowClear showArrow style={{ width: '100%' }} filterOption={false} mode="multiple">
                      {this.renderOptions(unitTypes)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={['filter', 'memberRoleIds']} label={L('UNIT_RESIDENT_ROLE')}>
                    <Select allowClear showArrow style={{ width: '100%' }} filterOption={false} mode="multiple">
                      {this.renderOptions(memberRoles)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={['filter', 'memberTypeIds']} label={L('UNIT_RESIDENT_TYPE')}>
                    <Select allowClear showArrow style={{ width: '100%' }} filterOption={false} mode="multiple">
                      {this.renderOptions(memberTypes)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="campaignType" label={L('ANNOUNCEMENT_METHOD')} rules={rules.campaignType}>
                    <Select allowClear showArrow style={{ width: '100%' }} filterOption={false}>
                      {this.renderOptions(announcementMethods)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="emails" label={L('ANNOUNCEMENT_INCLUDE_EMAILS')}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}
          <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab}>
            <Tabs.TabPane tab={this.L(tabKeys.announcementContent)} key={tabKeys.announcementContent}>
              <Card>
                <Row>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <Row gutter={[16, 0]}>
                      <Col sm={{ span: 24, offset: 0 }}>
                        <Form.Item label={L('SUBJECT')} {...formVerticalLayout} name={'subject'} rules={rules.subject}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 24, offset: 0 }}>
                        <Form.Item
                          label={L('TEMPLATE_CONTENT')}
                          {...formVerticalLayout}
                          name={['content', 'htmlText']}
                          rules={rules.content}>
                          <CKEditorInput />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <FileUploadWrapV2
                      maxSize={25}
                      parentId={editAnnouncement?.uniqueId}
                      fileStore={this.props.fileStore}
                      onRemoveFile={this.onRemoveFile}
                      beforeUploadFile={this.beforeUploadFile}
                      disabled={!!editAnnouncement?.uniqueId}
                    />
                  </Col>
                </Row>
              </Card>
            </Tabs.TabPane>
            <Tabs.TabPane tab={this.L(tabKeys.announcementUsers)} key={tabKeys.announcementUsers}>
              {!editAnnouncement.id && (
                <Table
                  size="middle"
                  className="custom-ant-table"
                  rowKey={(record: any) => record.key}
                  columns={columns}
                  pagination={false}
                  loading={this.props.residentStore.isLoading}
                  dataSource={announcementUserLogs?.items || []}
                  scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
                />
              )}
              {!!editAnnouncement.id && (
                <Table
                  size="middle"
                  className="custom-ant-table"
                  rowKey={(record: any) => record.key}
                  columns={columns}
                  pagination={false}
                  loading={this.props.residentStore.isLoading}
                  dataSource={announcementUserLogs?.items || []}
                  scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
                />
              )}
            </Tabs.TabPane>
          </Tabs>
        </Form>
      </WrapPageScroll>
    )
  }
}

export default withRouter(AnnouncementDetail)
