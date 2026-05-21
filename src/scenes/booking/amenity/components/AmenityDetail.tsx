/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import React from 'react'

import Col from 'antd/es/col'
import Form from 'antd/es/form'
import Row from 'antd/es/row'
import Card from 'antd/es/card'
import Input from 'antd/es/input'
import Button from 'antd/es/button'
import Modal from 'antd/es/modal'
import Select from 'antd/es/select'
import Switch from 'antd/es/switch'
import Tabs from 'antd/es/tabs'
import TimePicker from 'antd/es/time-picker'
import { validateMessages } from '../../../../lib/validation'
import CheckOutlined from '@ant-design/icons/CheckOutlined'
import ClearOutlined from '@ant-design/icons/ClearOutlined'
import MinusOutlined from '@ant-design/icons/MinusOutlined'
import AppConsts, { appPermissions, dateTimeFormat, fileTypeGroup } from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import AmenityStore from '../../../../stores/booking/amenityStore'
import AppComponentBase from '../../../../components/AppComponentBase'
import ProjectStore from '../../../../stores/project/projectStore'
import { isGrantedAny, L, LError, LNotification } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import rules from './validation'
import MultiLanguageInput from '@components/Inputs/MultiLanguageInput'
import MultiLanguageTextArea from '@components/Inputs/MultiLanguageInput/TextArea'
import { filterOptions, isSame, isBetween, inputNumberFormatter } from '@lib/helper'
import AmenityGroupStore from '@stores/booking/amenityGroupStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import NumberInput from '@components/Inputs/NumberInput'
import CurrencyInput from '@components/Inputs/CurrencyInput'
import sortBy from 'lodash/sortBy'
import moment from 'moment-timezone/moment-timezone'
import Avatar from 'antd/es/avatar'
import FileStore from '@stores/common/fileStore'
import withRouter from '@components/Layout/Router/withRouter'
import FormDateRangePicker from '@components/FormItem/FormDateRangePicker'
import FormTextArea from '@components/FormItem/FormTextArea'
import { RangePickerProps } from 'antd/lib/date-picker'
import { InputNumber, Popover } from 'antd'
import FileUploadWrapV2 from '@components/FileUploadV2'
import amenityService from '@services/booking/amenityService'
import { debounce } from 'lodash'
import TagsInput from '@components/Inputs/TagsInput'
import MultiLanguageSyncFusion from '@components/Inputs/MultiLanguageInput/SyncfusionInputMultiple'

const { Option } = Select
const { TabPane } = Tabs
const { formVerticalLayout, bookingTimes, bookingFutureTypes, bookingDates, dataType } = AppConsts
const confirm = Modal.confirm
const NO_LIMIT = 'NO_LIMIT'
const CURRENT = 'CURRENT'
const tabKeys = {
  tabInfo: 'AMENITY_TAB_INFO',
  tabMaintainance: 'AMENITY_TAB_MAINTAINANCE',
  tabRules: 'AMENITY_TAB_RULES',
  tabAuditLog: 'AMENITY_TAB_AUDIT_LOG'
}
const formatTime = 'HH:mm'
export const defaultGenerateRuleCondition = {
  generateDate: undefined,
  startTime: undefined,
  endTime: undefined,
  timeEachSlot: undefined,
  price: undefined
}

export interface IAmenityFormProps {
  params: any
  navigate: any
  amenityStore: AmenityStore
  amenityGroupStore: AmenityGroupStore
  projectStore: ProjectStore
  fileStore: FileStore
}
export interface IAmenityFormState {
  isDirty: boolean
  disableRule: any
  tabActiveKey: string
  generateRuleCondition: any
  isUseDeposited: boolean
  files: any
  generateDate: string | null | undefined
  startTime: string | null | undefined
  endTime: string | null | undefined
  timeEachSlot: string | null | undefined
  price: string | null | undefined
  enableMaintenance: boolean
  listAmenities: any[]
  isParent: boolean
  blockGen: boolean
}

@inject(Stores.AmenityStore, Stores.AmenityGroupStore, Stores.FileStore, Stores.ProjectStore)
@observer
class AmenityDetail extends AppComponentBase<IAmenityFormProps, IAmenityFormState> {
  formRef: any = React.createRef()

  state = {
    isDirty: false,
    disableRule: {
      limitation: false,
      requireInAdvance: false,
      typeForFuture: false,
      allowCancel: false,
      allowChange: false,
      allowCancelLimitation: false,
      overlapNumber: false
    },
    generateRuleCondition: { ...defaultGenerateRuleCondition },
    isUseDeposited: false,
    tabActiveKey: tabKeys.tabInfo,
    files: [] as any,
    generateDate: null,
    startTime: null,
    endTime: null,
    timeEachSlot: null,
    price: null,
    enableMaintenance: false,
    listAmenities: [] as any,
    isParent: false,
    blockGen: false
  }

  async componentDidMount() {
    await Promise.all([
      this.searchAmenity(''),
      this.props.amenityGroupStore.getLists({ isActive: true }),
      this.props.amenityStore.getIcons({}),
      this.props.amenityStore.getTimezones({}),
      this.props.amenityStore.getMemberRoles(),
      this.props.amenityStore.getUnitTypes(),
      this.findBuildings(''),
      this.init(this.props.params?.id)
    ])

    this.changeBookingRule()
  }

  searchAmenity = async (keyword) => {
    const res = await amenityService.getSearchAmenity({
      keyword,
      isActive: true,
      exceptAmenityId: this.props.params?.id
    })
    this.setState({ listAmenities: res.items.map((item) => ({ id: item.id, label: item.amenityName })) })
  }

  selectParentAmenity = async (value) => {
    if (value) {
      await this.props.amenityStore.getAminetyParent(value)
      this.setState({ isParent: true })
      this.formRef.current.setFieldsValue({
        timeRules: this.props.amenityStore.amenityParent.timeRules
      })
    } else {
      this.setState({ isParent: false })
      this.setState({ blockGen: false })
      this.formRef.current.setFieldsValue({
        timeRules: undefined
      })
    }
  }

  async init(id?) {
    if (!id) {
      await this.props.amenityStore.createAmenityModel()
    } else {
      await this.props.amenityStore.get(id)

      this.props.projectStore.filterBuildingOptions({})
      const { editAmenity } = this.props.amenityStore
      this.setIsUseDeposited(editAmenity?.isUseDeposited)
    }

    if (this.props.amenityStore?.editAmenity?.parentAmenityId) {
      this.setState({ isParent: true })
    }
    this.setState({
      enableMaintenance: !!this.props.amenityStore.editAmenity.maintenanceStartDate
    })

    this.formRef.current.setFieldsValue({
      ...this.props.amenityStore.editAmenity
    })
  }

  setIsUseDeposited = (isUseDeposited) => {
    this.setState({ isUseDeposited })
    if (isUseDeposited) {
      this.formRef.current.setFieldsValue({ isNeedApprove: true })
    }
  }

  findBuildings = async (keyword?) => {
    this.props.projectStore.filterBuildingOptions({ keyword })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
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

  changeBookingRule = () => {
    const form = this.formRef.current
    const { disableRule } = this.state
    disableRule.overlapNumber = !form?.getFieldValue('maximumReservationPerSlot')
    disableRule.limitation = form.getFieldValue('timeUnit') === NO_LIMIT
    disableRule.requireInAdvance = form.getFieldValue('reqMinimumUnit') === NO_LIMIT
    disableRule.typeForFuture = form.getFieldValue('typeForFuture') === CURRENT
    disableRule.allowCancel = form.getFieldValue('allowCancel')
    // disableRule.allowChange = form.getFieldValue('allowChange')
    disableRule.allowCancelLimitation = form.getFieldValue('reqCancelMinimumUnit') === NO_LIMIT
    this.setState({ disableRule })
  }

  setGenerateRuleCondition = (name, value) => {
    const { generateRuleCondition } = this.state
    this.setState({
      generateRuleCondition: { ...generateRuleCondition, [name]: value }
    })
  }

  handleGenerateSlot = () => {
    this.setState({
      generateDate: undefined,
      startTime: undefined,
      endTime: undefined,
      timeEachSlot: undefined,
      price: undefined
    })
    // const form = this.formRef.current
    const { generateRuleCondition } = this.state
    if (!generateRuleCondition || !generateRuleCondition.generateDate) {
      return this.setState({
        generateDate: LError('PLEASE_SELECT_DATE')
      })
    }
    if (
      generateRuleCondition.startTime === undefined ||
      generateRuleCondition.startTime === '' ||
      generateRuleCondition.endTime === undefined ||
      generateRuleCondition.endTime === ''
    ) {
      return this.setState({
        startTime: LError('PLEASE_SELECT_DATE'),
        endTime: LError('PLEASE_SELECT_DATE')
      })
    }
    if (moment(generateRuleCondition.startTime).isAfter(moment(generateRuleCondition.endTime))) {
      return this.setState({
        startTime: LError('END_TIME_MUST_BE_GREATER_THAN_START_TIME'),
        endTime: LError('END_TIME_MUST_BE_GREATER_THAN_START_TIME')
      })
    }
    if (!generateRuleCondition.timeEachSlot) {
      return this.setState({
        timeEachSlot: LError('INVALID_TIME_FOR_EACH_SLOT')
      })
    }

    let startTime = new Date(generateRuleCondition.startTime || '')
    const endTime = new Date(generateRuleCondition.endTime || '')
    let stepEndTime = new Date(startTime)
    stepEndTime.setMinutes(startTime.getMinutes() + (generateRuleCondition.timeEachSlot || 0))

    if (stepEndTime > endTime) {
      return this.setState({
        timeEachSlot: LError('TIME_FOR_EACH_SLOT_TOO_LARGE')
      })
    }

    // form.setFieldsValue({ timeRules: [] })
    if (generateRuleCondition.generateDate === 'ALL_DAY') {
      bookingDates.forEach((item) => {
        if (item.order > 0) {
          let startTime = new Date(generateRuleCondition.startTime || '')
          let stepEndTime = new Date(startTime)
          stepEndTime.setMinutes(startTime.getMinutes() + (generateRuleCondition.timeEachSlot || 0))
          if (stepEndTime.getHours() === 0 && stepEndTime.getMinutes() === 0) {
            stepEndTime.setHours(23, 59)
          }
          do {
            const timeRule = {
              ...item,
              startTime: moment(startTime),
              endTime: moment(stepEndTime),
              price: generateRuleCondition.price,
              isNew: true
            }
            this.addTimeRule(timeRule)
            startTime = new Date(stepEndTime)
            stepEndTime = new Date(startTime)
            stepEndTime.setMinutes(startTime.getMinutes() + (generateRuleCondition.timeEachSlot || 0))
          } while (stepEndTime <= endTime)
        }
      })
    } else {
      do {
        const timeRule = {
          ...generateRuleCondition,
          numNextValidDate: generateRuleCondition.generateDate,
          startTime: moment(startTime),
          endTime: moment(stepEndTime),
          isNew: true
        }
        this.addTimeRule(timeRule)
        startTime = new Date(stepEndTime)
        stepEndTime = new Date(startTime)
        stepEndTime.setMinutes(startTime.getMinutes() + (generateRuleCondition.timeEachSlot || 0))
      } while (stepEndTime <= endTime)
    }
    this.setState({ blockGen: true })
    this.setState({
      generateRuleCondition: { ...defaultGenerateRuleCondition }
    })
  }

  addTimeRule = (date) => {
    const form = this.formRef.current
    if (!form) {
      return
    }

    const timeRules = form.getFieldValue('timeRules') || {}
    timeRules[date.numNextValidDate] = timeRules[date.numNextValidDate] || []
    const invalidIndex = timeRules[date.numNextValidDate].findIndex((rule) => {
      return (
        isSame(rule.startTime, date.startTime) ||
        isSame(rule.endTime, date.endTime) ||
        isBetween(rule.startTime, rule.endTime, date.startTime) ||
        isBetween(rule.startTime, rule.endTime, date.endTime)
      )
    })

    if (invalidIndex >= 0) {
      LError('TIME_PERIOD_IS_OVERLAP_BY_OTHER_SLOT')
      return
    }

    timeRules[date.numNextValidDate].push({ ...date, editting: false })
    timeRules[date.numNextValidDate] = sortBy(timeRules[date.numNextValidDate], ['startTime'])

    form.setFields([{ name: 'timeRules', values: timeRules }])
  }

  handleClearSlot = () => {
    const form = this.formRef.current
    if (!form) {
      return
    }

    form.setFieldsValue({ timeRules: [] })
  }

  onSave = () => {
    const form = this.formRef.current
    this.state.tabActiveKey === tabKeys.tabMaintainance
      ? form.validateFields().then(async (values: any, error: any) => {
          const body = {
            amenityId: parseInt(this.props.params?.id),
            isEnable: this.state.enableMaintenance,
            startDate: Array.isArray(values.maintenanceTime) ? values.maintenanceTime[0].toISOString() : null,
            endDate: Array.isArray(values.maintenanceTime) ? values.maintenanceTime[1].toISOString() : null,
            description: values.maintenanceDescription
          }
          await this.props.amenityStore.updateAmenityMaintenance(body)
          this.setState({ isParent: false })
          this.setState({ blockGen: false })
          this.props.navigate({
            pathname: portalLayouts.amenitySettingManagement.path,
            search: 'amenity'
          })
        })
      : form.validateFields().then(async (values: any, error: any) => {
          if (error) return console.log(error)
          if (this.props.amenityStore.editAmenity?.id) {
            await this.props.amenityStore.update(
              {
                ...this.props.amenityStore.editAmenity,
                ...values
              },
              this.state.files
            )
          } else {
            await this.props.amenityStore.create(values, this.state.files)
          }

          this.setState({ isParent: false })
          this.setState({ blockGen: false })
          this.props.navigate({
            pathname: portalLayouts.amenitySettingManagement.path,
            search: 'amenity'
          })
        })
  }

  onCancel = () => {
    if (this.state.isDirty) {
      confirm({
        title: LNotification('ARE_YOU_SURE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          this.setState({ isParent: false })
          this.setState({ blockGen: false })
          this.props.navigate({
            pathname: portalLayouts.amenitySettingManagement.path,
            search: 'amenity'
          })
        }
      })
      return
    }
    this.setState({ isParent: false })
    this.setState({ blockGen: false })
    this.props.navigate({
      pathname: portalLayouts.amenitySettingManagement.path,
      search: 'amenity'
    })
  }

  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {isGrantedAny(appPermissions.amenity.create, appPermissions.amenity.update) && (
            <Button
              type="primary"
              disabled={this.props.params?.id && !this.isGranted(appPermissions.amenity.update)}
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

  public render() {
    const {
      projectStore: { buildingOptions },
      amenityStore: { isLoading, timezones, icons, memberRoles, unitTypes },
      amenityGroupStore: { amenityGroups }
    } = this.props
    const { disableRule, generateRuleCondition, isUseDeposited } = this.state
    const disabledDate: RangePickerProps['disabledDate'] = (current) => {
      // Can not select days before today and today
      return current && current < moment().endOf('day')
    }
    return (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Form ref={this.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
          <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab} type="card">
            <TabPane tab={L(tabKeys.tabInfo)} key={tabKeys.tabInfo}>
              <Card bordered={false}>
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('AMENITY_BUILDING')}
                      {...formVerticalLayout}
                      name="buildingIds"
                      rules={rules.buildingIds}>
                      <Select style={{ width: '100%' }} mode="multiple" showArrow>
                        {this.renderOptions(buildingOptions)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 4, offset: 0 }}>
                    <Form.Item
                      label={L('AMENITY_GROUP')}
                      {...formVerticalLayout}
                      name="amenityGroupId"
                      rules={rules.amenityGroupId}>
                      <Select style={{ width: '100%' }} allowClear>
                        {this.renderOptions(amenityGroups)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 4, offset: 0 }}>
                    <Form.Item
                      label={L('AMENITY_PARENT')}
                      {...formVerticalLayout}
                      name="parentAmenityId"
                      tooltip={L('AMENITY_PARENT_TOOLTIP')}>
                      <Select
                        style={{ width: '100%' }}
                        allowClear
                        showSearch
                        onChange={this.selectParentAmenity}
                        filterOption={false}
                        onSearch={debounce(this.searchAmenity, 300)}>
                        {this.renderOptions(this.state.listAmenities)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('AMENITY_NAME')} {...formVerticalLayout} name="names" rules={rules.name}>
                      <MultiLanguageInput />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('AMENITY_TIME_ZONE')}
                      {...formVerticalLayout}
                      name="timeZoneId"
                      rules={rules.timeZoneId}>
                      <Select style={{ width: '100%' }} showSearch showArrow filterOption={filterOptions}>
                        {this.renderOptions(timezones)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('AMENITY_NOTIFICATION_EMAIL')}
                      {...formVerticalLayout}
                      name="emailReceiveNotify"
                      rules={rules.emailReceiveNotify}>
                      <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('AMENITY_WHO_CAN_BOOK')} {...formVerticalLayout} name="amenityRoleIds">
                      <Select style={{ width: '100%' }} mode="multiple" showArrow>
                        {this.renderOptions(memberRoles)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('AMENITY_UNIT_TYPE')} {...formVerticalLayout} name="unitTypeCodes">
                      <Select style={{ width: '100%' }} mode="multiple" showArrow>
                        {this.renderOptions(unitTypes)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('AMENITY_DEPOSIT')}
                      {...formVerticalLayout}
                      name="isUseDeposited"
                      valuePropName="checked">
                      <Switch onChange={this.setIsUseDeposited} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    {isUseDeposited && (
                      <Form.Item
                        label={L('AMENITY_DEPOSIT_AMOUNT')}
                        {...formVerticalLayout}
                        name="depositAmount"
                        rules={rules.depositAmount}>
                        <CurrencyInput></CurrencyInput>
                      </Form.Item>
                    )}
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('AMENITY_STATUS')}
                      {...formVerticalLayout}
                      name="isActive"
                      valuePropName="checked">
                      <Switch defaultChecked />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('AMENITY_REQUIRED_APPROVE')}
                      {...formVerticalLayout}
                      name="isNeedApprove"
                      valuePropName="checked">
                      <Switch disabled={isUseDeposited} />
                    </Form.Item>
                  </Col>{' '}
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('AMENITY_MONTHLY_PACKAGE')}
                      {...formVerticalLayout}
                      name="isMonthlyPackage"
                      valuePropName="checked">
                      <Switch defaultChecked />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Popover
                      placement="bottom"
                      content={<div className="text-center">{L('AMENITY_LOCKED_RESIDENT_DESCRIPTION')}</div>}>
                      <Form.Item
                        label={L('AMENITY_LOCKED_RESIDENT')}
                        {...formVerticalLayout}
                        name="isLocked"
                        valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Popover>
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <Form.Item label={L('AMENITY_ICON')} {...formVerticalLayout} name="iconId" rules={rules.icon}>
                      <Select style={{ width: '100%' }} showArrow>
                        {(icons || []).map((option, index) => {
                          return (
                            <Option key={index} value={option.id}>
                              <Avatar src={option.path} size={20} /> {option.name}
                            </Option>
                          )
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <Form.Item label={L('AMENITY_REMARK')} {...formVerticalLayout} name="remarks">
                      <MultiLanguageTextArea />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <Form.Item
                      label={L('AMENITY_POLICY')}
                      name="policies"
                      {...formVerticalLayout}
                      rules={rules.policies}>
                      <MultiLanguageSyncFusion />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <FileUploadWrapV2
                      maxSize={25}
                      parentId={this.props.amenityStore.editAmenity?.uniqueId}
                      fileStore={this.props.fileStore}
                      onRemoveFile={this.onRemoveFile}
                      beforeUploadFile={this.beforeUploadFile}
                      acceptedFileTypes={fileTypeGroup.images}
                    />
                  </Col>
                </Row>
              </Card>
            </TabPane>

            <TabPane tab={L(tabKeys.tabRules)} key={tabKeys.tabRules}>
              <Card bordered={false}>
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 8, offset: 0 }}>{L('BOOKING_RULE_LIMITATION')}</Col>
                  <Col sm={{ span: 16, offset: 0 }}>
                    <Row gutter={[16, 0]}>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item label={L('BOOKING_RULE_LIMIT_TIME')} {...formVerticalLayout} name="numberOfLimit">
                          <NumberInput
                            min={0}
                            disabled={disableRule.limitation}
                            placeholder={L('BOOKING_RULE_LIMIT_TIME_PLACEHOLDER')}
                          />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item label={L('BOOKING_RULE_LIMIT_PER')} {...formVerticalLayout} name="numberOfTimes">
                          <NumberInput
                            min={0}
                            disabled={disableRule.limitation}
                            placeholder={L('BOOKING_RULE_LIMIT_PER_PLACEHOLDER')}
                          />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('BOOKING_RULE_LIMIT_TIME_DURATION')}
                          {...formVerticalLayout}
                          name="timeUnit">
                          <Select style={{ width: '100%' }} showArrow onChange={this.changeBookingRule}>
                            <Select.Option value={NO_LIMIT}>{L('NO_LIMIT')}</Select.Option>
                            {this.renderOptions(bookingTimes)}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>{L('BOOKING_RULE_REQUIRE_IN_ADVANCE')}</Col>
                  <Col sm={{ span: 16, offset: 0 }}>
                    <Row gutter={[16, 0]}>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <br />
                        <span className="small">{L('IN_ADVANCE')}</span>
                      </Col>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('BOOKING_RULE_REQUIRE_IN_ADVANCE_MINIMUM')}
                          {...formVerticalLayout}
                          name="reqMinimum">
                          <NumberInput
                            min={0}
                            placeholder={L('BOOKING_RULE_REQUIRE_IN_ADVANCE_MINIMUM_PLACEHOLDER')}
                            disabled={disableRule.requireInAdvance}
                          />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('BOOKING_RULE_REQUIRE_IN_ADVANCE_DURATION')}
                          {...formVerticalLayout}
                          name="reqMinimumUnit">
                          <Select
                            placeholder={L('BOOKING_RULE_REQUIRE_IN_ADVANCE_DURATION_PLACEHOLDER')}
                            style={{ width: '100%' }}
                            showArrow
                            onChange={this.changeBookingRule}>
                            <Select.Option value={NO_LIMIT}>{L('NO_LIMIT')}</Select.Option>
                            <Select.Option value="HOURS">{L('HOUR')}</Select.Option>
                            {this.renderOptions(bookingTimes)}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>{L('BOOKING_RULE_RESERVATION_WITHIN')}</Col>
                  <Col sm={{ span: 16, offset: 0 }}>
                    <Row gutter={[16, 0]}>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('BOOKING_RULE_RESERVATION_WITHIN_FUTURE_TYPE')}
                          {...formVerticalLayout}
                          name="typeForFuture">
                          <Select
                            placeholder={L('BOOKING_RULE_RESERVATION_WITHIN_FUTURE_TYPE_PLACEHOLDER')}
                            style={{ width: '100%' }}
                            showArrow
                            onChange={this.changeBookingRule}>
                            {this.renderOptions(bookingFutureTypes)}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('BOOKING_RULE_RESERVATION_WITHIN_LIMIT_TIME')}
                          {...formVerticalLayout}
                          name="limitForFuture">
                          <NumberInput
                            min={0}
                            disabled={disableRule.typeForFuture}
                            placeholder={L('BOOKING_RULE_RESERVATION_WITHIN_LIMIT_TIME_PLACEHOLDER')}
                          />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('BOOKING_RULE_REQUIRE_IN_ADVANCE_DURATION')}
                          {...formVerticalLayout}
                          name="limitForFutureUnit">
                          <Select
                            placeholder={L('BOOKING_RULE_REQUIRE_IN_ADVANCE_DURATION_PLACEHOLDER')}
                            style={{ width: '100%' }}
                            showArrow
                            onChange={this.changeBookingRule}>
                            {this.renderOptions(bookingTimes)}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>{L('BOOKING_RULE_CANCEL_BEFORE')}</Col>
                  <Col sm={{ span: 16, offset: 0 }}>
                    <Row gutter={[16, 0]}>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('BOOKING_RULE_ALLOW_CANCEL')}
                          {...formVerticalLayout}
                          name="allowCancel"
                          valuePropName="checked">
                          <Switch onChange={this.changeBookingRule} />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('BOOKING_RULE_ALLOW_CANCEL_LIMIT_TIME')}
                          {...formVerticalLayout}
                          name="reqCancelMinimum">
                          <NumberInput
                            min={0}
                            disabled={!disableRule.allowCancel || disableRule.allowCancelLimitation}
                          />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('BOOKING_RULE_ALLOW_CANCEL_DURATION')}
                          {...formVerticalLayout}
                          name="reqCancelMinimumUnit">
                          <Select
                            style={{ width: '100%' }}
                            showArrow
                            onChange={this.changeBookingRule}
                            disabled={!disableRule.allowCancel}>
                            <Select.Option value={NO_LIMIT}>{L('NO_LIMIT')}</Select.Option>
                            <Select.Option value="HOURS">{L('HOURS')}</Select.Option>
                            {this.renderOptions(bookingTimes)}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>

                  {/*
                  <Col sm={{ span: 8, offset: 0 }}>
                    {L('BOOKING_RULE_CHANGE_TIME_BEFORE')}
                  </Col>

                  <Col sm={{ span: 16, offset: 0 }}>
                    {' '}
                    <Row gutter={[16, 0]}>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('BOOKING_RULE_ALLOW_CHANGE_TIME')}
                          {...formVerticalLayout}
                          name="allowChange"
                          valuePropName="checked">
                          <Switch onChange={this.changeBookingRule} />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('BOOKING_RULE_ALLOW_CHANGE_LIMIT_TIME')}
                          {...formVerticalLayout}
                          name="reqChangeMinimum">
                          <NumberInput
                            min={0}
                            disabled={!disableRule.allowChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('BOOKING_RULE_ALLOW_CHANGE_TIME_BEFORE')}
                          {...formVerticalLayout}
                          name="reqChangeMinimumUnit">
                          <Select
                            style={{ width: '100%' }}
                            showArrow
                            onChange={this.changeBookingRule}
                            disabled={!disableRule.allowChange}>
                            <Select.Option value="HOURS">
                              {L('HOURS')}
                            </Select.Option>
                             {this.renderOptions(bookingTimes)}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  
                  */}

                  <Col sm={{ span: 8, offset: 0 }}>{L('BOOKING_RULE_ALLOW_OVERLAP')}</Col>
                  <Col sm={{ span: 16, offset: 0 }}>
                    <Row gutter={[16, 0]}>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('AMENITY_ALLOW_OVERLAP')}
                          {...formVerticalLayout}
                          name="isOverlap"
                          valuePropName="checked">
                          <Switch
                            onChange={(e) => {
                              this.setState({
                                disableRule: {
                                  ...this.state.disableRule,
                                  overlapNumber: !e
                                }
                              })
                            }}
                          />
                        </Form.Item>
                      </Col>
                      {this.formRef.current?.getFieldValue('isOverlap') && (
                        <>
                          <Col sm={{ span: 8, offset: 0 }}>
                            <label style={{ fontSize: 12, marginBottom: 10 }} className="text-muted d-block">
                              {L('UNLIMITED_BOOKING')}
                            </label>
                            <Switch
                              defaultChecked={this.state.disableRule.overlapNumber}
                              onChange={(e) => {
                                e &&
                                  this.formRef.current?.setFieldsValue({
                                    maximumReservationPerSlot: null
                                  })
                                this.setState({
                                  disableRule: {
                                    ...this.state.disableRule,
                                    overlapNumber: e
                                  }
                                })
                              }}
                            />
                          </Col>
                          <Col sm={{ span: 8, offset: 0 }}>
                            <Form.Item
                              label={L('BOOKING_RULE_ALLOW_OVERLAP_NUMBER')}
                              {...formVerticalLayout}
                              name="maximumReservationPerSlot">
                              <NumberInput disabled={disableRule.overlapNumber} min={0} />
                            </Form.Item>
                          </Col>
                        </>
                      )}
                    </Row>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>{L('BOOKING_RULE_MAXIMUM_EXTEND_SLOT')}</Col>
                  <Col sm={{ span: 16, offset: 0 }}>
                    <Form.Item
                      label={L('BOOKING_RULE_NUMBER_MAXIMUM_EXTEND_SLOT')}
                      {...formVerticalLayout}
                      name="numOfExtendTimeSlot">
                      <InputNumber
                        className="full-width"
                        min={0}
                        placeholder={L('BOOKING_RULE_NUMBER_MAXIMUM_EXTEND_SLOT_PLACEHOLDER')}
                        size={'middle'}
                        formatter={(value) => inputNumberFormatter(value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>{L('BOOKING_RULE_DEFINED_TIME_SLOT')}</Col>
                  <Col sm={{ span: 16, offset: 0 }}>
                    <Row gutter={[16, 0]}>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('BOOKING_RULE_GENERATE_DAYS')}
                          {...formVerticalLayout}
                          validateStatus={this.state.generateDate ? 'error' : undefined}
                          help={this.state.generateDate}>
                          <Select
                            placeholder={L('BOOKING_RULE_GENERATE_DAYS_PLACEHOLDER')}
                            style={{ width: '100%' }}
                            showArrow
                            value={generateRuleCondition.generateDate}
                            onChange={(value) => this.setGenerateRuleCondition('generateDate', value)}>
                            {this.renderOptions(bookingDates)}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('BOOKING_RULE_GENERATE_FROM')}
                          {...formVerticalLayout}
                          validateStatus={this.state.startTime ? 'error' : undefined}
                          help={this.state.startTime}>
                          <TimePicker
                            format={formatTime}
                            className="full-width"
                            minuteStep={15}
                            value={generateRuleCondition.startTime}
                            onChange={(value) => this.setGenerateRuleCondition('startTime', value)}
                          />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('BOOKING_RULE_GENERATE_TO')}
                          {...formVerticalLayout}
                          validateStatus={this.state.endTime ? 'error' : undefined}
                          help={this.state.endTime}>
                          <TimePicker
                            format={formatTime}
                            className="full-width"
                            minuteStep={15}
                            value={generateRuleCondition.endTime}
                            onChange={(value) => this.setGenerateRuleCondition('endTime', value)}
                          />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('BOOKING_RULE_GENERATE_TIME_EACH_SLOT')}
                          {...formVerticalLayout}
                          validateStatus={this.state.timeEachSlot ? 'error' : undefined}
                          help={this.state.timeEachSlot}>
                          <NumberInput
                            min={15}
                            max={1440}
                            value={generateRuleCondition.timeEachSlot}
                            placeholder={L('MIN_15_MAX_1440')}
                            onBlur={(value) => this.setGenerateRuleCondition('timeEachSlot', value)}
                          />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item label={L('BOOKING_RULE_GENERATE_SERVICE_USAGE_PRICE')} {...formVerticalLayout}>
                          <CurrencyInput
                            value={generateRuleCondition.price}
                            max={100000000}
                            onChange={(value) => this.setGenerateRuleCondition('price', value)}
                          />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item label={L('ACTIONS')} {...formVerticalLayout}>
                          <Button
                            disabled={this.state.isParent || this.state.blockGen}
                            className="ml-1"
                            icon={<CheckOutlined />}
                            size="middle"
                            onClick={this.handleGenerateSlot}>
                            {L('BTN_GENERATE')}
                          </Button>
                          <Button
                            disabled={this.state.isParent}
                            className="ml-1"
                            icon={<ClearOutlined />}
                            size="middle"
                            onClick={() => {
                              this.handleClearSlot(), this.setState({ blockGen: false })
                            }}>
                            {L('BTN_CLEAR')}
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    {bookingDates.map((item, i) => {
                      if (item.numNextValidDate === 'ALL_DAY') {
                        return
                      }

                      return (
                        <div key={i}>
                          <Row>
                            <Col sm={{ span: 24, offset: 0 }}>{L(item.numNextValidDate)}</Col>
                          </Row>
                          <Form.List name={['timeRules', item.numNextValidDate]}>
                            {(fields, { add, remove }) => (
                              <Row gutter={[16, 0]}>
                                {fields.map((field, index) => {
                                  return (
                                    <Col sm={{ span: 12, offset: 0 }} key={field.key + '-' + item.numNextValidDate}>
                                      <Row gutter={[16, 0]}>
                                        <Form.Item
                                          {...field}
                                          name={[field.name, 'numNextValidDate']}
                                          style={{ height: 0 }}>
                                          <Input
                                            style={{ display: 'none' }}
                                            hidden={true}
                                            disabled={this.state.isParent}
                                          />
                                        </Form.Item>
                                        <Col sm={{ span: 6, offset: 0 }} className="text-right">
                                          <Button
                                            disabled={this.state.isParent}
                                            className="ml-1"
                                            shape="circle"
                                            icon={<MinusOutlined />}
                                            onClick={() => remove(index)}></Button>
                                        </Col>
                                        <Col sm={{ span: 6, offset: 0 }}>
                                          <Form.Item
                                            {...field}
                                            {...formVerticalLayout}
                                            name={[field.name, 'startTime']}>
                                            <TimePicker
                                              disabled={this.state.isParent}
                                              onChange={() => this.setState({})}
                                              format={formatTime}
                                              className="full-width"
                                              minuteStep={30}
                                            />
                                          </Form.Item>
                                        </Col>
                                        <Col sm={{ span: 6, offset: 0 }}>
                                          <Form.Item {...field} {...formVerticalLayout} name={[field.name, 'endTime']}>
                                            <TimePicker
                                              disabled={this.state.isParent}
                                              format={formatTime}
                                              className="full-width"
                                              minuteStep={30}
                                            />
                                          </Form.Item>
                                        </Col>
                                        <Col sm={{ span: 6, offset: 0 }}>
                                          <Form.Item {...field} {...formVerticalLayout} name={[field.name, 'price']}>
                                            <CurrencyInput />
                                          </Form.Item>
                                        </Col>
                                      </Row>
                                    </Col>
                                  )
                                })}
                              </Row>
                            )}
                          </Form.List>
                        </div>
                      )
                    })}
                  </Col>
                </Row>
              </Card>
            </TabPane>
            {this.props.amenityStore.editAmenity?.id && (
              <TabPane tab={L(tabKeys.tabMaintainance)} key={tabKeys.tabMaintainance}>
                <Card bordered={false} style={{ minHeight: 680 }}>
                  <Row gutter={[16, 16]}>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Switch
                        checked={this.state.enableMaintenance}
                        onChange={(e) => this.setState({ enableMaintenance: e })}
                        className="mr-3"
                      />
                      {L('ENABLE_MAINTENANCE')}
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <FormDateRangePicker
                        dateTimeFormat={dateTimeFormat}
                        name="maintenanceTime"
                        rule={this.state.enableMaintenance && rules.projectId}
                        label={L('MAINTENANCE_TIME')}
                        dateTimeProps={{
                          showTime: true,
                          disabledDate: disabledDate
                        }}
                      />
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <FormTextArea
                        label={L('DESCRIPTION')}
                        name="maintenanceDescription"
                        rule={this.state.enableMaintenance && rules.projectId}
                      />
                    </Col>
                  </Row>
                </Card>
              </TabPane>
            )}
          </Tabs>
        </Form>
      </WrapPageScroll>
    )
  }
}

export default withRouter(AmenityDetail)
