import { Col, Form, Row, Switch, Select, Input, InputNumber, Collapse } from 'antd'

import AppComponentBase from '../../../../components/AppComponentBase'
import { L } from '@lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import AppConsts, { moduleIds } from '../../../../lib/appconst'
import { validateMessages } from '@lib/validation'
import staffService from '@services/member/staff/staffService'
import Card from 'antd/lib/card'
import TagsInput from '@components/Inputs/TagsInput'
import ProjectStore from '@stores/project/projectStore'
import http from '@services/httpService'
import rules from '../components/project.validation'

const { dayOfWeek, formVerticalLayout, dataType } = AppConsts
const { Option } = Select
const { Panel } = Collapse

const panelKeys = {
  panelNewEmail: 'PANEL_SETTING_NEW_WO',
  panelUpdateEmail: 'PANEL_SETTING_UPDATE_WO',
  panelReportEmail: 'PANEL_SETTING_REPORT',
  panelNotification: 'PANEL_SETTING_NOTIFICATION',
  panelAbnormalAction: 'PANEL_SETTING_ABNORMAL_ACTION',
  panelTimeSetting: 'PANEL_TIME_SETTING'
}
export interface IProjectsProps {
  formRef: any
  projectStore: ProjectStore
  projectId: number
}

export interface IProjectsState {
  projectId: number
  employeesWO: any[]
  employeesFeedBack: any[]
  employeesForm: any[]
  abnormalEmail: Array<string>
  abnormalTime: string
  abnormalNumber: string
}

@inject(Stores.ProjectStore, Stores.BuildingStore, Stores.FileStore)
@observer
class ProjectSetting extends AppComponentBase<IProjectsProps, IProjectsState> {
  state = {
    projectId: 0,
    employeesWO: [] as any,
    employeesFeedBack: [] as any,
    employeesForm: [] as any,
    abnormalEmail: [],
    abnormalTime: '',
    abnormalNumber: ''
  }

  async componentDidMount() {
    await this.props.projectStore.getTimeZone()
    await this.props.projectStore.getTimeSetting(this.props.projectId)
    await this.getAbnormalAction(this.props.projectId)
    await this.getProjectSetting(this.props.projectId)
    await this.getModuleNotificationSettings()

    await this.findEmployees('')

    this.props.formRef.current.setFieldsValue({
      workOrder: { ...this.props.projectStore.editProjectSettingWorkOrder },
      feedBack: { ...this.props.projectStore.editProjectSettingFeedBack },
      form: {
        createToMail: !Array.isArray(this.props.projectStore.notificationSettings.form?.createToMail)
          ? []
          : this.props.projectStore.notificationSettings.form?.createToMail,
        createToUsers: !Array.isArray(this.props.projectStore.notificationSettings.form?.createToUsers)
          ? []
          : this.props.projectStore.notificationSettings.form?.createToUsers,
        updateToMail: !Array.isArray(this.props.projectStore.notificationSettings.form?.updateToMail)
          ? []
          : this.props.projectStore.notificationSettings.form?.updateToMail,
        updateToUsers: !Array.isArray(this.props.projectStore.notificationSettings.form?.updateToUsers)
          ? []
          : this.props.projectStore.notificationSettings.form?.updateToUsers
      },
      // feedBack: {
      //   createToMail: !Array.isArray(this.props.projectStore.notificationSettings.feedBack?.createToMail)
      //     ? []
      //     : this.props.projectStore.notificationSettings.feedBack?.createToMail,
      //   createToUsers: !Array.isArray(this.props.projectStore.notificationSettings.feedBack?.createToUsers)
      //     ? []
      //     : this.props.projectStore.notificationSettings.feedBack?.createToUsers,
      //   updateToMail: !Array.isArray(this.props.projectStore.notificationSettings.feedBack?.updateToMail)
      //     ? []
      //     : this.props.projectStore.notificationSettings.feedBack?.updateToMail,
      //   updateToUsers: !Array.isArray(this.props.projectStore.notificationSettings.feedBack?.updateToUsers)
      //     ? []
      //     : this.props.projectStore.notificationSettings.feedBack?.updateToUsers
      // },
      // jobRequest: {
      //   createToMail: !Array.isArray(this.props.projectStore.notificationSettings.jobRequest?.createToMail)
      //     ? []
      //     : this.props.projectStore.notificationSettings.jobRequest?.createToMail,
      //   createToUsers: !Array.isArray(this.props.projectStore.notificationSettings.jobRequest?.createToUsers)
      //     ? []
      //     : this.props.projectStore.notificationSettings.jobRequest?.createToUsers,
      //   updateToMail: !Array.isArray(this.props.projectStore.notificationSettings.jobRequest?.updateToMail)
      //     ? []
      //     : this.props.projectStore.notificationSettings.jobRequest?.updateToMail,
      //   updateToUsers: !Array.isArray(this.props.projectStore.notificationSettings.jobRequest?.updateToUsers)
      //     ? []
      //     : this.props.projectStore.notificationSettings.jobRequest?.updateToUsers
      // },
      abnormalEmail: this.state.abnormalEmail,
      abnormalTime: this.state.abnormalTime,
      abnormalNumber: this.state.abnormalNumber,
      ...this.props.projectStore.timeSetting
    })
  }

  async getProjectSetting(id) {
    if (!id) {
      await this.props.projectStore.initProjectSetting()
    } else {
      await this.props.projectStore.getProjectSetting(id, moduleIds.feedback)
      await this.props.projectStore.getProjectSetting(id, moduleIds.workOrder)
      this.setState({
        employeesFeedBack: this.props.projectStore.editProjectSettingFeedBack?.notificationUsers || [],
        employeesWO: this.props.projectStore.editProjectSettingWorkOrder?.notificationUsers || []
      })
    }
  }

  async getModuleNotificationSettings() {
    await this.props.projectStore.getModuleNotificationSettings()
  }

  async getAbnormalAction(id) {
    const result = await http.get(`api/services/app/Projects/GetProjectSettings`, { params: { projectId: id } })
    if (result.data.result[0]) {
      result.data.result.map((item) => {
        if (item.name === 'TIME') {
          const abnormalTime = item.value
          this.setState({ abnormalTime })
        }
        if (item.name === 'NUMBER') {
          const abnormalNumber = item.value
          this.setState({ abnormalNumber })
        }
        if (item.name === 'EMAIL') {
          const abnormalEmail = item.value.split(', ')
          this.setState({ abnormalEmail })
        }
      })
    }
  }

  findEmployees = async (keyword) => {
    const employees = await staffService.filterOptions({ keyword })
    this.setState({ employeesForm: employees, employeesFeedBack: employees, employeesWO: employees })
  }

  findEmployeesForm = async (keyword) => {
    const employeesForm = await staffService.filterOptions({ keyword })
    this.setState({ employeesForm })
  }

  findEmployeesWoderOrder = async (keyword) => {
    const employeesWO = await staffService.filterOptions({ keyword })
    this.setState({ employeesWO })
  }

  findEmployeesFeedBack = async (keyword) => {
    const employeesFeedBack = await staffService.filterOptions({ keyword })
    this.setState({ employeesFeedBack })
  }

  public render() {
    const { employeesWO, employeesFeedBack, employeesForm } = this.state
    return (
      <Card bordered={false}>
        <Form ref={this.props.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
          <Row gutter={[16, 0]}>
            {/* <Col sm={{ span: 24, offset: 0 }} className="mb-2">
              <Collapse defaultActiveKey={[1]} collapsible="icon" className="custom-collapse ">
                <Panel header={L('NOTIFICATION_JOB_REQUEST')} key="1" className="pr-1 pl-1">
                  <Row gutter={[16, 4]} className="px-1 pt-1 pb-1">
                    <Col sm={{ span: 12, offset: 0 }}>
                      <Form.Item
                        name={['jobRequest', 'createToUsers']}
                        label={L('NOTIFICATION_CREATE_JOB_REQUEST_TO_USER')}>
                        <Select
                          showSearch
                          mode="multiple"
                          showArrow
                          size="large"
                          className="full-width"
                          onSearch={this.findEmployees}
                          filterOption={false}>
                          {(employees || []).map((item: any, index) => (
                            <Option key={index} value={item.id}>
                              {item.displayName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <Form.Item
                        label={L('NOTIFICATION_CREATE_JOB_REQUEST_TO_MAIL')}
                        {...formVerticalLayout}
                        name={['jobRequest', 'createToMail']}>
                        <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
                      </Form.Item>
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <Form.Item
                        name={['jobRequest', 'updateToUsers']}
                        label={L('NOTIFICATION_UPDATE_JOB_REQUEST_TO_USER')}>
                        <Select
                          showSearch
                          mode="multiple"
                          showArrow
                          size="large"
                          className="full-width"
                          onSearch={this.findEmployees}
                          filterOption={false}>
                          {(employees || []).map((item: any, index) => (
                            <Option key={index} value={item.id}>
                              {item.displayName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <Form.Item
                        label={L('NOTIFICATION_UPDATE_JOB_REQUEST_TO_MAIL')}
                        {...formVerticalLayout}
                        name={['jobRequest', 'updateToMail']}>
                        <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
            </Col> */}
            {/* <Col sm={{ span: 24, offset: 0 }} className="mb-2">
              <Collapse defaultActiveKey={[1]} collapsible="icon" className="custom-collapse ">
                <Panel header={L('NOTIFICATION_FEED_BACK')} key="1" className="pr-1 pl-1">
                  <Row gutter={[16, 4]} className="px-1 pt-1 pb-1">
                    <Col sm={{ span: 12, offset: 0 }}>
                      <Form.Item
                        name={['feedBack', 'createToUsers']}
                        label={L('NOTIFICATION_CREATE_FEED_BACK_TO_USER')}>
                        <Select
                          showSearch
                          mode="multiple"
                          showArrow
                          size="large"
                          className="full-width"
                          onSearch={this.findEmployees}
                          filterOption={false}>
                          {(employees || []).map((item: any, index) => (
                            <Option key={index} value={item.id}>
                              {item.displayName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <Form.Item
                        label={L('NOTIFICATION_CREATE_FEED_BACK_TO_MAIL')}
                        {...formVerticalLayout}
                        name={['feedBack', 'createToMail']}>
                        <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
                      </Form.Item>
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <Form.Item
                        name={['feedBack', 'updateToUsers']}
                        label={L('NOTIFICATION_UPDATE_FEED_BACK_TO_USER')}>
                        <Select
                          showSearch
                          mode="multiple"
                          showArrow
                          size="large"
                          className="full-width"
                          onSearch={this.findEmployees}
                          filterOption={false}>
                          {(employees || []).map((item: any, index) => (
                            <Option key={index} value={item.id}>
                              {item.displayName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <Form.Item
                        label={L('NOTIFICATION_UPDATE_FEED_BACK_TO_MAIL')}
                        {...formVerticalLayout}
                        name={['feedBack', 'updateToMail']}>
                        <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
            </Col> */}

            <Col sm={{ span: 24, offset: 0 }} className="mb-2">
              <Collapse defaultActiveKey={[1]} collapsible="icon" className="custom-collapse ">
                <Panel header={<strong>{L('NOTIFICATION_FORM')}</strong>} key="1" className="pr-1 pl-1">
                  <Row gutter={[16, 4]} className="px-1 pt-1 pb-1">
                    <Col sm={{ span: 12, offset: 0 }}>
                      <Form.Item name={['form', 'createToUsers']} label={L('NOTIFICATION_CREATE_FORM_TO_USER')}>
                        <Select
                          showSearch
                          mode="multiple"
                          showArrow
                          size="large"
                          className="full-width"
                          onSearch={this.findEmployeesForm}
                          filterOption={false}>
                          {(employeesForm || []).map((item: any, index) => (
                            <Option key={index} value={item.id}>
                              {item.displayName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <Form.Item
                        label={L('NOTIFICATION_CREATE_FORM_TO_MAIL')}
                        {...formVerticalLayout}
                        name={['form', 'createToMail']}>
                        <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
                      </Form.Item>
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <Form.Item name={['form', 'updateToUsers']} label={L('NOTIFICATION_UPDATE_FORM_TO_USER')}>
                        <Select
                          showSearch
                          mode="multiple"
                          showArrow
                          size="large"
                          className="full-width"
                          onSearch={this.findEmployeesFeedBack}
                          filterOption={false}>
                          {(employeesForm || []).map((item: any, index) => (
                            <Option key={index} value={item.id}>
                              {item.displayName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <Form.Item
                        label={L('NOTIFICATION_UPDATE_FORM_TO_MAIL')}
                        {...formVerticalLayout}
                        name={['form', 'updateToMail']}>
                        <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          {/* WORD_ORDER */}
          <Row gutter={[16, 0]} className="mt-1">
            <Col sm={{ span: 24, offset: 0 }} className="mt-2">
              <strong>{L('WO_NOTIFY_TO')}</strong>
            </Col>

            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_NUMBER_REQUEST_WO_PER_DAY')}
                {...formVerticalLayout}
                name={['workOrder', 'requestPerDay']}>
                <InputNumber className="full-width" min={0} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 16, offset: 0 }}>
              <Form.Item name={['workOrder', 'notificationUserIds']} label={L('PROJECT_SETTING_NOTIFICATION_TO_USERS')}>
                <Select
                  showSearch
                  mode="multiple"
                  showArrow
                  className="full-width"
                  onSearch={this.findEmployeesWoderOrder}
                  filterOption={false}>
                  {(employeesWO || []).map((item: any, index) => (
                    <Option key={index} value={item.id}>
                      {item.displayName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <h4 className="mb-0">{L(panelKeys.panelNewEmail)}</h4>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_MAIL_TO')}
                {...formVerticalLayout}
                name={['workOrder', 'newMailTos']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_MAIL_CC')}
                {...formVerticalLayout}
                name={['workOrder', 'newMailCCs']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_MAIL_BCC')}
                {...formVerticalLayout}
                name={['workOrder', 'newMailBCCs']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <h4 className="mb-0">{L(panelKeys.panelUpdateEmail)}</h4>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_MAIL_TO')}
                {...formVerticalLayout}
                name={['workOrder', 'updateMailTos']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_MAIL_CC')}
                {...formVerticalLayout}
                name={['workOrder', 'updateMailCCs']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_MAIL_BCC')}
                {...formVerticalLayout}
                name={['workOrder', 'updateMailBCCs']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <h4 className="mb-0">{L(panelKeys.panelReportEmail)}</h4>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_MAIL_TO')}
                {...formVerticalLayout}
                name={['workOrder', 'reportMailTos']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_MAIL_CC')}
                {...formVerticalLayout}
                name={['workOrder', 'reportMailCCs']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_MAIL_BCC')}
                {...formVerticalLayout}
                name={['workOrder', 'reportMailBCCs']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
          </Row>
          {/* END WORD_ORDER */}

          {/* NOTICE APPROVAL WORKORDER */}
          <Row gutter={[16, 0]} className="mt-1">
            <Col sm={{ span: 24, offset: 0 }} className="mt-2">
              <strong>{L('FEEDBACK_NOTIFY_TO')}</strong>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_NOTICE_APPROVAL_WORK_ORDER')}
                {...formVerticalLayout}
                name={['workOrder', 'reportMailBCCsabla']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
          </Row>
          {/* END NOTICE APPROVAL WORKORDER */}

          {/* FEEDBACK */}
          <Row gutter={[16, 0]} className="mt-1">
            <Col sm={{ span: 24, offset: 0 }} className="mt-2">
              <strong>{L('FEEDBACK_NOTIFY_TO')}</strong>
            </Col>

            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_NUMBER_REQUEST_WO_PER_DAY')}
                {...formVerticalLayout}
                name={['feedBack', 'requestPerDay']}>
                <InputNumber className="full-width" min={0} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 16, offset: 0 }}>
              <Form.Item name={['feedBack', 'notificationUserIds']} label={L('PROJECT_SETTING_NOTIFICATION_TO_USERS')}>
                <Select
                  showSearch
                  mode="multiple"
                  showArrow
                  className="full-width"
                  onSearch={this.findEmployeesFeedBack}
                  filterOption={false}>
                  {(employeesFeedBack || []).map((item: any, index) => (
                    <Option key={index} value={item.id}>
                      {item.displayName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <h4 className="mb-0">{L(panelKeys.panelNewEmail)}</h4>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item label={L('PROJECT_SETTING_MAIL_TO')} {...formVerticalLayout} name={['feedBack', 'newMailTos']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item label={L('PROJECT_SETTING_MAIL_CC')} {...formVerticalLayout} name={['feedBack', 'newMailCCs']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_MAIL_BCC')}
                {...formVerticalLayout}
                name={['feedBack', 'newMailBCCs']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <h4 className="mb-0">{L(panelKeys.panelUpdateEmail)}</h4>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_MAIL_TO')}
                {...formVerticalLayout}
                name={['feedBack', 'updateMailTos']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_MAIL_CC')}
                {...formVerticalLayout}
                name={['feedBack', 'updateMailCCs']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_MAIL_BCC')}
                {...formVerticalLayout}
                name={['feedBack', 'updateMailBCCs']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <h4 className="mb-0">{L(panelKeys.panelReportEmail)}</h4>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_MAIL_TO')}
                {...formVerticalLayout}
                name={['feedBack', 'reportMailTos']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_MAIL_CC')}
                {...formVerticalLayout}
                name={['feedBack', 'reportMailCCs']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_MAIL_BCC')}
                {...formVerticalLayout}
                name={['feedBack', 'reportMailBCCs']}>
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>
          </Row>
          {/* END FEED BACK */}

          <Row gutter={[16, 0]} className="mt-1">
            <Col sm={{ span: 24, offset: 0 }}>
              <h4 className="mb-0">{L(panelKeys.panelAbnormalAction)}</h4>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('PROJECT_SETTING_MAIL_TO')} {...formVerticalLayout} name="abnormalEmail">
                <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
              </Form.Item>
            </Col>

            <Col sm={{ span: 8, offset: 0 }}>{L('FREQUENCY_VIEWING_FULL_RESIDENT_INFORMATION')}</Col>
            <Col sm={{ span: 4, offset: 0 }}>
              <Form.Item {...formVerticalLayout} name="abnormalNumber">
                <Input type="number" className="w-100" />
              </Form.Item>
            </Col>
            <span style={{ fontSize: '1.5rem', lineHeight: '1.45rem' }}>/</span>
            <Col sm={{ span: 4, offset: 0 }}>
              <Form.Item {...formVerticalLayout} name="abnormalTime">
                <Input type="number" className="w-100" />
              </Form.Item>
            </Col>
            <Col sm={{ span: 2, offset: 0 }}>{L('MINUTES')}</Col>

            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('PROJECT_SETTING_ACTIVE')}
                {...formVerticalLayout}
                name="isActive"
                valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 0]} className="mt-1">
            <Col sm={{ span: 24, offset: 0 }}>
              <h4 className="mb-0">{L(panelKeys.panelTimeSetting)}</h4>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                name="timeZone"
                label={L('PROJECT_SETTING_TIMEZONE')}
                rules={rules.timeZone}
                initialValue="SE Asia Standard Time">
                <Select showSearch showArrow className="full-width" filterOption={false}>
                  {(this.props.projectStore.timeZone || []).map((item: any, index) => (
                    <Option key={index} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item name="startDayOfWeek" label={L('PROJECT_SETTING_START_DAY')}>
                <Select showSearch showArrow className="full-width" filterOption={false}>
                  {(dayOfWeek || []).map((item: any, index) => (
                    <Option key={index} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    )
  }
}

export default ProjectSetting
