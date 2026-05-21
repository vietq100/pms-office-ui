import FormInput from '@components/FormItem/FormInput'
import LanguageSelect from '@components/Layout/Header/LanguageSelect'
import { L, LError } from '@lib/abpUtility'
import { dateTimeFormat, timeFormat } from '@lib/appconst'
import { notifySuccess } from '@lib/helper'
import handoverService from '@services/handover/handoverService'
import HandoverStore from '@stores/handover/handoverStore'
import Stores from '@stores/storeIdentifier'
import Button from 'antd/lib/button'
import Calendar from 'antd/lib/calendar'
import Col from 'antd/lib/col'
import Form from 'antd/lib/form'
import Radio from 'antd/lib/radio'
import Row from 'antd/lib/row'
import Space from 'antd/lib/space'
import Spin from 'antd/lib/spin'
import Countdown from 'antd/lib/statistic/Countdown'
import Tag from 'antd/lib/tag'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import moment from 'moment'
import React from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { formDataRender } from '../handoverProcess/Details'

type Props = {
  handoverStore: HandoverStore
}

const HandoverBookingConfirmed = inject(Stores.HandoverStore)(
  observer((props: Props) => {
    const offOTP = true
    const params = useParams()
    const [form] = Form.useForm()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const idToken = searchParams.get('idToken')
    const [isSentOTP, setIsSentOTP] = React.useState(false)
    const sendOtp = async () => {
      setIsSentOTP(true)
      await handoverService.sentOTP({
        handoverId: detail?.handoverPlan?.id,
        idToken
      })
      notifySuccess(L('SUCCESSFULLY'), L('SEND_OTP_SUCCESSFULLY'))
    }
    React.useEffect(() => {
      if (params.id && params.id !== 'create') {
        props.handoverStore.getHandoverPublicUser(params.id)
      }
      return () => {
        props.handoverStore.handoverPublicUser = null
      }
    }, [])
    const detail = toJS(props.handoverStore.handoverPublicUser)
    const [timeSlot, setTimeSlot] = React.useState<any>()
    const handleSelectHandoverDate = async (date) => {
      const isAvailable = date > moment(detail.handoverPlan.fromDate) && date < moment(detail.handoverPlan.toDate)
      if (isAvailable) {
        await props.handoverStore.getTimeSlots(detail.handoverPlan.id, date.format('YYYY/MM/DD'))
      }
    }

    const dateCellRender = (value) => {
      const { innerWidth } = window
      const isAvailable = value > moment(detail.handoverPlan.fromDate) && value < moment(detail.handoverPlan.toDate)
      return isAvailable ? (
        <Tag className="w-100" color="green">
          {innerWidth > 578 ? L('AVAILABLE') : ''}
        </Tag>
      ) : null
    }
    const triggerCancel = async () => {
      await handoverService.cancelHandover({
        id: detail?.id,
        idToken
      })
      notifySuccess(L('SUCCESSFULLY'), L('UPDATE_SUCCESSFULLY'))
      navigate(-1)
    }

    const onSave = async () => {
      const formValues = await form.validateFields()
      const verificationCode = formValues.verificationCode
      const body = {
        verificationCode,
        idToken,
        handoverId: detail?.handoverPlan.id,
        unitId: detail?.unit.id,
        startDate: timeSlot?.startTime,
        endDate: timeSlot?.endTime
      }
      await props.handoverStore.createReservation(body)
      navigate(-1)
    }

    const renderAction = () => (
      <div
        style={{ backgroundColor: '#c8e4e7', borderRadius: '6px', width: '90%' }}
        className="d-flex justify-content-end pt-2 pb-2 pr-2">
        <Button className="mr-2" onClick={() => navigate(-1)} shape="round">
          {L('BTN_BACK')}
        </Button>

        {params.id === 'create' ? (
          <Button type="primary" onClick={onSave} shape="round">
            {L('BTN_SAVE')}
          </Button>
        ) : detail.status?.code === 'SUBMITTED' ? (
          <Button danger type="primary" className="mr-2" onClick={triggerCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
        ) : null}
      </div>
    )
    if (!detail)
      return (
        <div className="w-100 d-flex flex-column align-items-center m-3">
          <div className="m-3">{L('UNPICK_HANDOVER_PLAN')}</div>
          <Button className="d-block" onClick={() => navigate(-1)}>
            {L('BACK')}
          </Button>
        </div>
      )

    return params.id === 'create' ? (
      <div style={{ height: '100vh' }}>
        <div className={'lang'} style={{ paddingRight: '15px' }}>
          <LanguageSelect wrapClass="dart-auth-language" type="horizontal" />
        </div>

        <div className="pr-2 pl-2">
          <Row>
            <Col md={{ span: 12 }} xs={{ span: 24 }}>
              <h2 className="m-1 p-1 fw-bold">{detail.unit?.fullUnitCode}</h2>
              {formDataRender(L('UNIT_TYPE'), detail.unit?.type?.name, undefined, 4)}
              {formDataRender(L('TITLE'), detail.handoverPlan?.title, undefined, 4)}
              {formDataRender(L('UNIT_DESCRIPTION'), detail.handoverPlan?.unitTitle, undefined, 4)}
            </Col>
            <Col md={{ span: 12 }} xs={{ span: 24 }}>
              <img
                src={detail?.unit?.project?.file?.fileUrl}
                alt="Project Detail Image"
                className="rounded-pill"
                height={200}
              />
            </Col>
          </Row>

          <Row gutter={8}>
            <Col xs={{ span: 24 }} md={{ span: 12 }}>
              <label className="fw-bold mx-2">{L('HANDOVER_DATE')}</label>
              <Calendar fullscreen={false} onSelect={handleSelectHandoverDate} dateCellRender={dateCellRender} />
            </Col>
            <Col xs={{ span: 24 }} md={{ span: 12 }}>
              {props.handoverStore.isLoading ? (
                <Spin />
              ) : (
                <>
                  <label className="fw-bold m-2 d-block ">{L('TIMESLOTS')}</label>
                  <Radio.Group
                    className="m-1"
                    onChange={(e) => {
                      setTimeSlot(e.target.value)
                    }}
                    value={timeSlot}>
                    <Space direction="vertical">
                      {props.handoverStore.timeSlots.map((timeSlot, index) => (
                        <Radio className="m-1" key={index} value={timeSlot} disabled={!timeSlot.isAvailable}>
                          {moment(timeSlot.startTime).format(timeFormat) +
                            ' - ' +
                            moment(timeSlot.endTime).format(timeFormat)}
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                </>
              )}
            </Col>

            {!offOTP && (
              <>
                <Col xs={{ span: 24, offset: 0 }}>
                  <h3>{L('CONFIRM_PICKUP_HANDOVER_PLAN')}</h3>
                  <div className="text-muted">{L('CONFIRM_PICKUP_HANDOVER_PLAN_DESCRIPTION')}</div>
                </Col>
                <Col xs={{ span: 12, offset: 0 }}>
                  <Form form={form}>
                    <FormInput
                      label={L('OTP_CODE')}
                      name="verificationCode"
                      rule={[{ required: true, message: LError('REQUIRED') }]}
                    />
                  </Form>
                </Col>
                <Col xs={{ span: 12, offset: 0 }}>
                  <Button type="primary" shape="round" className="mt-5" disabled={isSentOTP} onClick={sendOtp}>
                    <span>{L('SEND_OTP')}</span>

                    {isSentOTP && (
                      <Countdown
                        format="mm:ss"
                        valueStyle={{
                          fontSize: '12px',
                          color: 'grey',
                          marginTop: '8px'
                        }}
                        value={Date.now() + 30 * 1000}
                        onFinish={() => setIsSentOTP(false)}
                      />
                    )}
                  </Button>
                </Col>
              </>
            )}
          </Row>
        </div>
        <div
          style={{
            width: '100vw',
            zIndex: 4,
            bottom: '12px',
            height: '60px',
            marginTop: '10px',
            position: 'fixed',
            display: 'flex',
            justifyContent: 'center'
          }}
          className="text-right">
          <>{renderAction()}</>
        </div>
      </div>
    ) : (
      <div>
        <div className={'lang'} style={{ paddingRight: '15px' }}>
          <LanguageSelect wrapClass="dart-auth-language" type="horizontal" />
        </div>
        <div className="m-3">
          <div className="d-flex justify-content-center w-100">
            <img
              src={detail?.unit?.project?.file?.fileUrl}
              alt="Project Detail Image"
              className="rounded-pill"
              height={200}
            />
          </div>
          <div className="d-flex justify-content-center">
            <Row>
              <Col span={24}>
                <h2 className="m-1 p-1 fw-bold">{detail.unit?.fullUnitCode}</h2>
                {formDataRender(L('UNIT_TYPE'), detail.unit?.type?.name, undefined, 4)}
                {formDataRender(L('TITLE'), detail.handoverPlan?.title, undefined, 4)}
                {formDataRender(L('UNIT_DESCRIPTION'), detail.handoverPlan?.unitTitle, undefined, 4)}

                {formDataRender(
                  L('HANDOVER_TIME'),
                  `${moment(detail.fromDate).format(dateTimeFormat)} - ${moment(detail.toDate).format(timeFormat)}`,
                  undefined,
                  4
                )}
                {formDataRender(L('NOTED'), detail.description, undefined, 4)}
                {formDataRender(
                  L('STATUS'),
                  <span
                    className="p-1"
                    style={{
                      border: 'none',
                      color: detail.status?.colorCode,
                      backgroundColor: detail.status?.borderColorCode
                    }}>
                    {L(detail.status?.name)}
                  </span>,
                  undefined,
                  4
                )}

                {/* //==== */}
                {formDataRender(L('DESCRIPTION'), detail.handoverPlan?.description, undefined, 4)}
                <div className="text-danger mx-2">{L('HANDOVER_BOOKING_WARNING')}</div>
              </Col>
            </Row>
          </div>
        </div>
        <div
          style={{
            width: '100vw',
            zIndex: 4,
            bottom: '12px',
            height: '60px',
            marginTop: '10px',
            position: 'fixed',
            display: 'flex',
            justifyContent: 'center'
          }}
          className="text-right">
          <>{renderAction()}</>
        </div>
      </div>
    )
  })
)

export default HandoverBookingConfirmed
