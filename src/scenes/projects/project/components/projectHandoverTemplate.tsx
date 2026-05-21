import { Button, Col, Form, Input, Row, Switch, Table } from 'antd'

import AppComponentBase from '@components/AppComponentBase'
import { L, isGrantedAny } from '@lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { validateMessages } from '@lib/validation'
import Card from 'antd/lib/card'
import ProjectStore from '@stores/project/projectStore'
import AppConsts, { appPermissions, contentType } from '@lib/appconst'
import Tabs from 'antd/lib/tabs'
import NotificationTemplateStore from '@stores/notificationTemplate/notificationTemplateStore'
import withRouter from '@components/Layout/Router/withRouter'
// import SyncfusionDocumentEditor from '@components/SyncfusionDocumentEditor'
import SynfDocumentEditorFormItem from '@components/SyncfusionDEFormItem'
import DataTable from '@components/DataTable'
import { renderDotActive } from '@lib/helper'
import TextArea from 'antd/es/input/TextArea'
import CKEditorInput from '@components/Inputs/CKEditorInput'
import WrapPageScroll from '@components/WrapPageScroll'
import React from 'react'

const { TabPane } = Tabs
const { formVerticalLayout } = AppConsts

export interface IProjectFeeTemplateProps {
  projectStore: ProjectStore
  notificationTemplateStore: NotificationTemplateStore
  projectId: number
  activeKey: any
  currentKey: any
}

export interface IProjectFeeTemplateState {
  projectId: number
  parameters: any[]
  editComponentState: any

  showDetail: boolean
  maxResultCount: number
  skipCount: number
}
const { align } = AppConsts

@inject(Stores.ProjectStore, Stores.NotificationTemplateStore)
@observer
class ProjectHandOverTemplate extends AppComponentBase<IProjectFeeTemplateProps, IProjectFeeTemplateState> {
  formRef: any = React.createRef()
  get languages() {
    return abp.localization.languages.filter((val: any) => {
      return !val.isDisabled
    })
  }
  state = {
    projectId: 0,
    parameters: [] as any,
    editComponentState: undefined,
    showDetail: false,
    maxResultCount: 10,
    skipCount: 0
  }

  async componentDidUpdate(prevProps) {
    if (this.props.activeKey !== prevProps.activeKey) {
      if (this.props.activeKey === this.props.currentKey) {
        this.setState({
          showDetail: false,
          editComponentState: undefined
        })
      }
    }
  }

  async componentDidMount() {
    await Promise.all([this.getNotifyTemplate()])
  }

  getNotifyTemplate = async () => {
    await this.props.notificationTemplateStore.getAll({
      maxResultCount: 20,
      skipCount: 0,
      notificationTypeId: 88, //10201: id template project
      projectId: this.props.projectId
    })
    if (
      this.props.notificationTemplateStore.pagedResult.totalCount === 1 &&
      this.props.notificationTemplateStore.pagedResult.items[0]?.id
    ) {
      this.detailTemplate(this.props.notificationTemplateStore.pagedResult.items[0]?.id)
    }
  }

  async detailTemplate(id: number) {
    this.setState({
      showDetail: true
    })
    if (id) {
      await this.props.notificationTemplateStore.get(id)
      this.setState({
        parameters: this.props.notificationTemplateStore.editTemplate?.parameters || []
      })
    }
    this.formRef.current.setFieldsValue({
      ...this.props.notificationTemplateStore.editTemplate
    })

    if (this.props.notificationTemplateStore.editTemplate.notificationMethod === 2) {
      //2 is methoud EMAIL (use editor)
      this.setState({
        editComponentState: contentType.sfdt
      })
    } else {
      this.setState({
        editComponentState: contentType.planText
      })
    }
  }
  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }
  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () =>
      this.getNotifyTemplate()
    )
  }
  onsaveHandOverTemplate = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      await this.props.notificationTemplateStore.update({
        ...this.props.notificationTemplateStore.editTemplate,
        ...values
      })
    })
  }
  onCancel = () => {
    this.setState({
      editComponentState: undefined,
      showDetail: false
    })
  }
  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BACK_TO_LIST_TEMPLATE')}
          </Button>

          {isGrantedAny(appPermissions.project.create, appPermissions.project.update) && (
            <Button
              type="primary"
              disabled={this.props.projectStore.editProject && !isGrantedAny(appPermissions.project.update)}
              onClick={this.onsaveHandOverTemplate}
              loading={isLoading}
              shape="round">
              {L('BTN_SAVE_HANOVER_TEMPLATE')}
            </Button>
          )}
        </Col>
      </Row>
    )
  }

  public render() {
    const { showDetail, editComponentState } = this.state
    const {
      notificationTemplateStore: { pagedResult, isLoading }
    } = this.props
    const columns: any[] = [
      {
        title: '',
        dataIndex: 'isActive',
        key: 'isActive',
        width: '2%',
        align: align.center,
        render: renderDotActive
      },
      {
        title: L('NOTIFICATION_TEMPLATE_TYPE'),
        dataIndex: 'notificationType',
        key: 'notificationType',
        width: '25%',
        ellipsis: true,
        render: (notificationType, item) => (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 21, offset: 0 }} className="col-info">
              <a
                onClick={() =>
                  this.isGranted(appPermissions.notificationTemplate.detail) && this.detailTemplate(item.id)
                }
                className="link-text-table">
                <div>{notificationType?.notificationName}</div>
              </a>
            </Col>
          </Row>
        )
      },

      {
        title: L('MODULE'),
        dataIndex: 'notificationType',
        key: 'notificationType',
        width: '10%',
        render: (notificationType) => <>{notificationType?.module?.name}</>
      },
      {
        title: L('NOTIFICATION_TEMPLATE_METHOD'),
        dataIndex: 'method',
        key: 'method',
        width: '10%',
        render: (method) => <>{L(method)}</>
      }
    ]

    return (
      <>
        <WrapPageScroll disable={!editComponentState} renderActions={() => this.renderActions(isLoading)}>
          <Card bordered={false}>
            <Form ref={this.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
              {showDetail && (
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 24, offset: 0 }}>
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
                                {editComponentState === contentType.sfdt && (
                                  <SynfDocumentEditorFormItem
                                    formRef={this.formRef}
                                    label={L('TEMPLATE_CONTENT')}
                                    {...formVerticalLayout}
                                    name={['templateLanguages', item.name, 'templateContent']}
                                  />
                                )}
                                {editComponentState === contentType.planText && (
                                  <Form.Item
                                    label={L('TEMPLATE_CONTENT')}
                                    {...formVerticalLayout}
                                    name={['templateLanguages', item.name, 'templateContent']}>
                                    <TextArea />
                                  </Form.Item>
                                )}
                                {editComponentState === contentType.html && (
                                  <Form.Item
                                    label={L('TEMPLATE_CONTENT')}
                                    {...formVerticalLayout}
                                    name={['templateLanguages', item.name, 'templateContent']}>
                                    <CKEditorInput />
                                  </Form.Item>
                                )}
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
              )}
            </Form>
            {!showDetail && (
              <>
                <DataTable
                  onRefresh={() => this.getNotifyTemplate()}
                  title={this.L('NOTIFICATION_TEMPLATE_LIST')}
                  pagination={{
                    pageSize: this.state.maxResultCount,
                    current: this.currentPage,
                    total: pagedResult === undefined ? 0 : pagedResult.totalCount,
                    onChange: this.handleTableChange
                  }}>
                  <Table
                    size="middle"
                    className="custom-ant-table custom-ant-row"
                    rowKey={(record) => record.id || 0}
                    columns={columns}
                    pagination={false}
                    loading={this.props.notificationTemplateStore.isLoading}
                    dataSource={pagedResult === undefined ? [] : pagedResult.items}
                  />
                </DataTable>
              </>
            )}
          </Card>
        </WrapPageScroll>
      </>
    )
  }
}

export default withRouter(ProjectHandOverTemplate)
