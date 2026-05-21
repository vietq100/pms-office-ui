import ReservationStore from '@stores/booking/reservationStore'
import SessionStore from '@stores/sessionStore'
import PlanMaintenanceStore from '@stores/planMaintenance/planMaintenanceStore'
import PlanMaintenancePipelineStore from '@stores/planMaintenance/planMaintenancePipelineStore'
import TeamStore from '@stores/team/teamStore'

export interface IPlanMaintenanceCalendarProps {
  navigate: any
  routedata?: any
  reservationStore: ReservationStore
  sessionStore: SessionStore
  teamStore: TeamStore
  planMaintenanceStore: PlanMaintenanceStore
  planMaintenancePipelineStore: PlanMaintenancePipelineStore
}
