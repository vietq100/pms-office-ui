import { CheckOutlined, EllipsisOutlined, HomeOutlined } from '@ant-design/icons/lib'
import { StatusColors } from '@components/StatusTag'
import { L, LNotification } from '@lib/abpUtility'
import { formatCurrency, renderDate } from '@lib/helper'
import { IFee } from '@models/fee'
import { Dropdown, Menu, Modal, Table } from 'antd'
import './fee-list.less'
import AppConsts, { appPermissions } from '@lib/appconst'
import AppComponentBase from '@components/AppComponentBase'
import { Col, Row } from 'antd/lib/grid'
const { feeTypes, feePaymentStatus } = AppConsts

interface Props {
  feeGroup?: string
  loading?: boolean
  dataSource: IFee[] | undefined
  selectedFeeIds: any[]
  showHideToResident: (fee: IFee) => void
  onChangeStatus: (fee: IFee) => void
  handleEdit: (record) => void
  updateSelectedFees: (feeIds) => void
  collectDeposit: (feeDetail) => void
  refundDeposit: (feeDetail) => void
}

export class FeeImportList extends AppComponentBase<Props, any> {
  handleShowHideToResident = (record: IFee) => () => {
    this.props.showHideToResident(record)
  }

  handleCollectDeposit = (record) => () => {
    this.props.collectDeposit(record)
  }

  handleRefundDeposit = (record) => () => {
    this.props.refundDeposit(record)
  }

  handleChangeStatus = (record) => () => {
    const self = this
    Modal.confirm({
      title: LNotification(
        record.isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'
      ),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk() {
        self.props.onChangeStatus(record)
      }
    })
  }

  handleRowSelect = (selectedFeeIds) => {
    this.setState({ selectedFeeIds })
    this.props.updateSelectedFees(selectedFeeIds)
  }

  gotoEdit = (record) => () => {
    if (this.isGranted(appPermissions.feeStatement.update)) {
      this.props.handleEdit(record)
    }
  }

  render() {
    const { dataSource = [], loading, selectedFeeIds } = this.props
    const rowSelection = {
      selectedRowKeys: selectedFeeIds,
      onChange: this.handleRowSelect
    }

    return (
      <Table
        size={'middle'}
        loading={loading}
        pagination={false}
        columns={this.columns}
        dataSource={dataSource}
        className="custom-ant-table custom-ant-row"
        rowKey={(record: any) => record.id}
        scroll={{ x: 1000, y: 480, scrollToFirstRowOnChange: true }}
        rowSelection={rowSelection}
      />
    )
  }

  columns = [
    {
      title: L(''),
      dataIndex: 'orderId',
      width: '2%',
      render: (text, record) => (
        <>
          {record.isShowToResident ? (
            <CheckOutlined style={{ color: '#438509' }} title={L('FEE_SHOW_TO_RESIDENT')} />
          ) : (
            <> {L('')}</>
          )}
        </>
      )
    },
    {
      title: () => <>{L('FEE_BILL_NUMBER')}</>,
      width: '15%',
      ellipsis: true,
      render: (text, record) => {
        const statusColor = record.isActive ? StatusColors.Active : StatusColors.Inactive
        return (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 20, offset: 0 }} className="col-info">
              <div className="full-name text-truncate text-link-to-detail" onClick={this.gotoEdit(record)}>
                <a className="link-text-table" style={{ color: statusColor }}>
                  {record.id} - {record.billNumber}{' '}
                </a>
                <br />
              </div>
            </Col>
            <Col sm={{ span: 4, offset: 0 }}>
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {/* {this.isGranted(appPermissions.feeStatement.update) && (
                      <Menu.Item onClick={this.handleShowHideToResident(record)}>
                        {record.isShowToResident ? L('FEE_HIDE_TO_RESIDENT') : L('FEE_SHOW_TO_RESIDENT')}
                      </Menu.Item>
                    )} */}
                    {/* {this.isGranted(appPermissions.feeStatement.update) &&
                      record.feePayStatusId !== feePaymentStatus.paid &&
                      record.feeTypeId === feeTypes.bookingDeposit && (
                        <Menu.Item onClick={this.handleCollectDeposit(record)}>{L('COLLECT_DEPOSIT')}</Menu.Item>
                      )} */}
                    {this.isGranted(appPermissions.feeStatement.update) &&
                      record.feePayStatusId === feePaymentStatus.paid &&
                      record.feeTypeId === feeTypes.bookingDeposit && (
                        <Menu.Item onClick={this.handleRefundDeposit(record)}>{L('BTN_REFUND')}</Menu.Item>
                      )}
                    {/* {this.isGranted(appPermissions.feeStatement.delete) && record.isActive && (
                      <Menu.Item onClick={this.handleChangeStatus(record)}>{L('BTN_DEACTIVATE')}</Menu.Item>
                    )} */}
                    <Menu.Item>
                      <a href={`/fee/audit-log/${record.id}`}>{L('FEE_AUDIT')}</a>
                    </Menu.Item>
                  </Menu>
                }
                placement="bottomLeft">
                <button className="button-action-hiden-table-cell">
                  <EllipsisOutlined />
                </button>
              </Dropdown>
            </Col>
          </Row>
        )
      }
    },
    {
      title: L('COMPANY'),
      dataIndex: 'company',
      width: '15%',
      render: (company) => (
        <>
          <Row>
            <Col flex="auto">
              <HomeOutlined /> {company?.companyName}
            </Col>
          </Row>
        </>
      )
    },
    {
      title: () => (
        <>
          {L('FEE_FILTER_PACKAGE')} - {L('FEE_FILTER_TYPE')}
          <br />
          {L('FEE_DESCRIPTION')} <br />
        </>
      ),
      render: (_, record) => (
        <div>
          {record?.package?.name} - {record?.feeType?.name}
          <br />
          <div className="text-truncate-2 small text-muted">{record?.description}</div>
        </div>
      ),
      width: '35%'
    },
    {
      title: () => (
        <>
          {L('FEE_INFORM_DATE')} <br /> {L('FEE_DUE_DATE')}
        </>
      ),
      dataIndex: 'dueDate',
      width: '8%',
      render: (text, record) => (
        <div>
          {renderDate(record.informDate)} <br />
          {renderDate(text)}
        </div>
      )
    },
    {
      title: () => <>{L('FEE_TOTAL_AMOUNT')}</>,
      dataIndex: 'totalAmount',
      width: '10%',
      render: (text) => {
        return (
          <div>
            {formatCurrency(text)} <br />
          </div>
        )
      }
    },
    {
      title: () => (
        <>
          {L('FEE_PAID_AMOUNT')} <br />
          {L('FEE_DEBIT_AMOUNT')}
        </>
      ),
      dataIndex: 'totalAmount',

      render: (text, record) => {
        const paymentStatusColor = record.feePayStatus?.color
        return (
          <>
            <div style={{ color: '#6a6a6a' }}>{formatCurrency(record.totalAmount - record.debitAmount)}</div>
            <div style={{ color: paymentStatusColor }}>{formatCurrency(record.debitAmount)}</div>
          </>
        )
      }
    }
  ]
}
