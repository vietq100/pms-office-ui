import AppComponentBase from '@components/AppComponentBase'
import { Button, Form, Col, Row, Input } from 'antd'
import { inject, observer } from 'mobx-react'
import { MinusCircleOutlined } from '@ant-design/icons'
import { validateMessages } from '@lib/validation'
import AppConsts from '@lib/appconst'
import CurrencyInput from '@components/Inputs/CurrencyInput'
import PercentInput from '@components/Inputs/PercentInput'
import { L, LError } from '@lib/abpUtility'

const { purposeUsing, actionString } = AppConsts
interface State {
  uniqueId: string
  visibleButtonAdd: boolean
  fromIndexValueDefult: any
  vatValue: any
  isRequied: boolean
}

interface Props {
  formEletricConfig: any
  dataConfig: any
  purposeUsing: any
}

@inject()
@observer
class GenOvertimeFeeElectricTable extends AppComponentBase<Props, State> {
  maxResultCount = 10

  state = {
    uniqueId: '',
    visibleButtonAdd: false,
    fromIndexValueDefult: 0,
    vatValue: 0,
    isRequied: false
  }
  async componentDidMount() {
    const description = this.props.dataConfig?.feeOvertimeElectricityConfigurations
      ? this.props.dataConfig?.feeOvertimeElectricityConfigurations
          .filter((item) => item.type === this.props.purposeUsing)
          .map((item) => {
            return item.description
          })
      : []
    this.props.dataConfig?.feeOvertimeElectricityConfigurations
      .filter((item) => item.type === this.props.purposeUsing)
      .map((item) => {
        this.setState({ fromIndexValueDefult: item?.toIndex })
      })
    description.length > 0 ? this.setState({ visibleButtonAdd: true }) : this.setState({ visibleButtonAdd: false })

    this.props.formEletricConfig.current.setFieldsValue({
      description: description[0],
      feeOvertimeElectricityConfigurations: this.props.dataConfig?.feeOvertimeElectricityConfigurations
        ? this.props.dataConfig.feeOvertimeElectricityConfigurations.filter(
            (item) => item.type === this.props.purposeUsing
          )
        : []
    })
  }
  onChange = async (action) => {
    const arrConfig =
      this.props.formEletricConfig.current.getFieldsValue(['feeOvertimeElectricityConfigurations'])
        .feeOvertimeElectricityConfigurations ?? []

    if (action === actionString.remove) {
      const objConfig = arrConfig[arrConfig.length - 2]
      await this.setState({ fromIndexValueDefult: objConfig?.toIndex ?? 0, vatValue: objConfig?.vatpercent ?? 0 })
    } else if (action === actionString.add) {
      const objConfig = arrConfig[arrConfig.length - 1] //lấy data last row

      await this.setState({ vatValue: objConfig?.vatpercent ?? 0, fromIndexValueDefult: objConfig?.toIndex ?? 0 })
    }
  }
  checkDuplicate = (value: any) => {
    const checkData = this.props.formEletricConfig.current
      .getFieldsValue()
      .feeOvertimeElectricityConfigurations.filter((item) => item.indexNumber === value)
    if (checkData.length > 1) {
      return this.props.formEletricConfig.current.setFields([
        {
          name: 'isDuplicate',
          errors: [LError('INDEX_NUMBER_DO_NOT_DUPLICATE')]
        }
      ])
    } else {
      this.props.formEletricConfig.current.setFields([
        {
          name: 'isDuplicate',
          errors: null
        }
      ])
    }
  }
  render() {
    const { formEletricConfig } = this.props
    return (
      <>
        <Form validateMessages={validateMessages} ref={formEletricConfig} layout={'vertical'} size="middle">
          <Row gutter={[8, 8]}>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                name="description"
                label={L('FEE_TYPE_CONFIG_CONTENT')}
                rules={[{ required: true }, { max: 2000 }]}>
                <Input size="large" />
              </Form.Item>
              <Form.Item name="isDuplicate">
                <Input className="d-none" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 8]} style={{ marginBottom: 10 }} className="custom-col-fee-config">
            <Col span={4}>{L('FEE_CONFIG_OVERTIME_ELECTRIC_DEVELOPER_AMOUNT')}</Col>
            <Col span={4}>{L('FEE_CONFIG_OVERTIME_ELECTRIC_UNIT_PRICE')}</Col>
            <Col span={4}>{L('FEE_CONFIG_VAT')}</Col>

            <Col span={3}>{L('FEE_CONFIG_ACTION')}</Col>
          </Row>
          <Form.List name="feeOvertimeElectricityConfigurations">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ name, key, ...restField }) => (
                  <Row key={key} gutter={[8, 8]}>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        messageVariables={{ label: L('FEE_CONFIG_OVERTIME_ELECTRIC_DEVELOPER_AMOUNT') }}
                        name={[name, 'developerAmount']}
                        rules={[{ required: true }]}>
                        <CurrencyInput />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        messageVariables={{ label: L('FEE_CONFIG_OVERTIME_ELECTRIC_UNIT_PRICE') }}
                        name={[name, 'amount']}
                        rules={[{ required: true }]}>
                        <CurrencyInput />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        messageVariables={{ label: L('FEE_CONFIG_VAT') }}
                        name={[name, 'vatpercent']}
                        rules={[{ required: true }]}
                        initialValue={this.state.vatValue}>
                        <PercentInput />
                        {/* input only first row */}
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
                {
                  <Form.Item>
                    <Button
                      size="middle"
                      style={{
                        marginTop: 40,
                        display:
                          this.props.purposeUsing !== purposeUsing.residential && this.state.visibleButtonAdd === true
                            ? 'none'
                            : ''
                      }}
                      disabled={fields.length >= 5}
                      type="primary"
                      onClick={() => {
                        this.setState({ isRequied: true })
                        this.props.formEletricConfig.current.validateFields().then(() => {
                          this.onChange(actionString.add),
                            this.props.purposeUsing !== purposeUsing.residential &&
                              this.setState({ visibleButtonAdd: true })
                          add()
                        })
                      }}
                      onBlur={() => this.setState({ isRequied: false })}>
                      {L('ADD_NEW')}
                    </Button>
                  </Form.Item>
                }
              </>
            )}
          </Form.List>
        </Form>
      </>
    )
  }
}

export default GenOvertimeFeeElectricTable
