import { L, isGrantedAny } from '@lib/abpUtility'
import { Button, Col, Form, Modal, Row, Select } from 'antd'
import React from 'react'
import debounce from 'lodash/debounce'
import packageFeeService from '@services/fee/packageFeeService'
import { validateMessages } from '@lib/validation'
import feeNoticeService from '@services/fee/feeNoticeService'
import feeTypeService from '@services/fee/feeTypeService'
import FormSelect from '@components/FormItem/FormSelect'
import rules from './validation'
import CurrencyInput from '@components/Inputs/CurrencyInput'
import AppConsts, { appPermissions } from '@lib/appconst'
import AppComponentBase from '@components/AppComponentBase'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import { addItemToList, filterOptions } from '@lib/helper'

const { formVerticalLayout, selectItem, feeSourceGroup } = AppConsts
interface Props {
  visible: boolean
  onCancel: () => void
  onCancelAndRefresh: () => void
}

interface State {
  feeTypes: any[]
  listPackage: any[]
  listNoticeType: any[]
  itemSelectBlock: any
  isLoading: boolean
  isRequiedDebitCloseDate: boolean
  feePackageCurrent: any
}

export default class FeeNoticeCreateModal extends AppComponentBase<Props, State> {
  form: any = React.createRef()

  state = {
    feeTypes: [],
    listPackage: [],
    listNoticeType: [],
    itemSelectBlock: undefined,
    isLoading: false,
    isRequiedDebitCloseDate: false,
    feePackageCurrent: {} as any
  }

  async componentDidMount() {
    await this.getListFeeType('')
    await this.handlePackageSearch('')
    await this.handleNoticeTemplateSearch('')
    await this.handleCurrentFeePackage()
    addItemToList(this.state.listPackage, this.state.feePackageCurrent)
  }

  componentDidUpdate = async (prevProps) => {
    if (!prevProps.visible && this.props.visible) {
      if (this.props.visible) {
        await this.handleCurrentFeePackage()
        addItemToList(this.state.listPackage, this.state.feePackageCurrent)
        this.form.current?.setFieldsValue({
          feePackageId: this.state.feePackageCurrent?.id
        })
      }
    }
  }

  handleCurrentFeePackage = async () => {
    const feePackageCurrent = await feeTypeService.getCurrent()
    this.setState({ feePackageCurrent })
  }

  handleSubmit = async () => {
    this.form.current.validateFields().then(async (values: any) => {
      const feeTypeIds = values.feeTypeIds.find((item: number) => item === -1)

      if (feeTypeIds === -1) {
        values.feeTypeIds = null
      }

      values.data = {
        IssuedDate: values.IssuedDate,
        debtClosingDate: values.debtClosingDate,
        beforeOn: values.beforeOn,
        feeTypeIds: values.feeTypeIds,
        buildingIds: values.buildingIds,
        methodIds: values.methodIds,
        ignoreFromMinAmount: values.ignoreFromMinAmount,
        waterPackageId: values.waterPackageId,
        waterPeriodFromDate: values.waterPeriodFromDate,
        waterPeriodToDate: values.waterPeriodToDate
      }
      delete values.IssuedDate
      delete values.debtClosingDate
      delete values.waterPeriodFromDate
      delete values.waterPeriodToDate
      delete values.waterPackageId
      delete values.feeTypeIds
      delete values.buildingIds
      delete values.methodIds
      delete values.beforeOn
      this.setState({ isLoading: true })
      await feeNoticeService.create(values)
      await this.form.current.resetFields()
      this.setState({ itemSelectBlock: undefined })
      this.props.onCancelAndRefresh()
      this.setState({ isLoading: false })
    })
  }

  getListFeeType = async (keyword: string) => {
    const listFeeTypes = await feeTypeService.getList({
      keyword,
      isActive: true,
      isRefundable: false,
      groupName: feeSourceGroup.feeManagement
    })

    listFeeTypes.unshift({
      code: 'ALL',
      description: 'Select All',
      id: -1,
      isActive: true,
      feeGenerateConfigurations: [],
      name: 'Select All'
    })
    this.setState({ feeTypes: listFeeTypes })
  }

  handleChangeFee = async (feeTypeIds: number[]) => {
    //feeTypeId=== -1 > Select All
    feeTypeIds[0] === -1 ? this.setState({ itemSelectBlock: -1 }) : this.setState({ itemSelectBlock: 'NOT_ALL' })
    if (feeTypeIds.length < 1) {
      this.setState({ itemSelectBlock: undefined })
    }
  }

  handlePackageSearch = async (value: string) => {
    const packages = await packageFeeService.filter({
      keyword: value,
      isClosed: false
    })
    this.setState({ listPackage: packages })
  }

  handleNoticeTemplateSearch = async (value: string) => {
    const noticeTemplate = await feeNoticeService.getTemplatesll({
      keyword: value
    })

    this.setState({ listNoticeType: noticeTemplate })
  }

  checkRequiredDebitCloseDate = (value) => {
    const { listNoticeType } = this.state
    const code: any = listNoticeType.find((item: any) => item.id === value)

    if (code.notificationCode !== 'App.FeeStatement.Notification.StopService') {
      this.setState({ isRequiedDebitCloseDate: true })
    } else {
      this.setState({ isRequiedDebitCloseDate: false })
    }
  }

  render(): React.ReactNode {
    const { visible, onCancel } = this.props

    return (
      <Modal
        style={{ top: 15 }}
        open={visible}
        destroyOnClose
        maskClosable={false}
        title={L('FEE_NOTICE_MODAL_TITLE')}
        cancelText={L('BTN_CANCEL')}
        onCancel={() => {
          onCancel(), this.setState({ itemSelectBlock: undefined })
        }}
        footer={[
          <>
            <Button
              onClick={() => {
                onCancel(), this.setState({ itemSelectBlock: undefined })
              }}>
              {L('BTN_CANCEL')}
            </Button>
            <Button type="primary" loading={this.state.isLoading} onClick={this.handleSubmit}>
              {L('BTN_SAVE')}
            </Button>
          </>
        ]}
        okButtonProps={{
          disabled: !isGrantedAny(appPermissions.feeNotice.create),
          className: !isGrantedAny(appPermissions.feeNotice.create) ? 'd-none' : ''
        }}>
        <Form layout="vertical" ref={this.form} validateMessages={validateMessages} size="middle">
          <Row gutter={16}>
            <Col md={{ span: 14 }} sm={{ span: 24 }}>
              <FormSelect
                label={L('FEE_NOTICE_NOTICE_TYPE')}
                rule={rules.noticeType}
                name="feeNotificationTypeId"
                onChange={this.checkRequiredDebitCloseDate}
                options={this.state.listNoticeType}
                selectProps={{
                  filterOption: filterOptions
                }}
              />
            </Col>
            <Col md={{ span: 10 }} sm={{ span: 24 }}>
              <FormSelect
                label={L('FEE_NOTICE_PERIOD')}
                rule={rules.period}
                name="feePackageId"
                options={this.state.listPackage}
                selectProps={{
                  onSearch: debounce(this.handlePackageSearch, 300)
                }}
              />
            </Col>
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <Form.Item
                label={L('FEE_NOTICE_FEE_TYPE')}
                name="feeTypeIds"
                rules={rules.feeType}
                {...formVerticalLayout}>
                <Select
                  showSearch
                  showArrow
                  allowClear
                  filterOption={false}
                  className="full-width"
                  mode="multiple"
                  onChange={this.handleChangeFee}
                  onSearch={debounce(this.getListFeeType, 300)}
                  size="middle">
                  {this.state.feeTypes.map((item: any) => (
                    <Select.Option
                      key={item.id}
                      value={item.id}
                      disabled={
                        this.state.itemSelectBlock === selectItem.all
                          ? item.id !== selectItem.all
                            ? true
                            : false
                          : this.state.itemSelectBlock === 'NOT_ALL'
                          ? item.id !== selectItem.all
                            ? false
                            : true
                          : false
                      }>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col md={{ span: 8 }}>
              <FormDatePicker label="FEE_NOTICE_BEFORE_ON" name="beforeOn" rule={rules.beforeOn} />
            </Col>
            <Col md={{ span: 8 }}>
              <FormDatePicker
                label="FEE_NOTICE_DEBIT_CLOSING_DATE"
                name="debtClosingDate"
                rule={this.state.isRequiedDebitCloseDate ? [{ required: true }] : [{ required: false }]}
              />
            </Col>
            <Col md={{ span: 8 }}>
              <FormDatePicker label="FEE_NOTICE_DATE_OF_ISSUED" name="IssuedDate" rule={[{ required: true }]} />
            </Col>

            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <Form.Item label={L('FEE_NOTICE_IGN0RE_MIN')} name="ignoreFromMinAmount" {...formVerticalLayout}>
                <CurrencyInput />
              </Form.Item>
              <label style={{ fontSize: 11 }}>{L('FEE_NOTICE_PLACEHOLDER_IGNORE_MIN_AMOUNT')}</label>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}
