import { action, computed, observable, toJS, makeObservable } from 'mobx'

import { TeamModel } from '@models/Team/TeamModel'
import type { PagedResultDto } from '@services/dto/pagedResultDto'
import teamService from '@services/team/teamService'

class TeamStore {
  @observable isLoading!: boolean
  @observable totalCount?: number
  @observable pageResult!: PagedResultDto<TeamModel>
  @observable editTeam: any
  @observable teamOptions: any = []
  @observable usersInTeamOptions: any = []
  @observable usersObservedInTeamOptions: any = []
  @observable teamUser?: any = []
  @observable teamName?: string
  constructor() {
    this.pageResult = { items: [], totalCount: 0 }
    this.editTeam = {}
    this.teamOptions = []
    this.usersInTeamOptions = []
    this.usersObservedInTeamOptions = []
    makeObservable(this)
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    this.pageResult = await teamService.getAll(params).finally(() => (this.isLoading = false))
    // this.teamResult = this.pageResult
  }

  @action
  async filterOptions(params: any) {
    params.maxResultCount = 1000
    params.isActive = true
    params.sorting = 'Name ASC'
    params.assetTypeIds = []
    params.companyIds = []
    params.keyWord = ''
    this.teamOptions = await teamService.filterOptions(params)
  }

  @computed
  get assets() {
    return this.pageResult ? toJS(this.pageResult.items) : []
  }

  @action
  async filterTeamOptions(params: any) {
    if (!params.projectId) {
      this.teamOptions = []
      return
    }
    params.isActive = true
    this.teamOptions = await teamService.filterOptions(params)
  }

  @action
  async createTeamModel() {
    this.editTeam = new TeamModel()
  }

  @action
  async showHideReminder(isShow: boolean) {
    if (!this.editTeam.reminder) {
      this.editTeam.reminder = {
        isActive: true,
        reminderInMinute: 0,
        period: 0,
        userIds: [],
        emails: []
      }
    }
    this.editTeam.reminder.isActive = isShow
  }

  @action
  async filterUsersInTeamOptions(params: any) {
    params.maxResultCount = 1000
    params.isActive = true
    params.sorting = 'Name ASC'
    this.usersInTeamOptions = await teamService.filterUsersInTeamOptions(params)
    this.usersObservedInTeamOptions = this.usersInTeamOptions.filter((item) => item.isObserver)
  }
  @action async getTeamDetail(id) {
    this.teamName = await teamService.getTeamDetail(id)
  }
  @action
  async createTeam(info) {
    await teamService.createTeam(info)
  }
  @action
  async updateTeam(info) {
    await teamService.updateTeam(info)
  }
  @action
  async deactiveTeam(id: number) {
    await teamService.deactiveTeam(id)
  }
  @action
  async activeTeam(id: number) {
    await teamService.activeTeam(id)
  }
  @action
  async getAllUser(params: any) {
    this.isLoading = true
    this.teamUser = await teamService.getAllUser(params).finally(() => (this.isLoading = false))
  }
  @action
  async addMember(info) {
    await teamService.addMember(info)
  }
  @action
  async updateTeamMember(info) {
    await teamService.updateTeamMember(info)
  }
}

export default TeamStore
