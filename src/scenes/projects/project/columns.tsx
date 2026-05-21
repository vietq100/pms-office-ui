import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { renderDotActive, renderLogo } from '@lib/helper'
const { align } = AppConsts
const columns = (actionColumn?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '2%',
      align: align.center,
      render: renderDotActive
    },
    {
      title: L('PROJECT_LOGO'),
      dataIndex: 'logoUrl',
      key: 'logoUrl',
      width: '7%',
      render: (logoUrl: string, row) => <div style={{ justifyItems: 'center' }}>{renderLogo(logoUrl, row.name)}</div>
    },
    actionColumn,

    {
      title: L('PROJECT_INVESTOR') + ' - ' + L('PROJECT_LOCATION'),
      dataIndex: 'investorName',
      key: 'investorName',
      render: (text: string, row) => (
        <div>
          {text}
          <div className="text-muted small">{row.address}</div>
        </div>
      )
    }
  ]

  return data
}

export default columns
