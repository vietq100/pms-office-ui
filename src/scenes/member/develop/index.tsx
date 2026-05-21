import * as React from 'react'
import { Col, Input, Modal, Row, Table, Select, Dropdown, Menu, Avatar } from 'antd'
import { AppComponentListBase } from '../../../components/AppComponentBase'
import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions, moduleAvatar } from '../../../lib/appconst'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
import { getFirstLetterAndUpperCase } from '../../../lib/helper'
import getColumns from './columns'
import { EllipsisOutlined } from '@ant-design/icons/lib'
import debounce from 'lodash/debounce'
import withRouter from '@components/Layout/Router/withRouter'
import NoRole from '@components/ComponentNoRole'
import dayjs from 'dayjs'
import DevelopStore from '@stores/member/develop/developStore'

const { activeStatus } = AppConst

export interface IResidentsProps {
  navigate: any
  params: any
  developStore: DevelopStore
}

export interface IResidentsState {
  maxResultCount: number
  skipCount: number
  currentPage: number
  filters: any
}

const confirm = Modal.confirm
const Search = Input.Search
const { colorByLetter } = moduleAvatar

@inject(Stores.DevelopStore)
@observer
class DevelopPage extends AppComponentListBase<IResidentsProps, IResidentsState> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: 10,
    skipCount: 0,
    residentId: 0,
    currentPage: 1,
    filters: {
      isActive: 'true'
    }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.resident.page) && (await Promise.all([this.getAll()]))
  }

  getAll = async () => {
    await this.props.developStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })

    const currentPage = (this.state.skipCount % this.state.maxResultCount) + 1
    this.setState({ currentPage })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.developStore.activateOrDeactivate(id, isActive)
        self.handleTableChange({ current: 1 })
      }
    })
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)

  handleSearch = (name, value) => {
    const { filters } = this.state
    if (name === 'birthday') {
      this.setState(
        {
          filters: { ...filters, birthday: `${dayjs(value).get('date')}/${dayjs(value).get('month') + 1}` },
          skipCount: 0
        },
        async () => {
          await this.getAll()
        }
      )
    } else {
      if (name === 'yearOfBirth') {
        const yearOfBirth = dayjs(value).year()
        this.setState({ filters: { ...filters, [name]: yearOfBirth }, skipCount: 0 }, async () => {
          await this.getAll()
        })
      } else {
        this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
          await this.getAll()
        })
      }
    }
  }

  gotoDetail = (id) => {
    const { navigate } = this.props
    id ? navigate(portalLayouts.developDetail.path.replace(':id', id)) : navigate(portalLayouts.developCreate.path)
  }

  public render() {
    const {
      developStore: { develops }
    } = this.props
    const { filters } = this.state

    const columns = getColumns({
      title: L('RESIDENT_FULL_NAME'),
      dataIndex: 'displayName',
      key: 'displayName',
      width: '20%',
      render: (text: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 21, offset: 0 }} className="col-info">
            <div className="table-cell-profile">
              <div>
                <Avatar
                  src={item.profilePictureUrl}
                  style={{
                    background: colorByLetter(getFirstLetterAndUpperCase(text || 'G'))
                  }}>
                  {getFirstLetterAndUpperCase(text || 'G')}
                </Avatar>
              </div>
              <div className="info ml-2">
                <div
                  className="full-name text-truncate"
                  onClick={() => this.isGranted(appPermissions.resident.detail) && this.gotoDetail(item.id)}>
                  <a className="link-text-table">
                    {/* {L(item.gender === null ? '' : item.gender === true ? 'GENDER_MR' : 'GENDER_MS')} */}
                    {text?.length > 40 ? text.substring(0, 40) + '...' : text}
                  </a>
                </div>

                <div className="phone text-truncate text-muted">{item?.displayName}</div>
              </div>
            </div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            {isGrantedAny(appPermissions.resident.update) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.resident.delete) && (
                      <Menu.Item onClick={() => this.activateOrDeactivate(item.id, item.isActive)}>
                        {item.isActive ? L('BTN_DEACTIVE_RESIDENT') : L('BTN_ACTIVE_RESIDENT')}
                      </Menu.Item>
                    )}
                  </Menu>
                }
                placement="bottomLeft">
                <button className="button-action-hiden-table-cell">
                  <EllipsisOutlined />
                </button>
              </Dropdown>
            )}
          </Col>
        </Row>
      )
    })

    const keywordPlaceholder = `${this.L('RESIDENT_USER_NAME')}, ${this.L('RESIDENT_EMAIL')}`

    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={keywordPlaceholder}
            onSearch={(value) => this.handleSearch('keyword', value)}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
          />
        </Col>

        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            style={{ width: '100%' }}
            defaultValue={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.resident.page) ? (
      <>
        <DataTable
          title={this.L('DEVELOP_LIST')}
          onCreate={() => this.gotoDetail(null)}
          onRefresh={this.getAll}
          extraFilterComponent={filterComponent}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: develops === undefined ? 0 : develops.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.resident.create}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.developStore.isLoading}
            dataSource={develops === undefined ? [] : develops.items}
            scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(DevelopPage)
