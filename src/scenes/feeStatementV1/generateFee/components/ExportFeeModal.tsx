import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import FeeGenerateStore from '@stores/fee/feeGenerateStore'
import Stores from '@stores/storeIdentifier'
import { Button, Modal, Table } from 'antd'
import { inject, observer } from 'mobx-react'
import { useEffect, useRef } from 'react'
import ReactToPrint from 'react-to-print'
import { columnsFeeManagement, columnsFeeRent, columnsOvertimeElectric } from './columnPdf'
import { formatNumber } from '@lib/helper'

type Props = {
  id: number
  generateType: number
  listCompany: any[]
  visible: boolean
  filters: any
  onCancel: () => void
  feeGenerateStore: FeeGenerateStore
}

const { generateType } = AppConsts

const ExportFeeModal = inject(
  Stores.FeeGenerateStore,
  Stores.FeeStore
)(
  observer((props: Props) => {
    const printRef = useRef<HTMLDivElement>(null)
    const filterSelectedCompanies = props.listCompany.filter((item) =>
      Array.isArray(props.filters.companyIds) ? props.filters.companyIds.includes(item.id) : false
    )

    const pageStyle = `
      @page {
        size: A4 portrait;
        margin: 2mm !important;
      }
      body {
        font-size: 10px;
        padding: 0 !important;
        margin: 0 !important;
      }
      /* disable scrollbars in print */
      .ant-table-body {
        overflow: visible !important;
      }
      .ant-table-content {
        overflow: visible !important;
      }
    `

    const columns = () => {
      switch (props.generateType) {
        case generateType.OvertimeElectricity:
          return columnsOvertimeElectric()
        case generateType.rent:
          return columnsFeeRent()
        case generateType.management:
          return columnsFeeManagement()
        default:
          return []
      }
    }

    const getAll = async () => {
      await props.feeGenerateStore.GetListDetail({
        FeeGenerateId: props.id,
        maxResultCount: 10,
        skipCount: 0,
        ...props.filters
      })
    }

    useEffect(() => {
      getAll()
    }, [props.visible])

    return (
      <Modal
        destroyOnClose
        style={{ minWidth: '50%' }}
        title={L('BTN_PRINT_PDF')}
        open={props.visible}
        okText={L('BTN_SAVE')}
        cancelText={L('BTN_CANCEL')}
        onCancel={props.onCancel}
        footer={[
          <>
            <Button onClick={props.onCancel}>{L('BTN_CANCEL')}</Button>

            <ReactToPrint
              removeAfterPrint
              documentTitle="overtime-electricity-fee-report"
              content={() => printRef.current}
              trigger={() => (
                <Button type="primary" shape="round">
                  {L('BTN_PRINT_PDF')}
                </Button>
              )}
              pageStyle={pageStyle}
            />
          </>
        ]}
        maskClosable={false}>
        <div ref={printRef}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ width: '50%' }}>
              {L('COMPANY_NAME')}: <strong>{filterSelectedCompanies.map((c) => c.name).join(', ')}</strong>
            </span>
            <span>
              {L('TOTAL_PRICE')} (VAT):{' '}
              <strong>{formatNumber(props.feeGenerateStore?.pagedBatchResultPdf?.totalAmountIncludeVAT || 0)}</strong>
            </span>
          </div>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            columns={columns()}
            loading={props.feeGenerateStore.isLoading}
            rowKey={(record) => record.id}
            scroll={{ x: 'max-content' }}
            pagination={false}
            dataSource={props.feeGenerateStore?.pagedBatchResultPdf?.items || []}
          />
        </div>
      </Modal>
    )
  })
)

export default ExportFeeModal
