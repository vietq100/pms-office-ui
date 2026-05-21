export interface PagedResultDto<T> {
  totalCount: number
  items: T[]
  totalUnit: number
  totalUnitUser: number
}
