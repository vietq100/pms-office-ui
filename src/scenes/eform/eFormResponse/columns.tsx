import { L } from '@lib/abpUtility'
import AppConst, { EFORM_PUBLISH_STATUS } from '@lib/appconst'
import { renderDateTime, renderDotActive } from '@lib/helper'
const { align } = AppConst
const colors = {
  publish: 'green',
  unpublish: '#C67484'
}
const columns = (actionColumn?) => {
  const data = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '3%',
      align: align.center,
      render: renderDotActive
    },
    actionColumn,
    {
      title: L('EFORM_NAME'),
      dataIndex: 'formName',
      key: 'formName',
      width: '30%',
      render: (formName, row) => (
        <>
          {formName}
          <div className="text-muted small">
            {row.formGroupName}{' '}
            {row.status && (
              <span>
                - {''}
                <span
                  style={{
                    color: row.status.code === EFORM_PUBLISH_STATUS.PUBLISHED ? colors.publish : colors.unpublish
                  }}>
                  {row.status?.name}
                </span>
              </span>
            )}
          </div>
        </>
      )
    },
    {
      title: L('EFORM_SUBMIT_STATUS'),
      dataIndex: 'submitStatus',
      key: 'submitStatus',
      width: '11%',
      render: (submitStatus) => <div>{submitStatus?.name}</div>
    },

    {
      title: L('LAST_UPDATE_INFORMATION'),
      dataIndex: 'lastModificationTime',
      key: 'lastModificationTime',
      render: (lastModificationTime, row) => {
        return (
          <div>
            <div className="text-muted small">
              {L('CREATION_TIME')} : {renderDateTime(row.creationTime)}
            </div>
            <div className="text-muted small">
              {L('LAST_UPDATE_TIME')} : {renderDateTime(lastModificationTime)}
            </div>
          </div>
        )
      }
    }
  ]

  return data
}

export default columns
