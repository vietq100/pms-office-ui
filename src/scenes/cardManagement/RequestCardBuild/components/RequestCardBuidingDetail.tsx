import React from 'react'

import { Col, Form, Row, Card, Button, Select, Table, message } from 'antd'
import { validateMessages } from '@lib/validation'
import AppConsts, { appPermissions, appStatusColors, fileTypeGroup } from '@lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppComponentBase from '@components/AppComponentBase'
import { isGrantedAny, L, LError, LNotification } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import CardbuidingStore from '@stores/cardBuilding/cardbuidingStore'
import './style.less'
import RequestCardbuidingStore from '@stores/cardBuilding/requestCardBuildingStore'
import SessionStore from '@stores/sessionStore'
import FormInput from '@components/FormItem/FormInput'
import FormRadioButton from '@components/FormItem/FormRadioButton'
import rules from './validation'
import ComponentRequestChangeInfo from './ComponentRequestChangeInfo'
import cardbuidingService from '@services/cardbuilding/cardbuidingService'
import { notifySuccess } from '@lib/helper'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import dayjs from 'dayjs'
import { CarOutlined, CheckCircleFilled, CloseCircleFilled, DeleteOutlined, EditFilled } from '@ant-design/icons'
import columnStaff from './column'
import { EditableCell } from '@components/DataTableV2/EditableCell'
import { v4 as uuid } from 'uuid'
import FileUploadWrapV2 from '@components/FileUploadV2'
import FileStore from '@stores/common/fileStore'
import CreateCardBuildingModal from './CreateCardBuildingModal'

const {
  listCardRequestStatus,
  listCardRequestType,
  cardRequestTypeEnum,
  typeAccount,
  listTenantTypeUseVehicle,
  listVehicleParkingType,
  cardRequestStatusEnum
} = AppConsts

export interface IProps {
  navigate: any
  params: any
  requestCardbuidingStore: RequestCardbuidingStore
  cardbuidingStore: CardbuidingStore
  sessionStore: SessionStore
  fileStore: FileStore
}

@inject(Stores.RequestCardbuidingStore, Stores.CardbuidingStore, Stores.SessionStore, Stores.FileStore)
@observer
class RequestCardBuidingDetail extends AppComponentBase<IProps> {
  formRef: any = React.createRef()
  formStaff: any = React.createRef()

  state = {
    requestType: cardRequestTypeEnum.IsUpdate,
    isUseVehicle: false,
    showCardBuildingPopup: { show: false, data: undefined },
    listCardEmpty: [],
    uniqueId: '',
    idDocument: undefined,
    previousDataRow: undefined,
    visibleAction: false,
    staffs: [] as any,
    files: [] as any
  }

  isStaff =
    this.props.sessionStore.userAccountType === typeAccount.Develop ||
    this.props.sessionStore.userAccountType === typeAccount.Resident
      ? false
      : true

  isEditing = (record: any) => record.id === this.state.uniqueId

  async componentDidMount() {
    await Promise.all([this.getListMasterData(), this.getAllCardEmpty(), this.getDetail(this.props.params?.id)])
  }

  getDetail = async (id?) => {
    if (!id) {
      await this.formRef.current?.resetFields()
      await this.props.requestCardbuidingStore.init()
    } else {
      if (this.isStaff) {
        await this.props.requestCardbuidingStore.get(this.props.params?.id)
      } else {
        await this.props.requestCardbuidingStore.getByCompany(this.props.params?.id)
      }

      if (this.props.requestCardbuidingStore.editRequestCardBuilding?.numberPlate) {
        this.setState({ isUseVehicle: true })
      } else {
        this.setState({ isUseVehicle: false })
      }

      this.setState({
        requestType: this.props.requestCardbuidingStore.editRequestCardBuilding?.type
      })

      // Tạo thẻ
      if (this.props.requestCardbuidingStore.editRequestCardBuilding?.type === cardRequestTypeEnum.IsCreate) {
        this.setState({
          staffs: this.props.requestCardbuidingStore.editRequestCardBuilding?.cardRequests,
          idDocument: this.props.requestCardbuidingStore.editRequestCardBuilding?.uniqueId
        })
        this.formRef?.current?.setFieldsValue({
          ...this.props.requestCardbuidingStore.editRequestCardBuilding,
          isUseVehicle: this.props.requestCardbuidingStore.editRequestCardBuilding?.numberPlate ? true : false,
          stoppingDate: this.props.requestCardbuidingStore.editRequestCardBuilding?.stoppingDate
            ? dayjs(this.props.requestCardbuidingStore.editRequestCardBuilding?.stoppingDate)
            : null
        })
      }

      // THay đổi thông tin thẻ
      if (
        this.props.requestCardbuidingStore.editRequestCardBuilding?.type === cardRequestTypeEnum.IsUpdate ||
        this.props.requestCardbuidingStore.editRequestCardBuilding?.type === cardRequestTypeEnum.IsCancel
      ) {
        this.setState({ staffs: this.props.requestCardbuidingStore.editRequestCardBuilding?.cardRequests })
        this.formRef?.current?.setFieldsValue({
          ...this.props.requestCardbuidingStore.editRequestCardBuilding,
          isUseVehicle: this.props.requestCardbuidingStore.editRequestCardBuilding?.numberPlate ? true : false,
          stoppingDate: this.props.requestCardbuidingStore.editRequestCardBuilding?.stoppingDate
            ? dayjs(this.props.requestCardbuidingStore.editRequestCardBuilding?.stoppingDate)
            : null,
          cardId: this.props.requestCardbuidingStore.editRequestCardBuilding?.cardRequests[0]?.cardId,
          tenantName: this.props.requestCardbuidingStore.editRequestCardBuilding?.cardRequests[0]?.tenantName,
          departmentName: this.props.requestCardbuidingStore.editRequestCardBuilding?.cardRequests[0]?.departmentName,
          numberPlate: this.props.requestCardbuidingStore.editRequestCardBuilding?.cardRequests[0]?.numberPlate,
          tenantType: this.props.requestCardbuidingStore.editRequestCardBuilding?.cardRequests[0]?.tenantType,
          vehicleTypeId: this.props.requestCardbuidingStore.editRequestCardBuilding?.cardRequests[0]?.vehicleTypeId,
          vehicleParkingType:
            this.props.requestCardbuidingStore.editRequestCardBuilding?.cardRequests[0]?.vehicleParkingType,
          parkingId: this.props.requestCardbuidingStore.editRequestCardBuilding?.cardRequests[0]?.parkingId,
          elevatorAccess: this.props.requestCardbuidingStore.editRequestCardBuilding?.cardRequests[0]?.elevatorAccess,
          cardType: this.props.requestCardbuidingStore.editRequestCardBuilding?.cardRequests[0]?.cardType,
          updateDescription: this.props.requestCardbuidingStore.editRequestCardBuilding?.updateDescription
        })
      }
    }
  }

  getAllCardEmpty = async () => {
    if (this.isStaff) {
      const res = await cardbuidingService.getAll({ isEmpty: true })
      const checkHaveItem = res?.items.find(
        (item) => item?.id === this.props.requestCardbuidingStore.editRequestCardBuilding?.card?.id
      )

      if (checkHaveItem) {
        this.setState({ listCardEmpty: res?.items })
      } else {
        const newListCard = res?.items
        newListCard.push(this.props.requestCardbuidingStore.editRequestCardBuilding?.card)
        this.setState({ listCardEmpty: newListCard })
      }
    } else {
      this.setState({ listCardEmpty: [this.props.requestCardbuidingStore.editRequestCardBuilding?.card] })
    }
  }

  getListMasterData = async () => {
    await this.props.cardbuidingStore.getListVehicleType()
    await this.props.cardbuidingStore.getListParking()
  }

  onChangeTypeRequest = (requestType) => {
    this.setState({ requestType, visibleAction: false })
  }

  handleAddRow = () => {
    this.setState({ visibleAction: true })
    this.formStaff.current.resetFields()
    const newRow = { id: uuid() }

    const newData = [...this.state.staffs]

    newData.unshift(newRow)

    this.setState({ staffs: newData })
    this.setState({ uniqueId: newRow.id })
  }

  saveRow = async (id: any) => {
    const values = await this.formStaff.current.validateFields()
    const foundItem = this.state.staffs.find((item) => item.id === this.state.uniqueId)

    if (id === undefined) {
      if (foundItem) {
        const data = {
          ...values
        }
        // Merge the found item with the object
        Object.assign(foundItem, data)
      }
    } else {
      values.id = id
      const data = {
        ...values
      }
      if (foundItem) {
        // Merge the found item with the object
        Object.assign(foundItem, data)
      }
    }

    this.setState({ visibleAction: false })
    this.setState({ uniqueId: '' })
    this.setState({ previousDataRow: undefined })
  }

  handleCancleRow = async (id) => {
    // check nếu k có data record trước khi edit đó thì xoá row luôn=> do khi tạo
    // mới thì chắc chắn không có data dòng trước đó
    if (this.state.previousDataRow === undefined) {
      const newStaff = this.state.staffs.filter((item) => item.id !== id)
      this.setState({ staffs: newStaff })
    }
    this.setState({ visibleAction: false })
    this.setState({ uniqueId: '' })
    this.setState({ previousDataRow: undefined })
  }

  handleDeleteRow = (id) => {
    const newStaffs = this.state.staffs.filter((item) => item.id !== id)
    this.setState({ staffs: newStaffs })
  }

  onSave = (isDraft?) => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      try {
        let body
        switch (values?.type) {
          case cardRequestTypeEnum.IsCreate:
            if (this.state.staffs?.length === 0) {
              message.warning(LError('AT_LEAST_ONE_RECORD_IS_REQUIRED_TO_SAVE'))
              return
            }

            body = {
              ...this.props.requestCardbuidingStore.editRequestCardBuilding,
              ...values,
              cardRequests: this.state.staffs.map((item) => ({
                ...item,
                id: typeof item.id !== 'number' ? 0 : item.id
              }))
            }

            break
          case cardRequestTypeEnum.IsUpdate:
          case cardRequestTypeEnum.IsCancel:
            body = {
              ...this.props.requestCardbuidingStore.editRequestCardBuilding,
              ...values,
              cardRequests: [values]
            }

            break
        }
        if (this.props.params?.id) {
          await this.props.requestCardbuidingStore.updateByResident(
            { id: this.props.params?.id, ...body, isDraft },
            this.state.files
          )
        } else {
          await this.props.requestCardbuidingStore.create({ ...body, isDraft }, this.state.files)
        }

        this.props.navigate(portalLayouts.RequestBuildingCard.path)
      } catch (e) {
        console.log(e)
      }
    })
  }

  onSaveStaff = () => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      try {
        if (this.props.requestCardbuidingStore.editRequestCardBuilding?.id) {
          let body
          switch (values?.type) {
            case cardRequestTypeEnum.IsCreate:
              body = {
                ...this.props.requestCardbuidingStore.editRequestCardBuilding,
                ...values,
                cardRequests: this.state.staffs.map((item) => ({
                  ...item,
                  id: typeof item.id !== 'number' ? 0 : item.id
                }))
              }
              break
            case cardRequestTypeEnum.IsUpdate:
            case cardRequestTypeEnum.IsCancel:
              body = {
                ...this.props.requestCardbuidingStore.editRequestCardBuilding,
                ...values,
                cardRequests: [values]
              }
              break
          }

          await this.props.requestCardbuidingStore.update(body, this.state.files)
        }

        this.props.navigate(portalLayouts.RequestBuildingCard.path)
      } catch (e) {
        console.log(e)
      }
    })
  }

  onChangeStatusCard = (value: string | number) => {
    if (value === 1) {
      this.setState({ cardIsActive: true })
    } else {
      this.setState({ cardIsActive: false })
    }
  }

  onChangeStatusUseVehicle = (status: boolean) => {
    if (status) {
      this.setState({ isUseVehicle: true })
    } else {
      this.setState({ isUseVehicle: false })
    }
  }

  updateCard = () => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      const body = {
        status: values?.status,
        companyId: values?.companyId,
        tenantName: values?.tenantName,
        departmentName: values?.departmentName,
        description: '',
        vehicleAttachment: {
          cardId: values?.cardId,
          numberPlate: values?.numberPlate,
          model: values?.model,
          color: values?.color,
          typeId: values?.typeId,
          parkingId: values?.parkingId,
          tenantType: values?.tenantType,
          vehicleParkingType: values?.vehicleParkingType
        },
        id: values?.cardId
      }
      try {
        await this.props.cardbuidingStore.update(body)
        notifySuccess(LNotification('SUCCESS'), LNotification(L('SAVING_SUCCESSFULLY')))
      } catch (e) {
        console.log(e)
      }
    })
  }

  onCancel = () => {
    const { navigate } = this.props

    navigate(portalLayouts.RequestBuildingCard.path)
  }

  onRemoveFile = (file) => {
    const index = this.state.files.indexOf(file)
    const newFileList = [...this.state.files]
    newFileList.splice(index, 1)
    this.setState({ files: newFileList })
  }

  beforeUploadFile = (file) => {
    this.setState({ files: [...this.state.files, file] })
    return false
  }

  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {isGrantedAny(appPermissions.updateCardRequest.create, appPermissions.updateCardRequest.update) &&
            this.isStaff &&
            this.props.requestCardbuidingStore.editRequestCardBuilding?.id && (
              <Button
                type="primary"
                onClick={this.onSaveStaff}
                loading={isLoading}
                shape="round"
                disabled={
                  this.state.visibleAction ||
                  this.props.requestCardbuidingStore.editRequestCardBuilding?.status === cardRequestStatusEnum.IsDone ||
                  this.props.requestCardbuidingStore.editRequestCardBuilding?.status ===
                    cardRequestStatusEnum.IsCancelled
                }>
                {L('BTN_SAVE')}
              </Button>
            )}

          {!this.isStaff && this.props.requestCardbuidingStore.editRequestCardBuilding?.isDraft && (
            <Button
              type="primary"
              onClick={() => this.onSave(false)}
              loading={isLoading}
              shape="round"
              className="mr-1"
              disabled={
                this.state.visibleAction ||
                this.props.requestCardbuidingStore.editRequestCardBuilding?.status === cardRequestStatusEnum.IsDone ||
                this.props.requestCardbuidingStore.editRequestCardBuilding?.status === cardRequestStatusEnum.IsCancelled
              }>
              {L('BTN_SEND')}
            </Button>
          )}
          {!this.isStaff &&
            (this.props.requestCardbuidingStore.editRequestCardBuilding?.isDraft ||
              !this.props.requestCardbuidingStore.editRequestCardBuilding?.id) && (
              <Button
                type="primary"
                onClick={() => this.onSave(true)}
                loading={isLoading}
                shape="round"
                disabled={
                  this.state.visibleAction ||
                  this.props.requestCardbuidingStore.editRequestCardBuilding?.status === cardRequestStatusEnum.IsDone ||
                  this.props.requestCardbuidingStore.editRequestCardBuilding?.status ===
                    cardRequestStatusEnum.IsCancelled
                }>
                {L('BTN_SAVE_DRAFT')}
              </Button>
            )}
        </Col>
      </Row>
    )
  }

  public render() {
    const {
      sessionStore: { userAccountType },
      cardbuidingStore: { isLoading }
    } = this.props

    const { requestType } = this.state
    const columnsCreate = columnStaff(
      {
        title: L('FILE_DOCUMENT_ACTION'),
        dataIndex: 'action',
        key: 'action',
        width: 120,
        fixed: 'right',
        render: (action, row) => {
          return this.state.uniqueId === row.id ? (
            <div className="d-flex justify-content-center w-100 ">
              <Button
                type="text"
                icon={<CheckCircleFilled style={{ color: appStatusColors.success }} />}
                onClick={() => this.saveRow(row.id)}
              />
              <Button
                type="text"
                icon={<CloseCircleFilled style={{ color: appStatusColors.error }} />}
                onClick={() => this.handleCancleRow(row.id)}
              />
            </div>
          ) : (
            <div className="d-flex justify-content-center w-100 ">
              {/* {isGrantedAny(appPermissions.contractor.update) && ( */}
              <Button
                disabled={(this.state.visibleAction && this.state.uniqueId !== row.id) || row.cardId}
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<EditFilled />}
                onClick={() => {
                  this.formStaff.current.setFieldsValue({
                    ...row,
                    startTime: row?.startTime ? dayjs(row?.startTime) : null,
                    endTime: row?.endTime ? dayjs(row?.endTime) : null,
                    cardTypes: row?.cardTypes || []
                  })
                  this.setState({ uniqueId: row?.id, visibleAction: true, previousDataRow: { ...row } })
                }}
              />
              {/* )} */}
              {/* {isGrantedAny(appPermissions.contractor.update) && ( */}
              <Button
                disabled={(this.state.visibleAction && this.state.uniqueId !== row.id) || row?.cardId}
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<DeleteOutlined />}
                onClick={() => this.handleDeleteRow(row.id)}
              />
              {/* )} */}
              {this.isStaff && (
                <Button
                  disabled={this.state.visibleAction && this.state.uniqueId !== row?.cardId}
                  size="small"
                  shape="circle"
                  icon={<CarOutlined />}
                  onClick={() => {
                    if (row.cardId) {
                      window.open(portalLayouts.buildingCardManagementDetail.path.replace(':id', row?.cardId), '_blank')
                    } else {
                      this.setState({
                        showCardBuildingPopup: { show: !this.state.showCardBuildingPopup.show, data: row }
                      })
                    }
                  }}
                />
              )}
            </div>
          )
        }
      },
      this.isEditing,
      this.props.cardbuidingStore.listVehicleType,
      this.props.cardbuidingStore.listParking?.map((item) => ({
        id: item?.id,
        value: item?.id,
        label: item?.name,
        name: item?.name
      }))
    )

    return (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Card bordered={false} style={{ minHeight: 750 }} id="delivery-detail">
          <Form
            ref={this.formRef}
            layout={'vertical'}
            onFinish={this.onSave}
            onAbort={this.onCancel}
            onValuesChange={() => this.setState({ isDirty: true })}
            validateMessages={validateMessages}
            size="middle">
            <Row gutter={[16, 2]}>
              {/* company Component */}
              {userAccountType !== typeAccount.Resident && userAccountType !== typeAccount.Develop && (
                <>
                  <Col span={24}>
                    <label className="labelTitle">{L('REQUEST_CARD_COMPANY')}</label>
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <Form.Item name="companyId" label={L('TRANSPORT_COMPANY_NAME')}>
                      <Select disabled showArrow className="full-width" style={{ width: '100%' }} filterOption={false}>
                        {this.renderOptions(
                          [this.props.requestCardbuidingStore.editRequestCardBuilding?.company].map((item) => ({
                            id: item?.id,
                            value: item?.id,
                            label: item?.companyName
                          }))
                        )}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col sm={{ span: 8, offset: 0 }}>
                    <FormInput name={['company', 'companyCode']} label={L('TRANSPORT_TAX_CODE')} disabled />
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <FormInput name={['company', 'representative']} label={L('TRANSPORT_REPRESENTATIVE')} disabled />
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <FormInput name={['company', 'primaryAddress']} label={L('TRANSPORT_ADDRESS_CONTACT')} disabled />
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }}>
                    <FormInput name={['company', 'contactName']} label={L('TRANSPORT_USER_CONTACT')} disabled />
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }}>
                    <FormInput name={['company', 'position']} label={L('TRANSPORT_POSITION')} disabled />
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }}>
                    <FormInput name={['company', 'contactPhone']} label={L('TRANSPORT_PHONE')} disabled />
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }}>
                    <FormInput name={['company', 'contactEmail']} label={L('TRANSPORT_EMAIL')} disabled />
                  </Col>
                </>
              )}
            </Row>

            <Col span={24}>
              <label className="labelTitle">{L('REQUEST_CARD_TYPE_SELECT')}</label>
            </Col>

            <Col sm={{ span: 24, offset: 0 }}>
              <FormRadioButton
                disabled={this.props.requestCardbuidingStore?.editRequestCardBuilding?.id}
                onChange={(item) => this.onChangeTypeRequest(item?.target?.value)}
                options={listCardRequestType}
                name="type"
                rule={[{ required: true }]}
              />
            </Col>
            {this.state.requestType === cardRequestTypeEnum.IsCancel && (
              <Col sm={{ span: 6, offset: 0 }}>
                <FormDatePicker label={L('REQUEST_CARD_DATE_STOP_CARD')} name="stoppingDate" rule={rules.required} />
              </Col>
            )}
            <Col sm={{ span: 18, offset: 0 }}></Col>

            {requestType === cardRequestTypeEnum.IsCreate && (
              <Col sm={{ span: 24, offset: 0 }} className="my-2">
                <Form ref={this.formStaff} layout={'vertical'} size="middle" validateMessages={validateMessages}>
                  <Table
                    pagination={false}
                    size="small"
                    components={{
                      body: {
                        cell: EditableCell
                      }
                    }}
                    bordered
                    dataSource={this.state.staffs}
                    columns={columnsCreate}
                    rowKey={(record) => record.id}
                    scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
                  />
                </Form>
                <style scoped>{`
                .ant-table-wrapper{
                 margin-bottom: 0px
               }
           `}</style>
                <Button
                  type="primary"
                  className="w-100"
                  onClick={this.handleAddRow}
                  disabled={this.state.visibleAction}>
                  {L('ADD_NEW_ROW')}
                </Button>
              </Col>
            )}

            {(requestType === cardRequestTypeEnum.IsUpdate || requestType === cardRequestTypeEnum.IsCancel) && (
              <ComponentRequestChangeInfo
                onRefresh={() => this.getDetail(this.props.params?.id)}
                isStaff={this.isStaff}
                itemDetail={this.props.requestCardbuidingStore.editRequestCardBuilding}
                requestType={this.state.requestType}
                formItem={this.formRef}
                listVehicleType={this.props.cardbuidingStore.listVehicleType}
                listParking={this.props.cardbuidingStore.listParking}
                listTenantTypeUseVehicle={listTenantTypeUseVehicle}
                listVehicleParkingType={listVehicleParkingType}
              />
            )}

            {this.isStaff && (
              <Row gutter={[16, 0]}>
                <Col span={24}>
                  <label className="labelTitle">{L('REQUEST_CARD_USER_ACTION')}</label>
                </Col>

                <Col sm={{ span: 6, offset: 0 }}>
                  <FormInput
                    name={['lastModifierUser', 'displayName']}
                    label={L('LAST_MODIFIER_USER_DISPLAY_NAME')}
                    disabled
                  />
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <FormInput
                    name={['lastModifierUser', 'phoneNumber']}
                    label={L('LAST_MODIFIER_USER_PHONE')}
                    disabled
                  />
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <FormInput
                    name={['lastModifierUser', 'emailAddress']}
                    label={L('LAST_MODIFIER_USER_EMAIL')}
                    disabled
                  />
                </Col>
                <Col span={6}>
                  <Form.Item name="status" label={L('LAST_MODIFIER_USER_STATUS')} rules={rules.required}>
                    <Select showArrow className="full-width" style={{ width: '100%' }} filterOption={false}>
                      {this.renderOptions(listCardRequestStatus)}
                    </Select>
                  </Form.Item>
                </Col>

                <Col sm={{ span: 24, offset: 0 }}>
                  <FormInput name={'updateDescription'} label={L('LAST_MODIFIER_USER_DESTIPTION')} />
                </Col>
              </Row>
            )}

            {requestType === cardRequestTypeEnum.IsCreate && (
              <Col sm={{ span: 24, offset: 0 }}>
                <label className="labelTitle">{L('TRANS_DOCUMENT')}</label>
                <FileUploadWrapV2
                  multiple
                  parentId={this.state.idDocument}
                  fileStore={this.props.fileStore}
                  onRemoveFile={this.onRemoveFile}
                  beforeUploadFile={this.beforeUploadFile}
                  acceptedFileTypes={fileTypeGroup.documentAndImage}
                  maxSize={25}
                />
              </Col>
            )}
          </Form>
        </Card>
        <CreateCardBuildingModal
          formItem={this.state.showCardBuildingPopup.data}
          visible={this.state.showCardBuildingPopup.show}
          onRefresh={() => this.getDetail(this.props.params?.id)}
          onCancel={() => {
            this.setState(() => ({
              showCardBuildingPopup: {
                show: !this.state.showCardBuildingPopup.show,
                data: undefined
              }
            }))
          }}
        />
      </WrapPageScroll>
    )
  }
}

export default withRouter(RequestCardBuidingDetail)
