import React from 'react'
import AppComponentBase from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { Button, Col, Input, Row, Table } from 'antd'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import '@scenes/feeStatement/receipt/components/receipt.less'
import { FormInstance } from 'antd/es/form'
import AppConst, { appPermissions } from '@lib/appconst'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import { ExcelIcon } from '@components/Icon'
import MeterReadingStore from '@stores/meterReading/meterReadingStore'

const { pageSize } = AppConst

interface State {
  skipCount: number
}

interface Props {
  navigate: any
  meterReadingStore: MeterReadingStore
}

@inject(Stores.MeterReadingStore)
@observer
class MeterReadingElectricHistory extends AppComponentBase<Props, State> {
  maxResultCount = pageSize.pageSize_10
  deleteFrom = React.createRef<FormInstance>()
  state = {
    skipCount: 0
  }
  //   async componentDidMount() {
  //     await Promise.all([
  //       this.getAll(),
  //       this.props.meterReadingStore.getAll({}),

  //     ])
  //   }

  //   handleSearch = (name, value) => {
  //     const { filters } = this.state
  //     if (name === 'dateFromTo') {
  //       this.setState(
  //         { filters: convertFilterDate(filters, value) },
  //         async () => {
  //           if (name === 'projectId') {
  //             this.handleUnitSearch('')
  //           }
  //           await this.getAll()
  //         }
  //       )
  //     } else {
  //       this.setState({ filters: { ...filters, [name]: value } }, async () => {
  //         if (name === 'projectId') {
  //           this.handleUnitSearch('')
  //         }
  //         await this.getAll()
  //       })
  //     }
  //   }

  //   handleUnitSearch = debounce(async (keyword) => {
  //     const data = await unitService.getAll({ keyword, isActive: true })
  //     this.setState({ units: data.items || [] })
  //   }, 100)

  renderActionGroups = () => {
    return (
      <span className="mr-2">
        {/* TODO:thieu permission */}
        {/* {this.isGranted(appPermissions.workOrder.export) && ( */}
        <Button
          shape="circle"
          type="primary"
          className="pt-1 mx-2"
          // onClick={this.handleDownloadReceipt}
          icon={
            // <span className="btn-icon">
            <ExcelIcon />
            // </span>
          }>
          {/* {L('EXPORT_EXCEL')} */}
        </Button>
        {/* )} */}
      </span>
    )
  }

  render() {
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col md={{ span: 6 }} sm={{ span: 24 }}>
          <span>{this.L('FILTER_KEYWORD')}</span>
          <Input.Search
            // onSearch={(value) => this.handleSearch('keyword', value)}
            placeholder={`${this.L('UNIT')}, ${this.L('CLOCK_CODE')}`}
          />
        </Col>

        {/* <Col sm={{ span: 24 }} md={{ span: 6 }}>
          <span>{this.L('FILTER_PAYMENT_CHANNEL')}</span>
          <Select
            allowClear
            style={{ width: '100%' }}
            // onChange={(value) => this.handleSearch('paymentChanelId', value)}
          >
            {[].map((item, index) => (
              <Select.Option
                //   value={item.id}
                key={index}>
                {/* {item.name} */}
        {/* </Select.Option>
            ))}
          </Select>
        </Col> */}
      </Row>
    )
    return (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          //   onRefresh={this.getAll}
          title={this.L('FEE_RECEIPT_LIST')}
          //   onCreate={this.gotoCreateReceipt}
          //   pagination={{
          //     pageSize: this.maxResultCount,
          //     total: this.props.receiptStore.pagedResult.totalCount,
          //     onChange: this.handlePagingChange
          //   }}
          createPermission={appPermissions.feeReceipt.create}
          actionGroups={this.renderActionGroups}>
          <Table
            size={'middle'}
            columns={this.columns}
            // loading={this.props.receiptStore.isLoading}
            dataSource={[]}
            scroll={{ x: 1024, scrollToFirstRowOnChange: true }}
            className="custom-ant-table custom-ant-row"
            pagination={false}
            rowKey={(record: any) => record.id}
          />
        </DataTable>
      </>
    )
  }

  columns = getColumns()
}

export default withRouter(MeterReadingElectricHistory)
