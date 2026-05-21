import React from 'react'
import { Checkbox, Table } from 'antd'
import { CustomFieldConfigurationModel } from '../../../../models/Workflow/ConfigurationModels'
import { L } from '../../../../lib/abpUtility'
import AppConsts from '../../../../lib/appconst'
const { align } = AppConsts

interface TableCustomFieldConfigurationProps {
  loading?: boolean
  wfCustomFieldConfig: CustomFieldConfigurationModel
  onChange: (checked, name, statusId, field) => void
}

const TableCustomFieldConfiguration: React.FC<TableCustomFieldConfigurationProps> = ({
  loading,
  wfCustomFieldConfig,
  onChange
}) => {
  const columnProperties: any[] = [
    {
      title: L('WF_CUSTOM_FIELD_NAME'),
      dataIndex: 'customFieldName',
      key: 'customFieldName',
      width: 150,
      fixed: 'left',
      render: (text: string) => <div>{text}</div>
    }
  ]
  ;(wfCustomFieldConfig.status || []).forEach((status) => {
    columnProperties.push({
      title: status.name,
      children: [
        {
          title: L('WF_IS_VISIBLE'),
          dataIndex: 'isVisible',
          key: 'isVisible',
          width: 100,
          align: align.center,
          render: (value, record) => {
            const item = record.items.find((item) => item.statusId === status.id)
            return (
              <>
                <Checkbox
                  checked={item?.isVisible}
                  onChange={(e) => onChange(e.target.checked, record.customFieldId, status.id, 'isVisible')}></Checkbox>
              </>
            )
          }
        },
        {
          title: L('WF_IS_REQUIRED'),
          dataIndex: 'isRequired',
          key: 'isRequired',
          width: 100,
          align: align.center,
          render: (value, record) => {
            const item = record.items.find((item) => item.statusId === status.id)
            return (
              <>
                <Checkbox
                  checked={item?.isRequired}
                  onChange={(e) =>
                    onChange(e.target.checked, record.customFieldId, status.id, 'isRequired')
                  }></Checkbox>
              </>
            )
          }
        },
        {
          title: L('WF_IS_READ_ONLY'),
          dataIndex: 'isReadOnly',
          key: 'isReadOnly',
          width: 100,
          align: align.center,
          render: (value, record) => {
            const item = record.items.find((item) => item.statusId === status.id)
            return (
              <>
                <Checkbox
                  checked={item?.isReadOnly}
                  onChange={(e) =>
                    onChange(e.target.checked, record.customFieldId, status.id, 'isReadOnly')
                  }></Checkbox>
              </>
            )
          }
        }
      ]
    })
  })
  return (
    <Table
      size="middle"
      className="custom-ant-table"
      rowKey={(record) => record.customFieldId}
      columns={columnProperties}
      dataSource={wfCustomFieldConfig.rows || []}
      scroll={{ x: 1300 }}
      pagination={false}
      loading={loading}
    />
  )
}

export default TableCustomFieldConfiguration
