import React from 'react'

import { Col, Form, Row, Card, Input, Button, Modal, Tabs, Table, Empty, Spin } from 'antd'
import { validateMessages } from '@lib/validation'
import AppConsts, { appPermissions, fileTypeGroup } from '../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AnnouncementStore from '../../../stores/announcement/announcementStore'
import AppComponentBase from '../../../components/AppComponentBase'
import ProjectStore from '../../../stores/project/projectStore'
import { isGrantedAny, L, LNotification } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import Select from '@components/Select'
import unitService from '@services/project/unitService'
import UnitStore from '@stores/project/unitStore'
import ResidentStore from '@stores/member/resident/residentStore'
import { getAnnouncementUserColumns } from '../columns'
import FileStore from '@stores/common/fileStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import rules from './validation'
import withRouter from '@components/Layout/Router/withRouter'
import { filterOptions } from '@lib/helper'
import DataTable from '@components/DataTable'
import Filter from '@components/Filter'
import { debounce } from 'lodash'
import { getAnnouncementUserColumnsBeforeSend } from '../columnsBeforeSend'
import { PreviewAnnouncement } from './PreviewAnnouncement'
import TagsInput from '@components/Inputs/TagsInput'
import FileUploadWrapV2 from '@components/FileUploadV2'
import SyncfutionRichText from '@components/Inputs/SyncfusionRichText'
import residentService from '@services/member/resident/residentService'
import NoRole from '@components/ComponentNoRole'

const { formVerticalLayout, announcementTypes, announcementStatus, dataType } = AppConsts
const confirm = Modal.confirm
const Search = Input.Search
export interface IAnnouncementFormProps {
  navigate: any
  params: any
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
    previewData: {} as any,
    showPreview: false,
    keyword: undefined,
    maxResultCount: 10,
    skipCount: 0,
    isDirty: false,
    units: [] as any,
    files: [] as any,
    isSms: false,
    unitIds: [] as any,
    filterUnit: {
      buildingIds: undefined,
      unitTypeIds: undefined
    },
    filterUser: {
      UnitId: undefined,
      RoleIds: undefined
    },
    announcementMethods: [] as any,
    announcementToUsers: [],
    tabActiveKey: tabKeys.announcementContent,
    residents: [] as any,
    isNotEdit: false,
    totalSizeUpload: 20
  }

  async componentDidMount() {
    const { projectStore, unitStore, announcementStore } = this.props
    const announcementMethods = Object.keys(announcementTypes).map((key) => {
      return { label: L(key.toUpperCase()), value: announcementTypes[key], id: announcementTypes[key] }
    })

    this.setState({ announcementMethods })
    this.isGranted(appPermissions.announcement.detail) &&
      (await Promise.all([
        unitStore.getUnitTypes(),
        // residentStore.getMemberRoles(),
        // residentStore.getMemberTypes(),
        projectStore.filterBuildingOptions({}),
        announcementStore.getListCategories({}),
        this.init(this.props.params?.id)
      ]))
  }

  onCancelShowPreview = () => {
    this.setState({ showPreview: false })
  }

  onResetUnit = () => {
    this.formRef.current.setFieldsValue({ filter: { unitIds: undefined } })
  }

  onResetUser = () => {
    this.formRef.current.setFieldsValue({ filter: { userIds: undefined } })
  }

  findUnits = async (keyword) => {
    const buildingIds = this.formRef.current?.getFieldValue(['filter', 'buildingIds'])
    const unitTypeIds = this.formRef.current?.getFieldValue(['filter', 'unitTypeIds'])
    const results = await unitService.getListUnits({
      buildingIds: buildingIds,
      unitTypeIds: unitTypeIds,
      keyword,
      maxResultCount: 20,
      skipCount: 0
    })
    this.setState({ units: results || [] })
  }

  findBuildings = debounce(async (keyword?) => {
    await this.props.projectStore.filterBuildingOptions({ keyword: keyword })
  }, 300)

  getUsers = async (unitIds?, RoleIds?) => {
    const results = await residentService.getAll({
      unitIds: unitIds ? unitIds : undefined,
      roleIds: RoleIds ? RoleIds : undefined,
      maxResultCount: 20,
      skipCount: 0
    })
    this.setState({ residents: results?.items })
  }
  getUnits = async (buildingIds?) => {
    const results = await unitService.getListUnits({
      buildingIds: buildingIds ? buildingIds : undefined,
      maxResultCount: 20,
      skipCount: 0
    })
    this.setState({ units: results || [] })
  }

  // chưa có api search user theo unitIds và MemberRoleIds
  findUsers = async (keyword) => {
    const unitIds = this.formRef.current?.getFieldValue(['filter', 'unitIds'])
    const RoleIds = this.formRef.current?.getFieldValue(['filter', 'memberRoleIds'])
    const results = await residentService.getAll({
      unitIds: unitIds,
      roleIds: RoleIds,
      keyword,
      maxResultCount: 20,
      skipCount: 0
    })

    this.setState({ residents: results?.items })
  }

  async init(id?) {
    this.props.announcementStore.isLoading = true
    if (!id) {
      this.setState({ isNotEdit: false })
      await this.props.announcementStore.createAnnouncement()

      this.formRef.current?.setFieldsValue({
        filter: {
          emailIncludes: [
            'hongphuc.tran@newtecons.vn',
            'tuyet.nguyen@newtecons.vn',
            'ngan.lengoc@newtecons.vn',
            'linh.tieu@newtecons.vn',
            'tung.vuthanh@newtecons.vn'
          ]
        }
      })
    } else {
      await this.findUnits('')
      await this.findUsers('')

      await this.props.announcementStore.get(this.props.params?.id)
      if (this.props.announcementStore.editAnnouncement.statusCode === announcementStatus.readyForPublish) {
        this.setState({ isNotEdit: false })
      } else {
        this.setState({ isNotEdit: true })
      }
      await this.props.announcementStore.getLogs(
        this.props.params?.id,
        this.state.skipCount,
        this.state.maxResultCount,
        this.state.keyword
      )
      this.getUsers(
        this.props.announcementStore.editAnnouncement?.filter?.unitIds,
        this.props.announcementStore.editAnnouncement?.filter?.memberRoleIds
      )
      this.getUnits(this.props.announcementStore.editAnnouncement?.filter?.buildingIds)

      this.formRef.current?.setFieldsValue({
        ...this.props.announcementStore.editAnnouncement
      })
    }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }
  keywordPlaceholder = ` ${this.L('ANNOUNCEMENT_PLACEHODER')}`
  handleSearch = (name, value) => {
    this.setState({ filter: { [name]: value }, skipCount: 0 }, async () => {
      await this.props.announcementStore.getLogs(
        this.props.params?.id,
        this.state.skipCount,
        this.state.maxResultCount,
        this.state.keyword
      )
    })
  }

  onChangBuilding = async (value) => {
    await this.setState({ filterUnit: { ...this.state.filterUnit, buildingIds: value } })
    await this.handleUnitSearch()
    this.onResetUnit()
    this.onResetUser()
  }

  onChangUnitType = async (value) => {
    await this.setState({ filterUnit: { ...this.state.filterUnit, unitTypeIds: value } })
    await this.handleUnitSearch()
    this.onResetUnit()
    this.onResetUser()
  }
  onChangeUnit = async (value) => {
    await this.setState({ filterUser: { ...this.state.filterUser, unitIds: value } })
    this.findUsers('')
    this.onResetUser()
  }

  onChangMemberType = async (value) => {
    await this.setState({ filterUser: { ...this.state.filterUser, memberRoleIds: value } })
    this.findUsers('')
    this.onResetUser()
  }

  handleUnitSearch = async () => {
    const form = this.formRef.current
    if (!form) {
      return
    }

    const units = await unitService.filterOptions({
      ...this.state.filterUnit
    })

    this.setState({ units: units })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  refreshUsers = async () => {
    const form = this.formRef.current
    const filter = form.getFieldValue('filter')

    filter && (await this.props.announcementStore.getAnnouncementUsers(filter))
    this.setState({ tabActiveKey: tabKeys.announcementUsers })
  }

  publishAnnouncement = async () => {
    const { editAnnouncement } = this.props.announcementStore
    if (!editAnnouncement || !editAnnouncement.id) {
      return
    }

    await this.props.announcementStore.publishAnnouncement(editAnnouncement.id)
    const { navigate } = this.props
    navigate(portalLayouts.announcement.path)
  }

  CheckAno = () => {
    const form = this.formRef.current
    if (form.getFieldValue('campaignType') == 3) this.setState({ isSms: true })
    else this.setState({ isSms: false })
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
  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount }, async () => {
      await this.props.announcementStore.get(this.props.params?.id)
      await this.props.announcementStore.getLogs(this.props.params?.id, this.state.skipCount, this.state.maxResultCount)
    })
  }

  onUpdate = async () => {
    setTimeout(() => {
      const form = this.formRef.current

      form.validateFields().then(async (values: any) => {
        await this.props.announcementStore.update({
          ...this.props.announcementStore.editAnnouncement,
          ...values
        })
      })

      if (this.props.announcementStore.editAnnouncement?.id) {
        const { navigate } = this.props
        navigate(portalLayouts.announcementDetail.path.replace(':id', this.props.announcementStore.editAnnouncement.id))
      }
    }, 200)
  }

  updateSearch = debounce((name, value) => {
    this.setState({ keyword: value })
  }, 100)
  onShowPerview = () => {
    this.setState({
      previewData: this.props.announcementStore.editAnnouncement
    })

    this.setState({ showPreview: true })
  }

  onSave = () => {
    setTimeout(() => {
      const form = this.formRef.current
      form.validateFields().then(async (values: any) => {
        confirm({
          title: LNotification('DO_YOU_WANT_SAVE_ANNO'),
          okText: L('BTN_YES'),
          cancelText: L('BTN_NO'),
          onOk: async () => {
            if (this.props.announcementStore.editAnnouncement?.id) {
              await this.props.announcementStore.update({
                ...this.props.announcementStore.editAnnouncement,
                ...values
              })
              this.init(this.props.announcementStore.editAnnouncement?.id)
            } else {
              await this.props.announcementStore.create(
                {
                  ...this.props.announcementStore.editAnnouncement,
                  ...values
                },
                this.state.files
              )
              const { navigate } = this.props
              navigate(
                portalLayouts.announcementDetail.path.replace(':id', this.props.announcementStore.editAnnouncement.id)
              )
            }
          }
        })
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
    const { editAnnouncement } = this.props.announcementStore
    return this.isGranted(appPermissions.announcement.detail) ? (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {/* {!editAnnouncement.id && isGrantedAny(appPermissions.announcement.create) && (
            <>
              <Button
                style={{ display: 'none' }}
                className="mr-1"
                onClick={this.refreshUsers}
                loading={isLoadingLogUser}
                disabled={isLoading}
                shape="round">
                {L('BTN_REFRESH_USERS')}
              </Button>
            </>
          )} */}
          {isGrantedAny(appPermissions.announcement.create, appPermissions.announcement.update) &&
            editAnnouncement.id &&
            editAnnouncement.statusCode === announcementStatus.readyForPublish && (
              <>
                <Button
                  style={{ display: 'none' }}
                  type="primary"
                  className="mr-1"
                  onClick={this.onUpdate}
                  loading={isLoading}
                  shape="round">
                  {L('BTN_UPDATE')}
                </Button>
              </>
            )}

          {isGrantedAny(appPermissions.announcement.create, appPermissions.announcement.update) &&
            editAnnouncement?.id &&
            editAnnouncement?.statusCode === announcementStatus.readyForPublish && (
              <Button type="primary" onClick={this.onSave} loading={isLoading} shape="round">
                {L('BTN_SAVE')}
              </Button>
            )}
          {isGrantedAny(appPermissions.announcement.create, appPermissions.announcement.update) &&
            !editAnnouncement?.id && (
              <Button type="primary" onClick={this.onSave} loading={isLoading} shape="round">
                {L('BTN_SAVE')}
              </Button>
            )}
        </Col>
      </Row>
    ) : (
      <NoRole />
    )
  }

  public render() {
    const { isLoading, editAnnouncement, announcementUserLogs, listCategories } = this.props.announcementStore
    const { announcementMethods } = this.state
    const {
      projectStore: { buildingOptions, filterBuildingOptions }
    } = this.props
    const columnsAfterSend = getAnnouncementUserColumns()
    const columnsBeforeSend = getAnnouncementUserColumnsBeforeSend()
    return this.isGranted(appPermissions.announcement.detail) ? (
      this.props.announcementStore.isLoading === false ? (
        <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
          <Form ref={this.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
            {/* {!editAnnouncement.id && ( */}

            <Card bordered={false}>
              <Row gutter={[16, 0]}>
                <Col span={8}>
                  <Form.Item name="campaignType" label={L('ANNOUNCEMENT_METHOD')} rules={rules.campaignType}>
                    <Select
                      disabled={this.props.announcementStore.editAnnouncement?.id !== undefined}
                      allowClear
                      showArrow
                      onChange={() => this.CheckAno()}
                      style={{ width: '100%' }}
                      filterOption={false}>
                      {this.renderOptions(announcementMethods)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name={'categoryId'}
                    label={L('ANNOUNCEMENT_DETAIL_CATEGORY')}
                    rules={rules.campaignCategory}>
                    <Select
                      disabled={this.props.announcementStore.editAnnouncement?.id !== undefined}
                      allowClear
                      showSearch
                      showArrow
                      style={{ width: '100%' }}
                      filterOption={filterOptions}>
                      {this.renderOptions(listCategories)}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item name={['filter', 'buildingIds']} label={L('BUILDING')} rules={rules.buildingIds}>
                    <Select
                      showSearch
                      showArrow
                      allowClear
                      filterOption={false}
                      onSearch={this.findBuildings}
                      onClear={() => filterBuildingOptions}
                      disabled={this.props.announcementStore.editAnnouncement?.id !== undefined}
                      onChange={this.onChangBuilding}
                      style={{ width: '100%' }}
                      mode="multiple">
                      {buildingOptions.map((building) => (
                        <Select.Option key={building.id} value={building.id}>
                          {building.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item name={['filter', 'unitIds']} label={L('UNIT')}>
                    <Select
                      disabled={this.props.announcementStore.editAnnouncement?.id !== undefined}
                      onSearch={this.findUnits}
                      allowClear
                      showSearch
                      showArrow
                      style={{ width: '100%' }}
                      filterOption={filterOptions}
                      onChange={this.onChangeUnit}
                      mode="multiple">
                      {/* {this.renderOptions(unitIds)} */}
                      {this.state.units.map((unit) => (
                        <Select.Option key={unit.id} value={unit.id}>
                          {unit.fullUnitCode}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item name={['filter', 'userIds']} label={L('ANNOUNCEMENT_DETAIL_USERS')}>
                    <Select
                      disabled={this.props.announcementStore.editAnnouncement?.id !== undefined}
                      allowClear
                      showSearch
                      showArrow
                      onSearch={this.findUsers}
                      style={{ width: '100%' }}
                      filterOption={filterOptions}
                      mode="multiple">
                      {this.state.residents.map((item: any) => (
                        <Select.Option key={item?.id} value={item?.id}>
                          {item?.displayName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item name={['filter', 'emailIncludes']} label={L('ANNOUNCEMENT_INCLUDE_EMAILS')}>
                    <TagsInput
                      placeholder={L('EMAIL')}
                      type={dataType.email}
                      disabled={this.props.announcementStore.editAnnouncement?.id !== undefined}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Tabs
              activeKey={this.state.tabActiveKey}
              onTabClick={this.changeTab}
              type="card"
              tabBarExtraContent={
                <Row gutter={[4, 4]}>
                  {editAnnouncement.id &&
                    editAnnouncement?.statusCode === announcementStatus.readyForPublish &&
                    this.isGranted(appPermissions.announcement.update) && (
                      <Col span={12}>
                        <Button type="primary" onClick={() => this.onShowPerview()}>
                          {L('BTN_PUBLISH')}
                        </Button>
                      </Col>
                    )}
                  {(editAnnouncement.id && editAnnouncement?.statusCode === announcementStatus.failed) ||
                    (editAnnouncement?.statusCode === announcementStatus.completed &&
                      this.isGranted(appPermissions.announcement.update) && (
                        <Col span={12}>
                          <Button type="primary" onClick={() => this.onShowPerview()}>
                            {L('BTN_PUBLISH_AGAIN')}
                          </Button>
                        </Col>
                      ))}
                </Row>
              }>
              <Tabs.TabPane tab={this.L(tabKeys.announcementContent)} key={tabKeys.announcementContent}>
                <Card>
                  <Row>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Row gutter={[16, 0]}>
                        <Col sm={{ span: 24, offset: 0 }}>
                          <Form.Item
                            label={L('ANNOUNCEMENT_SUBJECT')}
                            {...formVerticalLayout}
                            name={'subject'}
                            rules={this.state.isSms == true ? rules.subjectSms : rules.subject}>
                            <Input disabled={editAnnouncement?.statusCode === announcementStatus.completed} />
                          </Form.Item>
                        </Col>

                        <Col sm={{ span: 24, offset: 0 }}>
                          <Form.Item
                            rules={rules.subject}
                            style={this.state.isSms === true ? { display: 'none' } : { display: '' }}
                            label={L('TEMPLATE_CONTENT')}
                            {...formVerticalLayout}
                            name={['content', 'htmlText']}>
                            <SyncfutionRichText isNotEdit={this.state.isNotEdit} />
                          </Form.Item>
                          {/* )} */}
                        </Col>
                      </Row>
                    </Col>
                    <Col
                      sm={{ span: 24, offset: 0 }}
                      style={this.state.isSms === true ? { display: 'none' } : { display: '' }}>
                      <FileUploadWrapV2
                        multiple
                        height={100}
                        acceptedFileTypes={fileTypeGroup.documentAndImage}
                        maxSize={25}
                        parentId={this.props.params?.id ? editAnnouncement?.uniqueId : undefined}
                        fileStore={this.props.fileStore}
                        onRemoveFile={this.onRemoveFile}
                        beforeUploadFile={this.beforeUploadFile}
                        disabled={this.state.isSms == true ? true : !!editAnnouncement?.uniqueId}></FileUploadWrapV2>
                    </Col>
                  </Row>
                  <PreviewAnnouncement
                    statusCode={editAnnouncement?.statusCode || null}
                    files={this.state.files}
                    data={this.state.previewData}
                    visible={this.state.showPreview}
                    onCancel={this.onCancelShowPreview}
                    onOk={this.publishAnnouncement}
                  />
                </Card>
              </Tabs.TabPane>
              <Tabs.TabPane tab={this.L(tabKeys.announcementUsers)} key={tabKeys.announcementUsers}>
                {!editAnnouncement.id && (
                  <Row gutter={[4, 4]}>
                    <Col span={24} style={{ textAlign: 'right' }}>
                      <Button size="middle" className="mr-2" onClick={this.refreshUsers}>
                        {L('UPDATE_USER_RECEIVER')}
                      </Button>
                    </Col>
                    <Col span={24}>
                      <Table
                        locale={{
                          emptyText: (
                            <Empty description={<span style={{ color: 'red' }}>{L('ANNOUNCEMENT_NO_DATA')}</span>} />
                          )
                        }}
                        size="middle"
                        className="custom-ant-table"
                        rowKey={(record: any) => record.key}
                        columns={columnsBeforeSend}
                        pagination={false}
                        loading={this.props.announcementStore.isLoading}
                        dataSource={announcementUserLogs?.items || []}
                        scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
                      />
                    </Col>
                  </Row>
                )}
                {!!editAnnouncement.id && (
                  <>
                    <Filter>
                      <Row gutter={[16, 8]}>
                        <Col sm={{ span: 6, offset: 0 }}>
                          <label>{this.L('FILTER_KEYWORD')}</label>
                          <Search
                            placeholder={this.keywordPlaceholder}
                            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
                            onSearch={(value) => this.handleSearch('keyword', value)}
                          />
                        </Col>
                      </Row>
                    </Filter>
                    <DataTable
                      pagination={{
                        pageSize: this.state.maxResultCount,
                        current: this.currentPage,
                        total: announcementUserLogs === undefined ? 0 : announcementUserLogs.totalCount,
                        onChange: this.handleTableChange
                      }}
                      createPermission={appPermissions.announcement.create}>
                      <Table
                        locale={{
                          emptyText: (
                            <Empty description={<span style={{ color: 'red' }}>{L('ANNOUNCEMENT_NO_DATA')}</span>} />
                          )
                        }}
                        size="middle"
                        className="custom-ant-table"
                        rowKey={(record) => record.id}
                        columns={columnsAfterSend}
                        // loading={this.props.announcementStore.isLoadingLogUser}
                        pagination={false}
                        dataSource={announcementUserLogs === undefined ? [] : announcementUserLogs.items}
                        scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
                      />
                    </DataTable>
                  </>
                )}
              </Tabs.TabPane>
            </Tabs>
          </Form>
        </WrapPageScroll>
      ) : (
        <div className="d-flex justify-content-center align-items-center w-100 mt-3" style={{ height: '50vh' }}>
          <Spin size="large" />
        </div>
      )
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(AnnouncementDetail)
