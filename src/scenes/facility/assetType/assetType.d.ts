export interface IAssetProps {
  navigate: any
  assetStore: AssetStore
  assetTypeStore: AssetTypeStore
}

export interface IAssetState {
  maxResultCount: number
  skipCount: number
  newsId?: number
  filter: string
  loading: boolean
  selectedStatus?: string
  currentPage: number
  type: any
  visible: boolean
  selectedItem: IAssetTypeModel
}
