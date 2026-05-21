import { Col, Form, Input, InputNumber, Modal, Row, Select, DatePicker, Button } from 'antd'
import React from 'react'
import { isGrantedAny, L, LError } from '@lib/abpUtility'
import { FormInstance } from 'antd/lib/form'
import { IPackageFee } from '@models/fee'
import { packageFeeRules } from '@scenes/feeStatement/fee-package/components/PackageFeeBulkModal/form-validation'
import { appPermissions, dateFormat } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons/lib'
import { notifyError } from '@lib/helper'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const Option = Select.Option

interface PackageFeeProps {
  period?: any
  visible: boolean
  requiredCreate?: boolean
  callback: (pf: IPackageFee[]) => Promise<any>
  handleCancel: () => void
}

interface PackageFeeState {
  confirmLoading: boolean
}

class PackageFeeBulkModal extends React.Component<PackageFeeProps, PackageFeeState> {
  form = React.createRef<FormInstance>()

  constructor(props) {
    super(props)
    this.state = {
      confirmLoading: false
    }
  }

  generateFeePackages = async () => {
    const data = this.form.current?.getFieldsValue()
    const { year } = data || {}
    const feePackages: any[] = []
    for (let month = 0; month < 12; month++) {
      const startDate = dayjs(new Date(year, month, 1))
      const endDate = dayjs(startDate).endOf('month')
      feePackages.push({
        period: month + 1,
        name: `${month + 1}/${year}`,
        fromToDate: [startDate, endDate]
      })
    }

    this.form.current?.setFieldsValue({ feePackages })
  }

  handleOk = async () => {
    if (!this.validateBeforeSave()) {
      return
    }

    try {
      this.setState({ confirmLoading: true })
      await this.form.current?.validateFields()
      const data = this.form.current?.getFieldsValue()
      let { feePackages } = data || {}
      const { year } = data || {}
      feePackages = (feePackages || []).map((item) => {
        item.year = year
        return item
      })
      await this.props.callback(feePackages as IPackageFee[])
      this.setState({ confirmLoading: false })
    } catch {
      this.setState({ confirmLoading: false })
    }
  }

  validateBeforeSave = () => {
    const data = this.form.current?.getFieldsValue()
    const { feePackages } = data || {}

    if (!feePackages || !feePackages.length) {
      notifyError(LError('ERROR'), LError('PLEASE_ADD_ONE_FEE_PACKAGE_AT_LEAST'))
      return false
    }

    return true
  }

  handleCancel = () => {
    this.form.current?.resetFields()
    return this.props.handleCancel()
  }

  render() {
    const { visible, requiredCreate } = this.props
    const { confirmLoading } = this.state
    const values = {
      period: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      feePackages: [{}]
    }

    return (
      <div>
        <Modal
          title={L('PACKAGE_FEE_MODAL')}
          visible={visible}
          confirmLoading={confirmLoading}
          destroyOnClose
          maskClosable={false}
          width={800}
          closable={!requiredCreate}
          onCancel={this.handleCancel}
          keyboard={!requiredCreate}
          footer={[
            <Button key="1" onClick={this.handleCancel} disabled={requiredCreate} shape="round">
              {L('BTN_CANCEL')}
            </Button>,
            <Button key="2" onClick={this.generateFeePackages} shape="round">
              {L('BTN_GENERATE')}
            </Button>,
            <Button
              key="3"
              type="primary"
              shape="round"
              disabled={!isGrantedAny(appPermissions.feePackage.create, appPermissions.feePackage.update)}
              onClick={this.handleOk}>
              {L('BTN_OK')}
            </Button>
          ]}>
          <Form
            layout="vertical"
            ref={this.form}
            initialValues={values}
            validateMessages={validateMessages}
            size="middle">
            <Row gutter={16}>
              <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <Form.Item name="year" label={L('YEAR')} rules={packageFeeRules.year}>
                  <Select className="full-width">
                    {this.getYears().map((year) => (
                      <Option value={year} key={year}>
                        {L('YEAR')} {year}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.List name="feePackages">
                  {(fields, { add, remove }) => {
                    return (
                      <Row gutter={[24, 24]}>
                        {fields.map((field, index) => (
                          <Col sm={{ span: 12, offset: 0 }} key={field.key}>
                            <Row
                              gutter={[16, 0]}
                              style={{
                                border: '1px dashed #d9d9d9',
                                marginLeft: 0
                              }}
                              className="pt-3">
                              <Col md={{ span: 12 }} sm={{ span: 24 }}>
                                <Form.Item
                                  name={[field.name, 'period']}
                                  label={L('PERIOD')}
                                  rules={packageFeeRules.period}>
                                  <InputNumber min={1} className="full-width" />
                                </Form.Item>
                              </Col>
                              <Col sm={{ span: 12, offset: 0 }}>
                                <Form.Item
                                  name={[field.name, 'name']}
                                  label={L('PACKAGE_FEE_NAME')}
                                  rules={packageFeeRules.name}>
                                  <Input />
                                </Form.Item>
                              </Col>
                              <Col sm={{ span: 24, offset: 0 }}>
                                <Form.Item
                                  name={[field.name, 'fromToDate']}
                                  label={L('FROM_TO_DATE')}
                                  rules={packageFeeRules.fromToDate}>
                                  <RangePicker format={dateFormat} className="full-width" />
                                </Form.Item>
                              </Col>
                              <Col sm={{ span: 24, offset: 0 }}>
                                <Form.Item
                                  name={[field.name, 'description']}
                                  label={L('DESCRIPTION')}
                                  rules={packageFeeRules.description}>
                                  <Input.TextArea rows={1} />
                                </Form.Item>
                              </Col>
                            </Row>
                            <span
                              style={{
                                position: 'absolute',
                                right: '4px',
                                top: '3px'
                              }}>
                              <Button type="dashed" shape="round" size="small" onClick={() => remove(index)}>
                                <MinusOutlined />
                              </Button>
                            </span>
                          </Col>
                        ))}
                        <Col sm={{ span: 12, offset: 0 }}>
                          <Button type="dashed" onClick={add} className="full-width" shape="round">
                            <PlusOutlined /> {L('BTN_ADD')}
                          </Button>
                        </Col>
                      </Row>
                    )
                  }}
                </Form.List>
              </Col>
            </Row>
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

export default PackageFeeBulkModal
