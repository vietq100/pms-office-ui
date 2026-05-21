import './index.less'

import AppComponentBase from '@components/AppComponentBase'
import Row from 'antd/lib/grid/row'
import Col from 'antd/lib/grid/col'
import { observer } from 'mobx-react'
import { AppConfiguration } from '@lib/appconst'
@observer
export class Dashboard extends AppComponentBase<any, any> {
  state = {
    linkDashboard: AppConfiguration.powerBIUrl
  }

  render() {
    return (
      <Row>
        <Col sm={24} style={{ height: 'calc(100vh - 80px)' }}>
          <iframe
            style={{ position: 'relative', height: '100%', width: '100%' }}
            src={this.state.linkDashboard}
            frameBorder="0"
            allowFullScreen={true}></iframe>
        </Col>
      </Row>
    )
  }
}

export default Dashboard
