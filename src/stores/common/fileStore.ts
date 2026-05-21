import { action, observable, makeObservable } from 'mobx'
import fileService from '../../services/common/fileService'
import { FileModel } from '../../models/File'

class FileStore {
  @observable currentFiles: FileModel[] = []

  constructor() {
    makeObservable(this)
  }
  @action
  async getFiles(id?) {
    this.currentFiles = []
    if (!id) {
      return
    }
    const result = await fileService.get(id)
    this.currentFiles = result
    return result
  }

  @action
  async delete(guid) {
    await fileService.delete(guid)
    this.currentFiles = this.currentFiles.filter((item) => item.uid !== guid)
  }
  @action
  async deleteDocument(id) {
    await fileService.deleteDocument(id)
  }
}

export default FileStore
