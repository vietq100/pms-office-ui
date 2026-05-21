import AppComponentBase from '@components/AppComponentBase'
import { Button, Form, Select, Col, Row, Input, Switch } from 'antd'
import { inject, observer } from 'mobx-react'
import { MinusCircleOutlined } from '@ant-design/icons'
import { validateMessages } from '@lib/validation'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import NumberInput from '@components/Inputs/NumberInput'
import MeterReadingStore from '@stores/meterReading/meterReadingStore'
import Stores from '@stores/storeIdentifier'

const { typeMeterReading, typeMerderReading } = AppConsts
interface State {
  listType: any
  countMeterReading: number
}

interface Props {
  unitId: number
  formMeterReading: any
  type: number
  meterReadingStore: MeterReadingStore
}
@inject(Stores.MeterReadingStore)
@observer
class UnitConfigFee extends AppComponentBase<Props, State> {
  maxResultCount = 10

  state = {
    listType: [] as any,
    countMeterReading: 0
  }
  async componentDidMount() {
    this.setState({ listType: typeMeterReading })
    await this.getdata()
  }
  getdata = async () => {
    if (this.props.type === typeMerderReading.electric) {
      await this.props.meterReadingStore.getMeterElectricityProfileForUnit({
        unitId: this.props.unitId
      })
      this.props.formMeterReading.current.setFieldsValue({
        meterReading: this.props.meterReadingStore.profileElictrics
      })
      this.setState({
        countMeterReading: this.props.meterReadingStore.profileElictrics.length
      })
    } else {
      await this.props.meterReadingStore.getMeterWaterProfileForUnit({
        unitId: this.props.unitId
      })
      this.props.formMeterReading.current.setFieldsValue({
        meterReading: this.props.meterReadingStore.profileWaters
      })
      this.setState({
        countMeterReading: this.props.meterReadingStore.profileWaters.length
      })
    }
  }
  render() {
    const { formMeterReading } = this.props
    return (
      <Form validateMessages={validateMessages} ref={formMeterReading} layout={'vertical'} size="middle">
        <Form.Item name="checkNull">
          <Input className="d-none" />
        </Form.Item>
        <Row gutter={[8, 8]} style={{ marginBottom: 10 }} className="custom-col-fee-config">
          <Col span={6}>{L('UNIT_DETAIL_METER_READING_PECODE')}</Col>
          <Col span={6}>{L('UNIT_DETAIL_METER_READING_TYPE')}</Col>
          <Col span={6}>{L('UNIT_DETAIL_METER_READING_MEMBER')}</Col>
          <Col span={6}>{L('FEE_CONFIG_ACTION')}</Col>
        </Row>
        <Form.List name="meterReading">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={[8, 8]}>
                  <Col span={6}>
                    {this.props.type === typeMerderReading.electric ? (
                      <Form.Item
                        {...restField}
                        name={[name, 'pEcode']}
                        messageVariables={{ label: L('UNIT_DETAIL_PECODE') }}
                        rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                    ) : (
                      <Form.Item
                        {...restField}
                        name={[name, 'code']}
                        messageVariables={{ label: L('UNIT_DETAIL_PECODE') }}
                        rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                    )}
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      {...restField}
                      messageVariables={{
                        label: L('UNIT_DETAIL_METER_READING_TYPE')
                      }}
                      name={[name, 'type']}
                      rules={[{ required: true }]}>
                      <Select allowClear showArrow style={{ width: '100%' }}>
                        {(this.state.listType || []).map((item) => (
                          <Select.Option key={item.id} value={item.id}>
                            {L(item.name)}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      {...restField}
                      messageVariables={{
                        label: L('UNIT_DETAIL_METER_READING_MEMBER')
                      }}
                      name={[name, 'numOfPopulation']}
                      rules={[{ required: true }]}>
                      <NumberInput />
                    </Form.Item>
                  </Col>
                  <Col span={6} style={{ display: 'none' }}>
                    <MinusCircleOutlined
                      onClick={() => {
                        remove(name)
                        this.setState({
                          countMeterReading: this.state.countMeterReading - 1
                        })
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      {...restField}
                      messageVariables={{
                        label: L('FEE_CONFIG_ACTION')
                      }}
                      name={[name, 'isActive']}
                      valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
              ))}
              <Form.Item>
                {this.state.countMeterReading < 2 ? (
                  <Button
                    style={{ marginTop: 40 }}
                    type="primary"
                    onClick={() => {
                      if (this.state.countMeterReading < 2) {
                        add()
                        this.setState({
                          countMeterReading: this.state.countMeterReading + 1
                        })
                      }
                    }}>
                    {L('ADD_NEW')}
                  </Button>
                ) : (
                  <></>
                )}
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    )
  }
}

export default UnitConfigFee
