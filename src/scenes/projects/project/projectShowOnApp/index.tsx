import AppComponentBase from '../../../../components/AppComponentBase'

import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'

import Card from 'antd/lib/card'
import ProjectStore from '@stores/project/projectStore'
import { Checkbox, Col, Form, Row, Spin } from 'antd'
import { validateMessages } from '@lib/validation'
import { L } from '@lib/abpUtility'

export interface IProjectsProps {
  formRef: any
  projectStore: ProjectStore
  projectId: number
}

export interface IProjectsState {
  isLoading: boolean
}

@inject(Stores.ProjectStore, Stores.BuildingStore, Stores.FileStore)
@observer
class ProjectShowOnApp extends AppComponentBase<IProjectsProps, IProjectsState> {
  state = {
    isLoading: true
  }
  async componentDidMount() {
    this.setState({ isLoading: false })
  }

  public render() {
    return this.state.isLoading === false ? (
      <>
        <Card bordered={false} style={{ minHeight: 700 }}>
          <Form ref={this.props.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
            <Row gutter={[8, 8]}>
              <strong style={{ fontSize: 20 }}>{L('LIST_DISPLAY_FUCTION_SHOW_ON_APP')}</strong>
              <Col span={24}>
                <Form.Item valuePropName="checked" name={'chuaco'}>
                  <Checkbox.Group>
                    <Row>
                      {[
                        { id: 1, name: 'Name 12' },
                        { id: 3, name: 'Name 1' },
                        { id: 4, name: 'Name 13' }
                      ].map((item, index) => (
                        <Col span={24} key={index}>
                          <Checkbox value={item.id}>{item.name}</Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </>
    ) : (
      <div className="d-flex justify-content-center align-items-center w-100 mt-3" style={{ height: '50vh' }}>
        <Spin size="large" />
      </div>
    )
  }
}

export default ProjectShowOnApp
