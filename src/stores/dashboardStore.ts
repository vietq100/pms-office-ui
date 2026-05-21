import dashboardService from '@services/dashboardService'
import { action, observable, makeObservable } from 'mobx'

class DashboardStore {
  @observable isLoading!: boolean
  @observable projectOption: any[] = []
  @observable projectDashboardData: any[] = []
  @observable residentTypeDashboardData: any[] = []
  @observable residentDashboardData: any[] = []
  @observable staffDashboardData: any[] = []
  @observable jobRequestDashboardData: any[] = []
  @observable jobRequestStatusDashboardData: any[] = []
  @observable jobRequestByStaffDashboardData: any[] = []
  @observable jobRequestByRatingDashboardData: any[] = []
  @observable feedbackTypeDashboardData: any[] = []
  @observable feedbackStatusDashboardData: any[] = []
  @observable feedbackStaffDashboardData: any[] = []
  @observable feedbackRatingDashboardData: any[] = []
  @observable bookingDashboardData: any[] = []
  @observable feeDashboardData: any[] = []

  constructor() {
    makeObservable(this)
  }

  @action public setLoading(loading) {
    this.isLoading = loading
  }

  @action public async getMyProject() {
    this.isLoading = true
    const res = await dashboardService.getProject().finally(() => (this.isLoading = false))
    this.projectOption = res.map((i) => ({
      id: i.ProjectId,
      label: i.ProjectName
    }))

    return this.projectOption
  }

  @action public async getProjectDashboard(params) {
    this.isLoading = true
    const res = await dashboardService.getProjectDashboard(params).finally(() => (this.isLoading = false))
    this.projectDashboardData = res
    return res
  }
  @action public async getResidentDashboard(params) {
    this.isLoading = true
    const res = await dashboardService.getResidentDashboard(params).finally(() => (this.isLoading = false))
    const parseKey = [...new Set(res.map((item) => item.GroupAge))]
    const parseData: any[] = []
    parseKey.forEach((key) => {
      const female = res.find((item) => item.Gender === 'Famale' && item.GroupAge === key)
      const male = res.find((item) => item.Gender === 'Male' && item.GroupAge === key)
      return parseData.push({
        groupAge: key,
        male: male?.TotalCount ?? 0,
        female: female?.TotalCount ?? 0
      })
    })
    this.residentDashboardData = parseData
    return parseData
  }
  @action public async getResidentTypeDashboard(params) {
    this.isLoading = true
    const res = await dashboardService.getResidentTypeDashboard(params).finally(() => (this.isLoading = false))
    this.residentTypeDashboardData = res
    return res
  }
  @action public async getStaffDashboard(params) {
    this.isLoading = true
    const res = await dashboardService.getStaffDashboard(params).finally(() => (this.isLoading = false))
    this.staffDashboardData = res
    return res
  }
  @action public async getJobRequestDashboard(params) {
    this.isLoading = true
    const res = await dashboardService.getJobRequestDashboard(params).finally(() => (this.isLoading = false))
    this.jobRequestDashboardData = res
    return res
  }
  @action public async getJobRequestStatusDashboard(params) {
    this.isLoading = true
    const res = await dashboardService.getJobRequestStatusDashboard(params).finally(() => (this.isLoading = false))
    this.jobRequestStatusDashboardData = res
    return res
  }
  @action public async getJobRequestByStaffDashboard(params) {
    this.isLoading = true
    const res = await dashboardService.getJobRequestByStaffDashboard(params).finally(() => (this.isLoading = false))
    const parseKey = [...new Set(res.map((item) => item.DisplayName))]
    const parseData: any[] = []
    parseKey.forEach((key) => {
      const data = res.filter((i) => i.DisplayName === key)
      const returnItem = {
        staff: key,
        new: data.find((i) => i.StatusId === 4)?.TotalCount ?? 0,
        inProgress: data.find((i) => i.StatusId === 5)?.TotalCount ?? 0,
        completed: data.find((i) => i.StatusId === 6)?.TotalCount ?? 0,
        closed: data.find((i) => i.StatusName === 'Closed')?.TotalCount ?? 0,
        cancelled: data.find((i) => i.StatusId === 9)?.TotalCount ?? 0
      }
      return parseData.push(returnItem)
    })
    this.jobRequestByStaffDashboardData = parseData
    return parseData
  }

  @action public async getJobRequestByRatingDashboard(params) {
    this.isLoading = true
    const res = await dashboardService.getJobRequestByRatingDashboard(params).finally(() => (this.isLoading = false))
    const parseKey = [...new Set(res.map((item) => item.DisplayName))]
    const parseData: any[] = []
    parseKey.forEach((key) => {
      const data = res.filter((i) => i.DisplayName === key)
      const returnItem = {
        staff: key,
        one: data.find((i) => i.Rate === 1)?.TotalCount ?? 0,
        two: data.find((i) => i.Rate === 2)?.TotalCount ?? 0,
        three: data.find((i) => i.Rate === 3)?.TotalCount ?? 0,
        four: data.find((i) => i.Rate === 4)?.TotalCount ?? 0,
        five: data.find((i) => i.Rate === 5)?.TotalCount ?? 0
      }
      return parseData.push(returnItem)
    })
    this.jobRequestByRatingDashboardData = parseData
    return parseData
  }
  @action public async getFeedbackTypeDashboard(params) {
    this.isLoading = true
    const res = await dashboardService.getFeedbackTypeDashboard(params).finally(() => (this.isLoading = false))
    this.feedbackTypeDashboardData = res
    return res
  }
  @action public async getFeedbackStatusDashboard(params) {
    this.isLoading = true
    const res = await dashboardService.getFeedbackStatusDashboard(params).finally(() => (this.isLoading = false))
    this.feedbackStatusDashboardData = res
    return res
  }
  @action public async getFeedbackStaffDashboard(params) {
    this.isLoading = true
    const res = await dashboardService.getFeedbackStaffDashboard(params).finally(() => (this.isLoading = false))
    const parseKey = [...new Set(res.map((item) => item.DisplayName))]
    const parseData: any[] = []
    parseKey.forEach((key) => {
      const data = res.filter((i) => i.DisplayName === key)
      const returnItem = {
        staff: key,
        new: data.find((i) => i.StatusName === 'New')?.TotalCount ?? 0,
        inProgress: data.find((i) => i.StatusName === 'In Progress')?.TotalCount ?? 0,
        completed: data.find((i) => i.StatusName === 'Completed')?.TotalCount ?? 0,
        closed: data.find((i) => i.StatusName === 'Closed')?.TotalCount ?? 0,
        cancelled: data.find((i) => i.StatusName === 'Cancelled')?.TotalCount ?? 0
      }
      return parseData.push(returnItem)
    })
    this.feedbackStaffDashboardData = parseData
    return parseData
  }
  @action public async getFeedbackRatingDashboard(params) {
    this.isLoading = true
    const res = await dashboardService.getFeedbackRatingDashboard(params).finally(() => (this.isLoading = false))
    const parseKey = [...new Set(res.map((item) => item.DisplayName))]
    const parseData: any[] = []
    parseKey.forEach((key) => {
      const data = res.filter((i) => i.DisplayName === key)
      const returnItem = {
        staff: key,
        one: data.find((i) => i.Rate === 1)?.TotalCount ?? 0,
        two: data.find((i) => i.Rate === 2)?.TotalCount ?? 0,
        three: data.find((i) => i.Rate === 3)?.TotalCount ?? 0,
        four: data.find((i) => i.Rate === 4)?.TotalCount ?? 0,
        five: data.find((i) => i.Rate === 5)?.TotalCount ?? 0
      }
      return parseData.push(returnItem)
    })
    this.feedbackRatingDashboardData = parseData
    return parseData
  }
  @action public async getBookingDashboard(params) {
    this.isLoading = true
    const res = await dashboardService.getBookingDashboard(params).finally(() => (this.isLoading = false))
    const parseKey = [...new Set(res.map((item) => item.AmentityName))]
    const parseData: any[] = []
    parseKey.forEach((key) => {
      const data = res.filter((i) => i.AmentityName === key)
      const returnItem = {
        amentity: key,
        requested: data.find((i) => i.Code === 'REQUESTED')?.TotalCount ?? 0,
        approved: data.find((i) => i.Code === 'APPROVED')?.TotalCount ?? 0,
        declined: data.find((i) => i.Code === 'DECLINED')?.TotalCount ?? 0,
        cancelled: data.find((i) => i.Code === 'CANCELLED')?.TotalCount ?? 0
      }
      return parseData.push(returnItem)
    })
    this.bookingDashboardData = parseData
    return parseData
  }
  @action public async getFeeDashboard(params) {
    this.isLoading = true
    const res = await dashboardService.getFeeDashboard(params).finally(() => (this.isLoading = false))
    this.feeDashboardData = res
    return res
  }
}
export default DashboardStore
