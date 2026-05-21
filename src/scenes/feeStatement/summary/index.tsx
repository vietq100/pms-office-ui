import { useEffect, useState } from 'react'
import { Card, Col, Row, Spin, Statistic } from 'antd'
import { IPackageFee, ISummaryFee } from '@models/fee'
import feeGroupService from '@services/fee/feeGroupService'
import feeService from '@services/fee/feeService'
import { L } from '@lib/abpUtility'
import { formatCurrency } from '@lib/helper'
import { StatisticItem } from '@components/Statisitc/StatisticItem'
import { StatisticDetail } from '@models/global'
import './style.css'

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
  const [dataAmenity, setDataAmenity] = useState<ISummaryFee[]>([])
  const [dataPaid, setDataPaid] = useState<ISummaryFee[]>([])
  useEffect(() => {
    let fetchDataAmenity
    let fetchDataPaid
    if (isFeeGroup === true) {
      fetchDataPaid = feeGroupService.summary(getParams(props))
      fetchDataAmenity = feeGroupService.summaryReservationByFeeTypes(getParams(props))
    } else {
      fetchDataPaid = feeService.summary(getParams(props))
      fetchDataAmenity = feeGroupService.summaryReservationByFeeTypes(getParams(props))
    }
    fetchDataPaid.then((result) => {
      setDataPaid(result)
      setLoading(false)
    })
    fetchDataAmenity.then((result) => {
      setDataAmenity(result)
      setLoading(false)
    })
  }, [filterObject, isFeeGroup, _package, feeGroup])

  const renderSummary = () => {
    const unPaidStatistic = dataPaid.find((item) => item.statusId === feeStatus.UNPAID) || emptyItem
    const paidStatistic = dataPaid.find((item) => item.statusId === feeStatus.PAID) || emptyItem
    return (
      <>
        <Row gutter={8}>
          {loading && (
            <div className="flex center-content">
              <Spin />
            </div>
          )}
          <Col span={9}>
            <Card
              bodyStyle={{ backgroundColor: 'white' }}
              className="statistic-item round-overview"
              style={{
                boxShadow: 'none',
                backgroundColor: 'white',
                padding: 2
              }}>
              <Row gutter={8}>
                {!loading && (
                  <Col span={9}>
                    <Statistic
                      title={
                        L('FEE_TOTAL_AMOUNT') + L('/ ') + L('FEE_UNPAID') + ' (' + unPaidStatistic.totalCount + ')'
                      }
                      value={formatCurrency(unPaidStatistic.totalAmount)}
                      valueStyle={{ color: '#f50' }}
                    />
                  </Col>
                )}

                {loading && (
                  <div className="flex center-content">
                    <Spin />
                  </div>
                )}
                {!loading && (
                  <Col span={8}>
                    <Statistic
                      title={L('FEE_TOTAL_AMOUNT') + L('/ ') + L('FEE_PAID') + ' (' + paidStatistic.totalCount + ')'}
                      value={formatCurrency(paidStatistic.totalAmount)}
                      valueStyle={{ color: '#2db7f5' }}
                    />
                  </Col>
                )}
                {!loading && (
                  <Col span={7}>
                    <Statistic
                      title={
                        L('TOTAL_AMOUNT_ARISING') + ' (' + (unPaidStatistic.totalCount + paidStatistic.totalCount) + ')'
                      }
                      value={formatCurrency(unPaidStatistic.totalAmount + paidStatistic.totalAmount)}
                      valueStyle={{ color: '#0d5c6e' }}
                    />
                  </Col>
                )}
              </Row>
            </Card>
          </Col>

          {(dataAmenity || []).map((item, index) => {
            const labelPaid = L(`STATISTIC_FEE_RESERVATION_FEE_TYPE_${item.code}_PAID`)
            const labelUnpaid = L(`STATISTIC_FEE_RESERVATION_FEE_TYPE_${item.code}_UNPAID`)
            const labelRefunded = L(`STATISTIC_FEE_RESERVATION_FEE_TYPE_${item.code}_REFUNDED`)
            const detailItems = [
              new StatisticDetail(item.paid, labelPaid),
              new StatisticDetail(item.unPaid, labelUnpaid)
            ]
            if (item.code === 'DEP') {
              detailItems.push(new StatisticDetail(item.refund, labelRefunded))
            }
            return (
              <Col span={5} key={index}>
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
      </>
    )
  }

  return renderSummary()
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
      groupName,
      feeTypeIds: props.filterObject.feeTypeIds,
      amenityId: props.filterObject.amenityId
    }
  }

  return {
    maxResultCount,
    projectId: props.filterObject.projectId,
    packageId,
    isShowToResident,
    isActive,
    unitId: props.filterObject.unitId,
    feeTypeIds: props.filterObject.feeTypeIds,
    period: props.package?.period,
    year: props.package?.year,
    keyword: props.filterObject.keyword,
    feeStatusId: props.filterObject.feeStatusId,
    groupName
  }
}

export default Summary
