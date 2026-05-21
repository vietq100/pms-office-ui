import PlanMaintenancePipelineStore from '@stores/planMaintenance/planMaintenancePipelineStore'

export interface IPipelineItemProps {
  statusId: number
  pm: any
  planIndex: number
  navigateToDetail: (a) => void
  allowedDropEffect?: string
  onFinishedDrop: (a, b) => void
}

export interface IPipelineDragItem {
  statusId: number
  planIndex: number
  planId: number | undefined
  type: string
}

export interface IPipelineDropResult {
  dropEffect: string
  statusId: number
}

export interface IPipelineContainerProps {
  index: number
  status: any
  listPlanMaintenance: any
  navigateToDetail: (a) => void
  onFinishedDrop: (a, b) => void
  planMaintenancePipelineStore: PlanMaintenancePipelineStore
}
