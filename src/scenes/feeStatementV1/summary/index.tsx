import { useEffect, useState } from 'react'
import { Card, Col, Row, Spin, Statistic } from 'antd'
import { IPackageFee, ISummaryFee } from '@models/fee'
import feeGroupService from '@services/fee/feeGroupService'
import feeService from '@services/fee/feeService'
import { L } from '@lib/abpUtility'
import { formatCurrency } from '@lib/helper'
import appConsts from '@lib/appconst'
import { StatisticItem } from '@components/Statisitc/StatisticItem'
import { StatisticDetail } from '@models/global'
const { feeSourceGroup } = appConsts

type Props = {
  isFeeGroup: boolean
  filterObject: any
  package?: IPackageFee
  feeGroup?: string
}

const maxResultCount = 20

const emptyItem = {
  totalCount: 0,
  totalAmount: 0
}

const feeStatus = {
  PAID: 2,
  UNPAID: 1
}

function Summary(props: Props) {
  const { isFeeGroup, filterObject, package: _package, feeGroup } = props
  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<ISummaryFee[]>([])

  useEffect(() => {
    if (!feeGroup) return
    const fetchFn =
      feeGroup === feeSourceGroup.feeManagement
        ? isFeeGroup
          ? feeGroupService.summary(getParams(props))
          : feeService.summary(getParams(props))
        : feeGroupService.summaryReservationByFeeTypes(getParams(props))
    fetchFn.then((result) => {
      setData(result)
      setLoading(false)
    })
  }, [filterObject, isFeeGroup, _package, feeGroup])

  const renderFeeSummary = () => {
    const unPaidStatistic = data.find((item) => item.statusId === feeStatus.UNPAID) || emptyItem
    const paidStatistic = data.find((item) => item.statusId === feeStatus.PAID) || emptyItem
    return (
      <Row gutter={16} className={'mb-3'}>
        <Col md={{ span: 12 }}>
          <Card title={L('FEE_UNPAID')}>
            {loading && (
              <div className="flex center-content">
                <Spin />
              </div>
            )}
            {!loading && (
              <Row>
                <Col span={10}>
                  <Statistic
                    title={L('TOTAL_NUMBER')}
                    value={unPaidStatistic.totalCount}
                    valueStyle={{ color: '#f50' }}
                  />
                </Col>
                <Col span={14}>
                  <Statistic
                    title={L('FEE_TOTAL_AMOUNT')}
                    value={formatCurrency(unPaidStatistic.totalAmount)}
                    valueStyle={{ color: '#f50' }}
                  />
                </Col>
              </Row>
            )}
          </Card>
        </Col>
        <Col md={{ span: 12 }}>
          <Card title={L('FEE_PAID')}>
            {loading && (
              <div className="flex center-content">
                <Spin />
              </div>
            )}
            {!loading && (
              <Row>
                <Col span={10}>
                  <Statistic
                    title={L('TOTAL_NUMBER')}
                    value={paidStatistic.totalCount}
                    valueStyle={{ color: '#2db7f5' }}
                  />
                </Col>
                <Col span={14}>
                  <Statistic
                    title={L('FEE_TOTAL_AMOUNT')}
                    value={formatCurrency(paidStatistic.totalAmount)}
                    valueStyle={{ color: '#2db7f5' }}
                  />
                </Col>
              </Row>
            )}
          </Card>
        </Col>
      </Row>
    )
  }

  const renderReservationFeeByFeeType = () => {
    return (
      <Row gutter={16} className={'mb-3'}>
        {(data || []).map((item, index) => {
          const labelPaid = L(`STATISTIC_FEE_RESERVATION_FEE_TYPE_${item.code}_PAID`)
          const labelUnpaid = L(`STATISTIC_FEE_RESERVATION_FEE_TYPE_${item.code}_UNPAID`)
          const labelRefunded = L(`STATISTIC_FEE_RESERVATION_FEE_TYPE_${item.code}_REFUNDED`)
          const detailItems = [new StatisticDetail(item.paid, labelPaid), new StatisticDetail(item.unPaid, labelUnpaid)]
          if (item.code === 'DEP') {
            detailItems.push(new StatisticDetail(item.refund, labelRefunded))
          }
          return (
            <Col span={8} key={index}>
              <StatisticItem
                description={item.name}
                value={item.totalAmount}
                color={item.color || '#fff'}
                statisticDetailItems={detailItems}
              />
            </Col>
          )
        })}
      </Row>
    )
  }

  return feeGroup === feeSourceGroup.feeManagement ? renderFeeSummary() : renderReservationFeeByFeeType()
}

function getParams(props: Props) {
  const { packageId, isShowToResident, isActive, groupName } = props.filterObject
  if (props.isFeeGroup) {
    return {
      maxResultCount,
      projectId: props.filterObject.projectId,
      packageId,
      isShowToResident,
      isActive,
      unitId: props.filterObject.unitId,
      feeStatusId: props.filterObject.feeStatusId,
      groupName
    }
  }

  return {
    maxResultCount,
    projectId: props.filterObject.projectId,
    packageId,
    isShowToResident,
    isActive,
    feeTypeId: props.filterObject.feeTypeId,
    period: props.package?.period,
    year: props.package?.year,
    keyword: props.filterObject.keyword,
    feeStatus: props.filterObject.feeStatus,
    groupName
  }
}

export default Summary
