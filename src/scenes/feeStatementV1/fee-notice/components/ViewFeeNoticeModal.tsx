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
import dayjs from 'dayjs'

const { formVerticalLayout, selectItem } = AppConsts
interface Props {
  visible: boolean
  dataView: any
  onCancel: () => void
}

interface State {
  feeTypes: any[]
  listPackage: any[]
  listNoticeType: any[]
  itemSelectBlock: any
  isLoading: boolean
}

export default class ViewFeeNoticeModal extends AppComponentBase<Props, State> {
  form: any = React.createRef()

  state = {
    feeTypes: [],
    listPackage: [],
    listNoticeType: [],
    itemSelectBlock: undefined,
    isLoading: false
  }

  componentDidUpdate = async (prevProps) => {
    if (prevProps.visible !== this.props.visible) {
      if (this.props.visible) {
        this.getListFeeType('')

        this.handlePackageSearch('')
        this.handleNoticeTemplateSearch('')
        this.initData()
      }
    }
  }

  initData = () => {
    this.form.current.setFieldsValue({
      ...this.props.dataView,
      feeTypeIds: this.props.dataView?.data?.feeTypeIds === null ? [-1] : this.props.dataView?.data?.feeTypeIds,
      buildingIds: this.props.dataView?.data?.buildingIds,
      ignoreFromMinAmount: this.props.dataView?.data?.ignoreFromMinAmount,
      methodIds: this.props.dataView?.data?.methodIds,
      beforeOn: this.props.dataView?.data?.beforeOn ? dayjs(this.props.dataView?.data?.beforeOn) : null,
      waterPackageId: this.props.dataView?.data?.waterPackageId,
      waterPeriodFromDate: this.props.dataView?.data?.waterPeriodFromDate
        ? dayjs(this.props.dataView?.data?.waterPeriodFromDate)
        : null,
      waterPeriodToDate: this.props.dataView?.data?.waterPeriodToDate
        ? dayjs(this.props.dataView?.data?.waterPeriodToDate)
        : null,
      debtClosingDate: this.props.dataView?.data?.debtClosingDate
        ? dayjs(this.props.dataView?.data?.debtClosingDate)
        : null,
      issuedDate: this.props.dataView?.data?.issuedDate ? dayjs(this.props.dataView?.data?.issuedDate) : null
    })
  }

  getListFeeType = async (keyword) => {
    const listFeeTypes = await feeTypeService.getList({ keyword, isActive: true })

    listFeeTypes.unshift({
      code: 'ALL',
      description: 'Select All',
      id: -1,
      isActive: true,
      name: L('ALL_SELECT_FEE')
    })
    this.setState({ feeTypes: listFeeTypes })
  }

  handleChangeFee = async (feeTypeId) => {
    // -1 = Select All
    feeTypeId[0] === -1 ? this.setState({ itemSelectBlock: -1 }) : this.setState({ itemSelectBlock: 'NOT_ALL' })
    if (feeTypeId.length < 1) {
      this.setState({ itemSelectBlock: undefined })
    }
  }

  handlePackageSearch = async (value) => {
    const packages = await packageFeeService.filter({
      keyword: value,
      isClosed: false
    })
    this.setState({ listPackage: packages })
  }

  handleNoticeTemplateSearch = async (value) => {
    const noticeTemplate = await feeNoticeService.getTemplatesll({
      keyword: value
    })
    this.setState({ listNoticeType: noticeTemplate })
  }

  render(): React.ReactNode {
    const { visible, onCancel } = this.props

    return (
      this.props.visible && (
        <Modal
          style={{ top: 15 }}
          open={visible}
          onCancel={onCancel}
          destroyOnClose
          title={L('VIEW_FEE_NOTICE_MODAL_TITLE')}
          footer={[
            <>
              <Button
                onClick={() => {
                  onCancel(), this.setState({ itemSelectBlock: undefined })
                }}>
                {L('BTN_BACK')}
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
                  disabled={true}
                  label={L('FEE_NOTICE_NOTICE_TYPE')}
                  rule={rules.noticeType}
                  name="feeNotificationTypeId"
                  options={this.state.listNoticeType}
                  // selectProps={{
                  //   onSearch: debounce(handleNoticeTemplateSearch, 300)
                  // }}
                />
              </Col>
              <Col md={{ span: 10 }} sm={{ span: 24 }}>
                <FormSelect
                  disabled={true}
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
                    disabled={true}
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
              {this.props.dataView?.data?.waterPackageId !== 0 && (
                <>
                  <Col span={24}>
                    <label className="fs-6">{L('PERIOD_WATER_CONTENT')}</label>
                  </Col>
                  <Col md={{ span: 8 }} sm={{ span: 24 }}>
                    <FormSelect
                      label={L('FEE_NOTICE_WATER_PACKAGE')}
                      rule={[{ required: true }]}
                      name="waterPackageId"
                      options={this.state.listPackage}
                      disabled={true}
                      selectProps={{
                        onSearch: debounce(this.handlePackageSearch, 300)
                      }}
                    />
                  </Col>
                  <Col md={{ span: 8 }} sm={{ span: 24 }}>
                    <FormDatePicker
                      label="FEE_NOTICE_WATER_FROM_DATE"
                      name="waterPeriodFromDate"
                      rule={[{ required: true }]}
                      disabled={true}
                    />
                  </Col>
                  <Col md={{ span: 8 }} sm={{ span: 24 }}>
                    <FormDatePicker
                      label="FEE_NOTICE_WATER_FROM_TO"
                      name="waterPeriodToDate"
                      rule={[{ required: true }]}
                      disabled={true}
                    />
                  </Col>
                </>
              )}
              <Col md={{ span: 8 }}>
                <FormDatePicker label="FEE_NOTICE_BEFORE_ON" name="beforeOn" rule={rules.beforeOn} disabled={true} />
              </Col>
              <Col md={{ span: 8 }}>
                <FormDatePicker label="FEE_NOTICE_DEBIT_CLOSING_DATE" name="debtClosingDate" disabled={true} />
              </Col>

              <Col md={{ span: 8 }}>
                <FormDatePicker label="FEE_NOTICE_DATE_OF_ISSUED" name="issuedDate" disabled={true} />
              </Col>

              <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <Form.Item label={L('FEE_NOTICE_IGN0RE_MIN')} name="ignoreFromMinAmount" {...formVerticalLayout}>
                  <CurrencyInput disabled={true} />
                </Form.Item>
                <label style={{ fontSize: 11 }}>{L('FEE_NOTICE_PLACEHOLDER_IGNORE_MIN_AMOUNT')}</label>
              </Col>
            </Row>
          </Form>
        </Modal>
      )
    )
  }
}
