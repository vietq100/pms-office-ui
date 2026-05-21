import AppComponentBase from '@components/AppComponentBase'
import { Button, Form, Select, InputNumber, Col, Row, Input } from 'antd'

import { inject, observer } from 'mobx-react'
import '@scenes/feeStatement/receipt/components/receipt.less'

import { MinusCircleOutlined } from '@ant-design/icons'

import { validateMessages } from '@lib/validation'

import AppConsts from '@lib/appconst'
import { inputNumberFormatter } from '@lib/helper'
import CurrencyInput from '@components/Inputs/CurrencyInput'
import PercentInput from '@components/Inputs/PercentInput'
import { L, LError } from '@lib/abpUtility'

const { indexNumber, purposeUsing, actionString } = AppConsts
interface State {
  waterConfig: any
  listIndex: any
  visibleButtonAdd: boolean
  fromIndexValueDefult: any
  vatValue: any
  vatEnvironmentValue: any
  environmentFeePercent: any
  isRequied: boolean
}

interface Props {
  formWaterConfig: any
  dataConfig: any
  purposeUsing: any
}

@inject()
@observer
class GenFeeWaterTable extends AppComponentBase<Props, State> {
  maxResultCount = 10

  state = {
    waterConfig: [] as any,
    listIndex: [] as any,
    visibleButtonAdd: false,
    fromIndexValueDefult: 0,
    vatValue: 0,
    vatEnvironmentValue: 0,
    environmentFeePercent: 0,
    isRequied: false
  }
  async componentDidMount() {
    this.setState({ listIndex: indexNumber })
    const description = this.props.dataConfig?.feeWaterConfigurations
      ? this.props.dataConfig?.feeWaterConfigurations
          .filter((item) => item.type === this.props.purposeUsing)
          .map((item) => {
            return item.description
          })
      : []
    description.length > 0 ? this.setState({ visibleButtonAdd: true }) : this.setState({ visibleButtonAdd: false })

    this.props.formWaterConfig.current.setFieldsValue({
      description: description[0],
      feeWaterConfigurations: this.props.dataConfig?.feeWaterConfigurations
        ? this.props.dataConfig.feeWaterConfigurations.filter((item) => item.type === this.props.purposeUsing)
        : []
    })
  }

  onChange = async (action) => {
    const arrConfig =
      this.props.formWaterConfig.current.getFieldsValue(['feeWaterConfigurations']).feeWaterConfigurations ?? []
    if (action === actionString.remove) {
      const objConfig = arrConfig[arrConfig.length - 2]
      await this.setState({
        fromIndexValueDefult: objConfig?.toIndex ?? 0,
        vatValue: objConfig?.vatpercent ?? 0,
        vatEnvironmentValue: objConfig?.vatEnvironmentFeePercent ?? 0
      })
    } else if (action === actionString.add) {
      const objConfig = arrConfig[arrConfig.length - 1]
      await this.setState({
        fromIndexValueDefult: objConfig?.toIndex ?? 0,
        vatValue: objConfig?.vatpercent ?? 0,
        vatEnvironmentValue: objConfig?.vatEnvironmentFeePercent ?? 0,
        environmentFeePercent: objConfig?.environmentFeePercent ?? 0
      })
    }
  }
  checkDuplicate = (value: any) => {
    const checkData = this.props.formWaterConfig.current
      .getFieldsValue()
      .feeWaterConfigurations.filter((item) => item.indexNumber === value)
    if (checkData.length > 1) {
      return this.props.formWaterConfig.current.setFields([
        {
          name: 'isDuplicate',
          errors: [LError('INDEX_NUMBER_DO_NOT_DUPLICATE')]
        }
      ])
    } else {
      this.props.formWaterConfig.current.setFields([
        {
          name: 'isDuplicate',
          errors: null
        }
      ])
    }
  }
  render() {
    const { formWaterConfig } = this.props
    return (
      <>
        <Form validateMessages={validateMessages} ref={formWaterConfig} layout={'vertical'} size="middle">
          <Row gutter={[8, 8]}>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                name="description"
                label={L('FEE_TYPE_CONFIG_CONTENT')}
                rules={[{ required: true }, { max: 2000 }]}>
                <Input size="middle" />
              </Form.Item>
              <Form.Item name="isDuplicate">
                <Input size="middle" className="d-none" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[8, 8]} style={{ marginBottom: 10 }} className="custom-col-fee-config">
            <Col span={3}>{L('FEE_CONFIG_INDEX')}</Col>
            {this.props.purposeUsing === purposeUsing.residential && <Col span={3}>{L('FEE_WATER_CONFIG_FROM')}</Col>}
            {this.props.purposeUsing === purposeUsing.residential && <Col span={3}>{L('FEE_WATER_CONFIG_TO')}</Col>}
            <Col span={3}>{L('FEE_CONFIG_AMOUNT')}</Col>
            <Col span={3}>{L('FEE_CONFIG_VAT')}</Col>
            <Col span={3}>{L('FEE_CONFIG_ENVIRONMENT')}</Col>
            <Col span={3}>{L('VAT_FEE_CONFIG_ENVIRONMENT')}</Col>
            <Col span={1}>{L('FEE_CONFIG_ACTION')}</Col>
          </Row>
          <Form.List name="feeWaterConfigurations">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ name, key, ...restField }) => (
                  <Row key={key} gutter={[8, 8]}>
                    <Col span={3}>
                      <Form.Item
                        {...restField}
                        messageVariables={{ label: L('FEE_CONFIG_INDEX') }}
                        name={[name, 'indexNumber']}
                        rules={[{ required: true }]}
                        initialValue={name + 1}>
                        <Select
                          size="middle"
                          allowClear
                          showSearch
                          showArrow
                          defaultValue={name + 1}
                          disabled
                          onChange={(value) => this.checkDuplicate(value)}
                          style={{ width: '100%' }}>
                          {this.state.listIndex.map((item) => (
                            <Select.Option key={item.id} value={item.id}>
                              {L(item.name)}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    {this.props.purposeUsing === purposeUsing.residential && (
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          messageVariables={{
                            label: L('FEE_WATER_CONFIG_FROM')
                          }}
                          name={[name, 'fromIndex']}
                          rules={[{ required: true }]}
                          initialValue={this.state.fromIndexValueDefult + 1} //Cộng thêm 1 đơn vị cho giá trị sau
                        >
                          <InputNumber
                            size="middle"
                            min={0}
                            formatter={(value) => inputNumberFormatter(value)}
                            className="full-width"
                            disabled
                            // defaultValue={this.state.fromIndexValueDefult}
                          />
                        </Form.Item>
                      </Col>
                    )}
                    {this.props.purposeUsing === purposeUsing.residential && (
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          messageVariables={{ label: L('FEE_WATER_CONFIG_TO') }}
                          name={[name, 'toIndex']}
                          rules={[{ required: this.state.isRequied }]}>
                          <InputNumber
                            size="middle"
                            min={this.state.fromIndexValueDefult + 2} //Cho min giá trị phải lớn hơn "FromIdex"
                            onChange={() => this.onChange(actionString.changeValue)}
                            formatter={(value) => inputNumberFormatter(value)}
                            className="full-width"
                            disabled={name + 1 !== fields.length}
                          />
                        </Form.Item>
                      </Col>
                    )}
                    <Col span={3}>
                      <Form.Item
                        {...restField}
                        messageVariables={{ label: L('FEE_CONFIG_AMOUNT') }}
                        name={[name, 'amount']}
                        rules={[{ required: true }]}>
                        <CurrencyInput disabled={name + 1 !== fields.length} />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item
                        {...restField}
                        messageVariables={{ label: L('FEE_CONFIG_VAT') }}
                        name={[name, 'vatpercent']}
                        rules={[{ required: true }]}
                        initialValue={this.state.vatValue}>
                        <PercentInput disabled={fields.length !== 1} />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item
                        {...restField}
                        messageVariables={{ label: L('FEE_CONFIG_VAT') }}
                        name={[name, 'environmentFeePercent']}
                        rules={[{ required: true }]}
                        initialValue={this.state.environmentFeePercent}>
                        <PercentInput disabled={fields.length !== 1} />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item
                        {...restField}
                        messageVariables={{
                          label: L('VAT_FEE_CONFIG_ENVIRONMENT')
                        }}
                        initialValue={this.state.vatEnvironmentValue}
                        name={[name, 'vatEnvironmentFeePercent']}
                        rules={[{ required: true }]}>
                        <PercentInput disabled={fields.length !== 1} />
                      </Form.Item>
                    </Col>
                    <Col span={0}>
                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                        initialValue={this.props.purposeUsing}
                        rules={[{ required: true }]}>
                        <Input disabled />
                      </Form.Item>
                    </Col>
                    {fields.length - 1 === name && (
                      <Col span={1}>
                        <MinusCircleOutlined
                          onClick={() => {
                            this.setState({ isRequied: false })
                            this.onChange(actionString.remove),
                              this.props.purposeUsing !== purposeUsing.residential &&
                                this.setState({ visibleButtonAdd: false })
                            remove(name)
                          }}
                        />
                      </Col>
                    )}
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    size="middle"
                    type="primary"
                    onClick={async () => {
                      this.setState({ isRequied: true })
                      this.props.formWaterConfig.current.validateFields().then(() => {
                        this.onChange(actionString.add),
                          this.props.purposeUsing !== purposeUsing.residential &&
                            this.setState({ visibleButtonAdd: true })

                        add()
                      })
                    }}
                    onBlur={() => this.setState({ isRequied: false })}
                    disabled={fields.length >= 5}
                    style={{
                      marginTop: 40,
                      display:
                        this.props.purposeUsing !== purposeUsing.residential && this.state.visibleButtonAdd === true
                          ? 'none'
                          : ''
                    }}>
                    {L('ADD_NEW')}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </>
    )
  }
}

export default GenFeeWaterTable
