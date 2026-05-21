import React from 'react'

import { Col, Form, Row, Card, Tabs, Input, Switch, Button, Modal } from 'antd'
import { validateMessages } from '@lib/validation'
import AppConsts, { appPermissions } from '../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import NotificationTemplateStore from '../../../stores/notificationTemplate/notificationTemplateStore'
import AppComponentBase from '../../../components/AppComponentBase'
import CKEditorInput from '@components/Inputs/CKEditorInput'
import { isGrantedAny, L, LNotification } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import withRouter from '@components/Layout/Router/withRouter'
import FormSelect from '@components/FormItem/FormSelect'
import rules from './validation'
import TextArea from 'antd/es/input/TextArea'
import FormInput from '@components/FormItem/FormInput'
import NoRole from '@components/ComponentNoRole'
import { debounce } from 'lodash'
import { filterOptions } from '@lib/helper'

const { formVerticalLayout, lableTemplate } = AppConsts
const { TabPane } = Tabs
const confirm = Modal.confirm
const notifycationTextboxMethodIds = [1, 3]
export interface IWorkOrderFormProps {
  params: any
  navigate: any
  notificationTemplateStore: NotificationTemplateStore
}

@inject(Stores.NotificationTemplateStore, Stores.ProjectStore)
@observer
class TemplateDetail extends AppComponentBase<IWorkOrderFormProps> {
  formRef: any = React.createRef()
  get languages() {
    return abp.localization.languages.filter((val: any) => {
      return !val.isDisabled
    })
  }
  state = {
    isDirty: false,
    parameters: [] as any,
    lableSwich: lableTemplate.master
  }

  async componentDidMount() {
    this.isGranted(appPermissions.notificationTemplate.detail) &&
      (await Promise.all([
        this.init(this.props.params?.id),
        this.props.notificationTemplateStore.getNotificationTypes({})
      ]))
  }

  async init(id?) {
    if (!id) {
      await this.props.notificationTemplateStore.createNotificationTemplate()
    } else {
      await this.props.notificationTemplateStore.get(id)
      this.setState({
        parameters: this.props.notificationTemplateStore.editTemplate?.parameters || []
      })
    }

    if (this.props.notificationTemplateStore.editTemplate?.projectId) {
      this.setState({ lableSwich: lableTemplate.currentProject })
    }

    this.formRef.current.setFieldsValue({
      ...this.props.notificationTemplateStore.editTemplate,
      isCurrentProject: this.props.notificationTemplateStore.editTemplate?.projectId ? true : false
    })
  }

  findNotificationTypes = debounce(async (keyword?) => {
    await this.props.notificationTemplateStore.getNotificationTypes({ keyword: keyword })
  }, 300)

  onSave = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      delete values.notificationMethod

      if (this.props.notificationTemplateStore.editTemplate?.id) {
        await this.props.notificationTemplateStore.update({
          ...this.props.notificationTemplateStore.editTemplate,
          ...values
        })
      } else {
        await this.props.notificationTemplateStore.create(values)
      }

      this.props.navigate(-1)
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

  getTemplate = async (checked) => {
    if (checked === false) {
      this.setState({ lableSwich: lableTemplate.master })
      const form = this.formRef.current
      form.validateFields().then(async (values: any) => {
        await this.props.notificationTemplateStore.getProjectTemplate({
          notificationTypeId: values.notificationTypeId,
          notificationMethod: values.notificationMethod,
          isCurrentProject: values.isCurrentProject
        })
        this.setState({
          parameters: this.props.notificationTemplateStore.editTemplate?.parameters || []
        })
      })
      this.formRef.current.setFieldsValue({
        ...this.props.notificationTemplateStore.editTemplate
      })
    } else {
      this.setState({ lableSwich: lableTemplate.currentProject })
    }
  }

  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {isGrantedAny(appPermissions.notificationTemplate.create, appPermissions.notificationTemplate.update) && (
            <Button
              type="primary"
              disabled={this.props.params?.id && !this.isGranted(appPermissions.notificationTemplate.update)}
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

  public render() {
    const { isLoading, notificationTypes } = this.props.notificationTemplateStore
    const methodId = this.props.notificationTemplateStore?.editTemplate?.notificationMethod ?? 0
    return this.isGranted(appPermissions.notificationTemplate.detail) ? (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Card bordered={false}>
          <Form ref={this.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
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
                              {notifycationTextboxMethodIds.includes(methodId) ? <TextArea /> : <CKEditorInput />}
                            </Form.Item>
                          </Col>
                        </Row>
                      </TabPane>
                    )
                  })}
                </Tabs>
              </Col>

              <Col sm={{ span: 12, offset: 0 }} style={{ display: 'none' }}>
                <FormInput name="notificationMethod" disabled={true} />
              </Col>
              <Col sm={{ span: 12, offset: 0 }}>
                <FormSelect
                  name="notificationTypeId"
                  label={L('TEMPLATE_NOTIFICATION_TYPE')}
                  rule={rules.notificationTypeId}
                  options={notificationTypes}
                  disabled={this.props.notificationTemplateStore.editTemplate?.id ? true : false}
                  selectProps={{
                    filterOption: filterOptions
                  }}
                />
              </Col>
              <Col sm={{ span: 3, offset: 0 }}>
                <Form.Item
                  label={L('FEE_TEMPLATE_ACTIVE_STATUS')}
                  {...formVerticalLayout}
                  name="isActive"
                  valuePropName="checked">
                  <Switch defaultChecked />
                </Form.Item>
              </Col>
              <Col sm={{ span: 3, offset: 0 }}>
                <Form.Item
                  label={L(this.state.lableSwich)}
                  {...formVerticalLayout}
                  name="isCurrentProject"
                  valuePropName="checked">
                  <Switch onChange={(checked: boolean) => this.getTemplate(checked)} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(TemplateDetail)
