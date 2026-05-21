export interface IAssetTypeModel {
  id?: number
  assetTypeName: string
  isActive: boolean
  sortOrder: number
}

export class AssetTypeModel {
  id?: number
  assetTypeName: string
  isActive: boolean

  constructor() {
    this.id = undefined
    this.assetTypeName = ''
    this.isActive = false
  }

  public static assign(obj) {
    if (!obj) return undefined

    return { ...new AssetTypeModel(), ...obj }
  }

  public static assigns(items): AssetTypeModel[] {
    return items.map((item) => AssetTypeModel.assign(item))
  }
}
