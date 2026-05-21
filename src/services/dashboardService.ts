import http from '@services/httpService'

class DashboardService {
  public async getProjectDashboard(params): Promise<any> {
    const res = await http.get('api/services/app/StatisticAppServices/GetDashboard', {
      params: { ...params, nameStore: 'SpDashboardResidentByBuilding' }
    })
    return res.data.result
  }
  public async getProject(): Promise<any> {
    const result = await http.get('api/services/app/StatisticAppServices/GetDashboard', {
      params: { nameStore: 'SpDashboardProjectByUser' }
    })
    return result.data.result
  }
  public async getResidentDashboard(params): Promise<any> {
    const res = await http.get('api/services/app/StatisticAppServices/GetDashboard', {
      params: { ...params, nameStore: 'SpDashboardResidentGroupAgeByProject' }
    })
    return res.data.result
  }
  public async getResidentTypeDashboard(params): Promise<any> {
    const result = await http.get('api/services/app/StatisticAppServices/GetDashboard', {
      params: { ...params, nameStore: 'SpDashboardResidentRoleByProject' }
    })
    return result.data.result
  }
  public async getStaffDashboard(params): Promise<any> {
    const result = await http.get('api/services/app/StatisticAppServices/GetDashboard', {
      params: { ...params, nameStore: 'SpDashboardEmployeeRoleByProject' }
    })
    return result.data.result
  }
  public async getJobRequestDashboard(params): Promise<any> {
    const result = await http.get('api/services/app/StatisticAppServices/GetDashboard', {
      params: { ...params, nameStore: 'SpDashboardJobRequestByType' }
    })
    return result.data.result
  }
  public async getJobRequestStatusDashboard(params): Promise<any> {
    const result = await http.get('api/services/app/StatisticAppServices/GetDashboard', {
      params: { ...params, nameStore: 'SpDashboardJobRequestByStatus' }
    })
    return result.data.result
  }
  public async getJobRequestByStaffDashboard(params): Promise<any> {
    const result = await http.get('api/services/app/StatisticAppServices/GetDashboard', {
      params: {
        ...params,
        nameStore: 'SpDashboardJobRequestByPersonIncharge'
      }
    })
    return result.data.result
  }
  public async getJobRequestByRatingDashboard(params): Promise<any> {
    const result = await http.get('api/services/app/StatisticAppServices/GetDashboard', {
      params: {
        ...params,
        nameStore: 'SpDashboardJobRequestRatingByPersonInCharge'
      }
    })
    return result.data.result
  }
  public async getFeedbackTypeDashboard(params): Promise<any> {
    const result = await http.get('api/services/app/StatisticAppServices/GetDashboard', {
      params: { ...params, nameStore: 'SpDashboardFeedbackByType' }
    })
    return result.data.result
  }
  public async getFeedbackStatusDashboard(params): Promise<any> {
    const result = await http.get('api/services/app/StatisticAppServices/GetDashboard', {
      params: { ...params, nameStore: 'SpDashboardFeedbackByStatus' }
    })
    return result.data.result
  }
  public async getFeedbackStaffDashboard(params): Promise<any> {
    const result = await http.get('api/services/app/StatisticAppServices/GetDashboard', {
      params: { ...params, nameStore: 'SpDashboardFeedbackByPersonIncharge' }
    })
    return result.data.result
  }
  public async getFeedbackRatingDashboard(params): Promise<any> {
    const result = await http.get('api/services/app/StatisticAppServices/GetDashboard', {
      params: {
        ...params,
        nameStore: 'SpDashboardFeedbackRatingByPersonInCharge'
      }
    })
    return result.data.result
  }
  public async getBookingDashboard(params): Promise<any> {
    const result = await http.get('api/services/app/StatisticAppServices/GetDashboard', {
      params: {
        ...params,
        nameStore: 'SpDashboardBookingByCategory'
      }
    })
    return result.data.result
  }
  public async getFeeDashboard(params): Promise<any> {
    const result = await http.get('api/services/app/StatisticAppServices/GetDashboard', {
      params: {
        ...params,
        nameStore: 'SpDashboardFeeStatementSummary'
      }
    })
    return result.data.result
  }
}

export default new DashboardService()
