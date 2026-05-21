import React from 'react'

import { Col, Form, Row, Select, Card, Tabs, Modal, Button, Input, Switch } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import { isGranted, isGrantedAny, L, LNotification } from '../../../../lib/abpUtility'
import { validateMessages } from '../../../../lib/validation'
import rules from './validation'
import AppConsts, { appPermissions, moduleIds, fileTypeGroup, workflowEvent } from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import FeedbackStore from '../../../../stores/communication/feedbackStore'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import AppComponentBase from '../../../../components/AppComponentBase'
import ProjectStore from '../../../../stores/project/projectStore'
import WorkflowFormBuilder from '../../../workflow/formBuilder'
import WorkflowStore from '../../../../stores/workflow/workflowStore'
import { UserOutlined, PhoneOutlined } from '@ant-design/icons/lib'
import { portalLayouts } from '../../../../components/Layout/Router/router.config'
import { UnitUserModel } from '../../../../models/User/IUserModel'
import FileStore from '../../../../stores/common/fileStore'
import AuditLog from '../../../../components/AuditLog'
import AuditLogStore from '../../../../stores/common/auditLogStore'
import CommentStore from '../../../../stores/common/commentStore'
import SessionStore from '../../../../stores/sessionStore'
import CommentList from '../../../../components/CommentList'
import Rate from 'antd/lib/rate'
import withRouter from '@components/Layout/Router/withRouter'
import FileUploadWrapV2 from '@components/FileUploadV2'
import TextArea from 'antd/es/input/TextArea'
import NoRole from '@components/ComponentNoRole'
import dayjs from 'dayjs'
// import { toJS } from 'mobx'

const { formVerticalLayout } = AppConsts
const { confirm } = Modal
const { Option } = Select
const { TabPane } = Tabs
const tabKeys = {
  tabInfo: 'FEEDBACK_TAB_INFO',
  tabComment: 'FEEDBACK_TAB_COMMENTS',
  tabCommentPrivate: 'FEEDBACK_TAB_COMMENTS_PRIVATE',
  tabAuditLog: 'FEEDBACK_TAB_AUDIT_LOG'
}

export interface IFeedbackFormProps {
  navigate: any
  params: any
  feedbackStore: FeedbackStore
  workflowStore: WorkflowStore
  projectStore: ProjectStore
  fileStore: FileStore
  auditLogStore: AuditLogStore
  commentStore: CommentStore
  sessionStore: SessionStore
}

@inject(
  Stores.FeedbackStore,
  Stores.WorkflowStore,
  Stores.UserStore,
  Stores.ProjectStore,
  Stores.UnitStore,
  Stores.FileStore,
  Stores.AuditLogStore,
  Stores.CommentStore,
  Stores.SessionStore
)
@observer
class FeedbackDetail extends AppComponentBase<IFeedbackFormProps> {
  state = {
    isDirty: false,
    tabActiveKey: tabKeys.tabInfo,
    files: [] as any,
    filesAfter: [] as any,
    idDocument: undefined
  }
  formRef: any = React.createRef()

  async componentDidMount() {
    isGranted(appPermissions.feedback.detail) &&
      (await Promise.all([this.findUnitResidents(''), this.getDetail(this.props.params?.id)]))
    isGranted(appPermissions.feedback.detail) && this.initDefault()
  }

  initDefault = async () => {
    const { editFeedback } = this.props.feedbackStore
    if (editFeedback?.id) {
      this.props.projectStore.unitUserOptions = [UnitUserModel.assign(this.props.feedbackStore.editFeedback)]
    }
  }

  getDetail = async (id?) => {
    // Init properties & custom field for workflow first
    const initWorkflow = await this.props.workflowStore.getWorkflowFields(moduleIds.feedback)
    if (!id) {
      await this.props.feedbackStore.createFeedback(initWorkflow.customFields)
    } else {
      await this.props.feedbackStore.get(id)
      this.setState({
        idDocument: this.props.feedbackStore.editFeedback?.workflow?.uniqueId
      })
    }

    this.initWorkflow(null, null, () => {
      this.formRef.current?.setFieldsValue({
        ...this.props.feedbackStore.editFeedback,
        solution: this.props.feedbackStore.editFeedback.workflow.solution
      })
    })
  }

  initWorkflow = (event, value, cb?) => {
    if (this.props.params?.id || this.props.feedbackStore.editFeedback?.workflow?.id) {
      if (cb) {
        return cb()
      }
      return
    }

    if (event === workflowEvent.init) {
      const defaultStatus = (this.props.workflowStore.wfStatus || []).find((item) => item.isDefault)
      const defaultRole = (this.props.workflowStore.wfRoles || []).find((item) => item.isDefault)
      const defaultPriority = (this.props.workflowStore.wfPriorities || []).find((item) => item.isDefault)

      if (this.props.feedbackStore.editFeedback?.workflow) {
        this.props.feedbackStore.editFeedback.workflow.statusId = defaultStatus?.id
        this.props.feedbackStore.editFeedback.workflow.roleId = defaultRole?.id
        this.props.feedbackStore.editFeedback.workflow.priorityId = defaultPriority?.id
        this.props.feedbackStore.editFeedback.workflow.startDate = dayjs()
      }

      if (cb) {
        return cb()
      }
      this.formRef.current.setFieldsValue({
        ...this.props.feedbackStore.editFeedback
      })
    }
  }

  findProjects = async (keyword) => {
    await this.props.projectStore.filterOptions({ keyword })
  }

  findUnitResidents = async (keyword) => {
    await this.props.projectStore.filterUnitUserOptions({ keyword })
  }

  updateUnitResident = async (value) => {
    const { unitUserOptions } = this.props.projectStore
    const form = this.formRef.current

    if (!unitUserOptions || !unitUserOptions.length) {
      return
    }
    const resident = unitUserOptions.find((item) => item.optionValue === value)
    form.setFieldsValue({
      unitId: resident?.unitId,
      userId: resident?.userId,
      fullUnitCode: resident?.fullUnitCode
    })
  }

  onRemoveFile = (file) => {
    const index = this.state.files.indexOf(file)
    const newFileList = [...this.state.files]
    newFileList.splice(index, 1)
    this.setState({ files: newFileList })
  }

  beforeUploadFile = (file) => {
    this.setState({ files: [...this.state.files, file] })
    return false
  }
  onRemoveFileAfter = (file) => {
    const index = this.state.filesAfter.indexOf(file)
    const newFileList = [...this.state.filesAfter]
    newFileList.splice(index, 1)
    this.setState({ filesAfter: newFileList })
  }

  beforeUploadFileAfter = (file) => {
    this.setState({ filesAfter: [...this.state.filesAfter, file] })
    return false
  }
  onSave = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      values.workflow.solution = values.solution
      if (this.props.feedbackStore.editFeedback?.id) {
        if (values.workflow.estimatedHours === null) values.workflow.estimatedHours = 0

        await this.props.feedbackStore.update(
          {
            ...this.props.feedbackStore.editFeedback,
            ...values
          },
          this.state.files,
          this.state.filesAfter
        )
      } else {
        if (values.workflow.estimatedHours === null) values.workflow.estimatedHours = 0
        await this.props.feedbackStore.create(values, this.state.files)
      }

      this.props.navigate({
        pathname: portalLayouts.communicationFeedback.path,
        search: 'keep-filter'
      })
    })
  }

  onCancel = () => {
    if (this.state.isDirty) {
      confirm({
        title: LNotification('ARE_YOU_SURE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          this.props.navigate({
            pathname: portalLayouts.communicationFeedback.path,
            search: 'keep-filter'
          })
        }
      })
      return
    }
    this.props.navigate({
      pathname: portalLayouts.communicationFeedback.path,
      search: 'keep-filter'
    })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
    if (tabKey === tabKeys.tabComment || tabKey === tabKeys.tabCommentPrivate) {
      const params = {
        conversationUniqueId: this.props.feedbackStore.editFeedback?.workflow?.uniqueId,
        moduleId: moduleIds.feedback,
        maxResultCount: 10,
        skipCount: 0,
        isIncludeFile: true,
        isPrivate: tabKey === tabKeys.tabCommentPrivate
      }
      this.props.commentStore.getAll(params)
    }
  }

  renderFeedbackId = () => {
    if (!this.props.feedbackStore.editFeedback?.id) {
      return ''
    }
    return (
      <b>
        {this.L('FEEDBACK_ID')}: {this.props.feedbackStore.editFeedback.id}
      </b>
    )
  }

  renderActions = (isLoading?) => {
    const { tabActiveKey } = this.state
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {tabActiveKey === tabKeys.tabInfo &&
            isGrantedAny(appPermissions.feedback.create, appPermissions.feedback.update) && (
              <Button
                type="primary"
                disabled={this.props.feedbackStore.editFeedback?.id && !isGrantedAny(appPermissions.feedback.update)}
                onClick={this.onSave}
                loading={isLoading}
                shape="round">
                {L('BTN_SAVE')}
              </Button>
            )}
        </Col>
      </Row>
    )
  }

  render() {
    const {
      projectStore: { unitUserOptions },
      feedbackStore: { editFeedback, isLoading }
    } = this.props
    return isGranted(appPermissions.feedback.detail) ? (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Tabs
          type="card"
          activeKey={this.state.tabActiveKey}
          onTabClick={this.changeTab}
          tabBarExtraContent={this.renderFeedbackId()}>
          <TabPane tab={L(tabKeys.tabInfo)} key={tabKeys.tabInfo}>
            <Card bordered={false} id="feedback-detail">
              <Form
                ref={this.formRef}
                layout={'vertical'}
                onFinish={this.onSave}
                onAbort={this.onCancel}
                onValuesChange={() => this.setState({ isDirty: true })}
                validateMessages={validateMessages}
                size="middle">
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('FEEDBACK_RESIDENT')}
                      {...formVerticalLayout}
                      name="unitUserId"
                      rules={rules.unitUserId}>
                      <Select
                        showSearch
                        allowClear
                        filterOption={false}
                        className="full-width"
                        onSearch={this.findUnitResidents}
                        onChange={this.updateUnitResident}
                        disabled={this.formRef.current?.getFieldValue('id')}>
                        {(unitUserOptions || []).map((option, index) => {
                          return (
                            <Option key={index} value={option.optionValue}>
                              {option.displayName}
                              <div className="text-muted small" style={{ display: 'flex' }}>
                                <span className="mr-2 text-truncate" style={{ flex: 1 }}>
                                  <HomeOutlined className="mr-1" />
                                  {option.fullUnitCode}
                                </span>

                                <span className="mr-2 text-truncate" style={{ flex: 1 }}>
                                  {option.emailAddress && option.emailAddress.length && (
                                    <>
                                      <UserOutlined className="mr-1" />
                                      {option.userName}
                                    </>
                                  )}
                                </span>
                                <span className={'text-truncate'} style={{ flex: 1 }}>
                                  {option.phoneNumber && option.phoneNumber.length && (
                                    <>
                                      <PhoneOutlined className="mr-1" />
                                      {option.phoneNumber}
                                    </>
                                  )}
                                </span>
                              </div>
                            </Option>
                          )
                        })}
                      </Select>
                    </Form.Item>
                    <Form.Item name="userId" rules={rules.userId} className="d-none">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('FEEDBACK_UNIT')}
                      {...formVerticalLayout}
                      name="fullUnitCode"
                      rules={rules.unitId}>
                      <Input disabled={true} />
                    </Form.Item>
                    <Form.Item name="unitId" rules={rules.unitId} className="d-none">
                      <Input />
                    </Form.Item>
                  </Col>
                  {editFeedback && (
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Form.Item name="workflow" className="full-width">
                        <WorkflowFormBuilder
                          workflowStore={this.props.workflowStore}
                          moduleId={moduleIds.feedback}
                          projectId={this.formRef.current?.getFieldValue('projectId')}
                          onChange={this.initWorkflow}
                        />
                      </Form.Item>
                    </Col>
                  )}
                  {editFeedback.rating && (
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Row>
                        <Col sm={{ span: 8, offset: 0 }}>
                          <Form.Item name={['rating', 'rate']} label={L('FEEDBACK_RATING')}>
                            <Rate disabled={true} />
                          </Form.Item>
                        </Col>
                        <Col sm={{ span: 16, offset: 0 }}>
                          <Form.Item
                            name={['rating', 'comment']}
                            label={L('FEEDBACK_RATING_COMMENT')}
                            {...formVerticalLayout}>
                            <Input disabled={true} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                  )}
                  <Col sm={{ span: 24, offset: 0 }}>
                    <Form.Item label={L('FEEDBACK_SOLUTION')} {...formVerticalLayout} name="solution">
                      <TextArea autoSize={{ minRows: 3, maxRows: 5 }} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('FEEDBACK_SHOW_TO_RESIDENT_APP')}
                      {...formVerticalLayout}
                      name="isShowToResident"
                      initialValue={false}
                      valuePropName="checked">
                      <Switch defaultChecked={false} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <label>{L('BEFORE_IMAGES')}</label>
                    <FileUploadWrapV2
                      multiple
                      parentId={this.state.idDocument}
                      fileStore={this.props.fileStore}
                      onRemoveFile={this.onRemoveFile}
                      beforeUploadFile={this.beforeUploadFile}
                      acceptedFileTypes={[
                        ...fileTypeGroup.images,
                        ...fileTypeGroup.documentNotExcel,
                        ...fileTypeGroup.videos
                      ]}
                      totalSize={50}
                      specialModuleName="FEEDBACK"
                    />
                  </Col>
                  {this.props.params?.id && (
                    <Col sm={{ span: 24, offset: 0 }}>
                      <label>{L('AFTER_IMAGES')}</label>
                      <FileUploadWrapV2
                        multiple
                        parentId={this.state.idDocument}
                        fileStore={this.props.fileStore}
                        onRemoveFile={this.onRemoveFileAfter}
                        beforeUploadFile={this.beforeUploadFileAfter}
                        acceptedFileTypes={[
                          ...fileTypeGroup.images,
                          ...fileTypeGroup.documentNotExcel,
                          ...fileTypeGroup.videos
                        ]}
                        maxSize={25}
                        totalSize={50}
                        specialModuleName="FEEDBACKAFTER"
                      />
                    </Col>
                  )}
                </Row>
              </Form>
            </Card>
          </TabPane>
          {isGranted(appPermissions.communication.page) && (
            <TabPane
              tab={L(tabKeys.tabComment)}
              key={tabKeys.tabComment}
              disabled={!this.props.feedbackStore.editFeedback?.workflow?.uniqueId}>
              <CommentList
                moduleId={moduleIds.feedback}
                parentId={this.props.feedbackStore.editFeedback?.workflow?.uniqueId}
                commentStore={this.props.commentStore}
                sessionStore={this.props.sessionStore}
                isPrivate={false}
              />
            </TabPane>
          )}
          <TabPane
            tab={L(tabKeys.tabCommentPrivate)}
            key={tabKeys.tabCommentPrivate}
            disabled={!this.props.feedbackStore.editFeedback?.workflow?.uniqueId}>
            <CommentList
              moduleId={moduleIds.feedback}
              parentId={this.props.feedbackStore.editFeedback?.workflow?.uniqueId}
              commentStore={this.props.commentStore}
              sessionStore={this.props.sessionStore}
              isPrivate={true}
            />
          </TabPane>
          <TabPane
            tab={L(tabKeys.tabAuditLog)}
            key={tabKeys.tabAuditLog}
            disabled={!this.props.feedbackStore.editFeedback?.id}>
            <AuditLog
              moduleId={moduleIds.feedback}
              parentId={this.props.feedbackStore.editFeedback?.id}
              auditLogStore={this.props.auditLogStore}
            />
          </TabPane>
        </Tabs>
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(FeedbackDetail)
