import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
const { align } = AppConsts

const columns = () => {
  const data = [
    {
      title: L('UNIT_CODE'),
      dataIndex: 'fullUnitCode',
      key: 'fullUnitCode',
      width: '6%',
      align: align.left,
      ellipsis: true,
      render: (fullUnitCode) => <span className="ml-1">{fullUnitCode}</span>
    },
    {
      title: L('SENT_FEE_NOTIFICATION'),
      children: [
        {
          title: L('TOTAL_COUNT_INAPP'),
          dataIndex: 'totalNotificationByInApp',
          key: 'totalNotificationByInApp',
          width: '5%',
          align: align.right,
          ellipsis: true,
          render: (totalNotificationByInApp) => (totalNotificationByInApp > 0 ? totalNotificationByInApp : '-')
        },
        {
          title: L('TOTAL_COUNT_EMAIL'),
          dataIndex: 'totalNotificationByEmail',
          key: 'totalNotificationByEmail',
          width: '5%',
          align: align.right,
          ellipsis: true,
          render: (totalNotificationByEmail) => (totalNotificationByEmail > 0 ? totalNotificationByEmail : '-')
        }
      ]
    },
    {
      title: L('SENT_FEE_NOTIFICATION_REMINDER_1'),
      children: [
        {
          title: L('TOTAL_COUNT_INAPP'),
          dataIndex: 'totalReminder1ByInApp',
          key: 'totalReminder1ByInApp',
          width: '5%',
          align: align.right,
          ellipsis: true,
          render: (totalReminder1ByInApp) => (totalReminder1ByInApp > 0 ? totalReminder1ByInApp : '-')
        },
        {
          title: L('TOTAL_COUNT_EMAIL'),
          dataIndex: 'totalReminder1ByEmail',
          key: 'totalReminder1ByEmail',
          width: '5%',
          align: align.right,
          ellipsis: true,
          render: (totalReminder1ByEmail) => (totalReminder1ByEmail > 0 ? totalReminder1ByEmail : '-')
        }
      ]
    },
    {
      title: L('SENT_FEE_NOTIFICATION_REMINDER_2'),
      children: [
        {
          title: L('TOTAL_COUNT_INAPP'),
          dataIndex: 'totalReminder2ByInApp',
          key: 'totalReminder2ByInApp',
          width: '5%',
          align: align.right,
          ellipsis: true,
          render: (totalReminder2ByInApp) => (totalReminder2ByInApp > 0 ? totalReminder2ByInApp : '-')
        },
        {
          title: L('TOTAL_COUNT_EMAIL'),
          dataIndex: 'totalReminder2ByEmail',
          key: 'totalReminder2ByEmail',
          width: '5%',
          align: align.right,
          ellipsis: true,
          render: (totalReminder2ByEmail) => (totalReminder2ByEmail > 0 ? totalReminder2ByEmail : '-')
        }
      ]
    },
    {
      title: L('SENT_FEE_NOTIFICATION_STOP_SERVICE'),
      children: [
        {
          title: L('TOTAL_COUNT_INAPP'),
          dataIndex: 'totalStopServiceByInApp',
          key: 'totalStopServiceByInApp',
          width: '5%',
          align: align.right,
          ellipsis: true,
          render: (totalStopServiceByInApp) => (totalStopServiceByInApp > 0 ? totalStopServiceByInApp : '-')
        },
        {
          title: L('TOTAL_COUNT_EMAIL'),
          dataIndex: 'totalStopServiceByEmail',
          key: 'totalStopServiceByEmail',
          width: '5%',
          align: align.right,
          ellipsis: true,
          render: (totalStopServiceByEmail) => (
            <span className="mr-1">{totalStopServiceByEmail > 0 ? totalStopServiceByEmail : '-'}</span>
          )
        }
      ]
    }
  ]

  return data
}

export default columns
