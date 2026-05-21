import AssetStore from '@stores/facility/assetStore'
import CompanyStore from '@stores/project/companyStore'
import FileStore from '@stores/common/fileStore'
import ProjectStore from '@stores/project/projectStore'
import StaffStore from '@stores/member/staff/staffStore'
import SessionStore from '@stores/sessionStore'
import PlanMaintenanceStore from '@stores/planMaintenance/planMaintenanceStore'

export interface IAssetDetailFormProps {
  params: any
  navigate: any
  assetStore: AssetStore
  assetTypeStore: AssetTypeStore
  companyStore: CompanyStore
  fileStore: FileStore
  staffStore: StaffStore
  projectStore: ProjectStore
  sessionStore: SessionStore
  planMaintenanceStore: PlanMaintenanceStore
}
export interface IAssetDetailFormState {
  isDirty: boolean
  tabActiveKey: string
  files: any[]
  isActiveReminder: boolean
  idDocument: any
}
