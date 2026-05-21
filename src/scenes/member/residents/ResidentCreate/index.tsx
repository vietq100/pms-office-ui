import * as React from 'react'

import { Col, Form, Input, Row, Select, Switch, DatePicker, Card, Button, Modal, Popover } from 'antd'
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
  SearchOutlined,
  CopyOutlined,
  RetweetOutlined
} from '@ant-design/icons'
import { isGrantedAny, L, LNotification } from '../../../../lib/abpUtility'
import rules from './validation'
import AppConsts, { dateFormat, appPermissions, defaultAvatar } from '../../../../lib/appconst'
import ResidentStore from '../../../../stores/member/resident/residentStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import UserStore from '../../../../stores/administrator/userStore'
import { validateMessages } from '../../../../lib/validation'
import AppComponentBase from '@components/AppComponentBase'
import ProjectStore from '@stores/project/projectStore'
import withRouter from '@components/Layout/Router/withRouter'
import FormTextArea from '@components/FormItem/FormTextArea'
import NoRole from '@components/ComponentNoRole'
import { filterOptions } from '@lib/helper'
import residentService from '@services/member/resident/residentService'
import CompanyStore from '@stores/project/companyStore'
import { debounce } from 'lodash'
const { formVerticalLayout, genders } = AppConsts
const confirm = Modal.confirm

const genPassIcon = <img src="/assets/icons/genPass.svg" height="22px" />

export interface IResidentFormProps {
  navigate: any
  params: any
  projectStore: ProjectStore
  residentStore: ResidentStore
  companyStore: CompanyStore
  userStore: UserStore
  sources: any
  targetLanguages: any
}

@inject(Stores.ResidentStore, Stores.ProjectStore, Stores.UserStore, Stores.CompanyStore)
@observer
class ResidentCreate extends AppComponentBase<IResidentFormProps> {
  state = {
    isDirty: false,
    displayNames: [],
    passwordGen: []
  }
  formRef: any = React.createRef()

  async componentDidMount() {
    this.setState({ userId: this.props.params?.id })
    this.isGranted(appPermissions.resident.detail) &&
      (await Promise.all([
        this.getDetail(this.props.params?.id),
        this.props.projectStore.filterOptions({}),
        this.getListCountry(''),
        this.getListCompany('')
      ]))
  }
  getListCountry = async (keyword?) => {
    await this.props.projectStore.getListCountry(keyword)
  }

  getListCompany = debounce(async (keyword?) => {
    const filter = {
      skipCount: 0,
      maxResultCount: 50,
      keyword
    }
    await this.props.companyStore.getAll(filter)
  }, 300)

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
      await this.props.residentStore.createResident()
    } else {
      const isShowPhoneEmail = false
      await this.props.residentStore.get(id, isShowPhoneEmail)
    }
    this.formRef.current.setFieldsValue({
      ...this.props.residentStore.editResident
    })
  }

  hideModal = async (modalName: string) => {
    this.setState({ ...this.state, [modalName]: false })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  resetCheckExistResident = async () => {
    const form = this.formRef.current
    this.setState({ checkedExistResident: false })
    if (!form) {
      return
    }
    if (this.props.residentStore.editResident.id) {
      await this.props.residentStore.createResident()
      form.setFieldsValue({ ...this.props.residentStore.editResident })
    }
  }

  onSave = () => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      this.setState({ loading: true })

      await this.props.residentStore.create(values)

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
    this.props.residentStore.createResident()
    this.props.userStore.editUserProfilePicture = defaultAvatar
    this.props.navigate(-1)
  }

  findResidentByUserName = async () => {
    const form = this.formRef.current
    if (!form) {
      return
    }
    const userName = form.getFieldValue('userName')
    const existedResident = (await residentService.findByUserName({
      userName
    })) as any
    if (existedResident && existedResident.id) {
      this.props.residentStore.editResident = { ...existedResident }

      form.setFieldsValue({ ...this.props.residentStore.editResident })
    }

    this.setState({ checkedExistResident: true })
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

  renderUserCheckExist = () => {
    if (this.props.params?.id) {
      return
    }

    return <SearchOutlined className="pointer" onClick={this.findResidentByUserName} />
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
    const {
      projectStore: { countryOptions }
    } = this.props

    const disabledDate = (current) => {
      return current > new Date() ? true : false
    }
    return this.isGranted(appPermissions.resident.detail) ? (
      <WrapPageScroll renderActions={() => this.renderActions(this.props.residentStore.isLoading)}>
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
                  <Input
                    prefix={<UserOutlined />}
                    suffix={this.renderUserCheckExist()}
                    onChange={this.resetCheckExistResident}
                  />
                </Form.Item>
              </Col>

              <Col sm={{ span: 16, offset: 0 }}>
                <Form.Item label={L('RESIDENT_COMPANY')} {...formVerticalLayout} name="companyId" rules={rules.company}>
                  <Select
                    showSearch
                    showArrow
                    allowClear
                    filterOption={false}
                    onSearch={this.getListCompany}
                    onClear={() => this.getListCompany('')}
                    style={{ width: '100%' }}>
                    {this.props.companyStore.companies.items.map((item: any) => (
                      <Select.Option key={item?.id} value={item?.id}>
                        {item?.companyName}
                      </Select.Option>
                    ))}
                  </Select>
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
                <Form.Item label={L('STAFF_POSITION')} {...formVerticalLayout} name="position" rules={rules.company}>
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

              <Col sm={{ span: 4, offset: 0 }}>
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
              <Col sm={{ span: 4, offset: 0 }}>
                <Form.Item label={L('RESIDENT_COUNTRY')} {...formVerticalLayout} name="countryId">
                  <Select style={{ width: '100%' }} showSearch filterOption={filterOptions}>
                    {countryOptions.map((country: any, index) => (
                      <Select.Option key={index} value={country.value}>
                        {L(country.name)}
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
                      loading={this.props.residentStore.isLoading}>
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
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('RESIDENT_IS_RECEIVE_NOTICE_FEE')}
                {...formVerticalLayout}
                name="IsReceiveNoticeFee"
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

export default withRouter(ResidentCreate)
