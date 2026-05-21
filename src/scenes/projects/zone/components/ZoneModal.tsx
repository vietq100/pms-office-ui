import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Switch } from 'antd'
import { L } from '../../../../lib/abpUtility'
import AppComponentBase from '../../../../components/AppComponentBase'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import ZoneStore from '@stores/project/zoneStore'
import React from 'react'
import { validateMessages } from '@lib/validation'
import rules from './zone.validation'
import AppConsts from '@lib/appconst'
import handoverService from '@services/handover/handoverService'
import { filterOptions } from '@lib/helper'
import FormSwitch from '@components/FormItem/FormSwitch'

const { formVerticalLayout, validate } = AppConsts

export interface IFloorFormProps {
  zoneStore: ZoneStore
  visible: boolean
  onCancel: (isReload: boolean) => void
  idDetail: number | undefined
}

@inject(Stores.ZoneStore)
@observer
class ZoneFormModal extends AppComponentBase<IFloorFormProps> {
  formRef: any = React.createRef()

  state = {
    listUnit: [] as any,
    isEvent: false
  }

  componentDidUpdate(prevProps: Readonly<IFloorFormProps>): void {
    if (!prevProps.visible && this.props.visible) {
      this.getDetail(this.props.idDetail)
      this.getListUnit('')
    }
  }

  getDetail = async (id?) => {
    if (id) {
      await this.props.zoneStore.get(id)
    } else {
      this.props.zoneStore.initZone()
    }
    this.formRef.current.setFieldsValue({ ...this.props.zoneStore.editZone })
    this.setState({ isEvent: this.props.zoneStore.editZone.isEvent || false })
  }

  getListUnit = async (keyword) => {
    const res = await handoverService.getListUnit({ keyword })

    this.setState({ listUnit: res })
  }

  handleCreate = () => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      if (this.props.zoneStore.editZone?.id) {
        await this.props.zoneStore.update({
          ...this.props.zoneStore.editZone,
          ...values
        })
      } else {
        await this.props.zoneStore.create({ ...values, isActive: true })
      }
      form.resetFields()

      this.props.onCancel(true)
    })
  }

  handleChangeIsEventToggle = (isEvent: boolean) => {
    this.setState({ isEvent: isEvent })
  }

  render() {
    const { visible, onCancel } = this.props

    return (
      <Modal
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={() => onCancel(false)}
        onOk={this.handleCreate}
        title={L(this.props.idDetail ? 'EDIT' : 'CREATE')}
        footer={[
          <>
            <Button onClick={() => this.props.onCancel(false)}>{L('BTN_CANCEL')}</Button>
            {/* {isGrantedAny(appPermissions.floor.create, appPermissions.floor.update) && ( */}
            <Button
              key="submit"
              // disabled={isUpdateForm && !isGrantedAny(appPermissions.floor.update)}
              type="primary"
              loading={this.props.zoneStore.isLoading}
              onClick={this.handleCreate}>
              {L('BTN_SAVE')}
            </Button>
            {/* )} */}
          </>
        ]}
        // okButtonProps={{
        //   disabled: !isGrantedAny(appPermissions.floor.create, appPermissions.floor.update),
        //   className: !isGrantedAny(appPermissions.floor.create, appPermissions.floor.update) ? 'd-none' : ''
        // }}
      >
        <Form ref={this.formRef} layout="vertical" validateMessages={validateMessages} size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('ZONE_UNIT')} {...formVerticalLayout} name="unitId" rules={rules.unit}>
                <Select showSearch allowClear className="full-width" filterOption={filterOptions}>
                  {this.renderOptions(this.state.listUnit)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <FormSwitch name="isEvent" label={'CAN_ORGANIZE_EVENTS'} onChange={this.handleChangeIsEventToggle} />
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('ZONE_NAME')} {...formVerticalLayout} name="zoneName" rules={rules.zoneName}>
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('ZONE_CODE')} {...formVerticalLayout} name="zoneCode" rules={rules.zoneName}>
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('ZONE_SIZE')} {...formVerticalLayout} name="size" rules={rules.size}>
                <InputNumber className="full-width" min={0} max={validate.maxNumber} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('POWER_CONSUMPTION')}
                {...formVerticalLayout}
                name="powerConsumption"
                rules={rules.powerConsumption}>
                <InputNumber className="full-width" min={0} max={validate.maxNumber} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}></Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('ZONE_DESCRIPTION')} {...formVerticalLayout} name="description">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>

            {this.props.idDetail && (
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item
                  label={L('FLOOR_ACTIVE_STATUS')}
                  {...formVerticalLayout}
                  name="isActive"
                  valuePropName="checked">
                  <Switch defaultChecked />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default ZoneFormModal
