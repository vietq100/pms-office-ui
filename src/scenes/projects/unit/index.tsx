import * as React from 'react'

import { Col, Dropdown, Input, Menu, Modal, Row, Table, Select } from 'antd'
import { DownloadOutlined, EllipsisOutlined } from '@ant-design/icons'

import { AppComponentListBase } from '../../../components/AppComponentBase'

import DataTable from '../../../components/DataTable'
import { L, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import UnitStore from '../../../stores/project/unitStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../stores/storeIdentifier'
import AppConst, { appPermissions, moduleIds } from '../../../lib/appconst'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
import ProjectStore from '../../../stores/project/projectStore'
import UploadButton from '@components/FileUpload/UploadButton'
import FileStore from '@stores/common/fileStore'
import { DownOutlined } from '@ant-design/icons/lib'
import Button from 'antd/lib/button'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import { ExcelIcon } from '@components/Icon'
// import OverViewBar from '@components/DataTable/OverViewBar'
import withRouter from '@components/Layout/Router/withRouter'
import NoRole from '@components/ComponentNoRole'

const { activeStatus } = AppConst

export interface IUnitsProps {
  navigate: any
  params: any
  unitStore: UnitStore
  projectStore: ProjectStore
  fileStore: FileStore
}

export interface IUnitsState {
  maxResultCount: number
  skipCount: number
  unitId?: number
  filters: any
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.UnitStore, Stores.ProjectStore, Stores.FileStore)
@observer
class Units extends AppComponentListBase<IUnitsProps, IUnitsState> {
  formRef: any = React.createRef()

  state = {
    maxResultCount: 10,
    skipCount: 0,
    unitId: 0,
    filters: { projectId: undefined, buildingId: undefined, isActive: 'true' }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.unit.page) &&
      (await Promise.all([this.getAll(), this.props.unitStore.getUnitTypes(), this.findBuildings()]))
  }

  getAll = async () => {
    await this.props.unitStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
    // await this.props.unitStore.getOverview({
    //   maxResultCount: this.state.maxResultCount,
    //   skipCount: this.state.skipCount,
    //   ...this.state.filters
    // })
  }

  findBuildings = async (keyword?) => {
    await this.props.projectStore.filterBuildingOptions({ keyword })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  handleExportUnits = async () => {
    const { unitStore } = this.props
    await unitStore.exportUnits(this.state.filters)
  }
  handleExportUnitsAndUser = async () => {
    const { unitStore } = this.props
    await unitStore.exportUnitUsers(this.state.filters)
  }

  handleExportUnitForEdit = async () => {
    const { unitStore } = this.props
    await unitStore.exportUnitForEdit(this.state.filters)
  }

  HandleDownloadTemplate = async () => {
    const { unitStore } = this.props
    await unitStore.downloadTemplate()
  }

  activateOrDeactivate = async (id: number, isActive) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.unitStore.activateOrDeactivate(id, isActive)
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
    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
      if (name === 'projectId') {
        this.findBuildings('')
      }
      await this.getAll()
    })
  }

  renderActionGroups = () => {
    const { unitStore, fileStore } = this.props
    const { units } = unitStore

    return (
      <span>
        {this.isGranted(appPermissions.unit.import) && (
          <Dropdown
            trigger={['click']}
            className="mr-1"
            overlay={
              <Menu>
                <Menu.Item onClick={this.HandleDownloadTemplate}>
                  <DownloadOutlined />
                  {L('BTN_DOWNLOAD_TEMPLATE')}
                </Menu.Item>

                <Menu.Item>
                  <UploadButton
                    moduleId={moduleIds.unit}
                    fileStore={fileStore}
                    label={L('BTN_IMPORT')}
                    acceptedFileTypes={['.xlsx']}
                  />
                </Menu.Item>
              </Menu>
            }
            placement="bottomLeft">
            <span className="pointer">
              {L('IMPORT_UNIT')} <DownOutlined />
            </span>
          </Dropdown>
        )}
        {this.isGranted(appPermissions.unit.import) && (
          <Dropdown
            trigger={['click']}
            className="mr-1"
            overlay={
              <Menu>
                <Menu.Item onClick={this.handleExportUnitForEdit} disabled={!units || !units.totalCount}>
                  <DownloadOutlined /> {L('BTN_EXPORT_UNIT_FOR_EDIT')}
                </Menu.Item>

                <Menu.Item>
                  <UploadButton
                    moduleId={moduleIds.unitEdit}
                    fileStore={fileStore}
                    label={L('BTN_UPLOAD_EDITED_UNIT')}
                    acceptedFileTypes={['.xlsx']}
                  />
                </Menu.Item>
              </Menu>
            }
            placement="bottomLeft">
            <span className="pointer">
              {L('EDIT_UNIT')} <DownOutlined />
            </span>
          </Dropdown>
        )}

        <Dropdown
          trigger={['click']}
          overlay={
            <Menu>
              {this.isGranted(appPermissions.unit.export) && (
                <Menu.Item disabled={!units || !units.totalCount}>
                  <span className="d-flex align-items-center" onClick={this.handleExportUnits}>
                    <Button shape="circle" type="primary" className="mr-1" icon={<ExcelIcon />} />
                    {L('EXPORT_UNIT')}
                  </span>
                </Menu.Item>
              )}
              {this.isGranted(appPermissions.unit.exportUnitUser) && (
                <Menu.Item disabled={!units || !units.totalCount}>
                  <span className="d-flex align-items-center" onClick={this.handleExportUnitsAndUser}>
                    <Button shape="circle" type="primary" className="mr-1" icon={<ExcelIcon />} />
                    {L('EXPORT_UNIT_AND_USER')}
                  </span>
                </Menu.Item>
              )}
            </Menu>
          }
          placement="bottomLeft">
          <span className="pointer">
            <Button
              shape="circle"
              type="primary"
              className="mr-1"
              icon={<ExcelIcon />}
              disabled={!units || !units.totalCount}
            />
          </span>
        </Dropdown>
      </span>
    )
  }

  gotoDetail = (id?) => {
    const { navigate } = this.props
    id
      ? navigate(portalLayouts.projectUnitDetail.path.replace(':id', id))
      : navigate(portalLayouts.projectUnitCreate.path)
  }

  public render() {
    const {
      unitStore: { units },
      projectStore: { buildingOptions }
    } = this.props
    const { filters } = this.state
    const columns = getColumns({
      title: L('UNIT_FULL_CODE'),
      dataIndex: 'fullUnitCode',
      key: 'fullUnitCode',
      width: '12%',
      render: (fullUnitCode: string, item: any) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 20, offset: 0 }} className="col-info">
            <a
              onClick={() => this.isGranted(appPermissions.unit.detail) && this.gotoDetail(item.id)}
              className="link-text-table">
              {fullUnitCode}
            </a>
          </Col>
          <Col sm={{ span: 4, offset: 0 }}>
            {isGrantedAny(appPermissions.unit.delete) && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {this.isGranted(appPermissions.unit.delete) && (
                      <Menu.Item onClick={() => this.activateOrDeactivate(item.id, !item.isActive)}>
                        {L(item.isActive ? 'BTN_DEACTIVATE' : 'BTN_ACTIVATE')}
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

    const keywordPlaceHolder = `${this.L('UNIT_FULL_CODE')}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={keywordPlaceHolder}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_BUILDING')}</label>
          <Select
            showSearch
            allowClear
            filterOption={false}
            className="full-width"
            value={filters.buildingId}
            onSearch={this.findBuildings}
            onChange={(value) => this.handleSearch('buildingId', value)}>
            {this.renderOptions(buildingOptions)}
          </Select>
        </Col>

        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
          <Select
            allowClear
            defaultValue={filters.isActive}
            onChange={(value) => this.handleSearch('isActive', value)}
            style={{ width: '100%' }}>
            {this.renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.unit.page) ? (
      <>
        {/* <OverViewBar data={this.props.unitStore.unitOverview} /> */}

        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('UNIT_LIST')}
          onCreate={this.gotoDetail}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: units === undefined ? 0 : units.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.unit.create}
          actionGroups={this.renderActionGroups}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={this.props.unitStore.isLoading}
            dataSource={units === undefined ? [] : units.items}
            scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
          />
        </DataTable>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(Units)
