import * as React from 'react'

import { Col, Form, Input, Row, Select, Switch, DatePicker, Card, Button, Modal, Popover } from 'antd'
import { LockOutlined, MailOutlined, CopyOutlined, RetweetOutlined } from '@ant-design/icons'
import { isGrantedAny, L, LNotification } from '../../../../lib/abpUtility'
import rules from './validation'
import AppConsts, { dateFormat, appPermissions } from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import { validateMessages } from '../../../../lib/validation'
import AppComponentBase from '@components/AppComponentBase'
import withRouter from '@components/Layout/Router/withRouter'
import FormTextArea from '@components/FormItem/FormTextArea'
import NoRole from '@components/ComponentNoRole'
import DevelopStore from '@stores/member/develop/developStore'
const { formVerticalLayout, genders } = AppConsts
const confirm = Modal.confirm

const genPassIcon = <img src="/assets/icons/genPass.svg" height="22px" />

export interface IResidentFormProps {
  navigate: any
  params: any
  developStore: DevelopStore
}

@inject(Stores.DevelopStore)
@observer
class DevelopCreate extends AppComponentBase<IResidentFormProps> {
  state = {
    isDirty: false,
    displayNames: [],
    passwordGen: []
  }
  formRef: any = React.createRef()

  async componentDidMount() {
    this.setState({ userId: this.props.params?.id })
    this.isGranted(appPermissions.resident.detail) && (await Promise.all([this.getDetail(this.props.params?.id)]))
  }

  buildDisplayName = () => {
    let name = this.formRef.current.getFieldValue('name') || ''
    let surname = this.formRef.current.getFieldValue('surname') || ''
    if (name.length && surname.length) {
      name = name.trim()
      surname = surname.trim()
      this.setState({
        displayNames: [`${name} ${surname}`, `${surname} ${name}`]
      })
    }
  }

  getDetail = async (id?) => {
    if (!id) {
      await this.props.developStore.createDevelop()
    } else {
      await this.props.developStore.get(id)
    }
    this.formRef.current.setFieldsValue({
      ...this.props.developStore.editDevelop
    })
  }

  hideModal = async (modalName: string) => {
    this.setState({ ...this.state, [modalName]: false })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  onSave = () => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      this.setState({ loading: true })

      await this.props.developStore.create(values)

      this.setState({ loading: false })
      form.resetFields()
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
    const form = this.formRef.current
    form.resetFields()

    this.props.navigate(-1)
  }

  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }} flex="0"></Col>
        <Col sm={{ span: 24, offset: 0 }} flex="1">
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {isGrantedAny(appPermissions.resident.create, appPermissions.resident.update) && (
            <Button type="primary" onClick={this.onSave} loading={isLoading} shape="round">
              {L('BTN_SAVE')}
            </Button>
          )}
        </Col>
      </Row>
    )
  }

  genRandomPassword = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const passwordLength = 6
    let password = ''
    for (let i = 0; i <= passwordLength; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length)
      password += chars.substring(randomNumber, randomNumber + 1)
    }
    this.setState({ passwordGen: password + 'bA2%' })
  }

  render() {
    const { displayNames } = this.state

    const disabledDate = (current) => {
      return current > new Date() ? true : false
    }
    return this.isGranted(appPermissions.resident.detail) ? (
      <WrapPageScroll renderActions={() => this.renderActions(this.props.developStore.isLoading)}>
        <Card bordered={false} id="resident-detail" style={{ minHeight: 750 }}>
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
                <Form.Item label={L('RESIDENT_USER_NAME')} {...formVerticalLayout} name="userName">
                  <Input />
                </Form.Item>
              </Col>

              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item
                  label={L('RESIDENT_EMAIL')}
                  {...formVerticalLayout}
                  name="emailAddress"
                  rules={rules.emailAddress}>
                  <Input prefix={<MailOutlined />} />
                </Form.Item>
              </Col>

              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item
                  label={L('STAFF_PHONE')}
                  {...formVerticalLayout}
                  name="phoneNumber"
                  rules={rules.phoneNumber}>
                  <Input />
                </Form.Item>
              </Col>

              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item label={L('RESIDENT_NAME')} {...formVerticalLayout} name="name" rules={rules.name}>
                  <Input onChange={this.buildDisplayName} />
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item label={L('RESIDENT_SURNAME')} {...formVerticalLayout} name="surname" rules={rules.surname}>
                  <Input onChange={this.buildDisplayName} />
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item
                  label={L('RESIDENT_DISPLAY_NAME')}
                  {...formVerticalLayout}
                  name="displayName"
                  rules={rules.displayName}>
                  <Select style={{ width: '100%' }}>
                    {displayNames.map((item: any, index) => (
                      <Select.Option key={index} value={item}>
                        {item}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item
                  label={L('RESIDENT_PASSPORT')}
                  {...formVerticalLayout}
                  name="passport"
                  rules={rules.passport}>
                  <Input />
                </Form.Item>
              </Col>

              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item label={L('RESIDENT_DOB')} {...formVerticalLayout} name="birthDate">
                  <DatePicker
                    disabledDate={disabledDate}
                    className="full-width"
                    format={dateFormat}
                    placeholder={L('SELECT_DATE')}
                  />
                </Form.Item>
              </Col>

              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item label={L('RESIDENT_GENDER')} {...formVerticalLayout} name="gender">
                  <Select style={{ width: '100%' }}>
                    {genders.map((gender: any, index) => (
                      <Select.Option key={index} value={gender.value}>
                        {L(gender.name)}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item
                  label={L('RESIDENT_PASSWORD')}
                  {...formVerticalLayout}
                  name="password"
                  rules={rules.password}>
                  <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} />
                </Form.Item>
              </Col>

              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item label={' '} {...formVerticalLayout}>
                  <Popover
                    trigger="hover"
                    content={
                      <Row style={{ maxWidth: 160 }}>
                        <Col sm={{ span: 22, offset: 0 }}> {L('INFO_ICON_PASSWORD')}:</Col>
                        <Col sm={{ span: 2, offset: 0 }}>
                          <Popover trigger="hover" content={L('PASSWORD_RANDOM')}>
                            <RetweetOutlined
                              style={{
                                fontSize: '16px',
                                color: '#08c'
                              }}
                              onClick={() => this.genRandomPassword()}
                            />
                          </Popover>
                        </Col>
                        <Col span={22}>{this.state.passwordGen}</Col>
                        <Col span={2}>
                          <Popover trigger="hover" content={L('PASSWORD_COPY')}>
                            <CopyOutlined
                              style={{
                                fontSize: '16px',
                                color: '#08c'
                              }}
                              onClick={() => navigator.clipboard.writeText(this.state.passwordGen + '')}
                            />
                          </Popover>
                        </Col>
                      </Row>
                    }>
                    <Button
                      style={{ display: 'flex', alignItems: 'center' }}
                      type="primary"
                      onClick={() => this.genRandomPassword()}
                      loading={this.props.developStore.isLoading}>
                      {genPassIcon}
                    </Button>
                  </Popover>
                </Form.Item>
              </Col>
            </Row>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('RESIDENT_ACTIVE_STATUS')}
                {...formVerticalLayout}
                name="isActive"
                valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <FormTextArea label={L('DESCRIPTION')} name="description" />
            </Col>
          </Form>
        </Card>
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(DevelopCreate)
