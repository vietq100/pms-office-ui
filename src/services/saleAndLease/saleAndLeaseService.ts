import http from '@services/httpService'

class SaleAndLeaseService {
  public async getAll(params): Promise<any> {
    const res = await http.get('api/services/app/Enquiry/GetAll', { params })
    return res.data.result
  }

  public async getListStatus(): Promise<any> {
    const res = await http.get('api/services/app/Enquiry/GetListStatus')
    return res.data.result
  }

  public async getCurrentListStatus(id): Promise<any> {
    const res = await http.get('api/services/app/Enquiry/GetNextStatus', {
      params: { id }
    })
    return res.data.result
  }
  public async getDetail(id): Promise<any> {
    const res = await http.get('api/services/app/Enquiry/Get', {
      params: { id }
    })
    return res.data.result
  }

  public async create(body): Promise<any> {
    const res = await http.post('api/services/app/Enquiry/Create', body)
    return res.data.result
  }

  public async update(body): Promise<any> {
    const res = await http.put('api/services/app/Enquiry/Update', body)
    return res.data.result
  }

  public async completeEnquiry(id) {
    await http.put('api/services/app/Enquiry/UpdateStatus', {
      enquiryStatusId: 5,
      id
    })
  }

  public async getPhoto(uniqueId) {
    const res = await http.get('api/services/app/Documents/GetDocuments', {
      params: { uniqueId }
    })
    return res.data.result.map((item) => ({ ...item, url: item.fileUrl }))
  }

  public async uploadPhoto(fileList: any[], uniqueId) {
    const data = new FormData()
    fileList
      .filter((item) => !item.id)
      .forEach((file) => {
        const blobFile = new Blob([file.originFileObj], { type: file.type })
        data.append('Enquiry', blobFile, file.name)
      })
    if (data.getAll('Enquiry').length) {
      await http.post(`api/Documents/UploadEnquiries`, data, {
        headers: {
          'content-type': 'multipart/form-data'
        },
        params: { uniqueId }
      })
    }
  }

  public async getNotificationSetting(params): Promise<any> {
    const res = await http.get('api/services/app/Enquiry/GetUserNotificationSettings', { params })
    return res.data.result
  }

  public async updateNotificationSetting(body): Promise<any> {
    const res = await http.put('api/services/app/Enquiry/UpdateUserNotificationSettings', body)
    return res.data.result
  }
  public async getOverview(params: any): Promise<any> {
    const result = await http.get('api/services/app/Enquiry/GetOverviewEnquiry', {
      params
    })
    return result.data.result
  }
}

export default new SaleAndLeaseService()
