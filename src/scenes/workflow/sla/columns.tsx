import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import moment from 'moment'

const { align } = AppConsts
export const columns = [
  {
    title: L('ID'),
    dataIndex: 'parentId',
    key: 'parentId',
    width: '2%',
    ellipsis: true,
    render: (id) => <>{id}</>
  },
  {
    title: L('STATUS'),
    dataIndex: 'status',
    key: 'status',
    width: '10%',
    ellipsis: true,
    align: align.center,
    render: (status) => <>{status.name}</>
  },
  {
    title: L('ASSIGNEE'),
    dataIndex: 'currentAssignedUser',
    key: 'currentAssignedUser',
    width: '15%',
    align: align.center,
    render: (currentAssignedUser) => <>{currentAssignedUser?.displayName}</>
  },

  {
    title: L('OBSERVER'),
    dataIndex: 'currentObserverUser',
    key: 'currentObserverUser',
    width: '15%',
    align: align.center,
    render: (currentObserverUser) => <>{currentObserverUser?.displayName}</>
  },
  {
    title: L('PLANNED_START_END_DATE'),
    dataIndex: 'currentStartDate',
    key: 'currentStartDate',
    width: '10%',
    ellipsis: true,
    align: align.center,
    render: (currentStartDate) => <>{moment(currentStartDate).format('DD-MM-YYYY')}</>
  },
  {
    title: L('DESCRIPTION'),
    dataIndex: 'description',
    key: 'description',
    width: '10%',
    ellipsis: true,
    render: (description) => <>{description}</>
  },
  {
    title: L('LATE'),
    dataIndex: 'violateTime',
    key: 'violateTime',
    width: '10%',
    ellipsis: true,
    align: align.center,
    render: (violateTime) => <>{violateTime}</>
  }
]
