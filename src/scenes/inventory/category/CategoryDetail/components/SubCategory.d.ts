export interface SubCategoryItemProps {
  id: number
  text: string
  index: number
  isActive: boolean
  moveCard: (dragIndex: number, hoverIndex: number) => void
  onFinishedDrag: (a, b) => void
  activateOrDeactivate: (a, b) => void
}

export interface ISubCategoryDragItem {
  statusId: number
  planIndex: number
  planId: number | undefined
  type: string
}

export interface ISubCategoryDropResult {
  dropEffect: string
  statusId: number
}

export interface ISubCategoryContainerProps {
  listSubCategory: any
  onUpdateSort: (a) => void
  activateOrDeactivate: (a, b) => void
}
