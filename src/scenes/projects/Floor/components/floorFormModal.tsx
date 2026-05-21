import { Form, Input, Modal, Select, Row, Col, Switch, Button, InputNumber } from 'antd'
import { isGrantedAny, L } from '../../../../lib/abpUtility'
import rules from './floor.validation'
import AppConsts, { appPermissions } from '../../../../lib/appconst'
import AppComponentBase from '../../../../components/AppComponentBase'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import FloorStore from '../../../../stores/project/floorStore'
import ProjectStore from '../../../../stores/project/projectStore'
import { filterOptions } from '../../../../lib/helper'
import { validateMessages } from '../../../../lib/validation'

const { formVerticalLayout, authorization, validate } = AppConsts

export interface IFloorFormProps {
  floorStore: FloorStore
  projectStore: ProjectStore
  visible: boolean
  isUpdateForm: boolean
  onCancel: () => void
  onCreate: () => void
  formRef: any
}

@inject(Stores.FloorStore)
@inject(Stores.ProjectStore)
@observer
class FloorFormModal extends AppComponentBase<IFloorFormProps> {
  state = {
    isDirty: false,
    isUpdateForm: false,
    projectId: localStorage.getItem(authorization.projectId)
  }

  componentDidUpdate(prevProps: Readonly<IFloorFormProps>): void {
    if (!prevProps.visible && this.props.visible) {
      const { projectId } = this.state
      this.props.projectStore.filterBuildingOptions({ projectId })
    }
  }

  findProjects = async (keyword) => {
    await this.props.projectStore.filterOptions({ keyword })
  }

  findBuildings = async (keyword) => {
    const form = this.props.formRef.current
    const projectId = form.getFieldValue('projectId')
    if (!projectId) {
      form.setFieldsValue({ buildingId: undefined })
      return
    }
    await this.props.projectStore.filterBuildingOptions({ projectId, keyword })
  }

  render() {
    const {
      visible,
      onCancel,
      onCreate,
      formRef,
      isUpdateForm,
      projectStore: { buildingOptions },
      floorStore: { editFloor }
    } = this.props
    const { projectId } = this.state

    return (
      <Modal
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={onCancel}
        onOk={onCreate}
        title={L(isUpdateForm ? 'EDIT' : 'CREATE')}
        footer={[
          <>
            <Button onClick={onCancel}>{L('BTN_CANCEL')}</Button>
            {isGrantedAny(appPermissions.floor.create, appPermissions.floor.update) && (
              <Button
                key="submit"
                disabled={isUpdateForm && !isGrantedAny(appPermissions.floor.update)}
                type="primary"
                loading={this.props.projectStore.isLoading}
                onClick={onCreate}>
                {L('BTN_SAVE')}
              </Button>
            )}
          </>
        ]}
        okButtonProps={{
          // disabled: !isGrantedAny(appPermissions.floor.create, appPermissions.floor.update),
          className: !isGrantedAny(appPermissions.floor.create, appPermissions.floor.update) ? 'd-none' : ''
        }}>
        <Form
          ref={formRef}
          layout="vertical"
          validateMessages={validateMessages}
          initialValues={editFloor}
          size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('BUILDING_NAME')} {...formVerticalLayout} name="buildingId" rules={rules.name}>
                <Select
                  showSearch
                  allowClear
                  className="full-width"
                  filterOption={filterOptions}
                  disabled={!projectId || isUpdateForm}>
                  {this.renderOptions(buildingOptions)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('FLOOR_SIZE')} {...formVerticalLayout} name="size" rules={rules.size}>
                <InputNumber className="full-width" min={0} max={validate.maxNumber} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('FLOOR_NAME')} {...formVerticalLayout} name="name" rules={rules.name}>
                <Input />
              </Form.Item>
            </Col>

            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('FLOOR_CODE')} {...formVerticalLayout} name="code" rules={rules.code}>
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('FLOOR_DESCRIPTION')}
                {...formVerticalLayout}
                name="description"
                rules={rules.description}>
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
            {editFloor && editFloor.id > 0 && (
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

export default FloorFormModal
