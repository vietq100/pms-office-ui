import * as React from 'react'

import { Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Switch, Table, Tabs } from 'antd'
import AppComponentBase from '../../../../components/AppComponentBase'
import { isGrantedAny, L, LError, LNotification } from '../../../../lib/abpUtility'
import UnitStore from '../../../../stores/project/unitStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import AppConsts, { appPermissions, dateTimeFormat, fileTypeGroup } from '../../../../lib/appconst'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import rules from '../components/unit.validation'
import { OptionModel } from '../../../../models/global'
import ProjectStore from '../../../../stores/project/projectStore'
import BuildingStore from '../../../../stores/project/buildingStore'
import { validateMessages } from '../../../../lib/validation'
import withRouter from '@components/Layout/Router/withRouter'
import LogoutOutlined from '@ant-design/icons/lib/icons/LogoutOutlined'
import UnitMoveOutFormModal from '../components/unitMoveOutFormModal'
import moment from 'moment'
import LoginOutlined from '@ant-design/icons/lib/icons/LoginOutlined'
import Search from 'antd/lib/input/Search'
import LibraryStore from '@stores/communication/libraryStore'
import FileStore from '@stores/common/fileStore'

import FileUploadWrapV2 from '@components/FileUploadV2'
import UnitFeeNoticationConfig from '../components/unitFeeNoticationConfig'
import FeeTypeStore from '@stores/fee/feeTypeStore'
import UnitConfigFee from '../components/tabUnitConfigFee/UnitConfigFee'
import MeterReadingStore from '@stores/meterReading/meterReadingStore'
import ParkingStore from '@stores/parking/parkingStore'
import NoRole from '@components/ComponentNoRole'
import zoneService from '@services/project/zoneService'

const { formVerticalLayout, align, activeStatus, purposeUsing, typeMerderReading } = AppConsts

export interface IUnitsProps {
  navigate: any
  params: any
  unitStore: UnitStore
  projectStore: ProjectStore
  buildingStore: BuildingStore
  libraryStore: LibraryStore
  fileStore: FileStore
  feeTypeStore: FeeTypeStore
  meterReadingStore: MeterReadingStore
  parkingStore: ParkingStore
}

export interface IUnitsState {
  isDirty: boolean
  tabActiveKey: string
  modalMoveInVisible: boolean
  modalMoveOutVisible: boolean
  unitId: number
  moveInInitialValue: any
  moveOutInitialValue: any
  filterUnitResidents: any
  filterDocuments: any
  filterVehicle: any
  currentPage: number
  modalDocumentVisible: boolean
  files: any
  idDocument: any
  listValueUserConfigNotice: any[]
  isLoadingSaveConfig: boolean
  listZoneUnUsed: any[]
}

const confirm = Modal.confirm
@inject(Stores.MeterReadingStore)
@inject(Stores.UnitStore)
@inject(Stores.ProjectStore)
@inject(Stores.BuildingStore)
@inject(Stores.LibraryStore)
@inject(Stores.FileStore)
@inject(Stores.FeeTypeStore)
@inject(Stores.ParkingStore)
@observer
class UnitDetail extends AppComponentBase<IUnitsProps, IUnitsState> {
  formRef: any = React.createRef()
  formDocumentRef: any = React.createRef()
  formWater: any = React.createRef()
  formElectric: any = React.createRef()

  state = {
    isDirty: false,
    tabActiveKey: 'UNIT_INFO',
    modalMoveInVisible: false,
    modalMoveOutVisible: false,
    unitId: 0,
    moveInInitialValue: {},
    moveOutInitialValue: {},
    filterUnitResidents: {
      maxResultCount: 10,
      skipCount: 0,
      isActive: true
    },
    filterVehicle: {
      maxResultCount: 10,
      skipCount: 0,
      isActive: true
    },
    currentPage: 1,
    filterDocuments: { isActive: 'true', keyword: '' },
    modalDocumentVisible: false,
    files: [] as any,
    idDocument: undefined,
    listValueUserConfigNotice: [] as any,
    isLoadingSaveConfig: false,
    listZoneUnUsed: [] as any
  }
  get currentPage() {
    return Math.floor(this.state.filterUnitResidents.skipCount / this.state.filterUnitResidents.maxResultCount) + 1
  }
  async componentDidMount() {
    await this.setState({ unitId: this.props.params?.id })

    this.isGranted(appPermissions.unit.detail) &&
      (await Promise.all([
        this.props.unitStore.getUnitTypes(),
        this.props.unitStore.getUnitUseStatus(),
        this.findBuildings(''),

        this.getDetail(this.props.params?.id)
      ]))
    this.getListZonesUnUsed()
  }
  purposeUsing = Object.keys(purposeUsing).map((key) => {
    return { label: L(key.toUpperCase()), value: purposeUsing[key] }
  })
  createOrUpdateDocumentModalOpen = () => {
    this.setState({ modalDocumentVisible: true })
  }

  getListZonesUnUsed = async () => {
    const res = await zoneService.getListZonesUnUsed()
    const listZone = [...res, ...this.props.unitStore.editUnit.zones]
    this.setState({ listZoneUnUsed: listZone })
  }

  getAllDocument = async () => {
    const { editUnit } = this.props.unitStore
    await this.props.fileStore.getFiles(editUnit.uniqueId)
  }

  handleCreateDocument = async (files, isPublic) => {
    const { editUnit } = this.props.unitStore

    if (isPublic === true) {
      await this.props.libraryStore.createDocumentUnitPublic(editUnit.uniqueId, files)
    } else {
      await this.props.libraryStore.createDocumentUnitPrivate(editUnit.uniqueId, files)
    }
    this.getAllDocument()

    await this.getAllDocument()
    this.setState({ modalDocumentVisible: false })
  }
  handleSearchDocument = (name, value) => {
    const { filterDocuments } = this.state
    this.setState({ filterDocuments: { ...filterDocuments, [name]: value } }, async () => {
      await this.getAllDocument()
    })
  }

  activateOrDeactivateDocument = (id: number, isActive) => {
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.libraryStore.activateOrDeactivateDocument(id, isActive)
        this.getAllDocument()
      }
    })
  }
  async getDetail(id) {
    if (!id) {
      await this.props.unitStore.createUnit()
    } else {
      await this.props.unitStore.get(id)
      this.setState({ idDocument: this.props.unitStore.editUnit?.uniqueId })
      const { editUnit } = this.props.unitStore
      if (editUnit.id) {
        this.props.projectStore.buildingOptions = [new OptionModel(editUnit.building?.id, editUnit.building?.name)]
        this.props.projectStore.floorOptions = [new OptionModel(editUnit.floor?.id, editUnit.floor?.name)]
      }
    }
    this.setState(
      {
        filterUnitResidents: {
          ...this.state.filterUnitResidents,
          unitId: id,
          isActive: true
        }
      },
      async () => await this.getAll()
    )
    this.formRef.current.setFieldsValue({ ...this.props.unitStore.editUnit })
  }
  async handleSearch(key, value) {
    const { filterUnitResidents } = this.state
    this.setState(
      {
        filterUnitResidents: {
          ...filterUnitResidents,
          [key]: value,
          skipCount: 0
        }
      },
      async () => await this.getAll()
    )
  }
  getAll = async () => {
    await this.props.unitStore.getUnitResident({
      ...this.state.filterUnitResidents
    })
  }

  findBuildings = async (keyword?) => {
    this.props.projectStore.filterBuildingOptions({ keyword })
  }

  findFloors = async (keyword?) => {
    const form = this.formRef.current
    const buildingId = form.getFieldValue('buildingId')
    if (!buildingId) {
      form.setFieldsValue({ floorId: undefined })
      return
    }
    await this.props.projectStore.filterFloorOptions({
      keyword,
      buildingId
    })
  }

  buildFullUnitCode = async () => {
    const form = this.formRef.current
    const selectedBuildingId = form.getFieldValue('buildingId')
    const selectedFloorId = form.getFieldValue('floorId')
    const unitCode = form.getFieldValue('code')
    const { buildingOptions, floorOptions } = this.props.projectStore
    const selectedBuilding = selectedBuildingId
      ? buildingOptions.find((item: any) => item.value === selectedBuildingId)
      : ({} as any)
    const selectedFloor = selectedFloorId
      ? floorOptions.find((item: any) => item.value === selectedFloorId)
      : ({} as any)

    form.setFieldsValue({
      fullUnitCode: `${selectedBuilding.label || ''}-${selectedFloor.label || ''}-${unitCode}`
    })
  }

  openMoveInModal = () => {
    this.setState({
      modalMoveInVisible: true,
      moveInInitialValue: { unitId: this.state.unitId, residents: [{}] }
    })
  }

  openMoveOutModal = (resident) => {
    this.setState({
      modalMoveOutVisible: true,
      moveOutInitialValue: {
        unitId: resident.unit?.id,
        userId: resident.user?.id,
        unit: resident.unit,
        user: resident.user
      }
    })
  }

  hideModal = async (modalName: string) => {
    this.setState({ ...this.state, [modalName]: false })
  }

  changeTab = async (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  onSave = () => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      if (this.props.unitStore.editUnit?.id) {
        await this.props.unitStore.update({
          ...this.props.unitStore.editUnit,
          ...values
        })
      } else {
        await this.props.unitStore.create(values)
      }
      form.resetFields()
      this.props.navigate(-1)
    })
  }

  onCancel = () => {
    if (this.state.isDirty) {
      confirm({
        title: LNotification('ARE_YOU_SURE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          this.props.navigate(-1)
        }
      })
      return
    }
    this.props.navigate(-1)
  }
  onRemoveFile = (file) => {
    const index = this.state.files.indexOf(file)
    const newFileList = [...this.state.files]
    newFileList.splice(index, 1)
    this.setState({ files: newFileList })
  }

  beforeUploadFilePublic = (file) => {
    const files = [file]

    this.handleCreateDocument(files, true)
    return false
  }

  beforeUploadFilePrivate = (file) => {
    const files = [file]

    this.handleCreateDocument(files, false)

    return false
  }
  onCreateOrUpdateUserFeeType = async () => {
    this.setState({ isLoadingSaveConfig: true })
    await this.props.feeTypeStore
      .createOrUpdateFeeUnitUser(this.state.listValueUserConfigNotice)
      .finally(() => this.setState({ isLoadingSaveConfig: false }))
  }
  onCreateOrUpdateCofnig = async () => {
    let listMetterElectric = []
    let listMetterWater = []
    await this.formElectric.current.validateFields().then(async (valuesElectric: any) => {
      if (valuesElectric.meterReading.length < 1) {
        return this.formElectric.current.setFields([
          {
            name: 'checkNull',
            errors: [LError('METER_READING_ELECTRIC_GEN_NEED_VALUES')]
          }
        ])
      } else {
        valuesElectric.meterReading.map((item) => {
          item.unitId = this.props.params?.id
        })
        listMetterElectric = valuesElectric.meterReading
      }
    })
    await this.formWater.current.validateFields().then(async (valuesWater: any) => {
      if (valuesWater.meterReading.length < 1) {
        return this.formWater.current.setFields([
          {
            name: 'checkNull',
            errors: [LError('METER_READING_ELECTRIC_GEN_NEED_VALUES')]
          }
        ])
      } else {
        valuesWater.meterReading.map((item) => {
          item.unitId = this.props.params?.id
        })
        listMetterWater = valuesWater.meterReading
      }
    })

    if (listMetterElectric.length > 0 && listMetterWater.length > 0) {
      await this.props.meterReadingStore.createOrUpdateElectricityProfile(listMetterElectric)
      await this.props.meterReadingStore.createOrUpdateWaterProfile(listMetterWater)
      this.props.navigate(-1)
    }
  }
  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mx-3" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {this.state.tabActiveKey === 'UNIT_INFO' && isGrantedAny(appPermissions.unit.update) && (
            <Button
              type="primary"
              disabled={this.props.params?.id && !isGrantedAny(appPermissions.unit.update)}
              onClick={this.onSave}
              loading={isLoading}
              shape="round">
              {L('BTN_SAVE')}
            </Button>
          )}
          {this.state.tabActiveKey === 'UNIT_FEE_NOTIFICATION' && isGrantedAny(appPermissions.unit.update) && (
            <Button
              type="primary"
              disabled={this.props.params?.id && !isGrantedAny(appPermissions.unit.update)}
              onClick={this.onCreateOrUpdateUserFeeType}
              loading={this.state.isLoadingSaveConfig}
              shape="round">
              {L('BTN_SAVE_USER_FEETYPEE')}
            </Button>
          )}
          {this.state.tabActiveKey === 'UNIT_FEE_SETUP' && isGrantedAny(appPermissions.unit.update) && (
            <Button
              type="primary"
              disabled={this.props.params?.id && !isGrantedAny(appPermissions.unit.update)}
              onClick={this.onCreateOrUpdateCofnig}
              loading={isLoading}
              shape="round">
              {L('BTN_SAVE_METER_READING')}
            </Button>
          )}
        </Col>
      </Row>
    )
  }
  handleTableChange = (pagination: any) => {
    const skipCount = (pagination - 1) * this.state.filterUnitResidents.maxResultCount
    this.setState(
      { filterUnitResidents: { ...this.state.filterUnitResidents, skipCount } },
      async () => await this.getAll()
    )
  }

  public render() {
    const { unitId } = this.state
    const { unitResidents, isLoading } = this.props.unitStore
    const {
      projectStore: { buildingOptions, floorOptions }
    } = this.props

    const columns = [
      {
        title: L('FULL_NAME'),
        dataIndex: 'user',
        key: 'user',
        width: 250,
        render: (user) => this.renderAvatar(user.displayName, user, true)
      },
      {
        title: L('FULL_UNIT_CODE'),
        dataIndex: 'unit',
        key: 'unit',
        width: 150,
        render: (unit) => <div>{unit?.fullUnitCode}</div>
      },
      {
        title: L('UNIT_RESIDENT_ROLE'),
        dataIndex: 'role',
        key: 'role',
        width: 150,
        render: (role) => <div>{role?.name ?? role?.displayName}</div>
      },
      {
        title: L('UNIT_RESIDENT_TYPE'),
        dataIndex: 'type',
        key: 'type',
        width: 150,
        render: (type) => <div>{type?.name ?? type?.displayName}</div>
      },
      {
        title: L('UNIT_RESIDENT_MOVE_IN_OUT'),
        dataIndex: 'moveInDate',
        key: 'moveInDate',
        width: 150,
        render: (moveInDate, row) => (
          <div>
            <div className="text-success">
              <LoginOutlined className="mr-2" />
              {moment(moveInDate).isValid() && moment(moveInDate).format(dateTimeFormat)}
            </div>
            <div className="text-danger">
              <LogoutOutlined className="mr-2" />
              {moment(row.moveOutDate).isValid() ? moment(row.moveOutDate).format(dateTimeFormat) : ''}
            </div>
          </div>
        )
      },
      {
        title: L('ACTIONS'),
        dataIndex: 'operation',
        key: 'operation',
        fixed: align.right,
        align: align.right,
        width: 80,
        render: (text: string, item: any) =>
          this.isGranted(appPermissions.unit.moveOut) && (
            <Button
              size="small"
              className="mr-1"
              shape="circle"
              icon={<LogoutOutlined />}
              onClick={() => this.openMoveOutModal(item)}
            />
          )
      }
    ]

    return this.isGranted(appPermissions.unit.detail) ? (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab} type="card">
          <Tabs.TabPane tab={this.L('UNIT_TAB_INFO')} key="UNIT_INFO">
            <Card bordered={false} style={{ minHeight: 700 }}>
              <Form ref={this.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('BUILDING')} {...formVerticalLayout} name="buildingId" rules={rules.buildingId}>
                      <Select
                        showSearch
                        allowClear
                        filterOption={false}
                        className="full-width"
                        onSearch={this.findBuildings}
                        onChange={() => {
                          this.findFloors('')
                          this.buildFullUnitCode()
                        }}
                        disabled={!!unitId}>
                        {this.renderOptions(buildingOptions)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('FLOOR')} {...formVerticalLayout} name="floorId" rules={rules.floorId}>
                      <Select
                        showSearch
                        showArrow
                        allowClear
                        filterOption={false}
                        onSearch={this.findFloors}
                        className="full-width"
                        onChange={this.buildFullUnitCode}
                        disabled={!this.formRef.current?.getFieldValue('buildingId') || !!unitId}>
                        {this.renderOptions(floorOptions)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('UNIT_CODE')} {...formVerticalLayout} name="code" rules={rules.code}>
                      <Input onChange={this.buildFullUnitCode} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('UNIT_NAME')} {...formVerticalLayout} name="name" rules={rules.name}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('FULL_UNIT_CODE')}
                      {...formVerticalLayout}
                      name="fullUnitCode"
                      rules={rules.fullUnitCode}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <></>
                  {/* <Col sm={{ span: 4, offset: 0 }}>
                    <Form.Item label={L('UNIT_TYPE')} {...formVerticalLayout} name="typeId" rules={rules.typeId}>
                      <Select className="full-width">{this.renderOptions(unitTypes)}</Select>
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 4, offset: 0 }}>
                    <Form.Item label={L('UNIT_LAYOUT')} {...formVerticalLayout} name="typeId" rules={rules.typeId}>
                      <Select className="full-width">{this.renderOptions(unitTypes)}</Select>
                    </Form.Item>
                  </Col> */}
                  {/* <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('UNIT_USE_STATUS')}
                      {...formVerticalLayout}
                      name="statusId"
                      rules={rules.statusId}>
                      <Select className="full-width">{this.renderOptions(unitUseStatus)}</Select>
                    </Form.Item>
                  </Col> */}
                  <Col sm={{ span: 4, offset: 0 }}>
                    <Form.Item label={L('UNIT_SIZE')} {...formVerticalLayout} name="size" rules={rules.size}>
                      <InputNumber className="full-width" min={0} max={999999} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <Form.Item label={L('UNIT_ZONE')} {...formVerticalLayout} name="zoneIds">
                      <Select mode="multiple" className="full-width">
                        {this.renderOptions(
                          this.state.listZoneUnUsed.map((item) => ({
                            id: item?.id,
                            name: item?.zoneName
                          }))
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                  {/* <Col sm={{ span: 4, offset: 0 }}>
                    <Form.Item
                      label={L('UNIT_CENTER_SIZE')}
                      {...formVerticalLayout}
                      name="carpetArea"
                      rules={rules.size}>
                      <InputNumber className="full-width" min={0} max={validate.maxNumber} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('UNIT_NUMBER_ROOM')} {...formVerticalLayout} name="numOfRoom">
                      <InputNumber className="full-width" />
                    </Form.Item>
                  </Col> */}

                  {/* <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('UNIT_HANDOVER_DATE')} {...formVerticalLayout} name="handOverDate">
                      <DatePicker className="full-width" format={dateFormat} placeholder={L('SELECT_DATE')} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}></Col> */}

                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('UNIT_ACTIVE_STATUS')}
                      {...formVerticalLayout}
                      name="isActive"
                      valuePropName="checked">
                      <Switch defaultChecked />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <Form.Item label={L('FLOOR_DESCRIPTION')} {...formVerticalLayout} name="description">
                      <Input.TextArea rows={2} />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Tabs.TabPane>
          {this.props.params?.id && (
            <Tabs.TabPane tab={this.L('UNIT_TAB_RESIDENT')} key="UNIT_RESIDENTS">
              <Card bordered={false} style={{ minHeight: 700 }}>
                <Row gutter={[16, 16]}>
                  <Col sm={{ span: 12, offset: 0 }}>
                    <label>{this.L('FILTER_KEYWORD')}</label>
                    <Search onSearch={(value) => this.handleSearch('keyword', value)} />
                  </Col>
                  <Col sm={{ span: 12, offset: 0 }}>
                    <label>{this.L('FILTER_ACTIVE_STATUS')}</label>
                    <Select
                      defaultValue={this.state.filterUnitResidents.isActive}
                      onChange={(value) => this.handleSearch('isActive', value)}
                      className="full-width">
                      {this.renderOptions(activeStatus)}
                    </Select>
                  </Col>

                  <Col sm={{ span: 24, offset: 0 }}>
                    <Table
                      size="middle"
                      className="custom-ant-table"
                      rowKey="id"
                      columns={columns}
                      pagination={{
                        pageSize: this.state.filterUnitResidents.maxResultCount,
                        current: this.currentPage,
                        total: unitResidents === undefined ? 0 : unitResidents.totalCount,
                        onChange: this.handleTableChange
                      }}
                      loading={unitResidents === undefined}
                      dataSource={unitResidents === undefined ? [] : unitResidents.items}
                    />
                  </Col>
                </Row>
              </Card>
            </Tabs.TabPane>
          )}
          {this.props.params?.id && (
            <Tabs.TabPane
              tab={this.L('UNIT_TAB_FEE_NOTIFICATION')}
              key="UNIT_FEE_NOTIFICATION"
              disabled={!this.isGranted(appPermissions.unit.update)}>
              {isGrantedAny(appPermissions.unit.detail) && (
                <UnitFeeNoticationConfig
                  unitId={this.props.params?.id}
                  feeTypeStore={this.props.feeTypeStore}
                  listResident={unitResidents.items}
                  onChangeList={(listValue) => this.setState({ listValueUserConfigNotice: listValue })}
                />
              )}
            </Tabs.TabPane>
          )}
          {this.props.params?.id && (
            <Tabs.TabPane
              tab={this.L('UNIT_TAB_FEE_SETUP')}
              key="UNIT_FEE_SETUP"
              disabled={!this.isGranted(appPermissions.unit.update)}>
              <>
                <Card bordered={false} style={{ marginTop: 15, minHeight: '30vh' }}>
                  <Row gutter={[4, 4]}>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <label style={{ fontSize: 14, fontWeight: 'bold' }}>{L('UNIT_DETAIL_CONFIG_FEE_ELECTRIC')}</label>
                      <UnitConfigFee
                        unitId={this.props.params?.id}
                        formMeterReading={this.formElectric}
                        meterReadingStore={this.props.meterReadingStore}
                        type={typeMerderReading.electric}
                      />
                    </Col>
                  </Row>
                </Card>
                <Card bordered={false} style={{ marginTop: 15, minHeight: '30vh' }}>
                  <Row gutter={[4, 4]}>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <label style={{ fontSize: 14, fontWeight: 'bold' }}>{L('UNIT_DETAIL_CONFIG_FEE_WATER')}</label>
                      <UnitConfigFee
                        unitId={this.props.params.id}
                        meterReadingStore={this.props.meterReadingStore}
                        formMeterReading={this.formWater}
                        type={typeMerderReading.water}
                      />
                    </Col>
                  </Row>
                </Card>
              </>
            </Tabs.TabPane>
          )}

          {this.props.params?.id && (
            <Tabs.TabPane
              tab={this.L('UNIT_TAB_DOCUMENT')}
              key="UNIT_DOCUMENT"
              disabled={!this.isGranted(appPermissions.unit.update)}>
              {isGrantedAny(appPermissions.unit.detail) && (
                <Row gutter={[16, 8]}>
                  <Col sm={{ span: 12, offset: 0 }}>
                    <Card style={{ minHeight: 700 }}>
                      <Row>
                        <h3>{L('DETAIL_UNIT_DOCUMENT_LIST_PUBLIC')}</h3>
                      </Row>
                      <FileUploadWrapV2
                        disabled={!isGrantedAny(appPermissions.unit.update)}
                        parentId={this.state.idDocument}
                        fileStore={this.props.fileStore}
                        onRemoveFile={this.onRemoveFile}
                        beforeUploadFile={this.beforeUploadFilePublic}
                        acceptedFileTypes={fileTypeGroup.documentAndImage}
                        maxSize={25}
                        totalSize={999999}
                        specialModuleName="UNITPULIC"
                      />
                    </Card>
                  </Col>

                  <Col sm={{ span: 12, offset: 0 }}>
                    <Card style={{ minHeight: 700 }}>
                      <div>
                        <h3>{L('DETAIL_UNIT_DOCUMENT_LIST_PRIVATE')}</h3>
                        <FileUploadWrapV2
                          disabled={!isGrantedAny(appPermissions.unit.update)}
                          parentId={this.state.idDocument}
                          fileStore={this.props.fileStore}
                          onRemoveFile={this.onRemoveFile}
                          beforeUploadFile={this.beforeUploadFilePrivate}
                          acceptedFileTypes={fileTypeGroup.documentAndImage}
                          maxSize={25}
                          totalSize={999999}
                          specialModuleName="UNITPRIVATE"
                        />
                      </div>
                    </Card>
                  </Col>
                </Row>
              )}
            </Tabs.TabPane>
          )}
        </Tabs>

        <UnitMoveOutFormModal
          visible={this.state.modalMoveOutVisible}
          initialValue={this.state.moveOutInitialValue}
          onCancel={() => this.hideModal('modalMoveOutVisible')}
          onSave={() => this.hideModal('modalMoveOutVisible')}
        />
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(UnitDetail)
