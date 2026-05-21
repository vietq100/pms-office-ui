import FormInput from '@components/FormItem/FormInput'
import FormSelect from '@components/FormItem/FormSelect'
import WrapPageScroll from '@components/WrapPageScroll'
import { isGranted, isGrantedAny, L } from '@lib/abpUtility'
import staffService from '@services/member/staff/staffService'
import HandoverStore from '@stores/handover/handoverStore'
import Stores from '@stores/storeIdentifier'
import Col from 'antd/lib/col'
import Form from 'antd/lib/form'
import Row from 'antd/lib/row'
import Select from 'antd/lib/select'
import Spin from 'antd/lib/spin'
import debounce from 'lodash/debounce'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import rules from './validation'
import Button from 'antd/lib/button'
import AppConsts, { appPermissions, dateFormat, rangePickerPlaceholder, timeFormat } from '@lib/appconst'
import FormNumber from '@components/FormItem/FormNumber'
import handoverService from '@services/handover/handoverService'
import Card from 'antd/es/card'
import RowFloor from './components/RowFloor'
import FormCheckbox from '@components/FormItem/FormCheckbox'
import MobileOutlined from '@ant-design/icons/lib/icons/MobileOutlined'
import MailOutlined from '@ant-design/icons/lib/icons/MailOutlined'
import UserDeleteOutlined from '@ant-design/icons/lib/icons/UserDeleteOutlined'
import Tag from 'antd/lib/tag'
import FormDateRangePicker from '@components/FormItem/FormDateRangePicker'
import Checkbox from 'antd/lib/checkbox'
import { CheckboxValueType } from 'antd/lib/checkbox/Group'
import { TimePicker } from 'antd'
import CloseOutlined from '@ant-design/icons/CloseOutlined'
import MinusOutlined from '@ant-design/icons/MinusOutlined'
import moment from 'moment'
import Tabs from 'antd/es/tabs'
import NotificationProcess from './components/NotificationProcess'
import { portalLayouts } from '@components/Layout/Router/router.config'
import dayjs from 'dayjs'
import { converUTCDateRangePicker } from '@lib/helper'
import NoRole from '@components/ComponentNoRole'
import TagsInput from '@components/Inputs/TagsInput'

const { bookingDates, dataType } = AppConsts

const handoverWeekday = bookingDates.slice(1).map((date) => ({ ...date, label: L(date.label) }))
type Props = {
  handoverStore: HandoverStore
}
const tabKeys = {
  information: 'TAB_INFORMATION',
  process: 'TAB_NOTIFICATION_PROGRESS'
}
const Details = inject(Stores.HandoverStore)(
  observer((props: Props) => {
    const navigate = useNavigate()
    const onCancel = () => {
      navigate(-1)
    }

    const [isConfirmSave, setIsConfirmSave] = React.useState(false)
    const [defaultChecked, setDefaultChecked] = React.useState([])
    const onSave = async () => {
      const values = await form.validateFields()
      values.handoverTime = converUTCDateRangePicker(values.handoverTime)

      const timeSlotFormatted = timeSlots.map((item) => ({
        ...item,
        startTime: moment(item.startTime, 'HH:mm').format(timeFormat),
        endTime: moment(item.endTime, 'HH:mm').format(timeFormat)
      }))
      if (params.id) {
        await props.handoverStore.updatePlanHandover({
          ...values,
          timeSlots: timeSlotFormatted
        })
      } else {
        await props.handoverStore.createPlanHandover({
          ...values,
          timeSlots: timeSlotFormatted
        })
      }
      navigate(-1)
    }
    const renderActions = (isLoading) => {
      return tabActiveKey === tabKeys.information ? (
        <Row gutter={4}>
          <Col sm={{ span: 24, offset: 0 }} flex="end">
            <Button className="mr-1" onClick={onCancel} shape="round">
              {L('BTN_CANCEL')}
            </Button>
            <Button className="mx-3" type="primary" shape="round" onClick={handleCheckUnit}>
              {L('VERIFY_INFORMATION')}
            </Button>
            {isGrantedAny(appPermissions.handoverPlan.update, appPermissions.handoverPlan.create) && (
              <Button
                type="primary"
                onClick={onSave}
                loading={isLoading}
                shape="round"
                disabled={
                  !props.handoverStore.handoverPlanStatus &&
                  params.id &&
                  !isGrantedAny(appPermissions.handoverPlan.update) &&
                  isConfirmSave === false
                }>
                {L('BTN_SAVE')}
              </Button>
            )}
          </Col>
        </Row>
      ) : (
        <Row gutter={4}>
          <Col sm={{ span: 24, offset: 0 }} flex="end">
            <Button className="mr-1" onClick={onCancel} shape="round">
              {L('BTN_CANCEL')}
            </Button>
          </Col>
        </Row>
      )
    }
    const [form] = Form.useForm()
    const params: any = useParams()
    const [assignedUser, setAssignedUser] = React.useState<any[]>([])
    const getUser = async (keyword?) => {
      const res = await staffService.getAll({ keyword })
      return res.items
    }
    const searchAssignedUser = async (keyword?) => {
      const res = await getUser(keyword)
      setAssignedUser(res)
    }
    const getDetail = async (id) => {
      const detail = await props.handoverStore.getPlanHandoverDetail(id)
      const unitData = detail.units
      const buildingIds = [...new Set(unitData.map((unit) => unit.buildingId))]

      const lockedFloor: any[] = unitData.filter((unit) => unit.isLocked).map((item) => item.floorId)

      const floorOptions = (await handoverService.getListFloor({ buildingIds })).map((floor) => {
        return { ...floor, disabled: lockedFloor.includes(floor.id) }
      })

      const floorIds = [...new Set(unitData.map((unit) => unit.floorId))]
      setTimeSlots(props.handoverStore.planHandoverDetail.timeSlots)
      const weekday: string[] = (props.handoverStore.planHandoverDetail.timeSlots || []).map((i) => i.dayOfWeek)

      const units = await handoverService.getListUnit({
        floorIds,
        buildingIds
      })
      const floorPicked = floorOptions
        .filter((floor) => floorIds.includes(floor.id))
        .map((floor) => {
          const unitItems = (units || []).filter((u) => u.floorId === floor.id)
          return { ...floor, unitItems, totalUnitCount: unitItems.length ?? 0 }
        })
      setSelectedWeekday([...new Set(weekday)])
      setAssignedUser(props.handoverStore.planHandoverDetail.assignUsers)
      setDefaultChecked(unitData)
      setFloorOptions(floorOptions)
      setFloorPickup(floorPicked)
      form.setFieldsValue({
        ...detail,
        buildingIds,
        floorIds
      })
    }
    isGranted(appPermissions.handoverPlan.detail) &&
      React.useEffect(() => {
        getBuildingOption('')
        if (params.id) {
          getDetail(params.id)
        } else {
          searchAssignedUser()
        }
        return () => {
          props.handoverStore.handoverPlanStatus = undefined
        }
      }, [])

    const [floorOptions, setFloorOptions] = React.useState<any[]>([])
    const [buildingOptions, setBuildingOptions] = React.useState<any[]>([])

    const getBuildingOption = async (keyword) => {
      const res = await handoverService.getListBuilding({ keyword })
      setBuildingOptions(res)
    }
    const handleChangeBuilding = async (buildingIds): Promise<any[]> => {
      const res = await handoverService.getListFloor({ buildingIds })
      setFloorOptions(res)
      return res
    }

    const getUnitByFloor = async () => {
      const buildingIds = await form.getFieldValue('buildingIds')
      const floorIds = await form.getFieldValue('floorIds')

      const units = await handoverService.getListUnit({ floorIds, buildingIds })

      const floorPicked = floorOptions
        .filter((floor) => floorIds.includes(floor.id))
        .map((floor) => {
          const unitItems = (units || []).filter((u) => u.floorId === floor.id)
          return { ...floor, unitItems, totalUnitCount: unitItems.length ?? 0 }
        })

      setFloorPickup(floorPicked)
      if (!params.id) {
        const floorPickedId = floorPicked.map((f) => f.id)
        const unitItems = (units || []).filter((u) => floorPickedId.includes(u.floorId))
        setDefaultChecked(unitItems)
        form.setFieldsValue({ unitIds: unitItems.map((u) => u.id) })
      }
    }

    const [floorPickup, setFloorPickup] = React.useState<any[]>([])
    const handleChangeUnit = async (plainOptions, items) => {
      const units = await form.getFieldValue('unitIds')
      const unitIds = [...(units || []).filter((i) => !plainOptions.includes(i)), ...items]
      form.setFields([{ name: 'unitIds', value: unitIds }])
    }

    const handleCheckUnit = async () => {
      setIsConfirmSave(true)
      const isSendToOwner = form.getFieldValue('isSendToOwner')
      const unitIds = form.getFieldValue('unitIds')
      await props.handoverStore.checkUnitStatus({ isSendToOwner, unitIds })
    }

    const disabledDate = (current) => {
      return current < new Date() ? true : false
    }

    const [selectedWeekday, setSelectedWeekday] = React.useState<CheckboxValueType[]>([])
    const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<any[]>([[undefined, undefined]])
    const [timeSlots, setTimeSlots] = React.useState<any>([])
    const handleSelectTimeSlot = (time, index) => {
      const newSelectedTimeSlot = [...selectedTimeSlot]
      newSelectedTimeSlot.splice(index, 1, time)
      setSelectedTimeSlot(newSelectedTimeSlot)
    }
    const handleGenerateSlot = async () => {
      const newTimeSlots: any = []
      selectedWeekday.forEach((weekday) => {
        selectedTimeSlot.forEach((time) => {
          const addedItem = {
            dayOfWeek: weekday,
            startTime: time[0].format(timeFormat),
            endTime: time[1].format(timeFormat)
          }
          newTimeSlots.push(addedItem)
          setTimeSlots(newTimeSlots)
        })
      })
    }
    const [tabActiveKey, setTabActiveKey] = React.useState(tabKeys.information)
    return isGranted(appPermissions.handoverPlan.detail) ? (
      <WrapPageScroll renderActions={() => renderActions(props.handoverStore.isLoading)}>
        <Tabs activeKey={tabActiveKey} onTabClick={setTabActiveKey}>
          <Tabs.TabPane tab={L(tabKeys.information)} key={tabKeys.information}>
            <Form form={form} layout={'vertical'}>
              <Spin spinning={props.handoverStore.isLoading ?? false}>
                <Card>
                  <FormInput name="title" label={L('TITLE')} rule={rules.title} />
                  <FormInput name="description" label={L('DESCRIPTION')} rule={rules.description} />
                </Card>
                <Card className="my-3">
                  <Row gutter={[16, 16]}>
                    <Col sm={{ span: 0, offset: 0 }}>
                      <FormInput label={L('UNITS')} name="unitIds" />
                    </Col>
                    <Col sm={{ span: 8, offset: 0 }}>
                      <FormNumber
                        tooltip={L('MAXIMUM_HANDOVER_PER_DAY_TOOLTIP')}
                        label={L('MAXIMUM_HANDOVER_PER_DAY')}
                        name="maxSlotPerDay"
                        rule={rules.maxSlotPerDay}
                      />
                    </Col>
                    <Col sm={{ span: 8, offset: 0 }}>
                      <FormDateRangePicker
                        dateTimeFormat={dateFormat}
                        label={L('HANDOVER_TIME')}
                        name={'handoverTime'}
                        rule={rules.handoverTime}
                        dateTimeProps={{
                          disabledDate: disabledDate
                        }}
                      />
                    </Col>
                    <Col sm={{ span: 8, offset: 0 }}>
                      <FormNumber
                        tooltip={L('HANDOVER_SLOT_NUMBER_TOOLTIP')}
                        label={L('HANDOVER_SLOT_NUMBER')}
                        name="maxTimePerSlot"
                        rule={rules.maxTimePerSlot}
                      />
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    <Col sm={{ span: 8, offset: 0 }}>
                      {selectedTimeSlot.map((item, index) => (
                        <div key={index}>
                          <TimePicker.RangePicker
                            style={{ width: 'calc(100% - 60px', margin: 2 }}
                            value={item}
                            onChange={(time) => handleSelectTimeSlot(time, index)}
                            format={'HH:mm'}
                            placeholder={rangePickerPlaceholder}
                          />
                          <Button
                            shape="circle"
                            size="small"
                            className="mx-1"
                            icon={<CloseOutlined />}
                            onClick={() => {
                              const newSelectedTimeSlot = [...selectedTimeSlot]
                              newSelectedTimeSlot.splice(index, 1)
                              setSelectedTimeSlot(newSelectedTimeSlot)
                            }}
                          />
                        </div>
                      ))}
                      <Button
                        className="w-100 mt-1"
                        onClick={() => {
                          setSelectedTimeSlot([...selectedTimeSlot, [undefined, undefined]])
                        }}
                        type="primary">
                        {L('ADD_TIME_SLOT')}
                      </Button>
                    </Col>

                    <Col sm={{ span: 12, offset: 0 }}>
                      <label className="d-block">{L('WEEKDAY')}</label>
                      <Checkbox.Group options={handoverWeekday} value={selectedWeekday} onChange={setSelectedWeekday} />
                    </Col>
                    <Col sm={{ span: 4, offset: 0 }}>
                      <Button type="primary" className="mt-4" onClick={handleGenerateSlot}>
                        {L('CREATE_HANDOVER_TIME')}
                      </Button>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      {handoverWeekday.map((item, index) => {
                        if (!timeSlots.map((i) => i.dayOfWeek).includes(item.numNextValidDate)) return
                        return (
                          <div key={index}>
                            <Row>
                              <Col sm={{ span: 24, offset: 0 }}>{L(item.numNextValidDate)}</Col>
                              {timeSlots.map((timeSlot, index) => {
                                if (timeSlot.dayOfWeek === item.numNextValidDate) {
                                  const startTime = dayjs(timeSlot.startTime, 'HH:mm')
                                  const endTime = dayjs(timeSlot.endTime, 'HH:mm')
                                  return (
                                    <Col key={index} sm={{ span: 12, offset: 0 }} className="m-1">
                                      <Row gutter={[16, 16]}>
                                        <Col sm={{ span: 6, offset: 0 }} className="text-right">
                                          <Button
                                            className="ml-1"
                                            shape="circle"
                                            icon={<MinusOutlined />}
                                            onClick={() => {
                                              const newTimeSlots = [...timeSlots]
                                              newTimeSlots.splice(index, 1)
                                              setTimeSlots(newTimeSlots)
                                            }}></Button>
                                        </Col>
                                        <Col sm={{ span: 6, offset: 0 }}>
                                          <TimePicker
                                            value={startTime}
                                            format={timeFormat}
                                            onChange={(time) => {
                                              const newSlot = {
                                                ...timeSlot,
                                                startTime: time?.format(timeFormat)
                                              }
                                              const newTimeSlots = [...timeSlots]
                                              newTimeSlots.splice(index, 1, newSlot)
                                              setTimeSlots(newTimeSlots)
                                            }}
                                            className="full-width"
                                            minuteStep={30}
                                          />
                                        </Col>
                                        <Col sm={{ span: 6, offset: 0 }}>
                                          <TimePicker
                                            value={endTime}
                                            format={timeFormat}
                                            className="full-width"
                                            onChange={(time) => {
                                              const newSlot = {
                                                ...timeSlot,
                                                endTime: time?.format(timeFormat)
                                              }
                                              const newTimeSlots = [...timeSlots]
                                              newTimeSlots.splice(index, 1, newSlot)
                                              setTimeSlots(newTimeSlots)
                                            }}
                                            minuteStep={30}
                                          />
                                        </Col>
                                      </Row>
                                    </Col>
                                  )
                                } else return
                              })}
                            </Row>
                          </div>
                        )
                      })}
                    </Col>
                  </Row>
                </Card>
                <Card>
                  <Row gutter={[16, 16]}>
                    <Col sm={{ span: 8, offset: 0 }}>
                      <FormSelect
                        label={L('BUILDING')}
                        name="buildingIds"
                        options={buildingOptions || []}
                        selectProps={{
                          mode: 'multiple',
                          onChange: handleChangeBuilding,
                          onSearch: debounce(getBuildingOption, 300)
                        }}
                      />
                    </Col>
                    <Col sm={{ span: 8, offset: 0 }}>
                      <FormSelect
                        label={L('FLOORS')}
                        name="floorIds"
                        options={floorOptions || []}
                        selectProps={{
                          mode: 'multiple',
                          allowClear: false
                        }}
                        optionModal={(item, index) => (
                          <Select.Option key={index} value={item?.id}>
                            <div>
                              {item.name} ({item.buildingCode})
                            </div>
                          </Select.Option>
                        )}
                      />
                    </Col>
                    <Col sm={{ span: 8, offset: 0 }}>
                      <Button type="primary" className="mt-3" onClick={() => getUnitByFloor()}>
                        {L('FINDING_UNIT')}
                      </Button>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Card>
                        <h3>{L('UNIT')}</h3>
                        <Row gutter={[16, 16]}>
                          {floorPickup.map((floor, index) => (
                            <RowFloor
                              floorDetail={floor}
                              defaultChecked={defaultChecked}
                              key={index}
                              onChangeItem={handleChangeUnit}
                            />
                          ))}
                        </Row>
                      </Card>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <FormCheckbox label={L('ONLY_SEND_TO_HOST')} name="isSendToOwner" />
                    </Col>

                    <Col sm={{ span: 24, offset: 0 }}>
                      <FormSelect
                        rule={rules.assignUserIds}
                        name="assignUserIds"
                        label={L('ASSIGNED_USER')}
                        options={assignedUser}
                        selectProps={{
                          mode: 'multiple',
                          onSearch: debounce(searchAssignedUser, 300)
                        }}
                        optionModal={(item, index) => (
                          <Select.Option key={index} value={item.id}>
                            <div>{item.displayName}</div>
                            <div className="text-muted">{item.emailAddress}</div>
                          </Select.Option>
                        )}
                      />
                    </Col>

                    <Col sm={{ span: 24, offset: 0 }}>
                      <FormSelect
                        rule={rules.assignUserIds}
                        name="notifyUserIds"
                        label={L('ASSIGNED_USER_RECEIVE')}
                        options={assignedUser}
                        selectProps={{
                          mode: 'multiple',
                          onSearch: debounce(searchAssignedUser, 300)
                        }}
                        optionModal={(item, index) => (
                          <Select.Option key={index} value={item.id}>
                            <div>{item.displayName}</div>
                            <div className="text-muted">{item.emailAddress}</div>
                          </Select.Option>
                        )}
                      />
                    </Col>
                    <Col span={24}>
                      <Form.Item name="toListOfEmails" label={L('ASSIGNED_USER_EMAIL')}>
                        <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
                      </Form.Item>
                    </Col>
                    {props.handoverStore.handoverPlanStatus && (
                      <Col sm={{ span: 24, offset: 0 }}>
                        <span className="mr-3">
                          <MailOutlined className="m-1" />
                          {props.handoverStore.handoverPlanStatus.totalSendViaEmail}
                        </span>
                        <span className="mr-3">
                          <MobileOutlined className="m-1" />
                          {props.handoverStore.handoverPlanStatus.totalSendViaInApp}
                        </span>
                        <span className="mr-3">
                          <UserDeleteOutlined className="m-1 text-danger" />
                          {props.handoverStore.handoverPlanStatus.unitInvalid?.length}
                        </span>
                        <div />
                        {(props.handoverStore.handoverPlanStatus.unitInvalid || []).map((unit, index) => (
                          <div key={index} className="my-1 p-1">
                            {unit.unit.fullUnitCode} :&nbsp;
                            <Tag
                              color="red"
                              className="pointer mr-1"
                              onClick={() => {
                                unit.id &&
                                  window.open(portalLayouts.projectUnitDetail.path.replace(':id', unit.id), '_blank')
                              }}>
                              {unit.statusCode === 1
                                ? L('THIS_APARTMENT_DO_NOT_HAVE_OWNER_CONTACT')
                                : unit.statusCode === 2
                                ? L('THIS_APARTMENT_HANDOVERED')
                                : L('THIS_APARTMENT_DO_NOT_HAVE_MEMBER')}
                            </Tag>
                          </div>
                        ))}
                      </Col>
                    )}
                  </Row>
                </Card>
              </Spin>
            </Form>
          </Tabs.TabPane>
          {params.id && (
            <Tabs.TabPane tab={L(tabKeys.process)} key={tabKeys.process}>
              <NotificationProcess handoverStore={props.handoverStore} />
            </Tabs.TabPane>
          )}
        </Tabs>
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  })
)

export default Details
