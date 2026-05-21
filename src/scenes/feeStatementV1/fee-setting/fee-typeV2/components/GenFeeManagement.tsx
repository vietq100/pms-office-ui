import AppComponentBase from '@components/AppComponentBase'
import { Button, Form, Col, Row, Input } from 'antd'

import { observer } from 'mobx-react'

import { MinusCircleOutlined } from '@ant-design/icons'

import { validateMessages } from '@lib/validation'

import CurrencyInput from '@components/Inputs/CurrencyInput'
import PercentInput from '@components/Inputs/PercentInput'
import { L, LError } from '@lib/abpUtility'
import unitService from '@services/project/unitService'

interface State {
  listUnitType: any
  isBlockAdd: boolean
}

interface Props {
  formManagement: any
  dataConfig: any
}

@observer
class GenFeeManagement extends AppComponentBase<Props, State> {
  maxResultCount = 10

  state = {
    listUnitType: [] as any,
    isBlockAdd: false
  }
  async componentDidMount() {
    const listUnitType = await unitService.getUnitTypes()

    const description = this.props.dataConfig?.feeManagementConfigurations
      ? this.props.dataConfig?.feeManagementConfigurations.map((item) => {
          return item.description
        })
      : []
    this.setState({ listUnitType: listUnitType })
    this.props.formManagement.current.setFieldsValue({
      description: description[0],
      feeManagementConfigurations: this.props.dataConfig?.feeManagementConfigurations
        ? this.props.dataConfig.feeManagementConfigurations
        : [],
      contentTemplate: this.props.dataConfig?.contentTemplate ? this.props.dataConfig.contentTemplate : ''
    })

    if (this.props.dataConfig?.feeManagementConfigurations?.length > 0) {
      this.setState({ isBlockAdd: true })
    } else {
      this.setState({ isBlockAdd: false })
    }
  }
  checkDuplicate = (value: any) => {
    const checkData = this.props.formManagement.current
      .getFieldsValue()
      .feeManagementConfigurations.filter((item) => item.unitTypeId === value)
    if (checkData.length > 1) {
      return this.props.formManagement.current.setFields([
        {
          name: 'isDuplicate',
          errors: [LError('UNIT_TYPE_DO_NOT_DUPLICATE')]
        }
      ])
    } else {
      this.props.formManagement.current.setFields([
        {
          name: 'isDuplicate',
          errors: null
        }
      ])
    }
  }
  render() {
    const { formManagement } = this.props
    return (
      <>
        <Form validateMessages={validateMessages} ref={formManagement} layout={'vertical'} size="middle">
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
            {/* <Col span={6}>{L('FEE_CONFIG_NAME_COL_UNIT_TYPE')}</Col> */}
            <Col span={6}>{L('FEE_CONFIG_NAME_COL_AMOUNT')}</Col>
            <Col span={6}>{L('FEE_CONFIG_NAME_COL_VAT')}</Col>
            <Col span={6}>{L('FEE_CONFIG_ACTION')}</Col>
          </Row>
          <Form.List name="feeManagementConfigurations">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={[8, 8]}>
                    {/* <Col span={6}>
                      <Form.Item
                        {...restField}
                        messageVariables={{
                          label: L('FEE_CONFIG_NAME_COL_UNIT_TYPE')
                        }}
                        name={[name, 'unitTypeId']}
                        rules={[{ required: true }]}>
                        <Select
                          allowClear
                          showArrow
                          onChange={(value) => this.checkDuplicate(value)}
                          style={{ width: '100%' }}>
                          {(this.state.listUnitType || []).map((item) => (
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
                          label: L('FEE_CONFIG_NAME_COL_VAT')
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
                          label: L('FEE_CONFIG_NAME_COL_AMOUNT')
                        }}
                        name={[name, 'vatpercent']}
                        rules={[{ required: true }]}>
                        <PercentInput />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <MinusCircleOutlined
                        onClick={() => {
                          remove(name)
                          this.setState({ isBlockAdd: false })
                        }}
                      />
                    </Col>
                  </Row>
                ))}
                {!this.state.isBlockAdd && (
                  <Form.Item>
                    <Button
                      size="middle"
                      style={{ marginTop: 40 }}
                      type="primary"
                      onClick={() => {
                        add(), this.setState({ isBlockAdd: true })
                      }}>
                      {L('ADD_NEW')}
                    </Button>
                  </Form.Item>
                )}
              </>
            )}
          </Form.List>
        </Form>
      </>
    )
  }
}

export default GenFeeManagement
