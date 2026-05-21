import LanguageSelect from '@components/Layout/Header/LanguageSelect'
import { publicLayout } from '@components/Layout/Router/router.config'
import { L } from '@lib/abpUtility'
import { dateFormat, dateTimeFormat, timeFormat } from '@lib/appconst'
import HandoverStore from '@stores/handover/handoverStore'
import Stores from '@stores/storeIdentifier'
import Card from 'antd/es/card'
import { Col } from 'antd/lib/grid'
import Row from 'antd/lib/row'
import Spin from 'antd/lib/spin'
import { inject, observer } from 'mobx-react'
import moment from 'moment'
import React from 'react'
import {
  createSearchParams,
  useNavigate,
  // useParams,
  useSearchParams
} from 'react-router-dom'
import { formDataRender } from '../handoverProcess/Details'

type Props = {
  handoverStore: HandoverStore
}

const HandoverBooking = inject(Stores.HandoverStore)(
  observer((props: Props) => {
    // const params = useParams()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')?.replace(' ', '+')
    const navigate = useNavigate()
    React.useEffect(() => {
      props.handoverStore.getHandoverPublicBookingList(token)
    }, [])
    return (
      <div>
        <div className={'lang'} style={{ paddingRight: '15px' }}>
          <LanguageSelect wrapClass="dart-auth-language" type="horizontal" />
        </div>
        <h2 className="my-3">{L('YOUR_UNIT')}</h2>
        {props.handoverStore.isLoading ? (
          <Spin />
        ) : (
          <div style={{ height: '85vh' }}>
            <Row gutter={[16, 16]} className="pb-2">
              {props.handoverStore.handoverPublicBookingList.map((item, index) => {
                return (
                  <Col xs={{ span: 24 }} md={{ span: 12 }} key={index} className="d-flex align-items-center">
                    <Card className="w-100">
                      <Row gutter={[16, 16]}>
                        <Col md={{ span: 5 }} xs={{ span: 24, offset: 0 }}>
                          <img
                            width={'100%'}
                            src={item.unit?.project?.file?.fileUrl}
                            alt="Project Logo"
                            className="rounded-pill"
                          />
                        </Col>
                        <Col md={{ span: 19 }} xs={{ span: 24, offset: 0 }}>
                          <h2 className="text-primary">{item.unit?.fullUnitCode}</h2>
                          {formDataRender(L('UNIT_TYPE'), item.unit?.type?.name)}
                          {formDataRender(L('DESCRIPTION'), item.handoverPlan?.unitTitle)}
                          {item.reservation?.id
                            ? formDataRender(
                                L('HANDOVER_TIME'),
                                `${moment(item.reservation?.fromDate).format(dateTimeFormat)} - ${moment(
                                  item.reservation?.toDate
                                ).format(timeFormat)}`
                              )
                            : formDataRender(
                                L('HANDOVER_PLAN'),
                                `${moment(item.handoverPlan?.fromDate).format(dateFormat)} - ${moment(
                                  item.handoverPlan?.toDate
                                ).format(dateFormat)}`
                              )}
                          {formDataRender(
                            L('STATUS'),
                            item.reservation?.status?.id ? (
                              <button
                                className="pointer"
                                onClick={() => {
                                  const par: any = { idToken: token }
                                  navigate({
                                    pathname: publicLayout.publicHandoverBookingConfirmed.path.replace(
                                      ':id',
                                      item.reservation.id
                                    ),
                                    search: createSearchParams(par).toString()
                                  })
                                }}
                                style={{
                                  borderRadius: '4px',
                                  padding: '4px 6px',
                                  border: 'none',
                                  color: item.reservation?.status?.colorCode,
                                  backgroundColor: item.reservation?.status?.borderColorCode
                                }}>
                                {L(item.reservation?.status?.name)}
                              </button>
                            ) : (
                              <button
                                className="pointer"
                                onClick={() => {
                                  props.handoverStore.handoverPublicUser = item
                                  const par: any = { idToken: token }
                                  navigate({
                                    pathname: publicLayout.publicHandoverBookingConfirmed.path.replace(':id', 'create'),
                                    search: createSearchParams(par).toString()
                                  })
                                }}
                                style={{
                                  borderRadius: '4px',
                                  padding: '6px 8px',
                                  border: 'none',
                                  color: 'whitesmoke',
                                  backgroundColor: '#6ebac4',
                                  boxShadow: 'rgba(0, 0, 0, 0.2) 0px 0px 0px 0px, rgba(0, 0, 0, 0.19) 2px 2px 2px 0px'
                                }}>
                                {L('HANDOVER')}
                              </button>
                            )
                          )}
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </div>
        )}
      </div>
    )
  })
)

export default HandoverBooking
