import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { Card, Col, Form, Input, Row, Select, DatePicker, Tabs, Button, Modal, InputNumber, Switch, Table } from 'antd'
import { isGranted, isGrantedAny, L, LNotification } from '@lib/abpUtility'
import rules from './validation'
import AppConsts, {
  dateFormat,
  appPermissions,
  fileTypeGroup,
  defaultAvatar,
  moduleIds,
  servicePlanEnum,
  appStatusColors
} from '@lib/appconst'
import Stores from '@stores/storeIdentifier'
import WrapPageScroll from '@components/WrapPageScroll'
import UserStore from '@stores/administrator/userStore'
import { validateMessages } from '@lib/validation'
import AppComponentBase from '@components/AppComponentBase'
import ProjectStore from '@stores/project/projectStore'
import AuditLogStore from '@stores/common/auditLogStore'
import CommentStore from '@stores/common/commentStore'
import SessionStore from '@stores/sessionStore'
import FileStore from '@stores/common/fileStore'
import ReminderStore from '@stores/common/reminderStore'
import CommentList from '@components/CommentList'
import Reminder from '@components/Reminder'
import AuditLog from '@components/AuditLog'
import Recurring from '@components/Recurring'
import staffService from '@services/member/staff/staffService'
import withRouter from '@components/Layout/Router/withRouter'
import dayjs from 'dayjs'
import FileUploadWrapV2 from '@components/FileUploadV2'
import NoRole from '@components/ComponentNoRole'
import handoverService from '@services/handover/handoverService'
import { inputNumberFormatter } from '@lib/helper'
import ServicePlanStore from '@stores/planSanitation/planSanitationStore'
import { CheckCircleFilled, CloseCircleFilled, DeleteOutlined, EditFilled, MinusOutlined } from '@ant-design/icons'
import { EditableCell } from '@components/DataTableV2/EditableCell'
import columnsNote from './columnsNote'
import { v4 as uuid } from 'uuid'
import renovationService from '@services/ticketRequest/renovationService'
import { portalLayouts } from '@components/Layout/Router/router.config'

const { formVerticalLayout, timeUnits, align } = AppConsts
const moduleId = moduleIds.SanitationAndBonsai
const confirm = Modal.confirm
const { TabPane } = Tabs
const Option = Select.Option as any

const tabKeys = {
  tabInfo: 'PLANED_MAINTENANCE_TAB_INFO',
  tabComment: 'PLANED_MAINTENANCE_TAB_COMMENTS',
  tabAuditLog: 'PLANED_MAINTENANCE_TAB_AUDIT_LOG'
}

export interface IPlanMaintenanceWeeklyDetailProps {
  params: any
  navigate: any
  projectStore: ProjectStore
  servicePlanStore: ServicePlanStore
  fileStore: FileStore
  userStore: UserStore
  auditLogStore: AuditLogStore
  commentStore: CommentStore
  sessionStore: SessionStore
  reminderStore: ReminderStore
  sources: any
  targetLanguages: any
}

@inject(
  Stores.ProjectStore,
  Stores.UserStore,
  Stores.ServicePlanStore,
  Stores.FileStore,
  Stores.CommentStore,
  Stores.AuditLogStore,
  Stores.SessionStore,
  Stores.ReminderStore
)
@observer
class PlanMaintenanceWeeklyDetail extends AppComponentBase<IPlanMaintenanceWeeklyDetailProps> {
  state = {
    isDirty: false,
    userId: undefined,
    uniqueId: '',
    tabActiveKey: tabKeys.tabInfo,
    filterResidentUnits: {},
    projectId: undefined,
    files: [] as any,
    afterFiles: [] as any,
    filesVideo: [] as any,
    assigners: [],
    observers: [],
    idDocument: undefined,
    assignedIds: [],
    watcherIds: [],
    listFloor: [] as any,
    listZone: [] as any,
    note: [] as any,
    previousDataRow: undefined,
    visibleAction: false,
    isShowAssets: false
  }
  formRef: any = React.createRef()
  formRefNote: any = React.createRef()

  isEditing = (record: any) => record.id === this.state.uniqueId

  async componentDidMount() {
    isGranted(appPermissions.servicePlan.detail) &&
      (await Promise.all([
        this.getDetail(this.props.params?.id),
        this.findEmployees(''),
        this.findObservers(''),
        this.getListZone(),

        this.props.servicePlanStore.getPriorityOptions({
          moduleId,
          culture: 'en'
        }),
        this.props.servicePlanStore.getStatusOptions({
          moduleId,
          culture: 'en'
        }),
        this.getListFloor()
      ]))
  }

  getListFloor = async () => {
    const listFloor = await handoverService.getListFloor({})

    this.setState({ listFloor })
  }

  getListZone = async () => {
    const listZone = await renovationService.getListZone()

    this.setState({ listZone })
  }

  buildDisplayName = () => {
    let name = this.formRef.current.getFieldValue('name') || ''
    let surname = this.formRef.current.getFieldValue('surname') || ''
    if (name.length && surname.length) {
      name = name.trim()
      surname = surname.trim()
      this.setState({
        displayNames: [`${name} ${surname}`, `${surname} ${name}`]
      })
    }
  }

  // getUsersInTeamOptions = async (teamId: number) => {
  //   await this.props.teamStore.filterUsersInTeamOptions({ teamId })
  // }

  getDetail = async (id?) => {
    const { servicePlanStore, reminderStore } = this.props
    if (!id) {
      await servicePlanStore.createPlanSanitation()

      reminderStore.resetReminder()
      await servicePlanStore.seteditPlanSanitation('projectId', this.props.sessionStore.project.id)
    } else {
      await servicePlanStore.get(id)

      this.setState({
        idDocument: this.props.servicePlanStore.editPlanSanitation.documentId
      })
      const assignedUserIds = servicePlanStore.editPlanSanitation.assignedUsers
        ? [servicePlanStore.editPlanSanitation.assignedUsers]
        : []
      const watcherUserIds = servicePlanStore.editPlanSanitation.watcherUsers
        ? [servicePlanStore.editPlanSanitation.watcherUsers]
        : []
      this.setState({
        assignedUserIds,
        watcherUserIds,
        note: servicePlanStore.editPlanSanitation?.servicePlanNotes
      })
      // await this.getUsersInTeamOptions(servicePlanStore.editPlanSanitation.teamId)
      await reminderStore.getReminder(moduleId, id)
    }
    if (servicePlanStore.editPlanSanitation?.recurring) {
      this.formRef.current.setFieldsValue({
        recurringChecked: true,
        recurringName: servicePlanStore.editPlanSanitation.recurring.name,
        recurringStartTime: dayjs('01/01/2021 ' + (servicePlanStore.editPlanSanitation.recurring.startTime || '00:00')),
        recurringEndTime: dayjs('01/01/2021 ' + (servicePlanStore.editPlanSanitation.recurring.endTime || '00:00')),
        recurringDate: [
          dayjs(servicePlanStore.editPlanSanitation.recurring.startFrequency),
          dayjs(servicePlanStore.editPlanSanitation.recurring.endFrequency)
        ],
        recurringFrequency: servicePlanStore.editPlanSanitation.recurring.frequency,
        recurringFrequencyRepeat: servicePlanStore.editPlanSanitation.recurring.frequencyRepeat.split(',')
      })
    }

    const assignedIds = servicePlanStore.editPlanSanitation.assignedUsers?.map((item) => item?.id)
    this.setState({ assignedIds })

    const watcherIds = servicePlanStore.editPlanSanitation.watcherUsers?.map((item) => item.id)
    this.setState({ watcherIds })

    this.formRef.current.setFieldsValue({
      ...servicePlanStore.editPlanSanitation,
      assignedIds: this.state.assignedIds,
      watcherIds: this.state.watcherIds,
      startDate: id ? this.props.servicePlanStore.editPlanSanitation?.startDate : dayjs()
    })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
    if (tabKey === tabKeys.tabComment) {
      const params = {
        conversationUniqueId: this.props.servicePlanStore?.editPlanSanitation?.guid,
        moduleId: moduleId,
        maxResultCount: 10,
        skipCount: 0,
        isIncludeFile: true,
        isPrivate: false
      }
      this.props.commentStore.getAll(params)
    }
  }

  findEmployees = async (keyword) => {
    const assigners = await staffService.filterWfAssigner({
      keyword,
      moduleId: moduleId
    })
    this.setState({ assigners })
  }

  findObservers = async (keyword) => {
    const observers = await staffService.filterWfWatcher({
      keyword,
      moduleId: moduleId
    })
    this.setState({ observers })
  }

  onSave = () => {
    const { servicePlanStore, reminderStore } = this.props
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      this.setState({ loading: true })
      // Add recurring object -----------------------------------
      if (values.recurringChecked) {
        values.recurring = {
          name: values.recurringName,
          startTime: dayjs(values.recurringStartTime).format('HH:mm'),
          endTime: dayjs(values.recurringEndTime).format('HH:mm'),
          startFrequency: dayjs(values.recurringDate[0]).toISOString(),
          endFrequency: dayjs(values.recurringDate[1]).toISOString(),
          frequency: values.recurringFrequency,
          frequencyRepeat: values.recurringFrequencyRepeat.join()
        }
      } else {
        delete values.recurring
        delete servicePlanStore.editPlanSanitation.recurring
      }
      delete values.recurringName
      delete values.recurringChecked
      delete values.recurringStartTime
      delete values.recurringEndTime
      delete values.recurringDate
      delete values.recurringFrequency
      delete values.recurringFrequencyRepeat
      //-------------------------------------------------------

      if (servicePlanStore.editPlanSanitation?.id) {
        await servicePlanStore.update(
          {
            ...servicePlanStore.editPlanSanitation,
            type: servicePlanEnum.SANITTION,
            ...values,
            servicePlanNotes: this.state.note.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            }))
          },
          this.state.files,
          this.state.afterFiles,
          this.state.filesVideo
        )

        await reminderStore.updateReminder(moduleId, servicePlanStore.editPlanSanitation?.id, timeUnits.hours, true)
        servicePlanStore.setIsLoading(false)
      } else {
        const body = {
          ...this.props.servicePlanStore.editPlanSanitation,
          ...values,
          type: servicePlanEnum.SANITTION,
          servicePlanNotes: this.state.note.map((item) => ({
            ...item,
            id: typeof item.id !== 'number' ? 0 : item.id
          }))
        }
        await servicePlanStore.create(body, this.state.files, this.state.filesVideo)
        if (reminderStore.editReminder.isActive) {
          await reminderStore.updateReminder(
            moduleId,
            this.props.servicePlanStore.editPlanSanitation.id,
            timeUnits.hours,
            true
          )
        }
        await servicePlanStore.createPlanSanitation()
        servicePlanStore.setIsLoading(false)
      }

      this.setState({ loading: false })
      form.resetFields()
      this.props.navigate(portalLayouts.planSanitation.path)
    })
  }

  onCancel = () => {
    const form = this.formRef.current
    if (this.state.isDirty) {
      confirm({
        title: LNotification('ARE_YOU_SURE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          this.props.navigate(portalLayouts.planSanitation.path)
        }
      })
      return
    }
    this.props.servicePlanStore.createPlanSanitation()
    this.props.userStore.editUserProfilePicture = defaultAvatar
    form.resetFields()
    this.props.navigate(portalLayouts.planSanitation.path)
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
            isGrantedAny(appPermissions.servicePlan.create, appPermissions.servicePlan.update) && (
              <Button
                type="primary"
                disabled={this.props.params?.id && !isGranted(appPermissions.servicePlan.update)}
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

  onRemoveFile = (file: any) => {
    const index = this.state.files.indexOf(file)
    const newFileList = [...this.state.files]
    newFileList.splice(index, 1)
    this.setState({ files: newFileList })
  }

  onRemoveFileVideo = (file: any) => {
    const index = this.state.filesVideo.indexOf(file)
    const newFileList = [...this.state.filesVideo]
    newFileList.splice(index, 1)
    this.setState({ filesVideo: newFileList })
  }

  beforeUploadFile = (file) => {
    this.setState({ files: [...this.state.files, file] })
    return false
  }

  UploadFileVideo = (file) => {
    this.setState({ filesVideo: [...this.state.filesVideo, file] })
    return false
  }

  afterUploadFile = (file) => {
    this.setState({ afterFiles: [...this.state.afterFiles, file] })
    return false
  }
  onRemoveFileAfter = (file) => {
    const index = this.state.afterFiles.indexOf(file)
    const newFileList = [...this.state.afterFiles]
    newFileList.splice(index, 1)
    this.setState({ afterFiles: newFileList })
  }

  renderEmailOptions = (items) => {
    const children: any = []
    items.forEach((item, index) => {
      children.push(<Option key={index}>{item}</Option>)
    })
    return children
  }

  handleSaveRow = async (id: any) => {
    const values = await this.formRefNote.current.validateFields()
    const foundItem = this.state.note.find((item) => item.id === this.state.uniqueId)

    if (id === undefined) {
      Object.assign(foundItem, values)
    } else {
      values.id = id
      if (foundItem) {
        Object.assign(foundItem, values)
      }
    }

    this.setState({ visibleAction: false })
    this.setState({ uniqueId: '' })
    this.setState({ previousDataRow: undefined })
  }

  handleCancelRow = async (id) => {
    if (this.state.previousDataRow === undefined) {
      const newNote = this.state.note.filter((item) => item.id !== id)
      this.setState({ note: newNote })
    }
    this.setState({ visibleAction: false })
    this.setState({ uniqueId: '' })
    this.setState({ previousDataRow: undefined })
  }

  hanldeDeleteRow = (id) => {
    const newNote = this.state.note.filter((item) => item.id !== id)
    this.setState({ note: newNote })
  }

  handleAddRow = () => {
    this.setState({ visibleAction: true })
    this.formRefNote.current.resetFields()
    const newRow = { id: uuid() }

    const newData = [...this.state.note]

    newData.unshift(newRow)

    this.setState({ note: newData })
    this.setState({ uniqueId: newRow.id })
  }

  renderInformation = () => {
    const {
      fileStore,
      servicePlanStore: { priorityOptions, statusOptions }
    } = this.props

    const { assigners, observers } = this.state

    const columns = columnsNote(
      {
        title: L('FILE_DOCUMENT_ACTION'),
        dataIndex: 'action',
        key: 'action',
        fixed: align.right,
        align: align.center,
        width: '10%',
        render: (_, row) => {
          return this.state.uniqueId === row.id ? (
            <div className="d-flex justify-content-center w-100 ">
              <Button
                type="text"
                icon={<CheckCircleFilled style={{ color: appStatusColors.success }} />}
                onClick={() => this.handleSaveRow(row.id)}
              />
              <Button
                type="text"
                icon={<CloseCircleFilled style={{ color: appStatusColors.error }} />}
                onClick={() => this.handleCancelRow(row.id)}
              />
            </div>
          ) : (
            <div className="d-flex justify-content-center w-100 ">
              <Button
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<EditFilled />}
                onClick={() => {
                  this.formRefNote.current.setFieldsValue({
                    ...row
                  })
                  this.setState({ uniqueId: row?.id, visibleAction: true, previousDataRow: { ...row } })
                }}
                disabled={this.state.visibleAction && this.state.uniqueId !== row.id}
              />
              <Button
                size="small"
                shape="circle"
                icon={<DeleteOutlined />}
                onClick={() => this.hanldeDeleteRow(row.id)}
                disabled={this.state.visibleAction && this.state.uniqueId !== row.id}
              />
            </div>
          )
        }
      },
      this.isEditing,
      this.state.listZone.map((item) => ({ id: item?.id, name: item?.zoneName }))
    )

    return isGranted(appPermissions.servicePlan.detail) ? (
      <Row gutter={[16, 20]}>
        <Card className="full-width">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item label={L('PLANED_MAINTENANCE_NAME')} {...formVerticalLayout} name="name" rules={rules.name}>
                <Input onChange={this.buildDisplayName} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PLANED_MAINTENANCE_PERSON_IN_CHARGE')}
                {...formVerticalLayout}
                name="assignedIds"
                rules={rules.assignedIds}>
                <Select
                  style={{ width: '100%' }}
                  mode="multiple"
                  showSearch
                  filterOption={false}
                  onSearch={this.findEmployees}
                  allowClear>
                  {this.renderOptions(assigners)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PLANED_MAINTENANCE_OBSERVED_BY')}
                {...formVerticalLayout}
                name="watcherIds"
                rules={rules.watcherIds}>
                <Select
                  style={{ width: '100%' }}
                  mode="multiple"
                  showSearch
                  filterOption={false}
                  onSearch={this.findObservers}
                  allowClear>
                  {this.renderOptions(observers)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PLANED_MAINTENANCE_STATUS')}
                {...formVerticalLayout}
                name="statusId"
                rules={rules.statusId}>
                <Select style={{ width: '100%' }}>{this.renderOptions(statusOptions)}</Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item label={L('PLANED_MAINTENANCE_PRIORITY')} {...formVerticalLayout} name="priorityId">
                <Select style={{ width: '100%' }}>{this.renderOptions(priorityOptions)}</Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PLANED_MAINTENANCE_START_DATE')}
                {...formVerticalLayout}
                name="startDate"
                rules={rules.startDate}>
                <DatePicker className="full-width" format={dateFormat} placeholder={L('SELECT_DATE')} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item label={L('PLANED_MAINTENANCE_END_DATE')} {...formVerticalLayout} name="endDate">
                <DatePicker className="full-width" format={dateFormat} placeholder={L('SELECT_DATE')} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PLANED_MAINTENANCE_ACTUAL_START_DATE')}
                {...formVerticalLayout}
                name="actualStartDate">
                <DatePicker className="full-width" format={dateFormat} placeholder={L('SELECT_DATE')} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item label={L('PLANED_MAINTENANCE_ACTUAL_END_DATE')} {...formVerticalLayout} name="actualEndDate">
                <DatePicker className="full-width" format={dateFormat} placeholder={L('SELECT_DATE')} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('PLANED_SANITATION_FLOORS')} {...formVerticalLayout} name="floorIds">
                <Select className="full-width" mode="multiple">
                  {this.state.listFloor.map((item, index) => (
                    <Select.Option key={index} value={item?.id}>
                      {item?.buildingCode} - {item?.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item label={L('PLANED_SANITATION_FEE')} {...formVerticalLayout} name="additionalFee">
                <InputNumber min={0} className="full-width" formatter={(value) => inputNumberFormatter(value)} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item label={L('COMPANY_CONTRACCTOR_NAME')} {...formVerticalLayout} name="contructorName">
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }} xs={{ span: 24 }} className="mt-2">
              <label className="title-detail">{L('PLANED_SANITATION_NOTE')}</label>
            </Col>
            <Col sm={{ span: 24, offset: 0 }} className="mt-2">
              <Form ref={this.formRefNote} layout={'vertical'} size="middle" validateMessages={validateMessages}>
                <Table
                  bordered
                  pagination={false}
                  size="small"
                  components={{ body: { cell: EditableCell } }}
                  dataSource={this.state.note}
                  columns={columns}
                  rowKey={(record) => record.id}
                />
              </Form>
              <style scoped>
                {`
                  .ant-table-wrapper {
                     margin-bottom: 0px
                   }
                `}
              </style>
              <Button type="primary" className="w-100" onClick={this.handleAddRow} disabled={this.state.visibleAction}>
                {L('ADD_NEW_ROW')}
              </Button>
            </Col>
          </Row>
          <Reminder moduleId={moduleId} parentId={this.props.params?.id} timeUnit={timeUnits.days} />
          <Recurring
            recrurringStatus={this.props.servicePlanStore.editPlanSanitation.recurring}
            resetFrequencyRepeat={() =>
              this.formRef.current.setFieldsValue({
                recurringFrequencyRepeat: []
              })
            }
          />

          {/* ASSETS USE */}
          <Row gutter={[16, 0]}>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
              <Form.Item label={L('IS_USE_ASSETS')} {...formVerticalLayout} valuePropName="checked" name="isUseAssets">
                <Switch onChange={() => this.setState({ isShowAssets: !this.state.isShowAssets })} />
              </Form.Item>
            </Col>
            {this.state.isShowAssets && (
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.List name="assets">
                  {(fields, { add, remove }) => {
                    return (
                      <Row gutter={[2, 2]}>
                        {fields.map((field, index) => (
                          <Col sm={{ span: 24, offset: 0 }} key={field.key}>
                            <Row gutter={[4, 0]} className="pt-3 d-flex align-items-center">
                              <Col sm={{ span: 8, offset: 0 }}>
                                <Form.Item
                                  rules={[{ required: true }]}
                                  label={L('ITEM_ASSET_NAME')}
                                  name={[field.name, 'name']}>
                                  <Input />
                                </Form.Item>
                              </Col>
                              <Col sm={{ span: 8, offset: 0 }}>
                                <Form.Item
                                  rules={[{ required: true }]}
                                  label={L('ITEM_ASSET_QUANLITY')}
                                  name={[field.name, 'quanlity']}>
                                  <InputNumber className="full-width" />
                                </Form.Item>
                              </Col>
                              <Col sm={{ span: 7, offset: 0 }}>
                                <Form.Item
                                  rules={[{ required: true }]}
                                  label={L('ITEM_ASSET_USE_IN_FLOOR')}
                                  name={[field.name, 'floorUse']}>
                                  <Input />
                                </Form.Item>
                              </Col>

                              <Col sm={{ span: 1, offset: 0 }}>
                                <Button type="dashed" shape="round" size="small" onClick={() => remove(index)}>
                                  <MinusOutlined />
                                </Button>
                              </Col>
                            </Row>
                          </Col>
                        ))}
                        <Col sm={{ span: 12, offset: 0 }}>
                          <Form.Item>
                            <Button type="primary" onClick={() => add()}>
                              {L('BTN_ADD_RESIDENT')}
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                    )
                  }}
                </Form.List>
              </Col>
            )}

            {/*END ASSETS USE */}
          </Row>
        </Card>
        <Card className="full-width">
          <Col md={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
            <h3>{L('PLANMAINTENANCE_DOCUMENT')}</h3>

            <Row gutter={[24, 24]}>
              <Col md={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
                <strong>{L('BEFORE_PLAINTENANCE_UPDATE')}</strong>
                <FileUploadWrapV2
                  multiple
                  parentId={this.state.idDocument}
                  fileStore={this.props.fileStore}
                  onRemoveFile={this.onRemoveFile}
                  beforeUploadFile={this.beforeUploadFile}
                  acceptedFileTypes={[...fileTypeGroup.images, ...fileTypeGroup.documents, ...fileTypeGroup.videos]}
                  maxSize={25}
                  totalSize={50}
                  specialModuleName="PLANMAINTENANCEBEFORE"
                />
              </Col>
            </Row>
            {this.props.params.id && (
              <Row gutter={[24, 30]}>
                <Col md={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
                  <strong>{L('AFTER_PLAINTENANCE_UPDATE')}</strong>
                  <FileUploadWrapV2
                    multiple
                    parentId={this.state.idDocument}
                    fileStore={fileStore}
                    onRemoveFile={this.onRemoveFileAfter}
                    beforeUploadFile={this.afterUploadFile}
                    acceptedFileTypes={[...fileTypeGroup.images, ...fileTypeGroup.documents, ...fileTypeGroup.videos]}
                    maxSize={25}
                    totalSize={50}
                    specialModuleName="PLANMAINTENANCEAFTER"
                  />
                </Col>
              </Row>
            )}
            <Row gutter={[24, 24]}>
              <Col md={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
                <strong>{L('VIDEO_PLAINTENANCE_UPDATE')}</strong>
                <FileUploadWrapV2
                  parentId={this.state.idDocument}
                  fileStore={this.props.fileStore}
                  onRemoveFile={this.onRemoveFileVideo}
                  beforeUploadFile={this.UploadFileVideo}
                  acceptedFileTypes={[...fileTypeGroup.video]}
                  maxFile={1}
                  maxSize={25}
                  specialModuleName="PLANMAINTENANCEVIDEO"
                />
              </Col>
            </Row>
          </Col>
        </Card>
      </Row>
    ) : (
      <NoRole />
    )
  }

  render() {
    const {
      servicePlanStore: { isLoading, editPlanSanitation }
    } = this.props

    return (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Form
          ref={this.formRef}
          layout={'vertical'}
          onAbort={this.onCancel}
          onValuesChange={() => this.setState({ isDirty: true })}
          validateMessages={validateMessages}
          initialValues={this.props.servicePlanStore.editPlanSanitation}
          size="middle">
          <Tabs type="card" activeKey={this.state.tabActiveKey} onTabClick={this.changeTab}>
            <Tabs.TabPane tab={L(tabKeys.tabInfo)} key={tabKeys.tabInfo}>
              {this.renderInformation()}
            </Tabs.TabPane>
            <TabPane tab={L(tabKeys.tabComment)} key={tabKeys.tabComment} disabled={!editPlanSanitation?.guid}>
              <CommentList
                moduleId={moduleId}
                parentId={editPlanSanitation?.guid}
                commentStore={this.props.commentStore}
                sessionStore={this.props.sessionStore}
                isPrivate={false}
              />
            </TabPane>
            <TabPane tab={L(tabKeys.tabAuditLog)} key={tabKeys.tabAuditLog} disabled={!editPlanSanitation?.id}>
              <AuditLog
                moduleId={moduleId}
                parentId={editPlanSanitation?.id}
                auditLogStore={this.props.auditLogStore}
              />
            </TabPane>
          </Tabs>
        </Form>
      </WrapPageScroll>
    )
  }
}

export default withRouter(PlanMaintenanceWeeklyDetail)
