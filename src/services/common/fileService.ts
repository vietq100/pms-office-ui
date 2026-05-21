import http from '../httpService'
import { L, LNotification } from '../../lib/abpUtility'
import { notifyError, notifySuccess, prepareLinkQueryString } from '../../lib/helper'
import { FileModel } from '../../models/File'
import { AppConfiguration } from '@lib/appconst'

class FileService {
  public async upload(moduleName, uniqueId, files: any) {
    const data = new FormData()
    ;(files || []).forEach((file, index) => {
      data.append('file' + index, file)
    })

    // data.append('file', files[0])

    const result = await http.post(`api/Documents/Upload${moduleName}`, data, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })
    return result.data.result
  }

  public async uploadImgAnnouncement(uniqueId, formData) {
    const result = await http.post(`api/Documents/UploadFile`, formData, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })
    return result.data.result
  }

  public async uploadOnlineFormAnswer(uniqueId, formData) {
    const result = await http.post(`api/Documents/UploadOnlineFormAnswer`, formData, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })
    return result.data.result
  }

  public async uploadFileUnitPublic(uniqueId, files: any) {
    const data = new FormData()
    ;(files || []).forEach((file, index) => {
      data.append('file' + index, file)
    })

    // data.append('file', files[0])

    const result = await http.post(`api/Documents/UploadUnitPublic`, data, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })
    return result.data.result
  }
  public async uploadFileUnitPrivate(uniqueId, files: any) {
    const data = new FormData()
    ;(files || []).forEach((file, index) => {
      data.append('file' + index, file)
    })

    // data.append('file', files[0])

    const result = await http.post(`api/Documents/UploadUnitPrivate`, data, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })
    return result.data.result
  }

  public async uploadPlanMaintenanceBefore(uniqueId, files: any) {
    const data = new FormData()
    ;(files || []).forEach((file, index) => {
      data.append('file' + index, file)
    })

    // data.append('file', files[0])

    const result = await http.post(`api/Documents/UploadPlanMaintenanceBefore`, data, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })
    return result.data.result
  }

  public async uploadServicePlanDocument(uniqueId, files: any) {
    const data = new FormData()
    ;(files || []).forEach((file, index) => {
      data.append('file' + index, file)
    })

    // data.append('file', files[0])

    const result = await http.post(`api/Documents/UploadServicePlanDocument`, data, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })
    return result.data.result
  }

  public async UploadPlanMaintenanceVideo(uniqueId, files: any) {
    const data = new FormData()
    ;(files || []).forEach((file, index) => {
      data.append('file' + index, file)
    })

    // data.append('file', files[0])

    const result = await http.post(`api/Documents/UploadPlanMaintenanceVideo`, data, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })
    return result.data.result
  }

  public async uploadServicePlanVideo(uniqueId, files: any) {
    const data = new FormData()
    ;(files || []).forEach((file, index) => {
      data.append('file' + index, file)
    })

    // data.append('file', files[0])

    const result = await http.post(`api/Documents/UploadServicePlanVideo`, data, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })
    return result.data.result
  }

  public async UploadPlanMaintenanceAfters(uniqueId, files: any) {
    const data = new FormData()
    ;(files || []).forEach((file, index) => {
      data.append('file' + index, file)
    })

    // data.append('file', files[0])
    const result = await http.post(`api/Documents/UploadPlanMaintenanceAfters`, data, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })

    return result.data.result
  }

  public async uploadServicePlanDocumentDone(uniqueId, files: any) {
    const data = new FormData()
    ;(files || []).forEach((file, index) => {
      data.append('file' + index, file)
    })

    // data.append('file', files[0])
    const result = await http.post(`api/Documents/UploadServicePlanDocumentDone`, data, {
      headers: {
        'content-type': 'multipart/form-data'
      },
      params: { uniqueId }
    })

    return result.data.result
  }

  public async get(uniqueId: string): Promise<FileModel[]> {
    if (!uniqueId) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.get('api/services/app/Documents/GetDocuments', {
      params: { uniqueId }
    })
    const result = res.data.result
    return FileModel.assigns(result || [])
  }

  public async delete(id): Promise<any> {
    if (!id) {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    const res = await http.delete('api/services/app/Documents/Delete', {
      params: { id }
    })
    notifySuccess(LNotification('SUCCESS'), LNotification('DELETE_SUCCESSFULLY'))
    return res.data.result
  }

  public async downloadTempFile({ fileName, fileType, fileToken }) {
    if (!fileName) {
      notifyError(L('ERROR'), L('FILE_NOT_FOUND'))
    }
    if (!fileToken) {
      notifyError(L('ERROR'), L('NOTIFICATION_DOWNLOAD_NEED_FILE_TOKEN'))
    }

    const url = prepareLinkQueryString(
      { fileName, fileType, fileToken },
      AppConfiguration.remoteServiceBaseUrl + 'api/File/DownloadTempFile'
    )

    window.open(url, '_blank')
  }

  public async getAllBanners() {
    const res = await http.get('api/services/app/BannerManagement/GetAll')
    return res.data.result
  }
  public async uploadBanners(fileList: any) {
    const data = new FormData()
    ;(fileList || []).forEach((file, index) => {
      data.append('file' + index, file.originFileObj)
    })
    // data.append('file', files[0])
    const result = await http.post(`api/Documents/UploadBanners`, data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })
    return result.data.result
  }
  public async deleteBanner(id) {
    const res = await http.delete('api/services/app/BannerManagement/Delete', {
      params: { id }
    })
    return res.data.resut
  }

  public async deleteDocument(id) {
    const res = await http.delete('api/services/app/Contractor/DeleteDocument', {
      params: { id }
    })
    return res.data.resut
  }

  public async UploadAnnouncement(files: any) {
    const data = new FormData()
    ;(files || []).forEach((file, index) => {
      data.append('file' + index, file)
    })

    // data.append('file', files[0])
    const result = await http.post(`api/Documents/UploadPlanMaintenanceAfters`, data, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    })

    return result.data.result
  }
}

export default new FileService()
