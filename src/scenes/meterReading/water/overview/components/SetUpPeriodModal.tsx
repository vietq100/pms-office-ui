import { L } from '@lib/abpUtility'
import { Col, Form, Modal, Row } from 'antd'

import React from 'react'

import { FormInstance } from 'antd/lib/form'
import FormSelect from '@components/FormItem/FormSelect'
import packageFeeService from '@services/fee/packageFeeService'

interface Props {
  formPeriod: any
  visible: boolean
  currentPackage: any
  onClose: () => void
  onOk: () => void
}

export default class SetUpPeriodModal extends React.PureComponent<Props> {
  form = React.createRef<FormInstance>()
  state = {
    feePackages: [] as any
  }
  componentDidMount() {
    this.getfeePackageOption('')
  }
  getfeePackageOption = async (keyword) => {
    const res = await packageFeeService.filter({ keyword })
    this.setState({ feePackages: res })
  }
  HandelOk = () => {
    this.props.onClose()
  }
  render(): React.ReactNode {
    const { visible, onClose, onOk } = this.props

    return (
      <Modal
        open={visible}
        destroyOnClose
        title={L('SET_UP_CURRENT_PERIOD_NEXT_PERIOD')}
        cancelText={L('BTN_CANCEL')}
        onCancel={() => {
          onClose()
        }}
        onOk={onOk}>
        <Form ref={this.props.formPeriod} layout={'vertical'} size="middle">
          <Row gutter={[8, 8]}>
            <Col md={{ span: 24 }}>
              <FormSelect
                selectProps={{
                  onSearch: this.getfeePackageOption,
                  defaultValue: this.props.currentPackage,
                  disabled: true
                }}
                placeholder={L('CURRENT_PERIOD')}
                label="CURRENT_PERIOD"
                name="currentPackageId"
                options={this.state.feePackages}
              />
            </Col>
            <Col md={{ span: 24 }}>
              <FormSelect
                selectProps={{ onSearch: this.getfeePackageOption }}
                placeholder={L('NEXT_PERIOD')}
                label="NEXT_PERIOD"
                name="nextPackageId"
                options={this.state.feePackages}
              />
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}
