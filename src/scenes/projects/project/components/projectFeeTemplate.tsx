import { Col, Form, Input, Row, Switch } from 'antd'

import AppComponentBase from '../../../../components/AppComponentBase'
import { L } from '@lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import { validateMessages } from '@lib/validation'
import Card from 'antd/lib/card'
import ProjectStore from '@stores/project/projectStore'
import CKEditorInput from '@components/Inputs/CKEditorInput'
import AppConsts from '@lib/appconst'
import Tabs from 'antd/lib/tabs'

const { TabPane } = Tabs
const { formVerticalLayout } = AppConsts

export interface IProjectFeeTemplateProps {
  formRef: any
  projectStore: ProjectStore
  projectId: number
}

export interface IProjectFeeTemplateState {
  projectId: number
  parameters: any[]
}

@inject(Stores.ProjectStore, Stores.BuildingStore, Stores.FileStore)
@observer
class ProjectFeeTemplate extends AppComponentBase<IProjectFeeTemplateProps, IProjectFeeTemplateState> {
  get languages() {
    return abp.localization.languages.filter((val: any) => {
      return !val.isDisabled
    })
  }
  state = {
    projectId: 0,
    parameters: [] as any
  }

  async componentDidMount() {
    await this.getProjectSetting(this.props.projectId)
  }

  async getProjectSetting(id) {
    if (!id) {
      await this.props.projectStore.initProjectFeeTemplate()
    } else {
      await this.props.projectStore.getProjectFeeTemplate(id)
      this.setState({
        parameters: this.props.projectStore.editProjectFeeTemplate?.parameters || []
      })
    }

    this.props.formRef.current.setFieldsValue({
      ...this.props.projectStore.editProjectFeeTemplate
    })
  }

  public render() {
    return (
      <Card bordered={false} style={{ minHeight: 700 }}>
        <Form ref={this.props.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 24, offset: 0 }}>
              <div>
                <i>{L('FEE_TEMPLATE_DESCRIPTION_MESSAGE')}</i>
              </div>
              <div>
                <i>{L('FEE_TEMPLATE_DESCRIPTION_PARAMETER_MESSAGE')}</i>
              </div>
              <div>
                {this.state.parameters.map((parameter, index) => {
                  return (
                    <span key={index}>
                      {index > 0 ? ' - ' : ''}
                      <span>
                        <b>{parameter.key}:</b> <i>{parameter.description}</i>
                      </span>
                    </span>
                  )
                })}
              </div>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Tabs defaultActiveKey="vi">
                {this.languages.map((item) => {
                  return (
                    <TabPane tab={item.displayName} key={item.name}>
                      <Row gutter={[16, 0]}>
                        <Col sm={{ span: 24, offset: 0 }}>
                          <Form.Item
                            label={L('SUBJECT')}
                            {...formVerticalLayout}
                            name={['templateLanguages', item.name, 'subject']}>
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col sm={{ span: 24, offset: 0 }}>
                          <Form.Item
                            label={L('TEMPLATE_CONTENT')}
                            {...formVerticalLayout}
                            name={['templateLanguages', item.name, 'templateContent']}>
                            <CKEditorInput />
                          </Form.Item>
                        </Col>
                      </Row>
                    </TabPane>
                  )
                })}
              </Tabs>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('FEE_TEMPLATE_ACTIVE_STATUS')}
                {...formVerticalLayout}
                name="isActive"
                valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    )
  }
}

export default ProjectFeeTemplate
