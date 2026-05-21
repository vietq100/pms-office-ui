import { Col, Form, Input, InputNumber, Modal, Row, Select, DatePicker } from 'antd'
import React from 'react'
import { isGrantedAny, L } from '@lib/abpUtility'
import { FormInstance } from 'antd/lib/form'
import { IPackageFee } from '@models/fee'
import { packageFeeRules } from '@scenes/feeStatement/fee-package/components/PackageFeeModal/form-validation'
import get from 'lodash/get'
import { appPermissions, dateFormat } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import { notifySuccess } from '@lib/helper'

const { RangePicker } = DatePicker
const Option = Select.Option

interface PackageFeeProps {
  period?: any
  visible: boolean
  callback: (pf: IPackageFee) => Promise<any>
  handleCancel: () => void
  packageFee: IPackageFee | null
  projects: any[]
  onSearchProject: (keyword: string) => void
}

interface PackageFeeState {
  confirmLoading: boolean
}
class PackageFeeModal extends React.Component<PackageFeeProps, PackageFeeState> {
  form = React.createRef<FormInstance>()

  constructor(props) {
    super(props)
    this.state = {
      confirmLoading: false
    }
  }

  handleOk = async () => {
    try {
      this.setState({ confirmLoading: true })
      await this.form.current?.validateFields()
      const data = this.form.current?.getFieldsValue()
      await this.props.callback(data as IPackageFee)
      this.setState({ confirmLoading: false })
      notifySuccess(L('SUCCESSFULLY'), '')
    } catch {
      this.setState({ confirmLoading: false })
    }
  }

  handleCancel = () => {
    this.form.current?.resetFields()
    return this.props.handleCancel()
  }

  handleSearchProject = (keyword) => this.props.onSearchProject(keyword)

  render() {
    const { visible, packageFee } = this.props
    const { confirmLoading } = this.state
    const values = {
      ...packageFee,
      period: get(packageFee, 'period') || new Date().getMonth() + 1,
      year: get(packageFee, 'year') || new Date().getFullYear()
    }
    return (
      <div>
        <Modal
          title={L('PACKAGE_FEE_MODAL')}
          visible={visible}
          onOk={this.handleOk}
          confirmLoading={confirmLoading}
          onCancel={this.handleCancel}
          cancelText={L('BTN_CANCEL')}
          destroyOnClose
          maskClosable={false}
          okButtonProps={{
            disabled: !isGrantedAny(appPermissions.feePackage.create, appPermissions.feePackage.update),
            className: !isGrantedAny(appPermissions.feePackage.create, appPermissions.feePackage.update) ? 'd-none' : ''
          }}>
          <Form
            layout="vertical"
            ref={this.form}
            initialValues={values}
            validateMessages={validateMessages}
            size="middle">
            <Row gutter={16}>
              <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name="period" label={L('PERIOD')} rules={packageFeeRules.period}>
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col md={{ span: 12 }} sm={{ span: 24 }}>
                <Form.Item name="year" label={L('YEAR')} rules={packageFeeRules.year}>
                  <Select style={{ width: '100%' }}>
                    {this.getYears().map((year) => (
                      <Option value={year} key={year}>
                        {L('YEAR')} {year}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item name="fromToDate" label={L('FROM_TO_DATE')} rules={packageFeeRules.fromToDate}>
                  <RangePicker format={dateFormat} className="full-width" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="name" label={L('PACKAGE_FEE_NAME')} rules={packageFeeRules.name}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label={L('DESCRIPTION')} rules={packageFeeRules.description}>
              <Input.TextArea rows={6} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }

  getYears() {
    const years = [] as number[]
    const currentYears = new Date().getFullYear()
    for (let y = currentYears - 10; y <= currentYears + 10; y++) years.push(y)

    return years
  }
}

export default PackageFeeModal
