import * as React from 'react'

import { Col, Form, Input, Row, Select, Switch, DatePicker, Card, Tabs, Button, Tooltip } from 'antd'
import { MailOutlined } from '@ant-design/icons'
import { isGrantedAny, L } from '../../../../lib/abpUtility'
import rules from './validation'
import AppConsts, { dateFormat, appPermissions, moduleIds } from '../../../../lib/appconst'
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
import AuditLog from '@components/AuditLog'
import AuditLogStore from '@stores/common/auditLogStore'
import CompanyStore from '@stores/project/companyStore'
import { portalLayouts } from '@components/Layout/Router/router.config'

const { formVerticalLayout, genders } = AppConsts

const TAB_KEY = {
  RESIDENT_INFO: 'RESIDENT_INFO',
  RESIDENT_LOGS: 'RESIDENT_LOGS'
}
export interface IResidentFormProps {
  navigate: any
  params: any
  projectStore: ProjectStore
  residentStore: ResidentStore
  userStore: UserStore
  sources: any
  targetLanguages: any
  companyStore: CompanyStore
  auditLogStore: AuditLogStore
}

@inject(Stores.ResidentStore, Stores.ProjectStore, Stores.UserStore, Stores.AuditLogStore, Stores.CompanyStore)
@observer
class ResidentDetail extends AppComponentBase<IResidentFormProps> {
  state = {
    tabActiveKey: TAB_KEY.RESIDENT_INFO,
    displayNames: [],
    isShowFullDetail: false,
    isAllowSave: false
  }

  formRef: any = React.createRef()

  async componentDidMount() {
    this.isGranted(appPermissions.resident.detail) &&
      (await Promise.all([this.getDetail(this.props.params?.id), this.getListCountry(''), this.getListCompany('')]))
  }

  getListCountry = async (keyword?) => {
    await this.props.projectStore.getListCountry(keyword)
  }
  getListCompany = async (keyword?) => {
    const filter = {
      skipCount: 0,
      maxResultCount: 50,
      keyword
    }
    await this.props.companyStore.getAll(filter)
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
    if (id) {
      const isShowPhoneEmail = false

      await this.props.residentStore.get(id, isShowPhoneEmail)

      await this.props.residentStore.getNoteResident(this.props.params?.id)
      const countryId = this.props.residentStore?.editResident?.country?.id

      this.formRef.current.setFieldsValue({
        countryId: countryId,
        note: this.props.residentStore.notesResident?.note ?? '',
        ...this.props.residentStore.editResident
      })
    }
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  onSave = () => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      this.setState({ loading: true })

      if (this.props.residentStore.editResident?.id) {
        if (this.state.isShowFullDetail === true) {
          this.isGranted(appPermissions.resident.update) &&
            (await this.props.residentStore.update({
              ...this.props.residentStore.editResident,
              ...values
            }))
        }
      }
      form.resetFields()
      this.setState({ loading: false })
      this.props.navigate(portalLayouts.residentManagement.path)
    })
  }

  handleShowFullButton = async () => {
    const isShowPhoneEmail = true
    const id = this.props.params?.id
    this.setState({ isShowFullDetail: true })
    try {
      if (id) {
        await this.props.residentStore.get(id, isShowPhoneEmail)
        this.formRef.current.setFieldsValue({
          ...this.props.residentStore.editResident
        })
      }
      this.setState({ isAllowSave: true })
    } catch {
      this.setState({ isAllowSave: false })
    }
  }

  renderActions = (isLoading?) => {
    const { tabActiveKey } = this.state
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }} flex="0">
          {tabActiveKey === TAB_KEY.RESIDENT_INFO &&
            this.props.residentStore.editResident.id > 0 &&
            isGrantedAny(appPermissions.resident.fullDetail) && (
              <Button
                className="mr-1"
                type="primary"
                // ghost
                onClick={() => this.handleShowFullButton()}
                loading={isLoading}
                disabled={this.state.isShowFullDetail ? true : false}
                shape="round">
                {L('BTN_VIEW_FULL')}
              </Button>
            )}
        </Col>
        <Col sm={{ span: 24, offset: 0 }} flex="1">
          <Button
            className="mr-1"
            onClick={() => this.props.navigate(portalLayouts.residentManagement.path)}
            shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {tabActiveKey === TAB_KEY.RESIDENT_INFO &&
            isGrantedAny(appPermissions.resident.create, appPermissions.resident.update) && (
              <>
                {!this.state.isAllowSave ? (
                  <Tooltip trigger="hover" title={L('NOTE_SAVE_WHEN_VIEW_DETAIL')}>
                    <Button type="primary" loading={isLoading} shape="round" disabled={!this.state.isAllowSave}>
                      {L('BTN_SAVE')}
                    </Button>
                  </Tooltip>
                ) : (
                  <Button
                    type="primary"
                    onClick={this.onSave}
                    loading={isLoading}
                    shape="round"
                    disabled={!this.state.isAllowSave}>
                    {L('BTN_SAVE')}
                  </Button>
                )}
              </>
            )}
        </Col>
      </Row>
    )
  }

  render() {
    const { displayNames } = this.state
    const {
      residentStore,
      projectStore: { countryOptions }
    } = this.props
    const { isLoading } = residentStore

    if (this.state.isShowFullDetail === false && !this.props.params?.id) {
      this.setState({ isShowFullDetail: true })
    }
    const disabledDate = (current) => {
      return current > new Date() ? true : false
    }
    return this.isGranted(appPermissions.resident.detail) ? (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Card bordered={false} id="resident-detail" style={{ minHeight: 750 }}>
          <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab}>
            <Tabs.TabPane tab={L('RESIDENT_TAB_INFO')} key={TAB_KEY.RESIDENT_INFO}>
              <Form ref={this.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('RESIDENT_USER_NAME')} {...formVerticalLayout} name="userName">
                      <Input disabled />
                    </Form.Item>
                  </Col>

                  <Col sm={{ span: 16, offset: 0 }}>
                    <Form.Item
                      label={L('RESIDENT_COMPANY')}
                      {...formVerticalLayout}
                      name="companyId"
                      rules={rules.company}>
                      <Select style={{ width: '100%' }}>
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
                    <Form.Item
                      label={L('STAFF_POSITION')}
                      {...formVerticalLayout}
                      name="position"
                      rules={rules.company}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('RESIDENT_NAME')} {...formVerticalLayout} name="name" rules={rules.name}>
                      <Input onChange={this.buildDisplayName} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('RESIDENT_SURNAME')}
                      {...formVerticalLayout}
                      name="surname"
                      rules={rules.surname}>
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
                      name="isReceiveNoticeFee"
                      valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <FormTextArea label={L('DESCRIPTION')} name="description" />
                  </Col>
                </Row>
              </Form>
            </Tabs.TabPane>

            {this.props.params?.id && (
              <Tabs.TabPane tab={L('RESIDENT_LOGS')} key={TAB_KEY.RESIDENT_LOGS}>
                <AuditLog
                  moduleId={moduleIds.resident}
                  parentId={this.props.residentStore.editResident?.id}
                  auditLogStore={this.props.auditLogStore}
                />
              </Tabs.TabPane>
            )}
          </Tabs>
        </Card>
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(ResidentDetail)
