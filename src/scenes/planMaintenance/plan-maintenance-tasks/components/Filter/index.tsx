import { inject, observer } from 'mobx-react'
import { Row, Col, Input } from 'antd'
import AppComponentBase from '@components/AppComponentBase'
import Stores from '@stores/storeIdentifier'
import PlanMaintenanceStore from '@stores/planMaintenance/planMaintenanceStore'

interface IProps {
  className?: string
  planMaintenanceStore?: PlanMaintenanceStore
}

@inject(Stores.PlanMaintenanceStore)
@observer
export default class PlanMaintenanceTaskFilter extends AppComponentBase<IProps, any> {
  render() {
    const keywordPlaceholder = `${this.L('ID')}, ${this.L('DESCRIPTION')}`
    return (
      <div className={this.props.className}>
        <Row gutter={[16, 8]}>
          <Col sm={{ span: 16, offset: 0 }}>
            <Input.Search placeholder={keywordPlaceholder} />
          </Col>
        </Row>
      </div>
    )
  }
}
