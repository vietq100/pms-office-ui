import HomeOutlined from '@ant-design/icons/HomeOutlined'
import PhoneOutlined from '@ant-design/icons/PhoneOutlined'
import UserOutlined from '@ant-design/icons/UserOutlined'
import FormSelect from '@components/FormItem/FormSelect'
import WrapPageScroll from '@components/WrapPageScroll'
import { isGranted, isGrantedAny, L, LError } from '@lib/abpUtility'
import AppConsts, {
  appPermissions,
  dateFormat,
  dateTimeFormat,
  fileTypeGroup,
  moduleIds,
  timeFormat
} from '@lib/appconst'
import handoverService from '@services/handover/handoverService'
import staffService from '@services/member/staff/staffService'
import projectService from '@services/project/projectService'
import HandoverStore from '@stores/handover/handoverStore'
import Stores from '@stores/storeIdentifier'
import Tag from 'antd/es/tag'
import Button from 'antd/lib/button'
import Calendar from 'antd/lib/calendar'
import Card from 'antd/lib/card'
import Col from 'antd/lib/col'
import Form from 'antd/lib/form'
import CheckBox from 'antd/lib/checkbox'
import Row from 'antd/lib/row'
import Select from 'antd/lib/select'
import Spin from 'antd/lib/spin'
import debounce from 'lodash/debounce'
import { inject, observer } from 'mobx-react'

import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ResidentDetailCard from './components/ResidentDetailCard'
import rules from './validation'
import Tabs from 'antd/lib/tabs'
import CommentStore from '../../../stores/common/commentStore'
import CommentList from '@components/CommentList'
import SessionStore from '../../../stores/sessionStore'
import FormTextArea from '@components/FormItem/FormTextArea'

import FileStore from '@stores/common/fileStore'
import dayjs from 'dayjs'
import FileUploadWrapV2 from '@components/FileUploadV2'
import NoRole from '@components/ComponentNoRole'
import { DatePicker, Input } from 'antd'
import PrintHandOverProcess from './components/PrintHandOverProcess'
import ChecklistTable from './tabCheckList'
import DefectTable from './tabDefect'
import EFormStore from '@stores/eForm/eFormStore'
const { Option } = Select
const { formVerticalLayout } = AppConsts
type Props = {
  handoverStore: HandoverStore
  sessionStore: SessionStore
  commentStore: CommentStore
  fileStore: FileStore
  eFormStore: EFormStore
}
const tabKeys = {
  tabInfo: 'HANDOVER_TAB_INFO',
  tabCommentPrivate: 'HANDOVER_TAB_COMMENTS_PRIVATE',
  tabCheckList: 'HANDOVER_TAB_CHECK_LIST',
  tabDefect: 'HANDOVER_TAB_DEFECT',
  tabSignature: 'HAND_TAB_SIGNATURE'
}
export const formDataRender = (label, value, isHighline?, titleWidth?) => (
  <Row style={{ backgroundColor: isHighline ? 'whitesmoke' : 'white' }} className="m-1">
    <Col sm={{ span: titleWidth ?? 6, offset: 0 }} style={{ fontWeight: 'bold' }}>
      {label} :&nbsp;
    </Col>
    <Col sm={{ span: titleWidth ? 24 - titleWidth : 18, offset: 0 }}>
      &nbsp;
      {value}
    </Col>
  </Row>
)
const Details = inject(
  Stores.HandoverStore,
  Stores.SessionStore,
  Stores.CommentStore,
  Stores.FileStore,
  Stores.EFormStore
)(
  observer((props: Props) => {
    const [tabActiveKey, setTabActiveKey] = React.useState(tabKeys.tabInfo)
    const navigate = useNavigate()
    const params: any = useParams()
    const [showPrint, setShowPrint] = useState(false)
    isGranted(appPermissions.handoverReservation.detail) &&
      React.useEffect(() => {
        props.handoverStore.getRevervationHandoverStatus()
        if (params.id) {
          getDetail(params.id)
        } else {
          handleSearchResident('')
        }
        searchAssignedUser('')
      }, [])

    const getDetail = async (id) => {
      const res = await props.handoverStore.getReservationHandoverDetail(id)

      form.setFieldsValue({
        userId: res.user?.id,
        assignUserId: res.assignUserId,
        statusId: res.status?.id,
        description: res.description
      })

      setResidentInformation(res.user)
      res.assignUser && setAssignedUser([res.assignUser])
      res.user && setResidentOptions([res.user])

      setHandoverPlan(res.handover)
      setSelectedTimeSlot({ startDate: res.fromDate, endDate: res.toDate })
    }
    const onCancel = () => {
      form.resetFields()
      navigate(-1)
    }
    const onSave = async () => {
      const values = await form.validateFields()

      values.userId = residentInformation?.userId
      if (selectedTimeSlot.startDate === '' || selectedTimeSlot.endDate === '')
        return form.setFields([
          {
            name: 'selectedTimeSlot',
            errors: [LError('PLEASE_SELECT_TIME_SLOT')]
          }
        ])
      const body = {
        ...values,
        ...selectedTimeSlot,
        unitId: residentInformation?.unitId,
        handoverId: handoverPlan.id
      }

      if (params.id) {
        await props.handoverStore.updateHandoverReservation(body, files)
      } else {
        await props.handoverStore.createHandoverReservation(body, files)
      }
      form.resetFields()
      navigate(-1)
    }
    const renderActions = (loading?) => {
      return (
        <Row gutter={4}>
          {params?.id && (
            <Col sm={{ span: 12, offset: 0 }} className="d-flex justify-content-start">
              {tabActiveKey === tabKeys.tabInfo && (
                <Button className="mr-1" onClick={() => setShowPrint(true)} shape="round" type="primary">
                  {L('BTN_PRINT')}
                </Button>
              )}
            </Col>
          )}
          <Col sm={{ span: params?.id ? 12 : 24, offset: 0 }} className="d-flex justify-content-end">
            <Button className="mr-1" onClick={onCancel} shape="round">
              {L('BTN_CANCEL')}
            </Button>

            {isGrantedAny(appPermissions.handoverReservation.update, appPermissions.handoverReservation.create) && (
              <Button
                type="primary"
                disabled={params.id && !isGrantedAny(appPermissions.handoverReservation.update)}
                onClick={onSave}
                loading={loading}
                shape="round">
                {L('BTN_SAVE')}
              </Button>
            )}
          </Col>
        </Row>
      )
    }

    const [form] = Form.useForm()
    const [assignedUser, setAssignedUser] = React.useState<any[]>([])
    const [residentOptions, setResidentOptions] = React.useState<any[]>([])
    const [residentInformation, setResidentInformation] = React.useState<any>()

    const [availableDate, setAvailabelDate] = React.useState<any[]>()
    const [handoverPlan, setHandoverPlan] = React.useState<any>()
    const [timeSlots, setTimeSlots] = React.useState<any[]>([])
    const [selectedTimeSlot, setSelectedTimeSlot] = React.useState({
      startDate: '',
      endDate: ''
    })
    const getUser = async (keyword?) => {
      const res = await staffService.getAll({ keyword, isActive: true })
      return res.items
    }
    const searchAssignedUser = async (keyword?) => {
      const res = await getUser(keyword)
      setAssignedUser(res)
    }

    const handleSearchResident = async (keyword) => {
      const res = await projectService.filterUnitUsers({
        keyword,
        isActive: true
      })
      setResidentOptions(res)
    }

    const handleSelectResident = async (value) => {
      const [unitId, userId] = value.split('-')

      const resident = residentOptions.find((res) => res.id === parseInt(userId) && res.unitId === parseInt(unitId))

      setResidentInformation(resident)
      const result = await props.handoverStore.checkHandoverPlanByUnit(resident.unitId)
      setTimeSlots([])
      setSelectedTimeSlot({ startDate: '', endDate: '' })
      result.availableDates ? setAvailabelDate(result.availableDates) : setAvailabelDate([])
      result.handoverPlan ? setHandoverPlan(result.handoverPlan) : setHandoverPlan(undefined)
    }

    const dateCellRender = (value) => {
      const isAvailable = availableDate?.find((date) => dayjs(date).format(dateFormat) === value.format(dateFormat))
      return isAvailable ? (
        <Tag className="w-100" color="green">
          {L('AVAILABLE')}
        </Tag>
      ) : null
    }

    const handleSelectHandoverDate = async (date) => {
      const isAvailable = availableDate?.find((i) => dayjs(i).format(dateFormat) === date.format(dateFormat))
      const res = isAvailable
        ? await handoverService.getTimeSlot({
            handoverid: handoverPlan.id,
            handoverDate: date.format('YYYY/MM/DD')
          })
        : []
      setTimeSlots(res)
    }
    const changeTab = (tabKey) => {
      setTabActiveKey(tabKey)
      // Refresh comment from Independent request
      if (tabKey === tabKeys.tabCommentPrivate) {
        const params = {
          conversationUniqueId: props.handoverStore.reservationHandoverDetail.uniqueId,
          moduleId: moduleIds.handover,
          maxResultCount: 10,
          skipCount: 0,
          isIncludeFile: true,
          isPrivate: true
        }
        props.commentStore.getAll(params)
      }
    }
    const [files, setFiles] = React.useState<any[]>([])
    const onRemoveFile = (file) => {
      const index = files.indexOf(file)
      const newFileList = [...files]
      newFileList.splice(index, 1)
      setFiles(newFileList)
    }
    const beforeUploadFile = (file) => {
      setFiles([...files, file])
      return false
    }
    return isGranted(appPermissions.handoverReservation.detail) ? (
      <>
        <WrapPageScroll
          renderActions={() =>
            tabActiveKey !== tabKeys.tabCheckList ? renderActions(props.handoverStore.isLoading) : undefined
          }>
          <Tabs activeKey={tabActiveKey} onTabClick={changeTab} type="card">
            <Tabs.TabPane tab={L(tabKeys.tabInfo)} key={tabKeys.tabInfo}>
              <Form form={form} layout={'vertical'} initialValues={{ statusId: 1 }}>
                <Spin spinning={props.handoverStore.isLoading ?? false}>
                  <Row gutter={[16, 16]}>
                    <Col sm={{ span: 12, offset: 0 }}>
                      {props.handoverStore.reservationHandoverDetail?.id ? (
                        <Form.Item label={L('RESIDENT')} {...formVerticalLayout} name="userId" rules={rules.userEdit}>
                          <Select
                            showSearch
                            allowClear
                            filterOption={false}
                            className="full-width"
                            onSearch={debounce(handleSearchResident, 300)}
                            onChange={handleSelectResident}
                            disabled={params?.id}>
                            {(residentOptions || []).map((option, index) => {
                              return (
                                <Option key={index} value={params.id ? option.id : option.optionValue}>
                                  {option.displayName}
                                  <div className="text-muted small" style={{ display: 'flex' }}>
                                    <span className="mr-2 text-truncate" style={{ flex: 1 }}>
                                      <HomeOutlined className="mr-1" />
                                      {option.fullUnitCode}
                                    </span>

                                    <span className="mr-2 text-truncate" style={{ flex: 1 }}>
                                      {option.emailAddress && option.emailAddress.length && (
                                        <>
                                          <UserOutlined className="mr-1" />
                                          {option.userName}
                                        </>
                                      )}
                                    </span>
                                    <span className={'text-truncate'} style={{ flex: 1 }}>
                                      {option.phoneNumber && option.phoneNumber.length && (
                                        <>
                                          <PhoneOutlined className="mr-1" />
                                          {option.phoneNumber}
                                        </>
                                      )}
                                    </span>
                                  </div>
                                </Option>
                              )
                            })}
                          </Select>
                        </Form.Item>
                      ) : (
                        <Form.Item label={L('RESIDENT')} {...formVerticalLayout} name="userId" rules={rules.userCreate}>
                          <Select
                            showSearch
                            allowClear
                            filterOption={false}
                            className="full-width"
                            onSearch={debounce(handleSearchResident, 300)}
                            onChange={handleSelectResident}
                            disabled={params?.id}>
                            {(residentOptions || []).map((option, index) => {
                              return (
                                <Option key={index} value={params.id ? option.id : option.optionValue}>
                                  {option.displayName}
                                  <div className="text-muted small" style={{ display: 'flex' }}>
                                    <span className="mr-2 text-truncate" style={{ flex: 1 }}>
                                      <HomeOutlined className="mr-1" />
                                      {option.fullUnitCode}
                                    </span>

                                    <span className="mr-2 text-truncate" style={{ flex: 1 }}>
                                      {option.emailAddress && option.emailAddress.length && (
                                        <>
                                          <UserOutlined className="mr-1" />
                                          {option.userName}
                                        </>
                                      )}
                                    </span>
                                    <span className={'text-truncate'} style={{ flex: 1 }}>
                                      {option.phoneNumber && option.phoneNumber.length && (
                                        <>
                                          <PhoneOutlined className="mr-1" />
                                          {option.phoneNumber}
                                        </>
                                      )}
                                    </span>
                                  </div>
                                </Option>
                              )
                            })}
                          </Select>
                        </Form.Item>
                      )}

                      <ResidentDetailCard detail={residentInformation} />
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <Card className="mt-3">
                        <h4>{L('HANDOVER_INFORMATION')}</h4>
                        {handoverPlan && (
                          <div className="mb-2">
                            {formDataRender(L('TITLE'), handoverPlan.title)}
                            {formDataRender(L('FROM_DATE'), dayjs(handoverPlan.fromDate).format(dateFormat), true)}
                            {formDataRender(L('TO_DATE'), dayjs(handoverPlan.toDate).format(dateFormat))}
                            {formDataRender(
                              L('HANDOVER_DATE'),
                              params?.id ? dayjs(selectedTimeSlot.startDate).format(dateFormat) : '',
                              true
                            )}
                          </div>
                        )}
                      </Card>
                    </Col>

                    {params?.id ? (
                      <Col span={24}>
                        <Row gutter={[8, 0]}>
                          <Col sm={{ span: 6, offset: 0 }}>
                            <Form.Item label={L('HAND_OVER_DATE')}>
                              <DatePicker
                                disabled
                                className="full-width"
                                value={dayjs(selectedTimeSlot.startDate)}
                                format={dateFormat}
                              />
                            </Form.Item>
                          </Col>
                          <Col sm={{ span: 6, offset: 0 }}>
                            <Form.Item label={L('HAND_OVER_TIME')}>
                              <Input
                                disabled
                                value={`${dayjs(selectedTimeSlot.startDate).format(timeFormat)} - ${dayjs(
                                  selectedTimeSlot.endDate
                                ).format(timeFormat)}`}
                              />
                            </Form.Item>
                          </Col>
                          <Col sm={{ span: 6, offset: 0 }}>
                            <FormSelect
                              name="assignUserId"
                              label={L('ASSIGNED_USER')}
                              options={assignedUser}
                              selectProps={{
                                onSearch: debounce(searchAssignedUser, 300)
                              }}
                              optionModal={(item, index) => (
                                <Select.Option key={index} value={item?.id}>
                                  <div>{item.displayName}</div>
                                  <div className="text-muted">{item.emailAddress}</div>
                                </Select.Option>
                              )}
                            />
                          </Col>
                          <Col sm={{ span: 6, offset: 0 }}>
                            <FormSelect
                              name="statusId"
                              options={props.handoverStore.reservationHandoverStatus}
                              label={L('STATUS')}
                            />
                          </Col>
                        </Row>
                      </Col>
                    ) : (
                      <>
                        <Col sm={{ span: 12, offset: 0 }}>
                          <label>{L('HANDOVER_DATE')}</label>
                          <Calendar
                            fullscreen={false}
                            onSelect={handleSelectHandoverDate}
                            dateCellRender={dateCellRender}
                          />
                        </Col>
                        <Col sm={{ span: 12, offset: 0 }}>
                          <label className="d-block">{L('SLOT')}</label>
                          <div className="my-3">
                            {timeSlots.map((slot, index) => {
                              const isActive =
                                selectedTimeSlot.startDate === slot.startTime &&
                                selectedTimeSlot.endDate === slot.endTime
                              return (
                                <span
                                  className="mt-2 mr-3 p-2 pointer d-inline-block"
                                  style={{
                                    backgroundColor: !slot.isAvailable
                                      ? 'none'
                                      : isActive
                                      ? 'rgba(110, 186, 196, 0.16)'
                                      : 'white',
                                    borderRadius: '20px'
                                  }}
                                  key={index}
                                  onClick={() => {
                                    if (!slot.isAvailable) return
                                    form.setFields([{ name: 'selectedTimeSlot', errors: [] }])
                                    setSelectedTimeSlot({
                                      startDate: slot.startTime,
                                      endDate: slot.endTime
                                    })
                                  }}>
                                  <CheckBox checked={isActive} className="mr-2" disabled={!slot.isAvailable} />
                                  {dayjs(slot.startTime).format(dateTimeFormat)} -{' '}
                                  {dayjs(slot.endTime).format(timeFormat)}
                                </span>
                              )
                            })}
                          </div>
                          <Form.Item name="selectedTimeSlot">
                            <input className="d-none" />
                          </Form.Item>
                        </Col>
                      </>
                    )}
                    {!params?.id && (
                      <>
                        <Col sm={{ span: 12, offset: 0 }}>
                          <FormSelect
                            name="assignUserId"
                            label={L('ASSIGNED_USER')}
                            options={assignedUser}
                            selectProps={{
                              onSearch: debounce(searchAssignedUser, 300)
                            }}
                            optionModal={(item, index) => (
                              <Select.Option key={index} value={item?.id}>
                                <div>{item.displayName}</div>
                                <div className="text-muted">{item.emailAddress}</div>
                              </Select.Option>
                            )}
                          />
                        </Col>
                        <Col sm={{ span: 12, offset: 0 }}>
                          <FormSelect
                            name="statusId"
                            options={props.handoverStore.reservationHandoverStatus}
                            label={L('STATUS')}
                          />
                        </Col>
                      </>
                    )}
                    <Col sm={{ span: 24, offset: 0 }}>
                      <FormTextArea
                        name="description"
                        label={L('DESCRIPTION')}
                        rows={params?.id ? 5 : 3}
                        rule={[
                          {
                            max: 2000,
                            message: LError('MAX_FIELD_LENGTH_{0}', 2000)
                          }
                        ]}
                      />
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <FileUploadWrapV2
                        multiple
                        parentId={params?.id ? props.handoverStore.reservationHandoverDetail?.uniqueId : null}
                        fileStore={props.fileStore}
                        onRemoveFile={onRemoveFile}
                        beforeUploadFile={beforeUploadFile}
                        acceptedFileTypes={fileTypeGroup.documentAndImage}
                        maxSize={25}
                        totalSize={20}
                      />
                    </Col>
                  </Row>
                </Spin>
              </Form>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={L(tabKeys.tabCommentPrivate)}
              key={tabKeys.tabCommentPrivate}
              disabled={!props.handoverStore.reservationHandoverDetail?.uniqueId}>
              <CommentList
                moduleId={moduleIds.handover}
                parentId={props.handoverStore.reservationHandoverDetail?.uniqueId}
                commentStore={props.commentStore}
                sessionStore={props.sessionStore}
                isPrivate={true}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={L(tabKeys.tabCheckList)}
              key={tabKeys.tabCheckList}
              disabled={!props.handoverStore.reservationHandoverDetail?.uniqueId}>
              <ChecklistTable idDetail={params.id} handoverStore={props.handoverStore} eFormStore={props.eFormStore} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={L(tabKeys.tabDefect)}
              key={tabKeys.tabDefect}
              disabled={!props.handoverStore.reservationHandoverDetail?.uniqueId}>
              <DefectTable idDetail={params.id} handoverStore={props.handoverStore} />
            </Tabs.TabPane>
          </Tabs>
        </WrapPageScroll>
        <PrintHandOverProcess id={params?.id} open={showPrint} onClose={() => setShowPrint(false)} />
      </>
    ) : (
      <NoRole />
    )
  })
)

export default Details
