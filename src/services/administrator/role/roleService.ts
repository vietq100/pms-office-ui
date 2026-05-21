import { CreateRoleInput } from './dto/createRoleInput'
import { CreateRoleOutput } from './dto/createRoleOutput'
import { EntityDto } from '../../dto/entityDto'
import { GetAllRoleOutput } from './dto/getAllRoleOutput'
import { GetRoleAsyncInput } from './dto/getRolesAsyncInput'
import GetRoleAsyncOutput from './dto/getRoleAsyncOutput'
import { GetRoleForEditOutput } from './dto/getRoleForEditOutput'
import type { PagedResultDto } from '../../dto/pagedResultDto'
import { PagedRoleResultRequestDto } from './dto/PagedRoleResultRequestDto'
import { UpdateRoleInput } from './dto/updateRoleInput'
import { UpdateRoleOutput } from './dto/updateRoleOutput'
import orderBy from 'lodash/orderBy'
import http from '../../httpService'
import { GetAllPermissionsOutput } from '@services/administrator/role/dto/getAllPermissionsOutput'
import { LCategory } from '@lib/abpUtility'

class RoleService {
  public async create(createRoleInput: CreateRoleInput): Promise<PagedResultDto<CreateRoleOutput>> {
    const result = await http.post('api/services/app/Role/Create', createRoleInput)
    return result.data.result
  }

  public async getRolesAsync(getRoleAsyncInput: GetRoleAsyncInput): Promise<GetRoleAsyncOutput> {
    const result = await http.get('api/services/app/Role/GetRolesAsync', {
      params: getRoleAsyncInput
    })
    return result.data.result
  }

  public async update(updateRoleInput: UpdateRoleInput): Promise<UpdateRoleOutput> {
    const result = await http.put('api/services/app/Role/Update', updateRoleInput)
    return result.data.result as UpdateRoleOutput
  }

  public async delete(entityDto: EntityDto) {
    const result = await http.delete('api/services/app/Role/Delete', {
      params: entityDto
    })
    return result.data
  }

  public async getAllPermissions(): Promise<GetAllPermissionsOutput[]> {
    const result = await http.get('api/services/app/Role/GetAllPermissions')
    // Permission has 3 level [GroupUser].[Module].[Permission]
    const permissions = (result.data.result.items || []).map((item) => {
      item.displayName = LCategory(item.name)
      item.order =
        item.name.endsWith('.Create') ||
        item.name.endsWith('.Read') ||
        item.name.endsWith('.Update') ||
        item.name.endsWith('.Delete') ||
        item.name.endsWith('.Detail')
          ? 1
          : 2

      const paths = (item.name || '').split('.')
      // Get parentName from name
      if (paths.length > 1) {
        // Re-translate static permission
        if (item.order === 1) {
          item.displayName = LCategory(paths[paths.length - 1])
        }

        paths.pop()
        item.parentName = paths.join('.')
      }
      return item
    })
    return orderBy(permissions, ['name', 'order'])
  }

  public async getRoleForEdit(id): Promise<GetRoleForEditOutput> {
    const result = await http.get('api/services/app/Role/GetRoleForEdit', {
      params: { id }
    })
    return result.data.result
  }

  public async get(entityDto: EntityDto) {
    const result = await http.get('api/services/app/Role/Get', {
      params: entityDto
    })
    return result.data
  }

  public async getAll(
    pagedFilterAndSortedRequest: PagedRoleResultRequestDto
  ): Promise<PagedResultDto<GetAllRoleOutput>> {
    const result = await http.get('api/services/app/Role/GetAll', {
      params: pagedFilterAndSortedRequest
    })
    return result.data.result
  }
}

export default new RoleService()
