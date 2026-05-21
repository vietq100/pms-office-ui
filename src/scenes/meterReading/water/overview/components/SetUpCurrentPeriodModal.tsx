import { L } from '@lib/abpUtility'
import { Col, Form, Modal, Row } from 'antd'

import React from 'react'

import { FormInstance } from 'antd/lib/form'
import FormSelect from '@components/FormItem/FormSelect'
import packageFeeService from '@services/fee/packageFeeService'

interface Props {
  formCurrentPeriod: any
  visible: boolean
  onClose: () => void
  onOk: () => void
}

export default class SetUpCurrentPeriodModal extends React.PureComponent<Props> {
  form = React.createRef<FormInstance>()
  state = {
    feePackages: [] as any
  }
  componentDidMount() {
    this.getfeePackageOption('')
  }
  getfeePackageOption = async (keyword) => {
    const res = await packageFeeService.filter({ keyword, isClosed: false })
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
        <Form ref={this.props.formCurrentPeriod} layout={'vertical'} size="middle">
          <Row gutter={[8, 8]}>
            <Col md={{ span: 24 }}>
              <FormSelect
                selectProps={{
                  onSearch: this.getfeePackageOption
                }}
                placeholder={L('CURRENT_PERIOD')}
                label="CURRENT_PERIOD"
                name="currentPackageId"
                options={this.state.feePackages}
              />
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}
