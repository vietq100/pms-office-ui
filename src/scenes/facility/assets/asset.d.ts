import SessionStore from '@stores/sessionStore'

export interface IAssetProps {
  navigate: any
  assetStore: AssetStore
  assetTypeStore: AssetTypeStore
  companyStore: CompanyStore
  fileStore: FileStore
  sessionStore: SessionStore
}

export interface IAssetState {
  maxResultCount: number
  skipCount: number
  newsId?: number
  filter: string
  loading: boolean
  selectedStatus?: string
  projectIds?: Array<number>
  categoryId?: number | string
  currentPage: number
  type: any
  visible: boolean
  selectedItem: any
}

export interface IAssetManagementState {
  tabActiveKey: string
  selectAssetId: number[]
  showAction: boolean
  showPopupQRCode: boolean
}

export enum tabKeys {
  tabAssetList = 'ASSET_TAB_ASSET_LIST',
  tabQRCode = 'ASSET_TAB_PRINT_QR_CODE'
}
