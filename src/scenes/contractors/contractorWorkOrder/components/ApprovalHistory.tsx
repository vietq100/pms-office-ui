import { Table } from 'antd'

import withRouter from '@components/Layout/Router/withRouter'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { AppComponentListBase } from '@components/AppComponentBase'
import { L } from '@lib/abpUtility'

import { renderTag } from '@lib/helper'

export interface IContactProps {
  listHistory: any
}

@inject(Stores.ContractorStore)
@observer
class ApprovalHistory extends AppComponentListBase<IContactProps> {
  public render() {
    const columnsApprovalHistory = [
      {
        title: L('CONTRACTOR_ACTIVITY_CREATION_TIME'),
        dataIndex: 'creationTime',
        key: 'creationTime',
        width: 200,
        ellipsis: true,
        render: (creationTime) => <>{this.renderDate(creationTime)}</>
      },
      {
        title: L('WORK_ORDER_STATUS'),
        dataIndex: 'status',
        key: 'status',
        width: 150,
        render: (status, row) =>
          renderTag(row.status?.name, row.status?.colorCode || 'black', row.status?.borderColorCode || 'white')
      },
      {
        title: L('CONTRACTOR_ACTIVITY_REMARK'),
        dataIndex: 'remarks',
        key: 'remarks',
        width: 150,
        render: (remarks) => <>{remarks}</>
      }
    ]
    return (
      <>
        <Table
          size="middle"
          className="custom-ant-table"
          rowKey={(record) => record.id}
          columns={columnsApprovalHistory}
          pagination={false}
          loading={false}
          dataSource={this.props.listHistory || []}
          scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
        />
      </>
    )
  }
}

export default withRouter(ApprovalHistory)
