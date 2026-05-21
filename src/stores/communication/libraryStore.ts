import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import libraryService from '../../services/communication/libraryService'
import fileService from '../../services/common/fileService'
import { initMultiLanguageField, notifySuccess } from '../../lib/helper'
import { moduleFile } from '../../lib/appconst'
import { LNotification } from '@lib/abpUtility'

class LibraryStore {
  @observable isLoading!: boolean
  @observable isLoadingDocument!: boolean
  @observable folders!: PagedResultDto<any>
  @observable documents!: PagedResultDto<any>
  @observable editFolder!: any
  @observable editDocument!: any
  @observable currentDocumentFiles: any = []
  @observable folderOptions: any = []

  constructor() {
    makeObservable(this)
    this.folders = { items: [], totalCount: 0 }
    this.documents = { items: [], totalCount: 0 }
  }

  @action
  async create(body: any) {
    const result = await libraryService.create(body).finally(() => (this.isLoading = false))
    this.folders.items.push(result)
  }

  @action
  async update(updateLibraryInput: any) {
    const result = await libraryService.update(updateLibraryInput).finally(() => (this.isLoading = false))
    this.folders.items = this.folders.items.map((x) => {
      if (x.id === updateLibraryInput.id) x = result
      return x
    })
  }

  @action
  async activateOrDeactivateLibrary(id: number, isActive) {
    await libraryService.activateOrDeactivateLibrary(id, isActive)
    this.folders.items = this.folders.items.filter((x) => x.id !== id)
  }

  @action
  async get(id: number) {
    const result = await libraryService.get(id)
    this.editFolder = result
  }

  @action
  async createLibrary(projectId?) {
    this.editFolder = {
      id: 0,
      names: initMultiLanguageField(),
      projectId,
      buildingIds: [],
      isActive: true
    }
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await libraryService.getAll(params).finally(() => (this.isLoading = false))
    this.folders = result || {}
  }

  @action
  async filterOptions(params: any) {
    const result = await libraryService.getAll(params)
    this.folderOptions = result.items || []
  }

  // Document
  @action
  async createDocument(body: any, files?: any) {
    this.isLoadingDocument = true
    const result = await libraryService.createDocument(body).catch(() => (this.isLoadingDocument = false))
    if (files && files.length) {
      await fileService.upload(moduleFile.library, result.uniqueId, files).catch(() => (this.isLoadingDocument = false))
    }
    this.isLoadingDocument = false
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    this.documents.items.push(result)
  }

  @action
  async updateDocument(updateLibraryInput: any, files) {
    this.isLoadingDocument = true
    const result = await libraryService.updateDocument(updateLibraryInput).catch(() => (this.isLoadingDocument = false))
    if (files && files.length) {
      await fileService.upload(moduleFile.library, result.uniqueId, files).catch(() => (this.isLoadingDocument = false))
    }
    this.isLoadingDocument = false
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
    this.documents.items = this.folders.items.map((x) => {
      if (x.id === updateLibraryInput.id) x = result
      return x
    })
  }

  @action
  async deleteDocument(id: number) {
    await libraryService.deleteDocument(id)
    this.documents.items = this.documents.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivateDocument(id: number, isActive) {
    await libraryService.activateOrDeactivateDocument(id, isActive)
  }

  @action
  async getDocument(id: number) {
    const result = await libraryService.getDocument(id)
    this.editDocument = result
  }

  @action
  async createDocumentObject(projectId?) {
    this.editDocument = {
      id: 0,
      names: initMultiLanguageField(),
      descriptions: initMultiLanguageField(),
      projectId,
      isActive: true
    }
    if (projectId) {
      this.filterOptions({ projectIds: projectId })
    }
  }

  @action
  async getAllDocument(params: any) {
    this.isLoadingDocument = true
    const result = await libraryService.getAllDocument(params).finally(() => (this.isLoadingDocument = false))
    this.documents = result || {}
  }

  @action
  async createDocumentUnitPublic(uniqueId: any, files?: any) {
    this.isLoadingDocument = true

    if (files && files.length) {
      const result = await fileService
        .uploadFileUnitPublic(uniqueId, files)
        .catch(() => (this.isLoadingDocument = false))
      this.documents.items.push(result)
    }
    this.isLoadingDocument = false
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }

  @action
  async createDocumentUnitPrivate(uniqueId: any, files?: any) {
    this.isLoadingDocument = true

    if (files && files.length) {
      const result = await fileService
        .uploadFileUnitPrivate(uniqueId, files)
        .catch(() => (this.isLoadingDocument = false))
      this.documents.items.push(result)
    }
    this.isLoadingDocument = false
    notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
  }
}

export default LibraryStore
