import { EditableCell } from '@components/DataTableV2/EditableCell'
import { L } from '@lib/abpUtility'
import { validateMessages } from '@lib/validation'
import { Button, Card, Col, Form, FormInstance, Table } from 'antd'

interface IFeeTableSectionProps {
  unitId: number
  unitName: string
  itemRents: any[]
  columnsRentFee: any[]
  formRentFee: FormInstance
  visibleActionRent: boolean
  rentWarnings: string[]
  onAddRentRow: () => void
  itemManagements: any[]
  columnsManagementFee: any[]
  formManagementFee: FormInstance
  visibleActionMgmt: boolean
  mgmtWarnings: string[]
  onAddMgmtRow: () => void
  isSyncSap?: boolean
}

const FeeTableSection = ({
  unitId,
  unitName,
  itemRents,
  columnsRentFee,
  formRentFee,
  visibleActionRent,
  rentWarnings,
  onAddRentRow,
  itemManagements,
  columnsManagementFee,
  formManagementFee,
  visibleActionMgmt,
  mgmtWarnings,
  onAddMgmtRow,
  isSyncSap
}: IFeeTableSectionProps) => {
  return (
    <Col sm={{ span: 24, offset: 0 }} className="mt-2">
      <Card>
        <div className="unit-text-hightlight mt-1">{unitName}</div>

        <div className="title-detail">{L('RENT_FEE')}</div>
        <Form form={formRentFee} layout="vertical" size="middle" validateMessages={validateMessages}>
          <Table
            pagination={false}
            size="small"
            components={{ body: { cell: EditableCell } }}
            bordered
            dataSource={itemRents.filter((r) => r.unitId === unitId)}
            columns={columnsRentFee}
            rowKey={(record) => record.id}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </Form>
        {rentWarnings.length > 0 && (
          <div style={{ marginTop: 4, marginBottom: 4 }}>
            {rentWarnings.map((w, i) => (
              <div key={i} className="warning-fee-table-items">
                ⚠️ {w}
              </div>
            ))}
          </div>
        )}
        {!isSyncSap && (
          <Button className="mt-1" onClick={onAddRentRow} disabled={visibleActionRent}>
            {L('ADD_NEW_ROW')}
          </Button>
        )}

        <div className="title-detail mt-2">{L('FEE_TYPE_CONFIG_MANAGEMENT')}</div>
        <Form form={formManagementFee} layout="vertical" size="middle" validateMessages={validateMessages}>
          <Table
            pagination={false}
            size="small"
            components={{ body: { cell: EditableCell } }}
            bordered
            dataSource={itemManagements.filter((r) => r.unitId === unitId)}
            columns={columnsManagementFee}
            rowKey={(record) => record.id}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </Form>
        {mgmtWarnings.length > 0 && (
          <div style={{ marginTop: 4, marginBottom: 4 }}>
            {mgmtWarnings.map((w, i) => (
              <div key={i} className="warning-fee-table-items">
                ⚠️ {w}
              </div>
            ))}
          </div>
        )}
        {!isSyncSap && (
          <Button className="mt-1" onClick={onAddMgmtRow} disabled={visibleActionMgmt}>
            {L('ADD_NEW_ROW')}
          </Button>
        )}
      </Card>
    </Col>
  )
}

export default FeeTableSection
