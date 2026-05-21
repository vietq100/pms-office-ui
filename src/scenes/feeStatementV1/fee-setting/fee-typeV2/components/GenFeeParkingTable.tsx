import AppComponentBase from '@components/AppComponentBase'
import { Form, Col, Row, Button, Input } from 'antd'
import { inject, observer } from 'mobx-react'
import { validateMessages } from '@lib/validation'
import CurrencyInput from '@components/Inputs/CurrencyInput'
import PercentInput from '@components/Inputs/PercentInput'
import { L, LError } from '@lib/abpUtility'
import feeTypeService from '@services/fee/feeTypeService'
import { MinusCircleOutlined } from '@ant-design/icons'
interface State {
  listVehicelType: any
  visible: boolean
}

interface Props {
  formParkingConfig: any
  dataConfig: any
}

@inject()
@observer
class GenFeeParkingTable extends AppComponentBase<Props, State> {
  maxResultCount = 10

  state = {
    listVehicelType: [] as any,
    visible: true
  }
  async componentDidMount() {
    const listVehicelType = await feeTypeService.GetListVehicelType()
    const description = this.props.dataConfig?.feeParkingConfigurations
      ? this.props.dataConfig?.feeParkingConfigurations.map((item) => {
          return item.description
        })
      : []
    this.setState({ listVehicelType: listVehicelType })
    this.props.dataConfig?.feeParkingConfigurations.length > 0
      ? this.setState({ visible: true })
      : this.setState({ visible: false })

    this.props.formParkingConfig?.current.setFieldsValue({
      description: description[0],
      feeParkingConfigurations: this.props.dataConfig?.feeParkingConfigurations
        ? this.props.dataConfig?.feeParkingConfigurations
        : []
    })
  }
  checkDuplicate = (value: any) => {
    const checkData = this.props.formParkingConfig.current
      .getFieldsValue()
      .feeParkingConfigurations.filter((item) => item.vehicleTypeId === value)
    if (checkData.length > 1) {
      return this.props.formParkingConfig.current.setFields([
        {
          name: 'isDuplicate',
          errors: [LError('VEHICLE_TYPE_DO_NOT_DUPLICATE')]
        }
      ])
    } else {
      this.props.formParkingConfig.current.setFields([
        {
          name: 'isDuplicate',
          errors: null
        }
      ])
    }
  }
  re
  render() {
    const { formParkingConfig } = this.props
    return (
      <>
        <Form validateMessages={validateMessages} ref={formParkingConfig} layout={'vertical'} size="middle">
          <Row gutter={[8, 8]}>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                name="description"
                label={L('FEE_TYPE_CONFIG_CONTENT')}
                rules={[{ required: true }, { max: 2000 }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="isDuplicate">
            <Input className="d-none" />
          </Form.Item>
          <Row gutter={[8, 8]} style={{ marginBottom: 10 }} className="custom-col-fee-config">
            {/* <Col span={6}>{L('FEE_CONFIG_VEHICEL_TYPE')}</Col> */}
            <Col span={6}>{L('FEE_CONFIG_VEHICEL_AMOUNT_NO_VAT')}</Col>
            <Col span={6}>{L('FEE_CONFIG_VAT')}</Col>
            <Col span={6}>{L('FEE_CONFIG_ACTION')}</Col>
          </Row>
          <Form.List name="feeParkingConfigurations">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={[8, 8]}>
                    {/* <Col span={6}>
                      <Form.Item
                        {...restField}
                        messageVariables={{
                          label: L('FEE_CONFIG_VEHICEL_TYPE')
                        }}
                        name={[name, 'vehicleTypeId']}
                        rules={[{ required: true }]}>
                        <Select
                          allowClear
                          onChange={(value) => this.checkDuplicate(value)}
                          showArrow
                          style={{ width: '100%' }}>
                          {(this.state.listVehicelType || []).map((item) => (
                            <Select.Option key={item.id} value={item.id}>
                              {item.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col> */}

                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        messageVariables={{
                          label: L('FEE_CONFIG_NAME_COL_AMOUNT')
                        }}
                        name={[name, 'amount']}
                        rules={[{ required: true }]}>
                        <CurrencyInput />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        messageVariables={{
                          label: L('FEE_CONFIG_VAT')
                        }}
                        name={[name, 'vatpercent']}
                        rules={[{ required: true }]}>
                        <PercentInput />
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <MinusCircleOutlined
                        onClick={() => {
                          this.setState({ visible: false }, () => remove(name))
                        }}
                      />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    size="middle"
                    style={{
                      marginTop: 40,
                      display: this.state.visible ? 'none' : ''
                    }}
                    type="primary"
                    onClick={() => {
                      this.setState({ visible: true }), add()
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

export default GenFeeParkingTable
