import { Card, Checkbox, Col, Form, Row, Spin, Switch } from 'antd'
import AppComponentBase from '@components/AppComponentBase'
import { validateMessages } from '@lib/validation'
import FeeTypeStore from '@stores/fee/feeTypeStore'
import { observer } from 'mobx-react'
import AppConsts, { appPermissions } from '@lib/appconst'
import { L, isGrantedAny } from '@lib/abpUtility'
import React from 'react'

const { formVerticalLayout } = AppConsts
export interface IUnitFormProps {
  unitId: number
  listResident: any[]
  onChangeList: (listConfig) => void
  feeTypeStore: FeeTypeStore
}

@observer
class UnitFeeNoticationConfig extends AppComponentBase<IUnitFormProps> {
  formUserFeeType: any = React.createRef()
  state = {
    isLoading: true,
    listChecked: [] as any
  }
  async componentDidMount() {
    await Promise.all([
      this.props.feeTypeStore.getLists({ isActive: true }),
      await this.props.feeTypeStore.getListsFeeUnitUserByUnit({ unitId: this.props.unitId }),
      this.initSelectValue()
    ])
    this.setState({ isLoading: false })
  }

  initSelectValue = async () => {
    const feeTypeLength = this.props.feeTypeStore.pagedResult.items.length
    const listFeeTypeId = this.props.feeTypeStore.pagedResult.items.map((item) => item.id)
    const arrValue = this.props.feeTypeStore.listsFeeUnitUserByUnit?.map((item) => ({
      unitUserId: item.unitUserId,
      unitId: item.unitId,
      isReceiveFee: item.isReceiveFee,
      feeTypeIds: item.feeTypeIds.length === 0 && item.isReceiveFee === true ? listFeeTypeId : item.feeTypeIds,
      isFull:
        item.feeTypeIds.length === 0 && item.isReceiveFee === true
          ? true
          : item.feeTypeIds.length === feeTypeLength
          ? true
          : false
    }))

    this.setState({ listChecked: arrValue })

    this.props.onChangeList(this.state.listChecked)
  }

  onChangeReceiveFee = (value, unitUserId, index) => {
    const arrTemp = this.state.listChecked
    if (value) {
      const lengthFeeTypeIds = arrTemp.find((item) => item.unitUserId === unitUserId).feeTypeIds.length
      lengthFeeTypeIds > 0
        ? this.formUserFeeType.current.setFieldValue([index, 'isReceiveFee'], true)
        : this.formUserFeeType.current.setFieldValue([index, 'isReceiveFee'], false)
    }

    arrTemp.map((item) => {
      if (item.unitUserId === unitUserId) {
        item.isReceiveFee = value
      }
    })
  }
  oncheckAll = (value, unitUserId, index) => {
    if (value.target.checked === true) {
      const listFeeTypeId = this.props.feeTypeStore.pagedResult.items.map((item) => item.id)
      const arrTemp = this.state.listChecked
      arrTemp.map((item) => {
        if (item.unitUserId === unitUserId) {
          item.feeTypeIds = listFeeTypeId
        }
      })

      this.setState({ listChecked: arrTemp })
      this.props.onChangeList(this.state.listChecked)
    } else {
      const arrTemp = this.state.listChecked
      arrTemp.map((item) => {
        if (item.unitUserId === unitUserId) {
          item.feeTypeIds = []
          item.isReceiveFee = false
        }
      })
      this.formUserFeeType.current.setFieldValue([index, 'isReceiveFee'], false)
      this.setState({ listChecked: arrTemp })
      this.props.onChangeList(this.state.listChecked)
    }
  }

  onChangList = (values, unitUserId, index) => {
    const arrTemp = this.state.listChecked
    const feeTypeLength = this.props.feeTypeStore.pagedResult.items.length
    if (values.length === 0) {
      this.formUserFeeType.current.setFieldValue([index, 'isReceiveFee'], false)
    }
    if (values.length === feeTypeLength) {
      this.formUserFeeType.current.setFieldValue([index, 'isFull'], true)
    } else {
      this.formUserFeeType.current.setFieldValue([index, 'isFull'], false)
    }
    arrTemp.map((item) => {
      if (item.unitUserId === unitUserId) {
        item.feeTypeIds = values
      }
    })

    this.setState({ listChecked: arrTemp })
    this.props.onChangeList(this.state.listChecked)
  }

  render() {
    return this.state.isLoading === false ? (
      <>
        <Form ref={this.formUserFeeType} layout={'vertical'} validateMessages={validateMessages} size="middle">
          <Row gutter={[8, 8]}>
            {this.props.listResident.length > 0 ? (
              this.props.listResident
                .slice()
                .sort((a, b) => (new Number(a.id) as any) - (new Number(b.id) as any))
                .map((item, index) => (
                  <Col key={index} span={8}>
                    <Card bordered={false}>
                      <Form.Item style={{ display: 'none' }} initialValue={item.id} name={[index, 'unitUserId']} />
                      <Form.Item style={{ display: 'none' }} initialValue={item.unitId} name={[index, 'unitId']} />
                      <Row>
                        <Col span={18}>
                          <strong style={{ fontSize: 20 }}>{item.user?.displayName}</strong>
                          <Form.Item
                            initialValue={this.state.listChecked?.find((s) => s.unitUserId === item.id)?.isReceiveFee}
                            label={L('RECEIVE_NOTI_FEE_TYPE')}
                            name={[index, 'isReceiveFee']}
                            valuePropName="checked"
                            {...formVerticalLayout}>
                            <Switch
                              disabled={isGrantedAny(appPermissions.unit.update) ? false : true}
                              onChange={(value) => this.onChangeReceiveFee(value, item.id, index)}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={6}>
                          <label style={{ fontSize: 18 }}>{item.role?.name}</label>
                        </Col>
                      </Row>
                      <Col span={24}>
                        <Form.Item
                          valuePropName="checked"
                          name={[index, 'isFull']}
                          initialValue={
                            this.state.listChecked?.find((itemFilter) => itemFilter.unitUserId === item.id).isFull
                          }>
                          <Checkbox onChange={(value) => this.oncheckAll(value, item.id, index)}>
                            <strong> {L('ALL_FEE')}</strong>
                          </Checkbox>
                        </Form.Item>
                      </Col>

                      <Form.Item valuePropName="checked" name={[index, 'feeTypeIds']}>
                        <Checkbox.Group
                          value={
                            this.state.listChecked?.find((itemFilter) => itemFilter.unitUserId === item.id).feeTypeIds
                          }
                          onChange={(values) => this.onChangList(values, item.id, index)}
                          style={{ width: '100%' }}>
                          <Row>
                            {this.props.feeTypeStore.pagedResult.items.map((item, indexValue) => (
                              <Col span={12} key={indexValue}>
                                <Checkbox value={item.id}>{item.name}</Checkbox>
                              </Col>
                            ))}
                          </Row>
                        </Checkbox.Group>
                      </Form.Item>
                    </Card>
                  </Col>
                ))
            ) : (
              <Card bordered={false} style={{ height: '40vh', width: '100%' }}>
                <h3>{L('THE_APARTMENT_HAS_NO_USERS')}</h3>
              </Card>
            )}
          </Row>
        </Form>
      </>
    ) : (
      <div className="d-flex justify-content-center align-items-center w-100 mt-3" style={{ height: '50vh' }}>
        <Spin size="large"></Spin>
      </div>
    )
  }
}

export default UnitFeeNoticationConfig
