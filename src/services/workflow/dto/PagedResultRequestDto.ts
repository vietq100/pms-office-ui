import { PagedFilterAndSortedRequest } from '../../dto/pagedFilterAndSortedRequest'

export interface PagedStatusResultRequestDto extends PagedFilterAndSortedRequest {
  keyword: string
}

export interface PagedRoleResultRequestDto extends PagedFilterAndSortedRequest {
  keyword?: string
}

export interface PagedPriorityResultRequestDto extends PagedFilterAndSortedRequest {
  keyword?: string
}

export interface PagedCustomFieldResultRequestDto extends PagedFilterAndSortedRequest {
  keyword?: string
}
