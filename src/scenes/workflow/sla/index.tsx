import { L } from '@lib/abpUtility'
import {
  Col,
  Row,
  Select,
  Form,
  Collapse,
  InputNumber,
  Switch,
  Button,
  TimePicker,
  Checkbox,
  Tabs,
  Modal,
  notification,
  Input
} from 'antd'
import { useEffect, useState } from 'react'
import { CaretRightOutlined, DeleteOutlined } from '@ant-design/icons'
import AppConsts, { getEscalationModuleByModuleId, moduleIds } from '@lib/appconst'
import { debounce } from 'lodash'
import staffService from '@services/member/staff/staffService'
import Title from 'antd/lib/typography/Title'
import WrapPageScroll from '@components/WrapPageScroll'
import moment from 'moment'
import wfStatusService from '@services/workflow/wfStatusService'
import TagsInput from '@components/Inputs/TagsInput'
import wfPriorityService from '@services/workflow/wfPriorityService'
import SLAReportFirstResponse from './slaReportFirstResponse'
import SLAReportOnViolate from './slaReportOnViolate'
const { Option } = Select
const { Panel } = Collapse
const { formVerticalLayout, dataType } = AppConsts
const format = 'HH:mm:ss'
const { TabPane } = Tabs

interface Props {
  moduleId?: number
}

const tabKeys = {
  tabJobRequest: 'TAB_JOB_REQUEST',
  tabPM: 'TAB_PM',
  tabInspection: 'TAB_INSPECTION',
  tabFeedback: 'TAB_FEEDBACK'
}

const SettingWorkflowSLA = (props: Props) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [escalationModuleId, setEscalationModuleId] = useState(getEscalationModuleByModuleId(props.moduleId))
  const [assignedUsers, setAssignedUsers] = useState<Array<any>>([])
  const [offAllSwitch, setOffAllSwitch] = useState(false)
  const [escalationList, setEscalationList] = useState<Array<any>>([])
  const [priorityStatus, setPriorityStatus] = useState<any>()

  const getPriority = async () => {
    const result = await wfPriorityService.filterWithoutType({
      maxResultCount: 5,
      skipCount: 0,
      moduleId: props.moduleId,
      isActive: true
    })
    setPriorityStatus(result.items)
    return result.items
  }
  useEffect(() => {
    const userList: Array<any> = []
    getPriority().then((priorityData) => {
      form.resetFields()
      wfStatusService.getSettingEscalation(escalationModuleId).then(async (values) => {
        if (values.escalationBusinessTime?.escalationBusinessBreakHours[0]) {
          form.setFieldsValue({
            startBreakHours: moment(
              '01/01/2021 ' + (values.escalationBusinessTime.escalationBusinessBreakHours[0].startTime || '00:00')
            ),
            endBreakHours: moment(
              '01/01/2021 ' + (values.escalationBusinessTime.escalationBusinessBreakHours[0].endTime || '00:00')
            )
          })
        }
        if (values.escalationBusinessTime?.daysOfWeek)
          form.setFieldsValue({
            Sunday: values.escalationBusinessTime.daysOfWeek.includes('0'),
            Monday: values.escalationBusinessTime.daysOfWeek.includes('1'),
            Tuesday: values.escalationBusinessTime.daysOfWeek.includes('2'),
            Wednesday: values.escalationBusinessTime.daysOfWeek.includes('3'),
            Thursday: values.escalationBusinessTime.daysOfWeek.includes('4'),
            Friday: values.escalationBusinessTime.daysOfWeek.includes('5'),
            Saturday: values.escalationBusinessTime.daysOfWeek.includes('6')
          })
        form.setFieldsValue({
          startTime: moment('01/01/2021 ' + (values.escalationBusinessTime?.startTime || '00:00')),
          endTime: moment('01/01/2021 ' + (values.escalationBusinessTime?.endTime || '00:00'))
        })
        // offAll = true
        await values.escalationSettings.map((escalate) => {
          if (escalate.isEscalation === true) offAll = false
          const priority = (priorityData || []).find((item) => item.id === escalate.priorityId)
          let RUnit = '1'
          let FUnit = '1'
          if (escalate.resolveWithin % 1440 === 0) {
            RUnit = '1440'
          } else if (escalate.resolveWithin % 60 === 0) {
            RUnit = '60'
          }
          if (escalate.firstResponseWithin % 1440 === 0) {
            FUnit = '1440'
          } else if (escalate.firstResponseWithin % 60 === 0) {
            FUnit = '60'
          }
          form.setFieldsValue({
            [`${priority.name}Resolve`]: escalate.resolveWithin / parseInt(RUnit),
            [`${priority.name}ResolveUnit`]: RUnit,
            [`${priority.name}FirstResponse`]: escalate.firstResponseWithin / parseInt(FUnit),
            [`${priority.name}FirstResponseUnit`]: FUnit,
            [`switch${priority.name}`]: escalate.isEscalation
          })
        })
        form.setFieldsValue({
          startTime: moment('01/01/2021 ' + (values.escalationBusinessTime?.startTime || '00:00')),
          endTime: moment('01/01/2021 ' + (values.escalationBusinessTime?.endTime || '00:00'))
        })
        let offAll = true
        await values.escalationSettings.map((escalate: any) => {
          if (escalate.isEscalation === true) offAll = false
          const priority = (priorityData || []).find((item) => item.id === escalate.priorityId)
          let RUnit = '1'
          let FUnit = '1'
          if (escalate.resolveWithin % 1440 === 0) {
            RUnit = '1440'
          } else if (escalate.resolveWithin % 60 === 0) {
            RUnit = '60'
          }
          if (escalate.firstResponseWithin % 1440 === 0) {
            FUnit = '1440'
          } else if (escalate.firstResponseWithin % 60 === 0) {
            FUnit = '60'
          }
          return form.setFieldsValue({
            [`${priority.name}Resolve`]: escalate.resolveWithin / parseInt(RUnit),
            [`${priority.name}ResolveUnit`]: RUnit,
            [`${priority.name}FirstResponse`]: escalate.firstResponseWithin / parseInt(FUnit),
            [`${priority.name}FirstResponseUnit`]: FUnit,
            [`switch${priority.name}`]: escalate.isEscalation
          })
        })
        setOffAllSwitch(offAll)
        if (values.escalationFirstResponse[0]) {
          const firstUserId = values.escalationFirstResponse[0].users.map((user) => {
            userList.push(user)
            return user.id
          })
          let onViolateTimeUnit = '1'
          if (values.escalationFirstResponse[0].onViolateTime % 1440 === 0) {
            onViolateTimeUnit = '1440'
          } else if (values.escalationFirstResponse[0].onViolateTime % 60 === 0) {
            onViolateTimeUnit = '60'
          }
          form.setFieldsValue({
            firstOnViolateTime: values.escalationFirstResponse[0].onViolateTime / parseInt(onViolateTimeUnit),
            firstEmail: values.escalationFirstResponse[0].emails,
            firstUserId,
            firstId: values.escalationFirstResponse[0].id,
            firstOnViolateTimeUnit: onViolateTimeUnit
          })
        }
        setEscalationList(values.escalationLevels)
        await values.escalationLevels.map((level, index) => {
          let OnViolateTimeUnit = '1'
          if (level.onViolateTime % 1440 === 0) {
            OnViolateTimeUnit = '1440'
          } else if (level.onViolateTime % 60 === 0) {
            OnViolateTimeUnit = '60'
          }
          const info = {
            [`level${index}UserId`]: level.users.map((user) => {
              userList.push(user)
              return user.id
            }),
            [`level${index}Email`]: level.emails,
            [`level${index}OnViolateTime`]: level.onViolateTime / parseInt(OnViolateTimeUnit),
            [`level${index}OnViolateTimeUnit`]: OnViolateTimeUnit,
            [`level${index}EscalationName`]: level.escalationName
          }
          return form.setFieldsValue(info)
        })
        setAssignedUsers(userList)
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escalationModuleId])

  const findUser = debounce(async (keyword) => {
    setLoading(true)
    const result = await staffService.getAll({
      keyword,
      isActive: true,
      MaxResultCount: 20
    })
    setAssignedUsers(result.items)
    setLoading(false)
  }, 500)

  const handleChangeSwitch = () => {
    const resultt = form.getFieldsValue()
    let offAll = true
    priorityStatus.map((priority) => {
      if (resultt[`switch${priority.name}`] === true) offAll = false
      return null
    })
    return setOffAllSwitch(offAll)
  }
  const renderActions = (loading?) => {
    return (
      <Row>
        <Col flex="1"></Col>
        <Col flex="none">
          <Button type="primary" shape="round" onClick={onSave} loading={loading}>
            {L('BTN_SAVE')}
          </Button>
        </Col>
      </Row>
    )
  }

  const onSave = async () => {
    setLoading(true)
    try {
      const values = await form.validateFields()

      const escalationSettings = priorityStatus.map((priority) => {
        return {
          priorityId: priority.id,
          firstResponseWithin:
            values[`${priority.name}FirstResponse`] * (values[`${priority.name}FirstResponseUnit`] || 1) || 0,
          resolveWithin: values[`${priority.name}Resolve`] * (values[`${priority.name}ResolveUnit`] || 1) || 0,
          isEscalation: values[`switch${priority.name}`] === false ? false : true
        }
      })
      const startTime = moment(values.startTime).format(format)
      const endTime = moment(values.endTime).format(format)
      const escalationBusinessBreakHours: Array<any> = []
      if (values.startBreakHours && values.endBreakHours) {
        escalationBusinessBreakHours.push({
          startTime: moment(values.startBreakHours).format(format),
          endTime: moment(values.endBreakHours).format(format)
        })
      }
      const daysOfWeek: Array<string> = []
      if (values.Sunday) daysOfWeek.push('0')
      if (values.Monday) daysOfWeek.push('1')
      if (values.Tuesday) daysOfWeek.push('2')
      if (values.Wednesday) daysOfWeek.push('3')
      if (values.Thursday) daysOfWeek.push('4')
      if (values.Friday) daysOfWeek.push('5')
      if (values.Saturday) daysOfWeek.push('6')

      const formBody: { [key: string]: any } = {
        escalationModule: escalationModuleId,
        escalationBusinessTime: {
          timeZone: 'test',
          daysOfWeek: daysOfWeek.join(),
          startTime,
          endTime,
          escalationBusinessBreakHours
        },
        escalationSettings
      }
      if (!offAllSwitch) {
        formBody.escalationFirstResponse = [
          {
            onViolateTime: values.firstOnViolateTime * (values.firstOnViolateTimeUnit || 1) || 0,
            userIds: values.firstUserId,
            emails: values.firstEmail,
            isActive: true,
            id: values.firstId
          }
        ]
        formBody.escalationLevels = []
        escalationList.map((e, i) => {
          return formBody.escalationLevels.push({
            onViolateTime: values[`level${i}OnViolateTime`] * (values[`level${i}OnViolateTimeUnit`] || 1) || 0,
            sortOrder: i + 1,
            userIds: values[`level${i}UserId`],
            emails: values[`level${i}Email`],
            isActive: e.isActive,
            escalationName: values[`level${i}EscalationName`],
            id: e.id
          })
        })
      }

      await wfStatusService
        .saveSettingEscalation(formBody)
        .then(() => notification.success({ message: L('SAVE_SUCCESSFUL') }))
    } catch (errorInfo) {
      Modal.warning({
        title: L('Please input data')
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <WrapPageScroll renderActions={() => renderActions(loading)}>
      {!props.moduleId && (
        <Tabs
          onChange={(tabKey) => {
            setEscalationModuleId(getEscalationModuleByModuleId(tabKey))
          }}>
          <TabPane tab={L(tabKeys.tabJobRequest)} key={moduleIds.workOrder}></TabPane>
          <TabPane tab={L(tabKeys.tabPM)} key={moduleIds.planMaintenance} disabled></TabPane>
          <TabPane tab={L(tabKeys.tabInspection)} key={moduleIds.inspection} disabled></TabPane>
          <TabPane tab={L(tabKeys.tabFeedback)} key={moduleIds.feedback}></TabPane>
        </Tabs>
      )}
      <Collapse bordered={false} defaultActiveKey={['Configuration']}>
        <Panel
          key="ReportFirstResponse"
          header={<label style={{ fontWeight: 'bold' }}>{L('REPORT_FIRST_RESPONESE')}</label>}>
          <SLAReportFirstResponse escalationModule={escalationModuleId} />
        </Panel>
        <Panel key="ReportOnViolate" header={<label style={{ fontWeight: 'bold' }}>{L('REPORT_ON_VIOLATING')}</label>}>
          <SLAReportOnViolate escalationModule={escalationModuleId} />
        </Panel>
        <Panel
          key="Configuration"
          header={<label style={{ fontWeight: 'bold' }}>{L('SLA_ESCALATION_CONFIGURATION')}</label>}>
          <Form form={form}>
            <div className="w-100 d-flex justify-content-start mt-3">
              <label style={{ fontWeight: 'bold' }}>{L('SLA_TIME_CONFIGUATION')}</label>
            </div>
            <Row className="mt-3" gutter={16}>
              <Col sm={{ span: 4, offset: 0 }} className="d-flex align-items-center pl-3">
                {L('WORKING_HOURS')}
              </Col>
              <Col sm={{ span: 4, offset: 0 }}>
                <label>{L('FROM')}</label>
                <Form.Item name="startTime">
                  <TimePicker format="HH:mm" className="w-100" />
                </Form.Item>
              </Col>
              <Col sm={{ span: 4, offset: 0 }}>
                <label>{L('TO')}</label>
                <Form.Item name="endTime">
                  <TimePicker format="HH:mm" className="w-100" />
                </Form.Item>
              </Col>
              <Col sm={{ span: 12, offset: 0 }} className="d-flex justify-content-center align-items-center">
                <Form.Item name="Monday" valuePropName="checked">
                  <Checkbox>{L('MON')}</Checkbox>
                </Form.Item>
                <Form.Item name="Tuesday" valuePropName="checked">
                  <Checkbox>{L('TUE')}</Checkbox>
                </Form.Item>
                <Form.Item name="Wednesday" valuePropName="checked">
                  <Checkbox>{L('WED')}</Checkbox>
                </Form.Item>
                <Form.Item name="Thursday" valuePropName="checked">
                  <Checkbox>{L('THU')}</Checkbox>
                </Form.Item>
                <Form.Item name="Friday" valuePropName="checked">
                  <Checkbox>{L('FRI')}</Checkbox>
                </Form.Item>
              </Col>
              <Col sm={{ span: 4, offset: 0 }} className="d-flex align-items-center pl-3">
                {L('BREAK_HOURS')}
              </Col>
              <Col sm={{ span: 4, offset: 0 }}>
                <label>{L('FROM')}</label>
                <Form.Item name="startBreakHours">
                  <TimePicker format="HH:mm" className="w-100" />
                </Form.Item>
              </Col>
              <Col sm={{ span: 4, offset: 0 }}>
                <label>{L('TO')}</label>
                <Form.Item name="endBreakHours">
                  <TimePicker format="HH:mm" className="w-100" />
                </Form.Item>
              </Col>
              <Col sm={{ span: 12, offset: 0 }} className="d-flex justify-content-center align-items-center">
                <Form.Item name="Saturday" valuePropName="checked">
                  <Checkbox>{L('SAT')}</Checkbox>
                </Form.Item>
                <Form.Item name="Sunday" valuePropName="checked">
                  <Checkbox>{L('SUN')}</Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <div className="w-100 d-flex justify-content-start">
              <Title level={4} className="ml-3">
                {L('SLA_TARGET_OF_REQUEST')}
              </Title>
            </div>
            <Row className="my-2" gutter={16}>
              <Col sm={{ span: 3, offset: 0 }} className="d-flex justify-content-center align-items-center">
                {L('Priority')}
              </Col>
              <Col sm={{ span: 4, offset: 0 }} className="d-flex justify-content-center align-items-center">
                {L('1st Response within')}
              </Col>
              <Col sm={{ span: 5, offset: 0 }}></Col>
              <Col sm={{ span: 4, offset: 0 }} className="d-flex justify-content-center align-items-center">
                {L('Complete within')}
              </Col>
              <Col sm={{ span: 5, offset: 0 }}></Col>
              <Col sm={{ span: 3, offset: 0 }} className="d-flex justify-content-center align-items-center">
                {L('Escalation')}
              </Col>
            </Row>
            {(priorityStatus || []).map((priority) => (
              <Row className="my-2" gutter={16} key={priority.id}>
                <Col sm={{ span: 3, offset: 0 }}>{L(priority.name)}</Col>
                <Col sm={{ span: 4, offset: 0 }}>
                  <Form.Item name={`${priority.name}FirstResponse`} rules={[{ type: 'integer' }]}>
                    <InputNumber className="w-100 mx-1" min={0} />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 5, offset: 0 }}>
                  <Form.Item name={`${priority.name}FirstResponseUnit`} initialValue="1">
                    <Select className="w-100 mx-1" placeholder={L('SELECT_DURATION_UNIT')}>
                      <Option value="1">{L('MINUTE(S)')}</Option>
                      <Option value="60">{L('HOUR(S)')}</Option>
                      <Option value="1440">{L('DAY(S)')}</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col sm={{ span: 4, offset: 0 }}>
                  <Form.Item name={`${priority.name}Resolve`} rules={[{ type: 'integer' }]}>
                    <InputNumber className="w-100 mx-1" min={0} />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 5, offset: 0 }}>
                  <Form.Item name={`${priority.name}ResolveUnit`} initialValue="1">
                    <Select className="w-100 mx-1" placeholder={L('SELECT_DURATION_UNIT')}>
                      <Option value="1">{L('MINUTE(S)')}</Option>
                      <Option value="60">{L('HOUR(S)')}</Option>
                      <Option value="1440">{L('DAY(S)')}</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col sm={{ span: 3, offset: 0 }} className="d-flex justify-content-center align-items-center">
                  <Form.Item name={`switch${priority.name}`} valuePropName="checked">
                    <Switch onChange={() => handleChangeSwitch()} />
                  </Form.Item>
                </Col>
              </Row>
            ))}
            <Collapse
              bordered={false}
              defaultActiveKey={['1']}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              className="site-collapse-custom-collapse"
              activeKey={offAllSwitch ? ['1'] : ['1', '2', '3']}
              collapsible={offAllSwitch ? 'disabled' : undefined}>
              <Panel
                header={<Title level={4}>{L('SLA_ALERT_ABOUT_VIOLATING')}</Title>}
                key="2"
                className="site-collapse-custom-panel"
                // disabled={offAllSwitch}
                showArrow={false}>
                <Row className="my-2" gutter={16}>
                  <Form.Item name="firstId">
                    <Input hidden style={{ display: 'none' }} />
                  </Form.Item>
                  <Col sm={{ span: 6, offset: 0 }}>
                    <label>{L('USER')}</label>
                    <Form.Item {...formVerticalLayout} name="firstUserId">
                      <Select
                        mode="multiple"
                        showSearch
                        allowClear
                        showArrow
                        placeholder={L('SEARCH_NAME')}
                        filterOption={false}
                        className="w-100 mx-1"
                        onSearch={(text) => findUser(text)}
                        loading={loading}>
                        {assignedUsers.map((item, index) => (
                          <Option key={index} value={item.id}>
                            {item.displayName}
                            <div className="text-muted small">{item.emailAddress}</div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }}>
                    <label>{L('EMAIL_ADDRESS')}</label>
                    <Form.Item name="firstEmail">
                      <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }}>
                    <label>{L('IF_NOT_RES_AFTER')}</label>
                    <Form.Item name="firstOnViolateTime" rules={[{ type: 'integer' }]}>
                      <InputNumber className="w-100 mx-1" min={0} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }}>
                    <label>{L('TIME_UNIT')}</label>
                    <Form.Item name="firstOnViolateTimeUnit" initialValue="1">
                      <Select className="w-100 mx-1" placeholder={L('SELECT_DURATION_UNIT')}>
                        <Option value={'1'}>{L('MINUTE(S)')}</Option>
                        <Option value="60">{L('HOUR(S)')}</Option>
                        <Option value="1440">{L('DAY(S)')}</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>
              <Panel
                header={<Title level={4}>{L('SLA_ESCALATION_NOTIFICATION')}</Title>}
                key="3"
                className="site-collapse-custom-panel"
                // disabled={offAllSwitch}
                showArrow={false}>
                <Row className="my-2" gutter={16}>
                  <Col sm={{ span: 2, offset: 0 }}>
                    <label>{L('LEVEL')}</label>
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }}>
                    <label>{L('USER')}</label>
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }}>
                    <label>{L('EMAIL_ADDRESS')}</label>
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }}>
                    <label>{L('IF_NOT_RES_AFTER')}</label>
                  </Col>
                  <Col sm={{ span: 3, offset: 0 }}>
                    <label>{L('TIME_UNIT')}</label>
                  </Col>
                </Row>

                {(escalationList || []).map((es, index) => {
                  if (es.isActive === false) return null
                  return (
                    <Row className="my-2" gutter={16} key={index}>
                      <Col sm={{ span: 2, offset: 0 }}>
                        <Form.Item name={`level${index}EscalationName`}>
                          <Input maxLength={3} />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 6, offset: 0 }}>
                        <Form.Item {...formVerticalLayout} name={`level${index}UserId`}>
                          <Select
                            mode="multiple"
                            showSearch
                            allowClear
                            showArrow
                            placeholder={L('SEARCH_NAME')}
                            filterOption={false}
                            className="w-100 mx-1"
                            onSearch={(text) => findUser(text)}
                            loading={loading}>
                            {assignedUsers.map((item, index) => (
                              <Option key={index} value={item.id}>
                                {item.displayName}
                                <div className="text-muted small">{item.emailAddress}</div>
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 6, offset: 0 }}>
                        <Form.Item name={`level${index}Email`}>
                          <TagsInput placeholder={L('EMAIL')} type={dataType.email} />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 6, offset: 0 }}>
                        <Form.Item name={`level${index}OnViolateTime`} rules={[{ type: 'integer' }]}>
                          <InputNumber className="w-100 mx-1" min={0} />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 3, offset: 0 }}>
                        <Form.Item name={`level${index}OnViolateTimeUnit`} initialValue="1">
                          <Select className="w-100 mx-1" placeholder={L('SELECT_DURATION_UNIT')}>
                            <Option value="1">{L('MINUTE(S)')}</Option>
                            <Option value="60">{L('HOUR(S)')}</Option>
                            <Option value="1440">{L('DAY(S)')}</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 1, offset: 0 }}>
                        <Button
                          disabled={index === 0 || index === 1 ? true : false}
                          type="link"
                          danger
                          onClick={() => {
                            const newEscalationList = [...escalationList]
                            newEscalationList[index].isActive = false
                            setEscalationList(newEscalationList)
                          }}>
                          <DeleteOutlined />
                        </Button>
                      </Col>
                    </Row>
                  )
                })}
                <Button
                  type="primary"
                  onClick={() => {
                    const newEscalationList = [...escalationList]
                    newEscalationList.push({})
                    setEscalationList(newEscalationList)
                  }}>
                  {L('ADD_MORE_ESCALATION')}
                </Button>
              </Panel>
            </Collapse>
          </Form>
          <div style={{ height: '60px' }}></div>
        </Panel>
      </Collapse>
    </WrapPageScroll>
  )
}

export default SettingWorkflowSLA
