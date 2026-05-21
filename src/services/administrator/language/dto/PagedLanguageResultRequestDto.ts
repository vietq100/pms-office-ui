import { PagedFilterAndSortedRequest } from '../../../dto/pagedFilterAndSortedRequest'

export interface PagedLanguageResultRequestDto extends PagedFilterAndSortedRequest {
  keyword: string
}

export interface PagedLanguageTextResultRequestDto extends PagedFilterAndSortedRequest {
  keyword?: string
  sorting?: string
  sourceName?: string
  baseLanguageName?: string
  targetLanguageName?: string
  targetValueFilter?: string
  filterText?: string
}
