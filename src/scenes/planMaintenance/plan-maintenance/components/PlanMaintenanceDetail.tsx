import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { v4 as uuid } from 'uuid'

import { Card, Col, Form, Input, Row, Select, DatePicker, Tabs, Button, Modal, Badge, Table } from 'antd'
import { isGranted, isGrantedAny, L, LNotification } from '@lib/abpUtility'
import rules from './validation'
import AppConsts, {
  dateFormat,
  appPermissions,
  fileTypeGroup,
  defaultAvatar,
  moduleIds,
  appStatusColors
} from '@lib/appconst'
import Stores from '@stores/storeIdentifier'
import WrapPageScroll from '@components/WrapPageScroll'
import UserStore from '@stores/administrator/userStore'
import { validateMessages } from '@lib/validation'
import AppComponentBase from '@components/AppComponentBase'
import ProjectStore from '@stores/project/projectStore'
import AssetStore from '@stores/facility/assetStore'
import AuditLogStore from '@stores/common/auditLogStore'
import CommentStore from '@stores/common/commentStore'
import SessionStore from '@stores/sessionStore'
import PlanMaintenanceStore from '@stores/planMaintenance/planMaintenanceStore'
import FileStore from '@stores/common/fileStore'
import ReminderStore from '@stores/common/reminderStore'
import { AsyncSelect, asyncSelectType } from '@components/Select/AsyncSelect'
import CommentList from '@components/CommentList'
import Reminder from '@components/Reminder'
import AuditLog from '@components/AuditLog'
import Recurring from '@components/Recurring'
import staffService from '@services/member/staff/staffService'
import withRouter from '@components/Layout/Router/withRouter'
import dayjs from 'dayjs'
import FileUploadWrapV2 from '@components/FileUploadV2'
import NoRole from '@components/ComponentNoRole'
import companyService from '@services/project/companyService'
import { debounce } from 'lodash'
import { EditableCell } from '@components/DataTableV2/EditableCell'
import { CheckCircleFilled, CloseCircleFilled, DeleteOutlined, EditFilled } from '@ant-design/icons'
import columnNote from './columnNote'
import renovationService from '@services/ticketRequest/renovationService'

const { formVerticalLayout, timeUnits, align } = AppConsts
const moduleId = moduleIds.planMaintenance
const confirm = Modal.confirm
const { TabPane } = Tabs
const Option = Select.Option as any

const tabKeys = {
  tabInfo: 'PLANED_MAINTENANCE_TAB_INFO',
  tabComment: 'PLANED_MAINTENANCE_TAB_COMMENTS',
  tabAuditLog: 'PLANED_MAINTENANCE_TAB_AUDIT_LOG'
}

export interface IPlanMaintenanceFormProps {
  params: any
  navigate: any
  projectStore: ProjectStore
  planMaintenanceStore: PlanMaintenanceStore
  fileStore: FileStore
  userStore: UserStore
  assetStore: AssetStore
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
  Stores.PlanMaintenanceStore,
  Stores.FileStore,
  Stores.AssetStore,
  Stores.CommentStore,
  Stores.AuditLogStore,
  Stores.SessionStore,
  Stores.ReminderStore
)
@observer
class PlanMaintenanceDetail extends AppComponentBase<IPlanMaintenanceFormProps> {
  state = {
    isDirty: false,
    userId: undefined,
    tabActiveKey: tabKeys.tabInfo,
    filterResidentUnits: {},
    projectId: undefined,
    files: [] as any,
    afterFiles: [] as any,
    filesVideo: [] as any,
    assets: [],
    assigners: [],
    observers: [],
    idDocument: undefined,
    assignedIds: [],
    watcherIds: [],
    listCompany: [] as any,
    // listUserInCompany: [] as any,
    listZone: [] as any,
    note: [] as any,
    visibleAction: false,
    previousDataRow: undefined,
    uniqueId: ''
  }
  formRef: any = React.createRef()
  formRefNote: any = React.createRef()

  isEditing = (record: any) => record.id === this.state.uniqueId

  async componentDidMount() {
    isGranted(appPermissions.planMaintenanceRecurring.detail) &&
      (await Promise.all([
        this.getDetail(this.props.params?.id),
        this.props.planMaintenanceStore.getPriorityOptions({
          moduleId,
          culture: 'en'
        }),
        this.props.planMaintenanceStore.getStatusOptions({
          moduleId,
          culture: 'en'
        }),
        this.findEmployees(''),
        this.findObservers(''),
        this.getistCompanies(''),
        this.getListZone()
      ]))
  }

  getistCompanies = debounce(async (keyword?) => {
    const listCompany = await companyService.getListCompany({ keyword })

    this.setState({ listCompany })
  }, 300)

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
    const { planMaintenanceStore, reminderStore } = this.props
    if (!id) {
      await planMaintenanceStore.createPlanMaintenance()

      reminderStore.resetReminder()
      await planMaintenanceStore.setEditPlanMaintenance('projectId', this.props.sessionStore.project.id)
    } else {
      await planMaintenanceStore.get(id)

      // this.onFillInfoCompany(this.props.planMaintenanceStore.editPlanMaintenance?.companyId)
      this.setState({
        idDocument: this.props.planMaintenanceStore.editPlanMaintenance.documentId
      })
      const assignedUserIds = planMaintenanceStore.editPlanMaintenance.assignedUsers
        ? [planMaintenanceStore.editPlanMaintenance.assignedUsers]
        : []
      const watcherUserIds = planMaintenanceStore.editPlanMaintenance.watcherUsers
        ? [planMaintenanceStore.editPlanMaintenance.watcherUsers]
        : []
      this.setState({
        assets: planMaintenanceStore.editPlanMaintenance.assets,
        assignedUserIds,
        watcherUserIds,
        note: planMaintenanceStore.editPlanMaintenance?.servicePlanNotes || []
      })
      // await this.getUsersInTeamOptions(planMaintenanceStore.editPlanMaintenance.teamId)
      await reminderStore.getReminder(moduleId, id)
    }
    if (planMaintenanceStore.editPlanMaintenance.recurring) {
      this.formRef.current.setFieldsValue({
        recurringChecked: true,
        recurringName: planMaintenanceStore.editPlanMaintenance.recurring.name,
        recurringStartTime: dayjs(
          '01/01/2021 ' + (planMaintenanceStore.editPlanMaintenance.recurring.startTime || '00:00')
        ),
        recurringEndTime: dayjs(
          '01/01/2021 ' + (planMaintenanceStore.editPlanMaintenance.recurring.endTime || '00:00')
        ),
        recurringDate: [
          dayjs(planMaintenanceStore.editPlanMaintenance.recurring.startFrequency),
          dayjs(planMaintenanceStore.editPlanMaintenance.recurring.endFrequency)
        ],
        recurringFrequency: planMaintenanceStore.editPlanMaintenance.recurring.frequency,
        recurringFrequencyRepeat: planMaintenanceStore.editPlanMaintenance.recurring.frequencyRepeat.split(',')
      })
    }

    const assignedIds = planMaintenanceStore.editPlanMaintenance.assignedUsers?.map((item) => item?.id)
    this.setState({ assignedIds })

    const watcherIds = planMaintenanceStore.editPlanMaintenance.watcherUsers?.map((item) => item.id)
    this.setState({ watcherIds })

    this.formRef.current.setFieldsValue({
      ...planMaintenanceStore.editPlanMaintenance,
      assignedIds: this.state.assignedIds,
      watcherIds: this.state.watcherIds,
      startDate: id ? this.props.planMaintenanceStore.editPlanMaintenance?.startDate : dayjs()
    })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
    if (tabKey === tabKeys.tabComment) {
      const params = {
        conversationUniqueId: this.props.planMaintenanceStore?.editPlanMaintenance?.guid,
        moduleId: moduleIds.planMaintenance,
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
      moduleId: moduleIds.planMaintenance
    })
    this.setState({ assigners })
  }

  findObservers = async (keyword) => {
    const observers = await staffService.filterWfWatcher({
      keyword,
      moduleId: moduleIds.planMaintenance
    })
    this.setState({ observers })
  }

  onChangeAsset = (assetId, option) => {
    this.setState({
      assets: [...this.state.assets, { label: option.children[0], value: option.value }]
    })
  }

  handleRemoveAsset = (asset, index) => () => {
    const { assets } = this.state
    assets.splice(index, 1)
    this.setState({ assets })
  }

  onSendMaill = async () => {
    // await this.props.planMaintenanceStore.sendNotiMaintenancePlan(
    //   this.props.planMaintenanceStore?.editPlanMaintenance?.id
    // )
  }

  onSave = (isSendMall) => {
    const { planMaintenanceStore, reminderStore } = this.props
    const form = this.formRef.current
    const values = form.getFieldsValue()
    console.log(values)
    form.validateFields().then(async (values: any) => {
      values.assetIds = this.state.assets.map((item: any) => item.value)
      this.setState({ loading: true })
      // Add recurring object -----------------------------------
      if (values.recurringChecked) {
        values.recurring = {
          name: values.recurringName,
          // startTime: dayjs(values.recurringStartTime).format('HH:mm'),
          // endTime: dayjs(values.recurringEndTime).format('HH:mm'),
          startFrequency: dayjs(values.recurringDate[0]).endOf('day'),
          endFrequency: dayjs(values.recurringDate[1]).startOf('day'),

          frequency: values.recurringFrequency,
          frequencyRepeat: values.recurringFrequencyRepeat.join()
        }
      } else {
        delete values.recurring
        delete planMaintenanceStore.editPlanMaintenance.recurring
      }
      delete values.recurringName
      delete values.recurringChecked
      delete values.recurringStartTime
      delete values.recurringEndTime
      delete values.recurringDate
      delete values.recurringFrequency
      delete values.recurringFrequencyRepeat
      //-------------------------------------------------------

      if (planMaintenanceStore.editPlanMaintenance?.id) {
        await planMaintenanceStore.update(
          {
            ...planMaintenanceStore.editPlanMaintenance,
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
        await reminderStore.updateReminder(
          moduleId,
          planMaintenanceStore.editPlanMaintenance?.id,
          timeUnits.hours,
          true
        )
        planMaintenanceStore.setIsLoading(false)
      } else {
        await planMaintenanceStore.create(
          {
            ...values,
            servicePlanNotes: this.state.note.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            }))
          },
          this.state.files,
          this.state.filesVideo
        )
        if (reminderStore.editReminder.isActive) {
          await reminderStore.updateReminder(
            moduleId,
            this.props.planMaintenanceStore.editPlanMaintenance.id,
            timeUnits.hours,
            true
          )
        }
        await planMaintenanceStore.createPlanMaintenance()
        planMaintenanceStore.setIsLoading(false)
      }
      if (isSendMall) {
        this.onSendMaill()
      }
      this.setState({ loading: false })
      form.resetFields()
      this.props.navigate(-1)
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
          this.props.navigate(-1)
        }
      })
      return
    }
    this.props.planMaintenanceStore.createPlanMaintenance()
    this.props.userStore.editUserProfilePicture = defaultAvatar
    form.resetFields()
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
          {/* {tabActiveKey === tabKeys.tabInfo &&
            this.props.params?.id &&
            isGrantedAny(
              appPermissions.planMaintenanceRecurring.create,
              appPermissions.planMaintenanceRecurring.update
            ) && (
              <Button
                className="mr-1"
                type="primary"
                disabled={this.props.params?.id && !isGranted(appPermissions.planMaintenanceRecurring.update)}
                onClick={() => this.onSave(true)}
                loading={isLoading}
                shape="round">
                {L('BTN_SEND_MAIL')}
              </Button>
            )} */}
          {tabActiveKey === tabKeys.tabInfo &&
            isGrantedAny(
              appPermissions.planMaintenanceRecurring.create,
              appPermissions.planMaintenanceRecurring.update
            ) && (
              <Button
                type="primary"
                disabled={this.props.params?.id && !isGranted(appPermissions.planMaintenanceRecurring.update)}
                onClick={() => this.onSave(false)}
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

  // onFillInfoCompany = (id) => {
  //   if (id) {
  //     const infoCompany = this.state.listCompany.find((item) => item?.id === id)
  //     this.getListUserCompany(id)
  //     this.formRef.current.setFieldsValue({
  //       company: {
  //         representative: infoCompany?.representative,
  //         primaryAddress: infoCompany?.primaryAddress,
  //         contactName: infoCompany?.contactName
  //       }
  //     })
  //   } else {
  //     this.formRef.current.setFieldsValue({
  //       company: {
  //         representative: null,
  //         primaryAddress: null,
  //         contactName: null
  //       }
  //     })
  //   }
  // }

  // getListUserCompany = async (companyId) => {
  //   if (companyId) {
  //     const result = await companyService.getUsers({ id: companyId, isActive: true })
  //     this.setState({ listUserInCompany: result })
  //   }
  // }

  getListZone = async () => {
    const listZone = await renovationService.getListZone()

    this.setState({ listZone })
  }

  handleAddRow = () => {
    this.setState({ visibleAction: true })
    this.formRefNote.current.resetFields()
    const newRow = { id: uuid() }

    const newData = [...this.state.note]

    newData.unshift(newRow)

    this.setState({ note: newData, uniqueId: newRow.id })
  }

  handleCancelRow = async (id) => {
    if (this.state.previousDataRow === undefined) {
      const newNote = this.state.note.filter((item) => item.id !== id)
      this.setState({ note: newNote })
    }
    this.setState({ visibleAction: false, uniqueId: '', previousDataRow: undefined })
  }

  handleDeleteRow = (id) => {
    const newNote = this.state.note.filter((item) => item.id !== id)
    this.setState({ note: newNote })
  }

  handleSaveRow = async (id) => {
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

    this.setState({ visibleAction: false, uniqueId: '', previousDataRow: undefined })
  }

  renderEmailOptions = (items) => {
    const children: any = []
    items.forEach((item, index) => {
      children.push(<Option key={index}>{item}</Option>)
    })
    return children
  }

  renderInformation = () => {
    const {
      fileStore,
      planMaintenanceStore: { priorityOptions, statusOptions }
    } = this.props

    const { assigners, observers } = this.state

    const columns = columnNote(
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
                onClick={() => this.handleDeleteRow(row.id)}
                disabled={this.state.visibleAction && this.state.uniqueId !== row.id}
              />
            </div>
          )
        }
      },
      this.isEditing,
      this.state.listZone.map((item) => ({ id: item?.id, name: item?.zoneName }))
    )

    return isGranted(appPermissions.planMaintenanceRecurring.detail) ? (
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
              <Form.Item
                label={L('PLANED_MAINTENANCE_ASSETS')}
                {...formVerticalLayout}
                name="assetIds"
                rules={rules.assetIds}>
                <AsyncSelect
                  type={asyncSelectType.asset}
                  onChange={this.onChangeAsset}
                  alreadyAsset={this.state.assets}
                  filters={{
                    projectId: this.props.sessionStore.project.id,
                    maxResultCount: 1000,
                    isActive: true,
                    sorting: 'Name ASC'
                  }}
                  fieldValue={'value'}
                  fieldName={'label'}
                />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }} className="d-flex">
              {this.state.assets.map((item: any, index) => (
                <div key={index}>
                  <Badge count={item.label} style={{ backgroundColor: '#52c41a' }} />
                  <span onClick={this.handleRemoveAsset(item, index)} aria-hidden="true" className="ml-1 pointer">
                    &times;
                  </span>
                </div>
              ))}
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('PLANED_MAINTENANCE_PROBLEM_DESCRIPTION')}
                {...formVerticalLayout}
                name="description"
                rules={rules.description}>
                <Input.TextArea onChange={({ target: { value } }) => value} rows={3} />
              </Form.Item>
            </Col>
            {/* <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item label={L('PLANED_MAINTENANCE_FEE_ARISE')} {...formVerticalLayout} name="feeA">
                <InputNumber min={0} className="full-width" />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item label={L('PLANED_MAINTENANCE_CONTRUCTION')} {...formVerticalLayout} name="contructorId">
                <Input />
              </Form.Item>
            </Col> */}
            <Col sm={{ span: 24, offset: 0 }} className="mt-2">
              <label className="title-detail">{L('PLANED_MAINTENANCE_PROBLEM_NOTE')}</label>
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
            recrurringStatus={this.props.planMaintenanceStore.editPlanMaintenance.recurring}
            resetFrequencyRepeat={() =>
              this.formRef.current.setFieldsValue({
                recurringFrequencyRepeat: []
              })
            }
          />
          {/* <Row gutter={[16, 0]}>
            <Col sm={{ span: 24, offset: 0 }}>
              <label className="title-detail">{L('NOTICE_TO_RESIDENT')}</label>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item label={L('COMPANY_NAME')} {...formVerticalLayout} name="companyId" rules={rules.projectId}>
                <Select
                  showSearch
                  showArrow
                  allowClear
                  className="full-width"
                  filterOption={filterOptions}
                  onChange={this.onFillInfoCompany}>
                  {this.state.listCompany.map((item: any, index) => (
                    <Select.Option key={index} value={item?.id}>
                      {item?.companyName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 16, offset: 0 }}></Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <FormInput name={['company', 'representative']} label={L('TRANSPORT_REPRESENTATIVE')} disabled />
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <FormInput name={['company', 'primaryAddress']} label={L('TRANSPORT_ADDRESS_CONTACT')} disabled />
            </Col>
            <Col sm={{ span: 6, offset: 0 }}>
              <FormInput name={['company', 'contactName']} label={L('TRANSPORT_USER_CONTACT')} disabled />
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('PLANMAINTENANCE_USER_RECEIVE_MAIL')}
                {...formVerticalLayout}
                name="userIdReceiveEmail"
                rules={[{ required: true }]}>
                <Select mode="multiple" filterOption={filterOptions} style={{ width: '100%' }}>
                  {this.state.listUserInCompany.map((item: any) => (
                    <Select.Option key={item?.id} value={item?.id}>
                      {item?.displayName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row> */}
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
      planMaintenanceStore: { isLoading, editPlanMaintenance }
    } = this.props

    return (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Form
          ref={this.formRef}
          layout={'vertical'}
          onAbort={this.onCancel}
          onValuesChange={() => this.setState({ isDirty: true })}
          validateMessages={validateMessages}
          initialValues={this.props.planMaintenanceStore.editPlanMaintenance}
          size="middle">
          <Tabs type="card" activeKey={this.state.tabActiveKey} onTabClick={this.changeTab}>
            <Tabs.TabPane tab={L(tabKeys.tabInfo)} key={tabKeys.tabInfo}>
              {this.renderInformation()}
            </Tabs.TabPane>
            <TabPane tab={L(tabKeys.tabComment)} key={tabKeys.tabComment} disabled={!editPlanMaintenance?.guid}>
              <CommentList
                moduleId={moduleIds.planMaintenance}
                parentId={editPlanMaintenance?.guid}
                commentStore={this.props.commentStore}
                sessionStore={this.props.sessionStore}
                isPrivate={false}
              />
            </TabPane>
            <TabPane tab={L(tabKeys.tabAuditLog)} key={tabKeys.tabAuditLog} disabled={!editPlanMaintenance?.id}>
              <AuditLog
                moduleId={moduleIds.planMaintenance}
                parentId={editPlanMaintenance?.id}
                auditLogStore={this.props.auditLogStore}
              />
            </TabPane>
          </Tabs>
        </Form>
      </WrapPageScroll>
    )
  }
}

export default withRouter(PlanMaintenanceDetail)
