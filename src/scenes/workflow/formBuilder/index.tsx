import { Col, DatePicker, Form, Input, InputNumber, Row, Select } from 'antd'
import { L } from '../../../lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import WorkflowStore from '../../../stores/workflow/workflowStore'
import AppComponentBase from '../../../components/AppComponentBase'
import { dateTimeFormat, dateFormat, modulePrefix, wfFieldTypes, workflowEvent } from '../../../lib/appconst'
import staffService from '../../../services/member/staff/staffService'
import wfStatusService from '../../../services/workflow/wfStatusService'
import { toJS } from 'mobx'
import { filterOptions } from '../../../lib/helper'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

export interface IWfFormBuilderProps {
  workflowStore: WorkflowStore
  moduleId: number
  projectId?: any
  value?: any
  onChange?: (name, value) => void
  formRef?: any
}

@inject(Stores.WorkflowStore)
@observer
class WorkflowFormBuilder extends AppComponentBase<IWfFormBuilderProps> {
  state = {
    isDirty: false,
    assigners: [],
    watchers: [],
    wfStatus: [],
    modulePrefix: modulePrefix[this.props.moduleId]
  }

  async componentDidMount() {
    await Promise.all([
      this.props.workflowStore.getListWfStatus(this.props.value?.id, this.props.moduleId),
      this.props.workflowStore.getListWfPriority(this.props.moduleId),
      this.props.workflowStore.getListWfRole(this.props.moduleId),
      this.props.workflowStore.getListWfTracker(this.props.moduleId),
      this.getDetail(),
      this.findWatchers('')
    ])
    this.initDefault(this.props.workflowStore.wfStatus)
    if (this.props.onChange) {
      this.props.onChange(workflowEvent.init, null)
    }
  }

  async componentDidUpdate(prevProps) {
    if (
      (this.props.value && prevProps.value?.assignedUsers !== this.props.value?.assignedUsers) ||
      prevProps.value?.watcherUsers !== this.props.value?.watcherUsers
    ) {
      const {
        workflowStore: { wfStatus }
      } = this.props
      await this.initDefault(wfStatus)
    }
  }

  initDefault = async (initStatus?) => {
    const { value } = this.props
    if (!this.props.value?.id) {
      this.findEmployees('')
    }

    const wfStatus = value?.id ? await wfStatusService.getNextStatus({ id: value.id }) : initStatus
    let newState = { ...this.state, wfStatus } as any
    if (value?.assignedUsers && value?.assignedUsers.length) {
      newState = { ...newState, assigners: value.assignedUsers || [] }
    }
    if (value?.watcherUsers && value?.watcherUsers.length) {
      newState = { ...newState, watchers: value.watcherUsers || [] }
    }

    this.setState({ ...newState })
  }

  getDetail = async () => {
    const { value } = this.props
    if (value && value.id) {
      await this.props.workflowStore.setWfProperties(value.properties)
      await this.props.workflowStore.setWfCustomFields(value.customFields)
    }
  }

  findEmployees = async (keyword) => {
    const assigners = await staffService.filterWfAssigner({
      keyword,
      projectId: this.props.projectId,
      moduleId: this.props.moduleId
    })
    this.setState({ assigners })
  }

  findWatchers = async (keyword) => {
    const watchers = await staffService.filterWfWatcher({
      keyword,
      projectId: this.props.projectId,
      moduleId: this.props.moduleId
    })
    this.setState({ watchers })
  }

  render() {
    const { wfProperties, wfCustomFields, wfPriorities, wfRoles, wfTrackers } = this.props.workflowStore
    const { value } = this.props
    const { assigners, watchers, modulePrefix, wfStatus } = this.state
    return (
      <Row gutter={[16, 0]}>
        {wfProperties.Subject?.isVisible && (
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item
              name={['workflow', 'subject']}
              label={L(modulePrefix + 'Subject')}
              rules={[{ required: wfProperties.Subject.isRequired, max: 250 }]}>
              <Input disabled={wfProperties.Subject.isReadOnly} />
            </Form.Item>
          </Col>
        )}
        {wfProperties.StatusId?.isVisible && (
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item
              name={['workflow', 'statusId']}
              label={L(modulePrefix + 'StatusId')}
              rules={[{ required: wfProperties.StatusId.isRequired }]}>
              <Select showSearch disabled={wfProperties.StatusId.isReadOnly} filterOption={filterOptions}>
                {this.renderOptions(wfStatus)}
              </Select>
            </Form.Item>
          </Col>
        )}
        {wfProperties.PriorityId?.isVisible && (
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item
              name={['workflow', 'priorityId']}
              label={L(modulePrefix + 'PriorityId')}
              rules={[{ required: wfProperties.PriorityId.isRequired }]}>
              <Select showSearch disabled={wfProperties.PriorityId.isReadOnly} filterOption={filterOptions}>
                {this.renderOptions(wfPriorities)}
              </Select>
            </Form.Item>
          </Col>
        )}
        {wfProperties.TrackerId?.isVisible && (
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item
              name={['workflow', 'trackerId']}
              label={L(modulePrefix + 'TrackerId')}
              rules={[{ required: wfProperties.TrackerId.isRequired }]}>
              <Select showSearch disabled={wfProperties.TrackerId.isReadOnly} filterOption={filterOptions}>
                {this.renderOptions(wfTrackers)}
              </Select>
            </Form.Item>
          </Col>
        )}
        {wfProperties.RoleId?.isVisible && (
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item
              name={['workflow', 'roleId']}
              label={L(modulePrefix + 'RoleId')}
              rules={[{ required: wfProperties.RoleId.isRequired }]}>
              <Select showSearch disabled={wfProperties.RoleId.isReadOnly} filterOption={filterOptions}>
                {this.renderOptions(wfRoles)}
              </Select>
            </Form.Item>
          </Col>
        )}
        {wfProperties.AssignedIds?.isVisible && (
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item
              name={['workflow', 'assignedIds']}
              label={L(modulePrefix + 'AssignedIds')}
              rules={[{ required: wfProperties.AssignedIds.isRequired }]}>
              <Select
                mode="multiple"
                showArrow
                showSearch
                className="full-width"
                onSearch={this.findEmployees}
                filterOption={false}
                disabled={wfProperties.AssignedIds.isReadOnly}>
                {(assigners || []).map((item: any, index) => (
                  <Option key={index} value={item.id}>
                    {item.displayName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        )}
        {wfProperties.WatcherIds?.isVisible && (
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item
              name={['workflow', 'watcherIds']}
              label={L(modulePrefix + 'WatcherIds')}
              rules={[{ required: wfProperties.WatcherIds.isRequired }]}>
              <Select
                mode="multiple"
                showSearch
                showArrow
                className="full-width"
                onSearch={this.findWatchers}
                filterOption={false}
                disabled={wfProperties.WatcherIds.isReadOnly}>
                {(watchers || []).map((item: any, index) => (
                  <Option key={index} value={item.id}>
                    {item.displayName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        )}
        {wfProperties.StartDate?.isVisible && (
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item
              name={['workflow', 'startDate']}
              label={L(modulePrefix + 'StartDate')}
              rules={[{ required: wfProperties.StartDate.isRequired }]}>
              <DatePicker
                className="full-width"
                format={dateTimeFormat}
                placeholder={L('SELECT_DATE')}
                disabled={wfProperties.StartDate.isReadOnly}
                showTime
              />
            </Form.Item>
          </Col>
        )}
        {wfProperties.DueDate?.isVisible && (
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item
              name={['workflow', 'dueDate']}
              label={L(modulePrefix + 'DueDate')}
              rules={[{ required: wfProperties.DueDate.isRequired }]}>
              <DatePicker
                disabledDate={(current) => (value.startDate ? current < value.startDate : current < dayjs())}
                className="full-width"
                format={dateTimeFormat}
                placeholder={L('SELECT_DATE')}
                disabled={wfProperties.DueDate.isReadOnly}
                showTime
              />
            </Form.Item>
          </Col>
        )}
        {wfProperties.ClosedDate?.isVisible && (
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item
              name={['workflow', 'closedDate']}
              label={L(modulePrefix + 'ClosedDate')}
              rules={[{ required: wfProperties.ClosedDate.isRequired }]}>
              <DatePicker
                disabledDate={(current) => (value.startDate ? current < value.startDate : current < dayjs())}
                className="full-width"
                format={dateTimeFormat}
                placeholder={L('SELECT_DATE')}
                disabled={wfProperties.ClosedDate.isReadOnly}
                showTime
              />
            </Form.Item>
          </Col>
        )}
        {wfProperties.EstimatedHours?.isVisible && (
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item
              name={['workflow', 'estimatedHours']}
              label={L(modulePrefix + 'EstimatedHours')}
              rules={[{ required: wfProperties.EstimatedHours.isRequired }]}>
              <InputNumber className="full-width" disabled={wfProperties.EstimatedHours.isReadOnly} />
            </Form.Item>
          </Col>
        )}
        {wfProperties.DoneRatio?.isVisible && (
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item
              name={['workflow', 'doneRatio']}
              label={L(modulePrefix + 'DoneRatio')}
              rules={[{ required: wfProperties.DoneRatio.isRequired }]}>
              <InputNumber className="full-width" disabled={wfProperties.DoneRatio.isReadOnly} />
            </Form.Item>
          </Col>
        )}
        {wfProperties.WatcherId?.isVisible && (
          <Col sm={{ span: 8, offset: 0 }}>
            <Form.Item
              name={['workflow', 'watcherId']}
              label={L(modulePrefix + 'WatcherId')}
              rules={[{ required: wfProperties.WatcherId.isRequired }]}>
              <Select disabled={wfProperties.WatcherId.isReadOnly} />
            </Form.Item>
          </Col>
        )}
        {wfProperties.Description?.isVisible && (
          <Col sm={{ span: 24, offset: 0 }}>
            <Form.Item
              name={['workflow', 'description']}
              label={L(modulePrefix + 'Description')}
              rules={[{ required: wfProperties.Description.isRequired }]}>
              <TextArea autoSize={{ minRows: 3, maxRows: 5 }} disabled={wfProperties.Description.isReadOnly} />
            </Form.Item>
          </Col>
        )}

        <Form.List name={['workflow', 'customFields']}>
          {(fields) => {
            const { customFields } = value || {}
            if (!customFields) {
              return ''
            }

            return (
              <>
                {(fields || []).map((field: any) => {
                  const customField = toJS(customFields[field.key])
                  if (!wfCustomFields[customField.id]) {
                    return ''
                  }
                  return (
                    <Col sm={{ span: 8, offset: 0 }} key={field.key}>
                      <Form.Item name={[field.name, 'id']} className="d-none">
                        <Input hidden={true} />
                      </Form.Item>
                      {customField.fieldType === wfFieldTypes.text && (
                        <Form.Item
                          name={[field.name, 'value']}
                          label={customField.name}
                          rules={[{ required: customField?.isRequired }]}>
                          <Input disabled={wfCustomFields[customField.id].isReadOnly} />
                        </Form.Item>
                      )}
                      {customField.fieldType === wfFieldTypes.number && (
                        <Form.Item
                          name={[field.name, 'value']}
                          label={customField.name}
                          rules={[{ required: customField?.isRequired }]}>
                          <InputNumber disabled={wfCustomFields[customField.id].isReadOnly} className="full-width" />
                        </Form.Item>
                      )}
                      {customField.fieldType === wfFieldTypes.money && (
                        <Form.Item
                          name={[field.name, 'value']}
                          label={customField.name}
                          rules={[{ required: customField?.isRequired }]}>
                          <InputNumber disabled={wfCustomFields[customField.id].isReadOnly} className="full-width" />
                        </Form.Item>
                      )}
                      {customField.fieldType === wfFieldTypes.dateTime && (
                        <Form.Item
                          name={[field.name, 'value']}
                          label={customField.name}
                          rules={[{ required: customField?.isRequired }]}>
                          <DatePicker
                            className="full-width"
                            format={dateFormat}
                            disabled={wfProperties.DueDate.isReadOnly}
                            placeholder={L('SELECT_DATE')}
                          />
                        </Form.Item>
                      )}
                      {customField.fieldType === wfFieldTypes.list && (
                        <Form.Item
                          name={[field.name, 'value']}
                          label={customField.name}
                          rules={[{ required: customField?.isRequired }]}>
                          <Select
                            showSearch
                            disabled={wfCustomFields[customField.id].isReadOnly}
                            filterOption={filterOptions}>
                            {this.renderOptions(wfCustomFields[customField.id].possibleValues)}
                          </Select>
                        </Form.Item>
                      )}
                    </Col>
                  )
                })}
              </>
            )
          }}
        </Form.List>
      </Row>
    )
  }
}

export default WorkflowFormBuilder
