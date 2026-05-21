import { Form, Input, Modal, Switch, Col, Row, Button } from 'antd'
import { isGrantedAny, L } from '../../../../lib/abpUtility'
import rules from './building.validation'
import AppConsts, { appPermissions } from '../../../../lib/appconst'
import AppComponentBase from '../../../../components/AppComponentBase'
import { validateMessages } from '../../../../lib/validation'
import ProjectStore from '../../../../stores/project/projectStore'
import BuildingStore from '@stores/project/buildingStore'
import React from 'react'

const { formVerticalLayout } = AppConsts

export interface IBuildingFormProps {
  buildingStore: BuildingStore
  projectStore: ProjectStore
  visible: boolean
  dataSend: any
  onCancel: () => void
  hideProject: boolean
}

class BuildingFormModal extends AppComponentBase<IBuildingFormProps, any> {
  state = {
    confirmDirty: false
  }
  formRef: any = React.createRef()
  componentDidUpdate = async (prevProps: Readonly<IBuildingFormProps>) => {
    if (!prevProps.visible && this.props.visible) {
      if (this.props.visible) {
        if (this.props.dataSend) {
          await this.props.buildingStore.get(this.props.dataSend)
          this.formRef.current?.setFieldsValue(this.props.buildingStore.editBuilding)
        } else {
          this.formRef.current?.resetFields()
        }
      }
    }
  }

  handleCreate = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.buildingStore.editBuilding?.id) {
        await this.props.buildingStore.update({
          ...this.props.buildingStore.editBuilding,
          ...values
        })
      } else {
        await this.props.buildingStore.create(values)
      }

      this.setState({ modalVisible: false })
      this.props.onCancel()
      form.resetFields()
    })
  }
  render() {
    const { visible, onCancel, dataSend } = this.props

    return (
      this.props.visible && (
        <Modal
          open={visible}
          // cancelText={L('BTN_CANCEL')}
          // okText={L('BTN_SAVE')}
          onCancel={onCancel}
          // onOk={onCreate}
          destroyOnClose
          title={L('BUILDING_TILE')}
          footer={[
            <>
              <Button onClick={onCancel}>{L('BTN_CANCEL')}</Button>
              {isGrantedAny(appPermissions.building.create, appPermissions.building.update) && (
                <Button
                  key="submit"
                  disabled={dataSend && !isGrantedAny(appPermissions.building.update)}
                  type="primary"
                  loading={this.props.projectStore.isLoading}
                  onClick={this.handleCreate}>
                  {L('BTN_SAVE')}
                </Button>
              )}
            </>
          ]}
          okButtonProps={{
            className: !isGrantedAny(appPermissions.building.create, appPermissions.building.update) ? 'd-none' : ''
          }}>
          <Form ref={this.formRef} layout="vertical" validateMessages={validateMessages} size="middle">
            <Row gutter={[16, 0]}>
              <Col sm={{ span: 12, offset: 0 }}>
                <Form.Item label={L('BUILDING_NAME')} {...formVerticalLayout} name="name" rules={rules.name}>
                  <Input />
                </Form.Item>
              </Col>
              <Col sm={{ span: 12, offset: 0 }}>
                <Form.Item label={L('BUILDING_CODE')} {...formVerticalLayout} name="code" rules={rules.code}>
                  <Input />
                </Form.Item>
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item
                  label={L('BUILDING_DESCRIPTION')}
                  {...formVerticalLayout}
                  name="description"
                  rules={rules.description}>
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Col>
              {dataSend && (
                <Col sm={{ span: 24, offset: 0 }}>
                  <Form.Item
                    label={L('BUILDING_ACTIVE_STATUS')}
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
    )
  }
}

export default BuildingFormModal
