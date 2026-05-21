import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DataTable from '@components/DataTable'
import { Button, Checkbox, Col, Dropdown, Form, Input, Menu, Modal, Row, Select, Table, Tooltip } from 'antd'
import { convertFilterDate, formatCurrency, notifySuccess } from '@lib/helper'
import ReceiptStore from '@stores/fee/receiptStore'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import debounce from 'lodash/debounce'
import ProjectStore from '@stores/project/projectStore'
import UnitStore from '@stores/project/unitStore'
import { L, LNotification, isGranted } from '@lib/abpUtility'
import { EllipsisOutlined, RollbackOutlined } from '@ant-design/icons/lib'
import AppConst, { appPermissions, dateFormat } from '@lib/appconst'
import DatePicker from 'antd/lib/date-picker'
import FeeStore from '@stores/fee/feeStore'
import PackageFeeStore from '@stores/fee/packageFeeStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import OverViewFee from '@components/DataTable/OverViewFee'
import buildingService from '@services/project/buildingService'
import staffService from '@services/member/staff/staffService'
import { IFeeRefundModel } from '@models/fee'
import FeeRefundModalFrReceipt from '../fee-refund/FeeRefundModalFrReceipt'
import VoucherStore from '@stores/fee/voucherStore'
import { ExcelIcon } from '@components/Icon'
import { validateMessages } from '@lib/validation'
import CashAdvanceStore from '@stores/finance/cashAdvanceStore'
import feeTypeService from '@services/fee/feeTypeService'
import companyService from '@services/project/companyService'

const { formVerticalLayout } = AppConst
const { activeStatus, activeRefundable, pageSize } = AppConst
const { RangePicker } = DatePicker
const { confirm } = Modal

interface Props {
  keyword?: string
  navigate?: any
  projectStore?: ProjectStore
  feeStore?: FeeStore
  receiptStore?: ReceiptStore
  unitStore?: UnitStore
  packageFeeStore?: PackageFeeStore
  voucherStore?: VoucherStore
  cashAdvanceStore?: CashAdvanceStore
}

const defaultFilters = {
  keyword: '',
  projectId: undefined,
  companyId: undefined,
  isActive: true,
  buildingIds: undefined,
  creatorUserId: undefined,
  dateFromTo: undefined,
  feeTypeIds: [] as any
}

const FeeReceipt = observer((props: Props) => {
  const { keyword, navigate, feeStore, receiptStore, unitStore, packageFeeStore, voucherStore, cashAdvanceStore } =
    props
  const maxResultCount = pageSize.pageSize_10
  const [formReceipt] = Form.useForm()

  const [skipCount, setSkipCount] = useState(0)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [companies, setCompanies] = useState<any[]>([])
  const [buildings, setBuildings] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [record, setRecord] = useState<any>([])
  const [refundModalVisible, setRefundModalVisible] = useState(false)
  const [isShowDetailRecept, setIsShowDetailRecept] = useState(false)
  const [listFeeType, setListFeeType] = useState<any[]>([])
  const [filters, setFilters] = useState<any>(defaultFilters)

  const filtersRef = useRef(filters)
  const skipCountRef = useRef(skipCount)

  const getAll = useCallback(async () => {
    await receiptStore!.getAll({
      maxResultCount,
      skipCount: skipCountRef.current,
      ...filtersRef.current
    })
    await receiptStore!.getOverview(filtersRef.current)
  }, [receiptStore])

  const handlePackageFeeSearch = useMemo(
    () =>
      debounce(async (kw) => {
        await packageFeeStore?.filterOption({ keyword: kw })
      }, 100),
    [packageFeeStore]
  )

  const handlCompanySearch = useMemo(
    () =>
      debounce(async () => {
        const data = await companyService.getListCompany()
        setCompanies(data || [])
      }, 100),
    []
  )

  const handBuidlingsSearch = useMemo(
    () =>
      debounce(async (kw) => {
        const data = await buildingService.getAll({ keyword: kw, isActive: true })
        setBuildings(data.items || [])
      }, 100),
    []
  )

  const hanStaffsSearch = useMemo(
    () =>
      debounce(async (kw) => {
        const data = await staffService.getAll({ keyword: kw, isActive: true })
        setUsers(data.items || [])
      }, 100),
    []
  )

  const updateSearch = useMemo(
    () =>
      debounce((name, value) => {
        setFilters((prev) => {
          const next = { ...prev, [name]: value }
          filtersRef.current = next
          return next
        })
      }, 100),
    []
  )

  const getListFeeType = async (kw) => {
    const feeTypes = await feeTypeService.getList({ keyword: kw, isActice: true })
    setListFeeType(feeTypes)
  }

  useEffect(() => {
    const init = async () => {
      if (keyword === '?tabReceipt') {
        filtersRef.current = receiptStore!.filters
        setFilters(receiptStore!.filters)
      }
      await getAll()
      await Promise.all([
        unitStore!.getAll({}),
        handlCompanySearch(),
        getListFeeType(''),
        handBuidlingsSearch(''),
        hanStaffsSearch(''),
        handlePackageFeeSearch(''),
        feeStore!.getPaymentChannels()
      ])
    }
    init()
  }, [])

  const handleSearch = (name, value) => {
    let newFilters: any
    if (name === 'creationDate') {
      receiptStore!.setFilterDate(value)
      newFilters = convertFilterDate(filtersRef.current, value, 'fromCreationDate', 'toCreationDate')
    } else if (name === 'dateFromTo') {
      receiptStore!.setFilterDate(value)
      newFilters = convertFilterDate(filtersRef.current, value)
    } else {
      newFilters = { ...filtersRef.current, [name]: value }
    }
    filtersRef.current = newFilters
    setFilters(newFilters)
    getAll()
  }

  const getReceiptDetail = async (value) => {
    if (value.target.checked === true) {
      await receiptStore!.getDetail(selectedRecord?.id)
      setIsShowDetailRecept(true)
    }
  }

  const handlePagingChange = ({ current }) => {
    const newSkip = --current * maxResultCount
    skipCountRef.current = newSkip
    setSkipCount(newSkip)
    getAll()
  }

  const handleDelete = (rec) => () => {
    formReceipt.setFieldsValue({ IsTransferToCashAdvance: false })
    setSelectedRecord(rec)
    setOpenDeleteDialog(true)
  }

  const closeDeleteDialog = () => {
    formReceipt.resetFields()
    setOpenDeleteDialog(false)
    setIsShowDetailRecept(false)
  }

  const handleConfirmDelete = async () => {
    formReceipt.validateFields().then(async () => {
      const deleteFormData = formReceipt.getFieldsValue() || {}
      const { reasonCancel = '' } = deleteFormData
      const { IsTransferToCashAdvance = false } = deleteFormData
      await receiptStore!.delete({
        id: (selectedRecord as any).id || 0,
        reasonCancel,
        IsTransferToCashAdvance
      })
      notifySuccess(LNotification('SUCCESS'), LNotification(L('ITEM_DELETE_SUCCEED')))
      formReceipt.resetFields()
      setIsShowDetailRecept(false)
      closeDeleteDialog()
    })
  }

  const handleCloseRefundModal = () => {
    setRefundModalVisible(false)
    getAll()
  }

  const handleRefundFee = async (data: IFeeRefundModel) => {
    await feeStore?.refundReceipt(data)
    confirm({
      title: LNotification('DO_YOU_WANT_TO_GO_VOUCHER_DETAIL {0}', feeStore!.voucherDetail.id),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await feeStore?.getDetailVoucher(feeStore!.voucherDetail.id)
        voucherStore!.voucherDetail = feeStore!.voucherDetailFull
        navigate(portalLayouts.feeVoucherDetailV1.path)
      }
    })
    handleCloseRefundModal()
  }

  const handleOpenRefundModal = (rec) => () => {
    setRecord(rec)
    setRefundModalVisible(true)
  }

  const handleViewReceipt = (rec) => {
    receiptStore!.receiptDetail = rec
    receiptStore!.setFilter(filtersRef.current)
    navigate(portalLayouts.feeReceiptDetailV1.path.replace(':id', rec.id))
  }

  const handleDownloadReceipt = () => {
    receiptStore!.downloadReceipt(filtersRef.current)
  }

  const gotoCreateReceipt = () => {
    navigate(portalLayouts.feeCreateReceiptV2.path)
  }

  const renderActionGroups = () => (
    <span>
      {isGranted(appPermissions.feeReceipt.export) && (
        <Button shape="circle" type="primary" className="mr-1" onClick={handleDownloadReceipt} icon={<ExcelIcon />} />
      )}
    </span>
  )

  const columns = getColumns({
    title: L('FEE_RECEIPT_NUMBER'),
    dataIndex: 'receiptNumber',
    ellipsis: true,
    key: 'receiptNumber',
    width: '20%',
    render: (receiptNumber: string, item: any) => (
      <Row style={{ justifyContent: 'space-between' }}>
        <Col sm={{ span: 21, offset: 0 }} className="col-info">
          <div
            className="full-name text-truncate text-link-to-detail"
            onClick={() => isGranted(appPermissions.feeReceipt.detail) && handleViewReceipt(item)}>
            <a className="link-text-table ml-1">
              {item.isRefundable === true ? <RollbackOutlined /> : ''}
              <label> {receiptNumber}</label>
              <br />
            </a>
            <label style={{ fontSize: 10 }}> {item.orderId}</label>
          </div>
        </Col>
        <Col sm={{ span: 3, offset: 0 }}>
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu>
                {isGranted(appPermissions.feeReceipt.refund) && item.isRefundable === true && (
                  <Menu.Item onClick={handleOpenRefundModal(item)}>{L('REFUND_MONEY')}</Menu.Item>
                )}
                {isGranted(appPermissions.feeReceipt.delete) && item.isActive === true && (
                  <Menu.Item onClick={handleDelete(item)}>{L('BTN_RECEIPT_DELETE')}</Menu.Item>
                )}
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
  })

  const { paymentChannels } = feeStore!
  const { packageOptions } = packageFeeStore!

  const filterComponent = (
    <Row gutter={[16, 8]}>
      <Col md={{ span: 6 }} sm={{ span: 24 }}>
        <span>{L('FILTER_KEYWORD')}</span>
        <Input.Search
          defaultValue={keyword ? receiptStore!.filters?.keyword : undefined}
          maxLength={200}
          onSearch={(value) => handleSearch('keyword', value)}
          onChange={(value) => updateSearch('keyword', value.target?.value)}
          placeholder={`${L('FEE_RECEIPT_NUMBER')}, ${L('FEE_RECEIPT_UNIT')}`}
        />
      </Col>
      <Col md={{ span: 4 }} sm={{ span: 24 }} className="full-width">
        <span>{L('FEE_BUILDING')}</span>
        <Select
          showSearch
          allowClear
          filterOption={false}
          className="full-width"
          defaultValue={keyword ? receiptStore!.filters?.buildingIds : undefined}
          onChange={(value) => handleSearch('buildingIds', value)}
          onSearch={handBuidlingsSearch}
          value={filters?.buildingIds}>
          {(buildings || []).map((option: any, index) => (
            <Select.Option key={index} value={option.id}>
              {option.name}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col md={{ span: 4 }} sm={{ span: 24 }} className="full-width">
        <span>{L('COMPANY')}</span>
        <Select
          showSearch
          allowClear
          filterOption={false}
          className="full-width"
          onChange={(value) => handleSearch('companyId', value)}
          defaultValue={keyword ? receiptStore!.filters?.companyId : undefined}
          value={filters?.companyId}>
          {(companies || []).map((option: any, index) => (
            <Select.Option key={index} value={option.id}>
              {option.companyName}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col sm={{ span: 24 }} md={{ span: 4 }}>
        <span>{L('FILTER_FEE_PACKAGE')}</span>
        <Select
          allowClear
          showSearch
          filterOption={false}
          className="full-width"
          defaultValue={keyword ? receiptStore!.filters?.packageId : undefined}
          onChange={(value) => handleSearch('packageId', value)}
          onSearch={handlePackageFeeSearch}>
          {(packageOptions || []).map((item, index) => (
            <Select.Option value={`${item.id}`} key={index}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col sm={{ span: 24 }} md={{ span: 6 }}>
        <span>{L('FILTER_PAYMENT_CHANNEL')}</span>
        <Select
          allowClear
          className="full-width"
          defaultValue={keyword ? receiptStore!.filters?.paymentChanelId : undefined}
          onChange={(value) => handleSearch('paymentChanelId', value)}>
          {(paymentChannels || []).map((item, index) => (
            <Select.Option value={item.id} key={index}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col sm={{ span: 12 }} md={{ span: 3 }}>
        <span>{L('FILTER_ACTIVE_STATUS')}</span>
        <Select
          allowClear
          className="full-width"
          defaultValue={keyword ? receiptStore!.filters?.isActive : L('ACTIVE')}
          onChange={(value) => handleSearch('isActive', value)}>
          {activeStatus.map((status) => (
            <Select.Option value={status.value} key={status.value}>
              {status.label}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col sm={{ span: 12 }} md={{ span: 3 }}>
        <span>{L('FILTER_REFUND')}</span>
        <Select
          allowClear
          className="full-width"
          defaultValue={keyword ? receiptStore!.filters?.isRefundable : undefined}
          onChange={(value) => handleSearch('isRefundable', value)}>
          {activeRefundable.map((Refundable) => (
            <Select.Option value={Refundable.value} key={Refundable.value}>
              {Refundable.label}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col md={{ span: 6 }} sm={{ span: 24 }} className="full-width">
        <span>{L('CREATE_USER')}</span>
        <Select
          showSearch
          allowClear
          filterOption={false}
          className="full-width"
          defaultValue={keyword ? receiptStore!.filters?.creatorUserId : undefined}
          onChange={(value) => handleSearch('creatorUserId', value)}
          onSearch={hanStaffsSearch}
          value={filters?.creatorUserId}>
          {(users || []).map((option: any, index) => (
            <Select.Option key={index} value={option?.id}>
              {option?.displayName}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col sm={{ span: 6, offset: 0 }}>
        <label>{L('FILTER_FROM_TO_DATE_CREATE')}</label>
        <RangePicker
          defaultValue={keyword ? receiptStore!.filterDate : []}
          format={dateFormat}
          onChange={(value) => handleSearch('creationDate', value)}
          className="full-width"
        />
      </Col>
      <Col sm={{ span: 6, offset: 0 }}>
        <label>{L('FILTER_FROM_TO_DATE_RECEIPT')}</label>
        <RangePicker
          defaultValue={keyword ? receiptStore!.filterDate : []}
          format={dateFormat}
          onChange={(value) => handleSearch('dateFromTo', value)}
          className="full-width"
        />
      </Col>
      <Col sm={{ span: 24 }} md={{ span: 6 }}>
        <span>{L('FEE_TYPE')}</span>
        <Select
          allowClear
          showSearch
          filterOption={false}
          mode="multiple"
          className="full-width"
          defaultValue={keyword ? receiptStore!.filters?.feeTypeIds : undefined}
          onSearch={(value) => getListFeeType(value)}
          onChange={(value) => handleSearch('feeTypeIds', value)}>
          {(listFeeType || []).map((item, index) => (
            <Select.Option value={`${item.id}`} key={index}>
              <Tooltip trigger="contextMenu" title={item.name}>
                {item.name}
              </Tooltip>
            </Select.Option>
          ))}
        </Select>
      </Col>
    </Row>
  )

  return (
    <>
      <OverViewFee
        data={receiptStore!.receiptOverview}
        handleClickItem={() => {
          return
        }}
      />
      <div className={'fee-receipt-container'}>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={getAll}
          title={L('FEE_RECEIPT_LIST')}
          onCreate={gotoCreateReceipt}
          pagination={{
            pageSize: maxResultCount,
            total: receiptStore!.pagedResult.totalCount,
            onChange: handlePagingChange
          }}
          createPermission={appPermissions.feeReceipt.create}
          actionGroups={renderActionGroups}>
          <Table
            size={'middle'}
            columns={columns}
            loading={receiptStore!.isLoading}
            dataSource={receiptStore!.pagedResult.items}
            scroll={{ x: 1024, scrollToFirstRowOnChange: true }}
            className="custom-ant-table custom-ant-row"
            pagination={false}
            rowKey={(record: any) => record.id}
          />
        </DataTable>
        <FeeRefundModalFrReceipt
          record={record}
          navigate={navigate}
          feeStore={feeStore}
          cashAdvanceStore={cashAdvanceStore}
          onOk={handleRefundFee}
          visible={refundModalVisible}
          onClose={handleCloseRefundModal}
        />
        <Modal
          maskClosable={false}
          open={openDeleteDialog}
          onOk={handleConfirmDelete}
          cancelText={L('BTN_CANCEL')}
          onCancel={closeDeleteDialog}
          confirmLoading={receiptStore!.isLoading}>
          <Form
            form={formReceipt}
            layout="vertical"
            className={'mt-2'}
            size="middle"
            validateMessages={validateMessages}>
            <Form.Item label={L('REASON_TO_DELETE')} name={'reasonCancel'} rules={[{ required: true }]}>
              <Input.TextArea maxLength={255} />
            </Form.Item>
            <Form.Item name="IsTransferToCashAdvance" valuePropName="checked" {...formVerticalLayout}>
              <Checkbox onChange={(value) => getReceiptDetail(value)}>{L('REFUND_TO _CASH_ADVANCE')}</Checkbox>
            </Form.Item>
          </Form>
          {isShowDetailRecept && (
            <table className="cash-advance-confirm">
              <thead>
                <tr>
                  <th className="text-left">{L('FEE_TYPE')}</th>
                  <th className="text-right">{L('REFUND_AMOUNT')}</th>
                </tr>
              </thead>
              <tbody>
                {receiptStore!.receiptDetail?.feeIncomingDetails.map((item: any, index) => (
                  <tr key={index}>
                    <td>{item.feeDetail?.feeType?.name}</td>
                    <td className="text-right">{formatCurrency(item.paidAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      </div>
    </>
  )
})

export default withRouter(
  inject(
    Stores.FeeStore,
    Stores.ReceiptStore,
    Stores.ProjectStore,
    Stores.UnitStore,
    Stores.PackageFeeStore,
    Stores.VoucherStore,
    Stores.CashAdvanceStore
  )(FeeReceipt)
)
