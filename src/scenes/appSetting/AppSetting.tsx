import React from 'react'
import { Button, Tabs, Form, Col, Input, Row, Checkbox, Select, Switch, InputNumber } from 'antd'
import WrapPageScroll from '@components/WrapPageScroll'
import { inject } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { observer } from 'mobx-react-lite'
import SessionStore from '@stores/sessionStore'
import { isGranted, L, LError } from '@lib/abpUtility'
import AppConsts, { appPermissions, emailRegex } from '@lib/appconst'
import LoginPhone from './components/loginPhone'
import LoginManual from './components/loginManual'
import { notifySuccess } from '@lib/helper'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { validateMessages } from '@lib/validation'
import NoRole from '@components/ComponentNoRole'
import FormSelect from '@components/FormItem/FormSelect'
const { formVerticalLayout } = AppConsts

const GoogleIcon = <img src="/assets/icons/GoogleIcon.svg" height="20px" className="mx-3" />
const AppleIcon = <img src="/assets/icons/AppleIcon.svg" height="20px" className="mx-3" />
const MicrosoftIcon = <img src="/assets/icons/MicrosoftIcon.svg" height="20px" className="mx-3" />
const VNPay = <img src="/assets/icons/vnpayIcon.svg" height="20px" className="mx-3" />
const Momo = <img src="/assets/icons/momoIcon.svg" height="25px" className="mx-3" />
const ZaloPay = <img src="/assets/icons/ZaloPayIcon.svg" height="20px" className="mx-3" />

const { TabPane } = Tabs
interface Props {
  sessionStore: SessionStore
}

const AppSetting = inject(Stores.SessionStore)(
  observer((props: Props) => {
    const [formAppSetting] = Form.useForm()
    const [isEmailProviderEnabled, setIsEmailProviderEnabled] = React.useState(false)
    const [isSmsProviderEnabled, setIsSmsProviderEnabled] = React.useState(false)

    const [isAppleProviderEnabled, setIsAppleProviderEnabled] = React.useState(false)
    const [isGoogleProviderEnabled, setIsGoogleProviderEnabled] = React.useState(false)
    const [isMicrosoftProviderEnabled, setIsMicrosoftProviderEnabled] = React.useState(false)

    const [passwordComplexity, setPasswordComplexity] = React.useState({
      requireDigit: true,
      requireLowercase: true,
      requireNonAlphanumeric: true,
      requireUppercase: true,
      requiredLength: 8
    })
    const [userLockOut, setUserLockOut] = React.useState({
      isEnabled: true,
      maxFailedAccessAttemptsBeforeLockout: 60,
      defaultAccountLockoutSeconds: 100
    })

    isGranted(appPermissions.appSetting.page) &&
      React.useEffect(() => {
        getHostSetting()
      }, [])

    const getHostSetting = async () => {
      await props.sessionStore.getHostSetting().then((values) => {
        setIsEmailProviderEnabled(values?.security.twoFactorLogin.isEmailProviderEnabled)
        setIsSmsProviderEnabled(values?.security.twoFactorLogin.isSmsProviderEnabled)
        setIsAppleProviderEnabled(values?.security.twoFactorLogin.isAppleAuthenticatorEnabled)
        setIsGoogleProviderEnabled(values?.security.twoFactorLogin.isGoogleAuthenticatorEnabled)
        setIsMicrosoftProviderEnabled(values?.security.twoFactorLogin.isMicrosoftAuthenticatorEnabled)
        setPasswordComplexity(values?.security.passwordComplexity)
        setUserLockOut(values?.security.userLockOut)

        formAppSetting.setFieldsValue({
          ...values,
          general: {
            ...values.general
          }
        })
      })
    }
    const handleSubmit = async () => {
      const values = await formAppSetting.validateFields()
      if (values?.security) {
        values.security.twoFactorLogin = {
          isEmailProviderEnabled: isEmailProviderEnabled,
          isSmsProviderEnabled: isSmsProviderEnabled,
          isGoogleAuthenticatorEnabled: isGoogleProviderEnabled,
          isAppleAuthenticatorEnabled: isAppleProviderEnabled,
          isMicrosoftAuthenticatorEnabled: isMicrosoftProviderEnabled
        }
        values.security.passwordComplexity = passwordComplexity
        values.security.userLockOut = userLockOut
        values.security.defaultPasswordComplexity = props.sessionStore.hostSetting?.security.defaultPasswordComplexity
      }
      await props.sessionStore.changeHostSetting(values)
      notifySuccess(L('SUCCESSFULLY'), L('UPDATE_SETTING_SUCCESSFULLY'))
      getHostSetting()
    }
    const renderActions = (loading?) => {
      return isGranted(appPermissions.appSetting.page) ? (
        <Button loading={loading} type="primary" shape="round" onClick={() => handleSubmit()}>
          {L('BTN_SAVE')}
        </Button>
      ) : null
    }
    return isGranted(appPermissions.appSetting.page) ? (
      <WrapPageScroll renderActions={() => renderActions(false)}>
        <Form form={formAppSetting} layout="vertical" validateMessages={validateMessages}>
          <Tabs defaultActiveKey="1">
            <TabPane tab={L('GENERAL')} key="1">
              <Row gutter={[8, 8]} className="mx-3">
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item
                    {...formVerticalLayout}
                    name={['general', 'startDayOfWeek']}
                    label={L('START_DAY_OF_WEEK')}>
                    <Select showArrow>
                      {AppConsts.dayOfWeek.map((option, index) => (
                        <Select.Option key={index} value={option.value}>
                          {L(option.name)}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item
                    {...formVerticalLayout}
                    name={['general', 'companyName']}
                    label={L('COMPANY_NAME')}
                    rules={[
                      {
                        required: true,
                        max: 250,
                        message: LError('INVALID_COMPANY_NAME')
                      }
                    ]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item
                    {...formVerticalLayout}
                    name={['general', 'applicationName']}
                    label={L('APPLICATION_NAME')}
                    rules={[
                      {
                        required: true,
                        max: 250,
                        message: LError('INVALID_APPLICATION_NAME')
                      }
                    ]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  {/* <FormDatePicker name={['general', 'lastDayOfPeriod']} label={L('LAST_DATE_OF_PERIOD')} /> */}
                  <FormSelect
                    name={['general', 'lastDayOfPeriod']}
                    label={L('LAST_DATE_OF_PERIOD')}
                    options={Array.from({ length: 31 }, (_, i) => ({
                      id: i + 1,
                      label: String(i + 1),
                      value: i + 1
                    }))}
                  />
                </Col>
                <Col sm={{ span: 24, offset: 0 }}>
                  <strong>{L('CONFIG_SENDER')}</strong>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item name={['general', 'allowSendEmail']} valuePropName="checked">
                    <Checkbox>{L('ALLOW_SEND_EMAIL')}</Checkbox>
                  </Form.Item>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item name={['general', 'allowSendSms']} valuePropName="checked">
                    <Checkbox>{L('ALLOW_SEND_SMS')}</Checkbox>
                  </Form.Item>
                </Col>
                <Col sm={{ span: 24, offset: 0 }}>
                  <strong>{L('USER_MANAGEMENT')}</strong>
                </Col>
                <Col sm={{ span: 24, offset: 0 }}>
                  <Form.Item name={['userManagement', 'allowSelfRegistration']} valuePropName="checked">
                    <Checkbox>{L('ALLOW_SELF_REGISTRATION')}</Checkbox>
                  </Form.Item>
                </Col>
                <Col sm={{ span: 24, offset: 0 }}>
                  <Form.Item name={['userManagement', 'smsVerificationEnabled']} valuePropName="checked">
                    <Checkbox>{L('SMS_VERIFICATION_ENABLE')}</Checkbox>
                  </Form.Item>
                </Col>
                <Col sm={{ span: 24, offset: 0 }}>
                  <Form.Item name={['userManagement', 'useCaptchaOnRegistration']} valuePropName="checked">
                    <Checkbox>{L('USE_CAPCHA_REGISTRATION')}</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab={L('SERCURITY')} key="3">
              <Row>
                <Col span={12}>
                  <Row gutter={[8, 8]} className="mx-3">
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Form.Item name={['security', 'allowOneConcurrentLoginPerUser']} valuePropName="checked">
                        <Checkbox>{L('ALLOW_ONE_CURRENT_LOGIN_PER_USER')}</Checkbox>
                      </Form.Item>
                    </Col>

                    <Col sm={{ span: 24, offset: 0 }}>
                      <Switch
                        className="mr-1"
                        defaultChecked={isAppleProviderEnabled}
                        onChange={setIsAppleProviderEnabled}
                      />
                      <label>{L('CONTINUE_WITH_APPLE')}</label>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }} className="w-100">
                      <div style={{ maxWidth: 320, marginLeft: 40 }}>
                        <div className="w-100">
                          <Button shape="round" icon={AppleIcon} className="w-100 my-1 text-left">
                            {L('CONTINUE_WITH_APPLE')}
                          </Button>
                        </div>
                      </div>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Switch
                        className="mr-1"
                        defaultChecked={isGoogleProviderEnabled}
                        onChange={setIsGoogleProviderEnabled}
                      />
                      <label>{L('CONTINUE_WITH_GOOGLE')}</label>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }} className="w-100">
                      <div style={{ maxWidth: 320, marginLeft: 40 }}>
                        <div className="w-100">
                          <div className="d-inline-block w-100">
                            <Button shape="round" icon={GoogleIcon} className="w-100 my-1 text-left">
                              {L('CONTINUE_WITH_GOOGLE')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Switch
                        className="mr-1"
                        defaultChecked={isMicrosoftProviderEnabled}
                        onChange={setIsMicrosoftProviderEnabled}
                      />
                      <label>{L('CONTINUE_WITH_MICROSOFT')}</label>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }} className="w-100">
                      <div style={{ maxWidth: 320, marginLeft: 40 }}>
                        <div className="w-100">
                          <div className="d-inline-block w-100">
                            <Button shape="round" icon={MicrosoftIcon} className="w-100 my-1 text-left">
                              {L('CONTINUE_WITH_MICROSOFT')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Switch
                        className="mr-1"
                        defaultChecked={isSmsProviderEnabled}
                        onChange={setIsSmsProviderEnabled}
                      />
                      <label>{L('ALLOW_LOGIN_PHONE')}</label>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }} className="w-100">
                      <div style={{ maxWidth: 320, marginLeft: 40 }}>
                        <LoginPhone />
                      </div>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Switch
                        className="mr-1"
                        defaultChecked={isEmailProviderEnabled}
                        onChange={setIsEmailProviderEnabled}
                      />
                      <label>{L('ALLOW_LOGIN_MANUAL')}</label>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <div style={{ maxWidth: 320, marginLeft: 40 }}>
                        <LoginManual />
                      </div>
                    </Col>
                  </Row>
                </Col>
                <Col span={12}>
                  <Row gutter={[8, 8]} className="mx-3">
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Form.Item name={['security', 'useDefaultPasswordComplexitySettings']} valuePropName="checked">
                        <Checkbox>{L('USE_DEFAULT_PASSWORD_CEMPLEXITY')}</Checkbox>
                      </Form.Item>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <strong>{L('PASSWORD_COMPLEXITY')}</strong>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Checkbox
                        defaultChecked={passwordComplexity.requireDigit}
                        onChange={(e) => {
                          const res = passwordComplexity
                          res.requireDigit = e.target.checked
                          setPasswordComplexity(res)
                        }}>
                        {L('REQUIRED_DIGIT')}
                      </Checkbox>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Checkbox
                        defaultChecked={passwordComplexity.requireLowercase}
                        onChange={(e) => {
                          const res = passwordComplexity
                          res.requireLowercase = e.target.checked
                          setPasswordComplexity(res)
                        }}>
                        {L('REQUIRED_LOWERCASE')}
                      </Checkbox>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Checkbox
                        defaultChecked={passwordComplexity.requireUppercase}
                        onChange={(e) => {
                          const res = passwordComplexity
                          res.requireUppercase = e.target.checked
                          setPasswordComplexity(res)
                        }}>
                        {L('REQUIRED_UPPERCASE')}
                      </Checkbox>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Checkbox
                        defaultChecked={passwordComplexity.requireNonAlphanumeric}
                        onChange={(e) => {
                          const res = passwordComplexity
                          res.requireNonAlphanumeric = e.target.checked
                          setPasswordComplexity(res)
                        }}>
                        {L('REQUIRED_NON_ALPHA_NUMERIC')}
                      </Checkbox>
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <label>{L('REQUIRED_LENGTH')}</label>
                      <InputNumber
                        className="w-100"
                        defaultValue={passwordComplexity.requiredLength}
                        onChange={(e) => {
                          const res = passwordComplexity
                          res.requiredLength = e ?? 0
                          setPasswordComplexity(res)
                        }}
                      />
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <strong>{L('USER_LOCK_OUT')}</strong>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Checkbox
                        defaultChecked={userLockOut.isEnabled}
                        onChange={(e) => {
                          const res = userLockOut
                          res.isEnabled = e.target.checked
                          setUserLockOut(res)
                        }}>
                        {L('ENABLE_LOCK_ACCOUNT_ON_FAIL_LOGIN')}
                      </Checkbox>
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <label>{L('NUMBER_OF_FAILED')}</label>
                      <InputNumber
                        className="w-100"
                        defaultValue={userLockOut.maxFailedAccessAttemptsBeforeLockout}
                        onChange={(e) => {
                          const res = userLockOut
                          res.maxFailedAccessAttemptsBeforeLockout = e ?? 0
                          setUserLockOut(res)
                        }}
                      />
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <label>{L('LOCKING_DURATION')}</label>
                      <InputNumber
                        className="w-100"
                        defaultValue={userLockOut.defaultAccountLockoutSeconds}
                        onChange={(e) => {
                          const res = userLockOut
                          res.defaultAccountLockoutSeconds = e ?? 0
                          setUserLockOut(res)
                        }}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab={L('SETTING_PAYMENT')} key="4">
              <Row gutter={[32, 8]} className="mx-3">
                <Col sm={{ span: 24, offset: 0 }}>
                  <strong>{L('PAYMENT_METHOD')}</strong>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item name={['payment', 'momoEnable']} valuePropName="checked">
                    <Checkbox>
                      {L('MOMO_ENABLE')} {Momo}
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item name={['payment', 'vnPayEnable']} valuePropName="checked">
                    <Checkbox>
                      {L('VNPAY_ENABLE')}
                      {VNPay}
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item name={['payment', 'zaloPayEnable']} valuePropName="checked">
                    <Checkbox>
                      {L('ZALOPAY_ENABLE')}
                      {ZaloPay}
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}></Col>
                <Col sm={{ span: 8, offset: 0 }}>
                  <label>{L('APP_SETTING_LABEL_BILLING_BACK_DATE_LIMIT_CASH_ADVANCE_RECEIPT')}</label>
                  <Form.Item name={['payment', 'billingBackDateLimitCashAdvanceReceipt']}>
                    <InputNumber className="w-100" />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 8, offset: 0 }}>
                  <label>{L('APP_SETTING_LABEL_BILLING_BACK_DATE_LIMIT_CREATE_RECEIPT')}</label>
                  <Form.Item name={['payment', 'billingBackDateLimitIncomingReceipt']}>
                    <InputNumber className="w-100" />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 8, offset: 0 }}>
                  <label>{L('APP_SETTING_LABEL_BILLING_BACK_DATE_LIMIT_CREATE_EXPENSE_RECEIPT')}</label>
                  <Form.Item name={['payment', 'billingBackDateLimitExpenseReceipt']}>
                    <InputNumber className="w-100" />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 8, offset: 0 }}>
                  <label>{L('APP_SETTING_LABEL_BILLING_BACK_DATE_LIMIT_CASH_ADVANCE_CANCEL_RECEIPT')}</label>
                  <Form.Item name={['payment', 'billingBackDateLimitCashAdvanceCancelReceipt']}>
                    <InputNumber className="w-100" />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 8, offset: 0 }}>
                  <label>{L('APP_SETTING_LABEL_BILLING_BACK_DATE_LIMIT_CANNEL_RECEIPT')}</label>
                  <Form.Item name={['payment', 'billingBackDateLimitCancelReceipt']}>
                    <InputNumber className="w-100" />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 8, offset: 0 }}>
                  {' '}
                  <label>{L('APP_SETTING_LABEL_BILLING_BACK_DATE_LIMIT_CANNEL_EXPENSE_RECEIPT')}</label>
                  <Form.Item name={['payment', 'billingBackDateLimitCancelExpenseReceipt']}>
                    <InputNumber className="w-100" />
                  </Form.Item>
                </Col>

                <Col sm={{ span: 8, offset: 0 }}>
                  <label>{L('APP_SETTING_LABEL_BILLING_BACK_DATE_LIMIT_CASH_ADVANCE_WITH_DRAW_RECEIPT')}</label>
                  <Form.Item name={['payment', 'billingBackDateLimitCashAdvanceWithDrawReceipt']}>
                    <InputNumber className="w-100" />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 16, offset: 0 }}></Col>
                <Col sm={{ span: 8, offset: 0 }}>
                  <Form.Item name={['payment', 'allowSentNoticeAfterPayment']} valuePropName="checked">
                    <Checkbox>{L('ALLOW_SENT_NOTICE_AFTER_PAYMENY')}</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab={L('EMAIL_CONFIG')} key="5">
              <Row gutter={[8, 8]} className="mx-3">
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item
                    {...formVerticalLayout}
                    name={['email', 'smtpHost']}
                    label={L('SMTP_HOST')}
                    rules={[
                      {
                        required: true,
                        max: 250
                      }
                    ]}>
                    <Input placeholder={L('SMTP_SERVER_NAME')} />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}></Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item
                    label={L('SMTP_PORT')}
                    {...formVerticalLayout}
                    name={['email', 'smtpPort']}
                    rules={[{ required: true }]}>
                    <InputNumber className="w-100" placeholder={L('SMTP_SERVER_PORT')} />
                  </Form.Item>
                  {/* <Form.Item
                    {...formVerticalLayout}
                    name={['email', 'smtpPort']}
                    label={L('SMTP_PORT')}
                    rules={[
                      {
                        max: 250
                      }
                    ]}>
                    <InputNumber className="w-100" placeholder={L('SMTP_SERVER_PORT')} />
                  </Form.Item> */}
                </Col>
                <Col sm={{ span: 12, offset: 0 }}></Col>

                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item {...formVerticalLayout} name={['email', 'smtpEnableSsl']} label={L('SMTP_ENABLE_SSL')}>
                    <Select showArrow>
                      {AppConsts.yesNoValue.map((option, index) => (
                        <Select.Option key={index} value={option.value}>
                          {L(option.name)}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}></Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item name={['email', 'smtpUseDefaultCredentials']} valuePropName="checked">
                    <Checkbox>{L('USE_DEFAULT_CREDENTIALS')}</Checkbox>
                  </Form.Item>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}></Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item
                    {...formVerticalLayout}
                    name={['email', 'defaultFromDisplayName']}
                    label={L('EMAIL_CONFIG_DEFAULT_FROM_DISPLAY_NAME')}
                    rules={[
                      {
                        required: true,
                        max: 250
                      }
                    ]}>
                    <Input placeholder={L('FROM_ADDRESS')} />
                    {/* {L('IF_NOT_SPACIFLED_THE_USERNAME_WILL_BE_USED')} */}
                  </Form.Item>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}></Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item
                    {...formVerticalLayout}
                    name={['email', 'defaultFromAddress']}
                    label={L('FROM_ADDRESS_CONFIG')}
                    rules={[
                      {
                        required: true,
                        max: 250
                      }
                    ]}>
                    <Input placeholder={L('FROM_ADDRESS')} />
                    {/* {L('IF_NOT_SPACIFLED_THE_USERNAME_WILL_BE_USED')} */}
                  </Form.Item>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}></Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item
                    {...formVerticalLayout}
                    name={['email', 'smtpUserName']}
                    label={L('SMTP_USERNAME')}
                    rules={[
                      {
                        required: true,
                        max: 250
                      }
                    ]}>
                    <Input placeholder={L('SMTP_USERNAME')} />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}></Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item
                    {...formVerticalLayout}
                    name={['email', 'smtpPassword']}
                    label={L('SMTP_PASSWORD')}
                    rules={[
                      {
                        required: true,
                        max: 250
                      }
                    ]}>
                    <Input.Password
                      placeholder={L('SMTP_PASSWORD')}
                      prefix={<LockOutlined className="site-form-item-icon" />}
                    />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}></Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item
                    {...formVerticalLayout}
                    name={['email', 'replyToAddress']}
                    label={L('REPLY_TO')}
                    rules={[{ pattern: emailRegex }]}>
                    <Input placeholder={L('REPLY_TO_EMAIL')} prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Form>
        <div className="p-1" />
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  })
)

export default AppSetting
