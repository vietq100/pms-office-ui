import * as React from 'react'

import { Button, Card, Col, Form, Input, Modal, Row, Switch, Tabs } from 'antd'
import AppComponentBase from '../../../../components/AppComponentBase'
import { isGrantedAny, L, LNotification } from '@lib/abpUtility'
import ProjectStore from '../../../../stores/project/projectStore'
import BuildingStore from '../../../../stores/project/buildingStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import AppConsts, { appPermissions, moduleAvatar, moduleIds } from '../../../../lib/appconst'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import rules from '../components/project.validation'
import FileStore from '../../../../stores/common/fileStore'
import { validateMessages } from '@lib/validation'
import AvatarUpload from '@components/FileUpload/AvatarUpload'
import projectService from '@services/project/projectService'
import withRouter from '@components/Layout/Router/withRouter'
import ProjectBankSetting from '../components/ProjectBankSetting'
import ProjectSetting from '../ProjectSetting'
import NoRole from '@components/ComponentNoRole'
import ProjectHandOverTemplate from '../components/projectHandoverTemplate'
import NotificationTemplateStore from '@stores/notificationTemplate/notificationTemplateStore'
import { EyeOutlined } from '@ant-design/icons'

const { formVerticalLayout } = AppConsts

export interface IProjectsProps {
  navigate: any
  params: any
  projectStore: ProjectStore
  buildingStore: BuildingStore
  fileStore: FileStore
  notificationTemplateStore: NotificationTemplateStore
}

export interface IProjectsState {
  files: any[]
  isDirty: boolean
  loading: boolean
  projectId: number
  tabActiveKey: string
  isPreviewImage: boolean
}

const confirm = Modal.confirm
const tabKeys = {
  projectTabInfo: 'PROJECT_TAB_INFO',
  projectTabBuilding: 'PROJECT_TAB_BUILDING',
  projectTabSetting: 'PROJECT_TAB_SETTING',
  // projectTabFeeTemplate: 'PROJECT_TAB_FEE_TEMPLATE',
  projectTimeSetting: 'PROJECT_TAB_TIME_SETTING',
  projectBankSetting: 'PROJECT_TAB_BANK',
  projectShopOnApp: 'PROJECT_SHOW_ON_APP',
  projectHandOverTemplate: 'PROJECT_HAND_OVER_TEMPLATE'
}

@inject(Stores.ProjectStore, Stores.BuildingStore, Stores.FileStore, Stores.NotificationTemplateStore)
@observer
class ProjectDetail extends AppComponentBase<IProjectsProps, IProjectsState> {
  formRef: any = React.createRef()
  formRefSetting: any = React.createRef()
  formRefBankSetting: any = React.createRef()
  formRefTemplate: any = React.createRef()
  formShowOnApp: any = React.createRef()
  state = {
    files: [] as any[],
    isDirty: false,
    loading: false,
    projectId: 0,
    tabActiveKey: 'PROJECT_TAB_INFO',
    isPreviewImage: false
  }

  async componentDidMount() {
    await this.getDetail(this.props.params?.id)
  }

  async getDetail(id) {
    if (!id) {
      await this.props.projectStore.createProject()
    } else {
      await this.props.projectStore.get(id)
    }

    this.formRef.current?.setFieldsValue({
      ...this.props.projectStore.editProject
    })
  }

  handleRefreshAfterUploadAvatar = () => {
    if (this.props.params?.id) {
      this.getDetail(this.props.params?.id)
    }
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  showPreviewImage = () => {
    this.setState({ isPreviewImage: !this.state.isPreviewImage })
  }

  onSave = () => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      if (this.props.projectStore.editProject?.id) {
        await this.props.projectStore.update(
          {
            ...this.props.projectStore.editProject,
            ...values
          },
          this.state.files
        )
      } else {
        await this.props.projectStore.create(values, this.state.files)
      }

      form.resetFields()
      this.props.navigate(-1)
    })
  }

  onSaveProjectSetting = () => {
    const form = this.formRefSetting.current

    form.validateFields().then(async (values: any) => {
      await projectService.createOrUpdateProjectSettings(this.props.projectStore.editProject.id, values)
      const timeSettingValues = {
        timeZone: values.timeZone,
        startDayOfWeek: values.startDayOfWeek,
        projectId: this.props.projectStore.editProject.id
      }
      await projectService.updateProjectTimeSettings(timeSettingValues)
      delete values.timeZone
      delete values.startDayOfWeek

      await this.props.projectStore.updateProjectSetting({
        projectId: this.props.projectStore.editProject?.id,
        ...this.props.projectStore.editProjectSettingWorkOrder,
        moduleId: moduleIds.workOrder,
        ...values.workOrder
      })
      if (this.props.projectStore.editProjectSettingWorkOrder) {
        this.formRefSetting.current.setFieldsValue({
          workOrder: { ...this.props.projectStore.editProjectSettingWorkOrder }
        })
      }

      await this.props.projectStore.updateProjectSetting({
        projectId: this.props.projectStore.editProject?.id,
        ...this.props.projectStore.editProjectSettingFeedBack,
        moduleId: moduleIds.feedback,
        ...values.feedBack
      })

      if (this.props.projectStore.editProjectSettingFeedBack) {
        this.formRefSetting.current.setFieldsValue({
          feedback: { ...this.props.projectStore.editProjectSettingFeedBack }
        })
      }
      await this.props.projectStore.updateModuleNotificationSettings({ ...values })
      if (this.props.projectStore.notificationSettings) {
        this.formRefSetting.current.setFieldsValue(this.props.projectStore.notificationSettings)
      }
    })
  }

  onCancel = () => {
    if (this.state.isDirty) {
      confirm({
        title: LNotification('ARE_YOU_SURE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          this.props.navigate(-1)
        }
      })
      return
    }
    this.props.navigate(-1)
  }

  onSaveBankSetting = () => {
    const form = this.formRefBankSetting.current
    form.validateFields().then(async (values: any) => {
      if (this.props.projectStore.editProject?.id) {
        const arrBankList = [...values.bankOBA, ...values.bankDBA]
        await this.props.projectStore.updateBank(arrBankList, this.props.projectStore.editProject?.id)
      }
      form.resetFields()
      this.props.navigate(-1)
    })
  }

  renderActions = (isLoading?) => {
    const { tabActiveKey } = this.state
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {tabActiveKey === tabKeys.projectBankSetting &&
            isGrantedAny(appPermissions.project.update, appPermissions.project.create) && (
              <Button
                type="primary"
                disabled={this.props.projectStore.editProject && !isGrantedAny(appPermissions.project.update)}
                onClick={this.onSaveBankSetting}
                loading={isLoading}
                shape="round">
                {L('BTN_SAVE')}
              </Button>
            )}
          {tabActiveKey === tabKeys.projectTabInfo &&
            isGrantedAny(appPermissions.project.create, appPermissions.project.update) && (
              <Button
                disabled={this.props.projectStore.editProject && !isGrantedAny(appPermissions.project.update)}
                type="primary"
                onClick={this.onSave}
                loading={isLoading}
                shape="round">
                {L('BTN_SAVE')}
              </Button>
            )}
          {tabActiveKey === tabKeys.projectTabSetting &&
            isGrantedAny(appPermissions.project.create, appPermissions.project.update) && (
              <Button
                disabled={this.props.projectStore.editProject && !isGrantedAny(appPermissions.project.update)}
                type="primary"
                onClick={this.onSaveProjectSetting}
                loading={isLoading}
                shape="round">
                {L('BTN_SAVE_SETTING')}
              </Button>
            )}
          {/* {tabActiveKey === tabKeys.projectHandOverTemplate &&
            isGrantedAny(appPermissions.project.create, appPermissions.project.update) && (
              <Button
                type="primary"
                disabled={this.props.projectStore.editProject && !isGrantedAny(appPermissions.project.update)}
                onClick={this.onsaveHandOverTemplate}
                loading={isLoading}
                shape="round">
                {L('BTN_SAVE_HANOVER_TEMPLATE')}
              </Button>
            )} */}
          {tabActiveKey === tabKeys.projectShopOnApp &&
            isGrantedAny(appPermissions.project.create, appPermissions.project.update) && (
              <Button
                type="primary"
                disabled={this.props.projectStore.editProject && !isGrantedAny(appPermissions.project.update)}
                // onClick={this.onSaveProjectSetting}
                loading={isLoading}
                shape="round">
                {L('BTN_SAVE_SETTING_SHOW_ON_APP')}
              </Button>
            )}
        </Col>
      </Row>
    )
  }

  public render() {
    const { tabActiveKey } = this.state
    const { isLoading } = this.props.projectStore
    return this.isGranted(appPermissions.project.detail) ? (
      <WrapPageScroll
        disable={tabActiveKey === tabKeys.projectHandOverTemplate}
        renderActions={() => this.renderActions(isLoading)}>
        <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab} type="card">
          <Tabs.TabPane tab={this.L(tabKeys.projectTabInfo)} key={tabKeys.projectTabInfo}>
            <Card style={{ minHeight: 700 }}>
              <Row gutter={[16, 0]}>
                <Col sm={{ span: 20, offset: 0 }}>
                  <Form ref={this.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
                    <Row gutter={[16, 0]}>
                      <Col sm={{ span: 12, offset: 0 }}>
                        <Form.Item
                          label={L('PROJECT_PROJECT_NAME')}
                          {...formVerticalLayout}
                          name="name"
                          rules={rules.name}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 12, offset: 0 }}>
                        <Form.Item
                          label={L('PROJECT_PROJECT_CODE')}
                          {...formVerticalLayout}
                          name="code"
                          rules={rules.code}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 12, offset: 0 }}>
                        <Form.Item
                          label={L('PROJECT_INVESTOR')}
                          {...formVerticalLayout}
                          name="investorName"
                          rules={rules.investorName}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 12, offset: 0 }}>
                        <Form.Item
                          label={L('PROJECT_LOCATION')}
                          {...formVerticalLayout}
                          name="address"
                          rules={rules.address}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 12, offset: 0 }}>
                        <Form.Item
                          label={L('PROJECT_HOTLINE')}
                          {...formVerticalLayout}
                          name="hotline"
                          rules={rules.hotline}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 12, offset: 0 }}>
                        <Form.Item
                          label={L('PROJECT_SAP_VBS')}
                          {...formVerticalLayout}
                          name="sapVbs"
                          rules={rules.code}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 3, offset: 0 }}>
                        <Form.Item
                          label={L('ACTIVE_STATUS')}
                          {...formVerticalLayout}
                          name="isActive"
                          valuePropName="checked">
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 3, offset: 0 }}>
                        <Form.Item
                          label={L('IS_DEFAULT')}
                          {...formVerticalLayout}
                          name="isDefault"
                          valuePropName="checked">
                          <Switch disabled />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Col>
                <Col sm={{ span: 4, offset: 0 }} className="text-center">
                  <div>
                    <label>{L('PROJECT_LOGO')}</label>
                  </div>
                  <AvatarUpload
                    projectStore={this.props.projectStore}
                    module={moduleAvatar.project}
                    parentId={this.props.projectStore.editProject?.uniqueId}
                    initImageUrl={this.props.params?.id ? this.props.projectStore.editProject?.logoUrl : ''}
                    cbGetProfilePicture={this.handleRefreshAfterUploadAvatar}
                  />
                  <Button size="small" className="mb-1" style={{ fontSize: 12 }} onClick={this.showPreviewImage}>
                    <EyeOutlined twoToneColor="#eb2f96" /> {L('VIEW_IMAGE')}
                  </Button>
                  <br />
                  <label className="text-muted small">{L('HINT_PROJECT_LOGO_MESSAGE')}</label>
                </Col>
              </Row>
            </Card>
          </Tabs.TabPane>
          {this.props.projectStore.editProject?.id && this.isGranted(appPermissions.projectSettings.settings) && (
            <Tabs.TabPane tab={this.L(tabKeys.projectTabSetting)} key={tabKeys.projectTabSetting}>
              <ProjectSetting
                formRef={this.formRefSetting}
                projectId={this.props.projectStore.editProject?.id}
                projectStore={this.props.projectStore}
              />
            </Tabs.TabPane>
          )}

          {this.props.projectStore.editProject?.id && (
            <Tabs.TabPane tab={this.L(tabKeys.projectBankSetting)} key={tabKeys.projectBankSetting}>
              <ProjectBankSetting
                formRef={this.formRefBankSetting}
                projectId={this.props.projectStore.editProject?.id}
                projectStore={this.props.projectStore}
              />
            </Tabs.TabPane>
          )}
          {this.props.projectStore.editProject?.id && (
            <Tabs.TabPane tab={this.L(tabKeys.projectHandOverTemplate)} key={tabKeys.projectHandOverTemplate}>
              <ProjectHandOverTemplate
                projectId={this.props.projectStore.editProject?.id}
                projectStore={this.props.projectStore}
                activeKey={tabActiveKey}
                currentKey={tabKeys.projectHandOverTemplate}
              />
            </Tabs.TabPane>
          )}

          {/* {this.props.projectStore.editProject?.id && (
              <Tabs.TabPane tab={this.L(tabKeys.projectShopOnApp)} key={tabKeys.projectShopOnApp}>
                <ProjectShowOnApp
                  formRef={this.formShowOnApp}
                  projectId={this.props.projectStore.editProject?.id}
                  projectStore={this.props.projectStore}
                />
              </Tabs.TabPane>
            )} */}
        </Tabs>

        <Modal
          width={'400px'}
          closable={false}
          footer={false}
          open={this.state.isPreviewImage}
          onCancel={this.showPreviewImage}>
          <img style={{ width: '400px' }} src={this.props.projectStore.editProject?.logoUrl} />
        </Modal>
        <style scoped>
          {`
      .ant-modal .ant-modal-content{
          padding: 0px ;
          height: 200px;
      }`}
        </style>
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(ProjectDetail)
