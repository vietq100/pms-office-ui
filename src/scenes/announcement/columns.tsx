import { L } from '@lib/abpUtility'
import { CheckCircleOutlined, CloseCircleOutlined, FlagOutlined, LoadingOutlined } from '@ant-design/icons/lib'
import { renderAvatar, renderDateTime, renderDotActive } from '@lib/helper'
import AppConsts from '@lib/appconst'
import SystemColumn from '@components/DataTable/columns'

const { align, announcementTypesLabel, statusSendMailCode } = AppConsts

export const getAnnouncementUserColumns = (actionColumn?) => {
  const data = [
    {
      title: L('RESIDENT_FULL_NAME'),
      dataIndex: 'displayName',
      key: 'displayName',
      width: 200,
      ellipsis: true,
      render: (displayName, row) => renderAvatar(displayName, row, true, false, false)
    },
    {
      title: L('EMAIL'),
      dataIndex: 'emailAddress',
      key: 'emailAddress',
      width: 150,
      ellipsis: true,
      render: (emailAddress) => <>{emailAddress}</>
    },
    {
      title: L('UNIT_FULL_CODE'),
      dataIndex: 'fullUnitCode',
      key: 'fullUnitCode',
      width: 150,
      ellipsis: true,
      render: (fullUnitCode) => <>{fullUnitCode}</>
    },
    {
      title: L('EXECUTE_TIME'),
      dataIndex: 'executeTime',
      key: 'executeTime',
      width: 150,
      ellipsis: true,
      render: (executeTime) => <>{renderDateTime(executeTime)}</>
    },
    {
      title: L('STATUS_SEND'),
      dataIndex: 'statusCode',
      key: 'statusCode',
      width: 70,
      align: align.center,
      ellipsis: true,
      render: (statusCode) => (
        <>
          {statusCode === null ? (
            <></>
          ) : statusCode === statusSendMailCode.successfully ? (
            <CheckCircleOutlined className="text-success" />
          ) : statusCode === statusSendMailCode.failed ? (
            <CloseCircleOutlined className="text-danger" />
          ) : statusCode === statusSendMailCode.processing ? (
            <LoadingOutlined />
          ) : statusCode === statusSendMailCode.alreadySent ? (
            <CheckCircleOutlined className="text-already-sent" />
          ) : (
            ''
          )}
        </>
      )
    }
  ]

  if (actionColumn) {
    data.push(actionColumn)
  }

  return data
}

const columns = (actionColumn?) => {
  const data = [
    {
      title: L('TITLE_FLAG'),
      dataIndex: 'category',
      key: 'category',
      width: '2%',
      align: align.center,
      render: (category) => <>{category?.id === 5 ? <FlagOutlined style={{ color: '#FFCC00' }} /> : ''}</>
    },
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '2%',
      align: align.center,
      render: renderDotActive
    },
    actionColumn,
    {
      title: L('ANNOUNCEMENT_METHOD'),
      dataIndex: 'campaignType',
      key: 'campaignType',
      ellipsis: true,
      width: '15%',
      render: (campaignType) => announcementTypesLabel.map((item) => item.id === campaignType && <>{item?.label}</>)
    },
    {
      title: L('ANNOUNCEMENT_STATUS'),
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      ellipsis: true,
      render: (status) => <>{L(status)}</>
    },
    {
      title: L('ANNOUNCEMENT_CATEGORY'),
      dataIndex: 'category',
      key: 'category',
      width: '15%',
      render: (category) => <>{category?.name}</>
    },
    // {
    //   title: L('CREATED_AT'),
    //   dataIndex: 'creationTime',
    //   key: 'creationTime',
    //   ellipsis: true,
    //   render: (text, row) => (
    //     <div className="small">
    //       <CalendarOutlined className="mr-1" /> {renderDate(text)} {L('BY')}
    //       {row.creatorUser?.displayName}
    //     </div>
    //   )
    // }
    SystemColumn
  ]

  return data
}

export default columns
