import withRouter from '@components/Layout/Router/withRouter'
import { L } from '@lib/abpUtility'
import AppConsts, { dateFormat } from '@lib/appconst'
import { FeeTypeEnum, paymentScheduleStatusEnum } from '@lib/enum'
import { calculateDuration, formatNumber, renderDate } from '@lib/helper'
import { generateSchedule } from '@lib/leaseCalculator'
import ContractOfficeStore from '@stores/project/contractOfficeStore'
import Stores from '@stores/storeIdentifier'
import { Button, Card, Col, Dropdown, Form, message, Modal, Row, Table, Tag } from 'antd'
import dayjs from 'dayjs'

import { inject, observer } from 'mobx-react'
import { useEffect, useState } from 'react'

const { align } = AppConsts

export interface IProps {
  detailData?: any
  contractOfficeStore: ContractOfficeStore
  tabActive?: any
  tabKey?: any
  isSync?: boolean
}

const PaymentSchedule = ({ detailData, contractOfficeStore, tabActive, tabKey, isSync }: IProps) => {
  const [form] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)

  const [dataByUnit, setDataByUnit] = useState<Map<number, { rent: any[]; management: any[] }>>(new Map())
  const [dataGeneratedByUnit, setDataGeneratedByUnit] = useState<Map<number, { rent: any[]; management: any[] }>>(
    new Map()
  )
  const [overviewData, setOverviewData] = useState<any>({
    totalAmount: 0,
    paid: 0,
    unpaid: 0
  })

  const getUnitIds = (): number[] => {
    const ids = (detailData?.leaseAgreementUnit ?? []).map((u: any) => u.unitId)
    return [...new Set<number>(ids)]
  }

  useEffect(() => {
    if (tabActive === tabKey && detailData?.id && detailData?.id) getData()
  }, [tabActive, tabKey])

  const getData = async () => {
    await contractOfficeStore.getPaymentSchedule({ leaseAgreementId: detailData.id }).then((res) => {
      const unitIds = getUnitIds()
      const map = new Map<number, { rent: any[]; management: any[] }>()

      unitIds.forEach((unitId) => {
        map.set(unitId, {
          rent: res.filter((d: any) => d.feeTypeId === FeeTypeEnum.rentFee && d.unitId === unitId),
          management: res.filter((d: any) => d.feeTypeId === FeeTypeEnum.managerFee && d.unitId === unitId)
        })
      })

      setDataByUnit(map)

      let totalAmount = 0
      let paid = 0
      let unpaid = 0
      for (const payment of res) {
        if (payment.statusId !== res.cancel) {
          totalAmount = totalAmount + payment.amount
          if (payment.statusId === 2) {
            paid = paid + payment.amount
          } else {
            unpaid = unpaid + payment.amount
          }
        }
      }
      setOverviewData({ totalAmount, paid, unpaid })
    })
  }

  const getLastPaidEndDate = (unitId: number, feeTypeId: FeeTypeEnum): string | undefined => {
    const list = feeTypeId === FeeTypeEnum.rentFee ? dataByUnit.get(unitId)?.rent : dataByUnit.get(unitId)?.management
    if (!list?.length) return undefined
    const paid = list
      .filter((d: any) => d.statusId === 2)
      .sort((a: any, b: any) => dayjs(b.endDate).diff(dayjs(a.endDate)))
    return paid[0]?.endDate
  }

  const getPeriodCount = (items: any[]): number => {
    const periodNums = new Set<string>()
    items.forEach((d) => {
      const parts = (d.name ?? '').split('_')
      if (parts[1]) periodNums.add(parts[1])
    })
    return periodNums.size
  }

  const renamePeriods = (items: any[], offset: number): any[] =>
    items.map((d) => {
      const parts = (d.name ?? '').split('_')
      if (!parts[1]) return d
      const newNum = parseInt(parts[1]) + offset
      const newName = parts[3] ? `PERIOD_${newNum}_PATH_${parts[3]}` : `PERIOD_${newNum}`
      return { ...d, name: newName }
    })

  const generateScheduleByFeeTypeAndUnit = (
    feeTypeId: FeeTypeEnum,
    unitId: number,
    overrideStartDate?: string,
    periodOffset = 0
  ) => {
    const details = (detailData.leaseAgreementDetails ?? []).filter(
      (d: any) => d.feeTypeId === feeTypeId && d.unitId === unitId
    )

    const paymentDateValue = detailData.paymentDate
    const startDate = overrideStartDate ?? detailData.commencementDate

    if (overrideStartDate && !dayjs(overrideStartDate).isBefore(dayjs(detailData.expiryDate))) return []

    const result = generateSchedule(
      details,
      startDate,
      detailData.expiryDate,
      detailData.paymentTerm,
      paymentDateValue,
      unitId
    )
    return periodOffset > 0 ? renamePeriods(result, periodOffset) : result
  }

  const initDataGenerate = async () => {
    if (isSync) {
      message.warning(L('CONTRACT_IS_SYNC_TO_SAP'))
      return
    }

    const unitIds = getUnitIds()
    const newMap = new Map<number, { rent: any[]; management: any[] }>()

    try {
      await Promise.all(
        unitIds.map(async (unitId) => {
          const lastPaidRent = getLastPaidEndDate(unitId, FeeTypeEnum.rentFee)
          const lastPaidMgmt = getLastPaidEndDate(unitId, FeeTypeEnum.managerFee)
          const pastRent = lastPaidRent
            ? (dataByUnit.get(unitId)?.rent ?? [])
                .filter((d: any) => d.statusId === 2)
                .map((d: any) => ({ ...d, isPast: true }))
            : []
          const pastMgmt = lastPaidMgmt
            ? (dataByUnit.get(unitId)?.management ?? [])
                .filter((d: any) => d.statusId === 2)
                .map((d: any) => ({ ...d, isPast: true }))
            : []
          const [rentData, managementData] = await Promise.all([
            generateScheduleByFeeTypeAndUnit(
              FeeTypeEnum.rentFee,
              unitId,
              lastPaidRent ? dayjs(lastPaidRent).add(1, 'day').toISOString() : undefined,
              getPeriodCount(pastRent)
            ),
            generateScheduleByFeeTypeAndUnit(
              FeeTypeEnum.managerFee,
              unitId,
              lastPaidMgmt ? dayjs(lastPaidMgmt).add(1, 'day').toISOString() : undefined,
              getPeriodCount(pastMgmt)
            )
          ])
          newMap.set(unitId, {
            rent: [...pastRent, ...rentData],
            management: [...pastMgmt, ...managementData]
          })
        })
      )
    } catch (e: any) {
      Modal.error({ title: e.message })
      return
    }
    setDataGeneratedByUnit(newMap)
    setModalVisible(true)
  }

  const onGenerate = () => {
    const allData: any[] = []

    dataGeneratedByUnit.forEach((unitData) => {
      ;[...unitData.rent, ...unitData.management].forEach((d) => {
        allData.push({
          leaseAgreementId: detailData.id,
          leaseAgreementDetailId: d.leaseAgreementDetailId,
          feeTypeId: d.feeTypeId,
          feeTypeDetailId: d.feeTypeDetailId,
          unitId: d.unitId,
          startDate: dayjs(d.startDate).endOf('day').toISOString(),
          endDate: dayjs(d.endDate).endOf('day').toISOString(),
          amount: d.amount,
          name: d.name,
          statusId: d.statusId ?? paymentScheduleStatusEnum.unpaid
        })
      })
    })

    contractOfficeStore.createPaymentSchedule(allData).finally(() => {
      getData()
    })
    setModalVisible(false)
  }

  const columns = [
    {
      title: L('PAYMENT_SCHEDULE_PERIOD_NAME'),
      dataIndex: 'name',
      key: 'name',
      width: 100,

      render: (name: any) => {
        const namee = name ?? ''
        const parts = namee.split('_')

        return (
          <strong>
            {parts[1] && L('PERIOD_{0}', parts[1])} {parts[3] && L('PATH_{0}', parts[3])}
          </strong>
        )
      }
    },
    {
      title: L('START_DATE'),
      dataIndex: 'startDate',
      key: 'startDate',
      align: align.center,
      width: 100,
      render: renderDate
    },
    {
      title: L('END_DATE'),
      dataIndex: 'endDate',
      key: 'endDate',
      width: 100,
      align: align.center,
      render: renderDate
    },
    {
      title: L('RENT_MONTHS'),
      dataIndex: 'month',
      align: align.center,
      width: 40,
      key: 'month',
      render: (_, record) => {
        let val: any = ''
        if (record.startDate && record.endDate) {
          const durationTime = calculateDuration(record.startDate, dayjs(record.endDate))

          val = durationTime.months
        }
        return <div className="pl-2">{formatNumber(val)}</div>
      }
    },
    {
      title: L('RENT_DAYS'),
      dataIndex: 'day',
      align: align.center,
      width: 40,
      key: 'day',
      render: (_, record) => {
        let val: any = ''
        if (record.startDate && record.endDate) {
          const durationTime = calculateDuration(record.startDate, dayjs(record.endDate))

          val = durationTime.days
        }
        return <div className="pl-2">{formatNumber(val)}</div>
      }
    },
    {
      title: L('RENT_LA_AMOUNT'),
      dataIndex: 'totalAmount',
      align: align.right,
      width: 100,
      key: 'totalAmount',
      render: (rentWithVat, row) => <strong>{formatNumber(row?.amount)}</strong>
    }
  ]

  const columnsBase = [
    ...columns,
    {
      title: L('STATUS'),
      dataIndex: 'statusId',
      align: align.center,
      key: 'statusId',
      width: 80,

      render: (statusId, row) => (
        <div>
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                { key: paymentScheduleStatusEnum.unpaid, label: L('UNPAID') },
                { key: paymentScheduleStatusEnum.paid, label: L('PAID') },
                { key: paymentScheduleStatusEnum.cancel, label: L('CANCEL') }
              ].filter((item) => item.key !== statusId),
              onClick: async (e) => {
                await contractOfficeStore.updateStatusPaymentSchedule({ id: row.id, statusId: e.key }).finally(() => {
                  getData()
                })
              }
            }}
            placement="bottomLeft">
            <a>
              <Tag color={row?.status?.color}>{row?.status?.name}</Tag>
            </a>
          </Dropdown>
        </div>
      )
    }
  ]
  const { isLoading } = contractOfficeStore
  return (
    <>
      <Row gutter={[8, 8]}>
        <Col sm={{ span: 6 }}>
          <strong>
            {L('PAYMENT_SCHEDULE_TOTAL_AMOUNT')}: {formatNumber(overviewData?.totalAmount)}
          </strong>
        </Col>
        <Col sm={{ span: 6 }}>
          <strong>
            {L('PAYMENT_SCHEDULE_TOTAL_PAID')}: {formatNumber(overviewData?.paid)}
          </strong>
        </Col>
        <Col sm={{ span: 6 }}>
          <strong>
            {L('PAYMENT_SCHEDULE_TOTAL_UNPAID')}: {formatNumber(overviewData?.unpaid)}
          </strong>
        </Col>
        <Col sm={{ span: 6 }} style={{ textAlign: 'right' }}>
          <Button type="primary" onClick={() => initDataGenerate()}>
            {L('GENERATE_PAYMENT')}
          </Button>
        </Col>
        {getUnitIds().map((unitId) => {
          const unitInfo = detailData?.leaseAgreementUnit?.find((u: any) => u.unitId === unitId)
          const unitName = unitInfo?.unit?.name ?? unitInfo?.unitName ?? unitId
          const unitData = dataByUnit.get(unitId)

          return (
            <Col key={unitId} span={24}>
              <Card>
                <div className="mb-2 mt-2 unit-text-hightlight">
                  <strong>{unitName}</strong>
                </div>
                <Row gutter={[8, 8]}>
                  <Col sm={{ span: 12 }}>
                    <div className="mb-2">
                      <strong>{L('RENT_FEE')}</strong>
                    </div>
                    <Table
                      size="small"
                      rowKey={(record, index) => `rent-${unitId}-${index}`}
                      columns={columnsBase}
                      bordered
                      loading={isLoading}
                      pagination={false}
                      dataSource={unitData?.rent ?? []}
                      // rowClassName={(r) => (r.id && r.statusId === paymentScheduleStatusEnum.paid ? 'row-paid' : '')}
                      scroll={{ x: 'max-content' }}
                    />
                  </Col>
                  <Col sm={{ span: 12 }}>
                    <div className="mb-2">
                      <strong>{L('MANAGER_FEE')}</strong>
                    </div>
                    <Table
                      size="small"
                      rowKey={(record, index) => `mgmt-${unitId}-${index}`}
                      columns={columnsBase}
                      bordered
                      loading={isLoading}
                      pagination={false}
                      dataSource={unitData?.management ?? []}
                      // rowClassName={(r) => (r.id && r.statusId === paymentScheduleStatusEnum.paid ? 'row-paid' : '')}
                      scroll={{ x: 'max-content' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          )
        })}
      </Row>
      <Modal
        style={{ top: 20 }}
        title={<strong>{L('GENERATE_PAYMENT')}</strong>}
        open={modalVisible}
        width={'90%'}
        onOk={() => onGenerate()}
        onCancel={() => setModalVisible(false)}
        okText={L('BTN_CREATE')}
        cancelText={L('BTN_CLOSE')}
        closable={false}>
        <Form form={form} layout={'vertical'} size="middle">
          <div className="w-100">
            <Row gutter={[8, 0]} className="mb-2">
              <Col className="pl-4" sm={{ span: 6 }}>
                <strong>
                  {L('PAYMENT_TERM')}:{' '}
                  {AppConsts.contractOfficeTime.find((t) => t.value === detailData.paymentTerm)?.label}
                </strong>
              </Col>
              <Col sm={{ span: 6 }}>
                <strong>
                  {L('COMMENCEMENT_DATE')}:{'  '}
                  {dayjs(detailData.commencementDate).format(dateFormat)}
                </strong>
              </Col>

              <Col sm={{ span: 6 }}>
                <strong>
                  {L('EXPIRY_DATE')}:{'  '}
                  {dayjs(detailData.expiryDate).format(dateFormat)}
                </strong>
              </Col>
            </Row>
            {Array.from(dataGeneratedByUnit.entries()).map(([unitId, unitData]) => {
              const unitInfo = detailData?.leaseAgreementUnit?.find((u: any) => u.unitId === unitId)
              const unitName = unitInfo?.unit?.name ?? unitInfo?.unitName ?? unitId

              return (
                <div key={unitId}>
                  <div className="mb-2 mt-2 unit-text-hightlight">{unitName}</div>
                  <Row gutter={[8, 0]} className="mb-2">
                    <Col sm={{ span: 12 }}>
                      <div>
                        <strong>{L('RENT_FEE')}</strong>
                      </div>
                      <Table
                        size="small"
                        rowKey={(record, index) => `gen-rent-${unitId}-${index}`}
                        columns={columns}
                        bordered
                        pagination={false}
                        dataSource={unitData.rent}
                        rowClassName={(record) => (record.isPast ? 'row-past-paid' : '')}
                      />
                    </Col>
                    <Col sm={{ span: 12 }}>
                      <div>
                        <strong>{L('MANAGER_FEE')}</strong>
                      </div>
                      <Table
                        size="small"
                        rowKey={(record, index) => `gen-mgmt-${unitId}-${index}`}
                        columns={columns}
                        bordered
                        pagination={false}
                        dataSource={unitData.management}
                        rowClassName={(record) => (record.isPast ? 'row-past-paid' : '')}
                      />
                    </Col>
                  </Row>
                </div>
              )
            })}
          </div>
        </Form>
      </Modal>
    </>
  )
}

export default withRouter(inject(Stores.ContractOfficeStore)(observer(PaymentSchedule)))
