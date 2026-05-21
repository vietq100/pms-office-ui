import * as React from 'react'

import { Input, Modal, Form, Select, Col, Row } from 'antd'
import { L } from '@lib/abpUtility'
import { validateMessages } from '@lib/validation'
import CurrencyInput from '@components/Inputs/CurrencyInput'
import NumberInput from '@components/Inputs/NumberInput'
import AppConsts from '@lib/appconst'

const { formHorizontalLayout } = AppConsts

export interface IProjectUnitProps {
  visible: boolean
  modalType: string
  onCancel: () => void
  onCreate: () => void
  formRef: any
}

class ProjectUnitFormModal extends React.Component<IProjectUnitProps> {
  state = {
    confirmDirty: false,
    floors: []
  }

  render() {
    const { visible, onCancel, onCreate, modalType } = this.props
    return (
      <Modal
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={onCancel}
        onOk={onCreate}
        title={L('UNIT')}>
        <Form layout={'vertical'} ref={this.props.formRef} validateMessages={validateMessages} size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('FLOOR')} {...formHorizontalLayout} name="floorId"></Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('UNIT_NAME')} {...formHorizontalLayout} name="unitName">
                <Input disabled={modalType === 'edit'} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('MONTHLY_COST_$_PER_MONTH')} {...formHorizontalLayout} name="monthly">
                <CurrencyInput locale={'en'} symbol={'$'} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('COST_$_PER_SQM')} {...formHorizontalLayout} name="per">
                <CurrencyInput locale={'en'} symbol={'$'} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('STATUS')} {...formHorizontalLayout} name="statusId">
                <Select className="full-width"></Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('UNIT_TYPE')} {...formHorizontalLayout} name="unitTypeId">
                <Select className="full-width"></Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('SIZE_SQM')} {...formHorizontalLayout} name="size">
                <NumberInput />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default ProjectUnitFormModal
