import React from 'react'

import { Col, Form, Row, Select, Card, Modal, Button, Input, DatePicker, InputNumber, Radio } from 'antd'
import { isGrantedAny, L, LNotification } from '../../../../lib/abpUtility'
import { filterOptions } from '../../../../lib/helper'
import { validateMessages } from '../../../../lib/validation'
import rules from './validation'
import AppConsts, { appPermissions, dateFormat, fileTypeGroup } from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import ContractStore from '../../../../stores/project/contractStore'
import CompanyStore from '../../../../stores/project/companyStore'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import AppComponentBase from '../../../../components/AppComponentBase'
import ProjectStore from '../../../../stores/project/projectStore'
import { portalLayouts } from '../../../../components/Layout/Router/router.config'
import FileStore from '../../../../stores/common/fileStore'
import SessionStore from '../../../../stores/sessionStore'
import CurrencyInput from '@components/Inputs/CurrencyInput'
import ContractCategoryStore from '@stores/project/contractCategoryStore'
import ModalContractPayment from './ModalContractPayment'
import withRouter from '@components/Layout/Router/withRouter'
import FileUploadWrapV2 from '@components/FileUploadV2'
import NoRole from '@components/ComponentNoRole'

const { formVerticalLayout } = AppConsts
const { confirm } = Modal
const relatedType: any = { building: 1, unit: 2, other: 3 }
const relatedTypes: any = [
  { value: 1, name: L('BUILDING') },
  { value: 2, name: L('UNIT') },
  {
    value: 3,
    name: L('OTHER')
  }
]
const contractTypeConst: any = { CONTRACT_PRINCIPAL: 1, CONTRACT_ANNEX: 2 }
const contractTypes: any = [
  { value: 1, name: L('CONTRACT_PRINCIPAL') },
  { value: 2, name: L('CONTRACT_ANNEX') }
]
const tabKeys = {
  tabInfo: 'CONTRACT_TAB_INFO',
  tabComment: 'CONTRACT_TAB_COMMENTS',
  tabAuditLog: 'CONTRACT_TAB_AUDIT_LOG'
}

export interface IContractFormProps {
  navigate: any
  params: any
  contractStore: ContractStore
  contractCategoryStore: ContractCategoryStore
  projectStore: ProjectStore
  companyStore: CompanyStore
  fileStore: FileStore
  sessionStore: SessionStore
}

@inject(
  Stores.ContractStore,
  Stores.ContractCategoryStore,
  Stores.ProjectStore,
  Stores.CompanyStore,
  Stores.FileStore,
  Stores.SessionStore
)
@observer
class ContractDetail extends AppComponentBase<IContractFormProps> {
  state = {
    isDirty: false,
    tabActiveKey: tabKeys.tabInfo,
    files: [] as any,
    buildings: [] as any,
    units: [] as any,
    haveProcessPayment: false,
    modalVisible: false,
    idDocument: undefined
  }
  formRef: any = React.createRef()

  async componentDidMount() {
    this.isGranted(appPermissions.companyContract.detail) &&
      (await Promise.all([
        this.getDetail(this.props?.params?.id),
        this.findProject(''),
        this.findCompanies(''),
        this.findContractCategories('')
      ]))
    this.initDefault()
  }

  initDefault = () => {
    const { editContract } = this.props.contractStore
    if (editContract?.id) {
      this.props.companyStore.companyOptions = this.props.contractStore.editContract.company
        ? [this.props.contractStore.editContract.company]
        : []
      this.props.projectStore.buildingOptions = this.props.contractStore.editContract.buildings
        ? [...this.props.contractStore.editContract.buildings]
        : []
      this.props.projectStore.unitOptions = this.props.contractStore.editContract.units
        ? [...this.props.contractStore.editContract.units]
        : []
      this.props.contractCategoryStore.contractCategoryOptions = this.props.contractStore.editContract.contractCategory
        ? [this.props.contractStore.editContract.contractCategory]
        : []
      this.props.contractStore.editContract.contractCategoryId === 1 && this.setState({ haveProcessPayment: true })
    }
  }

  getDetail = async (id?) => {
    if (!id) {
      this.setState({ files: [] })
      await this.props.contractStore.createContract(this.props.sessionStore.projectId)
    } else {
      await this.props.contractStore.get(id)
      this.setState({
        idDocument: this.props.contractStore.editContract.documentFileId
      })
    }

    this.formRef.current.setFieldsValue({
      ...this.props.contractStore.editContract
    })
  }

  changeRelatedType = () => {
    const relatedTo = this.formRef.current.getFieldValue('relatedTo')
    if (relatedTo === relatedType.building) {
      this.findBuildings('')
    } else {
      this.findUnits('', true)
    }
  }

  findBuildings = async (keyword, changeProject?) => {
    const projectId = this.formRef.current.getFieldValue('projectId')
    if (!projectId || changeProject) {
      this.formRef.current.setFieldsValue({
        buildingIds: undefined,
        unitIds: undefined
      })
    }
    await this.props.projectStore.filterBuildingOptions({ keyword, projectId })
  }

  findUnits = async (keyword, changeBuilding) => {
    const projectId = this.formRef.current.getFieldValue('projectId')
    if (!projectId || changeBuilding) {
      this.formRef.current.setFieldsValue({
        buildingIds: undefined,
        unitIds: undefined
      })
    }
    await this.props.projectStore.filterUnitOptions({ keyword, projectId })
  }

  findProject = async (keyword) => {
    await this.props.projectStore.filterOptions({ keyword })
  }

  findCompanies = async (keyword) => {
    await this.props.companyStore.filterOptions({ keyword })
  }

  findContractCategories = async (keyword) => {
    await this.props.contractCategoryStore.filterContractCategoryOptions({
      keyword
    })
  }

  findContracts = async (keyword) => {
    await this.props.contractStore.filterContractOptions({ keyword })
  }

  onRemoveFile = (file) => {
    const index = this.state.files.indexOf(file)
    const newFileList = [...this.state.files]
    newFileList.splice(index, 1)
    this.setState({ files: newFileList })
  }

  updateAmount = () => {
    const unitPrice = this.formRef.current.getFieldValue('unitPrice')
    const usageTimes = this.formRef.current.getFieldValue('usageTimes')
    if (unitPrice > 0 && usageTimes > 0) {
      const contractAmount = unitPrice * usageTimes
      this.formRef.current.setFieldsValue({ contractAmount })
    }
  }

  beforeUploadFile = (file) => {
    this.setState({ files: [...this.state.files, file] })
    return false
  }

  onSave = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.contractStore.editContract?.id) {
        this.isGranted(appPermissions.companyContract.update) &&
          (await this.props.contractStore.update(
            {
              ...this.props.contractStore.editContract,
              ...values
            },
            this.state.files
          ))
      } else {
        this.isGranted(appPermissions.companyContract.create) &&
          (await this.props.contractStore.create(values, this.state.files))
      }

      this.props.navigate(portalLayouts.companyContracts.path)
    })
  }

  onCancel = () => {
    if (this.state.isDirty) {
      confirm({
        title: LNotification('ARE_YOU_SURE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          this.props.navigate(portalLayouts.companyContracts.path)
        }
      })
      return
    }
    this.props.navigate(portalLayouts.companyContracts.path)
  }

  renderActions = (isLoading?) => {
    const { tabActiveKey } = this.state
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {tabActiveKey === tabKeys.tabInfo &&
            isGrantedAny(appPermissions.companyContract.create, appPermissions.companyContract.update) && (
              <Button type="primary" onClick={this.onSave} loading={isLoading} shape="round">
                {L('BTN_SAVE')}
              </Button>
            )}
        </Col>
      </Row>
    )
  }

  render() {
    const {
      projectStore: { projectOptions, buildingOptions, unitOptions },
      companyStore: { companyOptions },
      contractStore: { isLoading, contractOptions },
      contractCategoryStore: { contractCategoryOptions }
    } = this.props

    return this.isGranted(appPermissions.companyContract.detail) ? (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Card bordered={false}>
          <Form
            ref={this.formRef}
            layout={'vertical'}
            onFinish={this.onSave}
            onAbort={this.onCancel}
            onValuesChange={() => this.setState({ isDirty: true })}
            validateMessages={validateMessages}
            size="middle">
            <Row gutter={[16, 0]}>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item label={L('PROJECT')} {...formVerticalLayout} name="projectId" rules={rules.projectId}>
                  <Select
                    showSearch
                    allowClear
                    className="full-width"
                    filterOption={filterOptions}
                    onChange={() => this.findBuildings('', true)}
                    disabled={this.formRef.current?.getFieldValue('id')}>
                    {this.renderOptions(projectOptions)}
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item label={L('CONTRACT_RELATED_TO')} {...formVerticalLayout} name="relatedTo">
                  <Select
                    allowClear
                    filterOption={false}
                    className="full-width"
                    onChange={() => this.changeRelatedType()}>
                    {this.renderOptions(relatedTypes)}
                  </Select>
                </Form.Item>
              </Col>

              <Col sm={{ span: 8, offset: 0 }}>
                {this.formRef.current?.getFieldValue('relatedTo') === relatedType.building && (
                  <Form.Item label={L('CONTRACT_BUILDING')} {...formVerticalLayout} name="buildingIds">
                    <Select
                      allowClear
                      showArrow
                      mode="multiple"
                      filterOption={false}
                      className="full-width"
                      disabled={!this.formRef.current?.getFieldValue('projectId')}>
                      {this.renderOptions(buildingOptions)}
                    </Select>
                  </Form.Item>
                )}
                {this.formRef.current?.getFieldValue('relatedTo') === relatedType.unit && (
                  <Form.Item label={L('CONTRACT_UNIT')} {...formVerticalLayout} name="unitIds">
                    <Select
                      showSearch
                      showArrow
                      allowClear
                      mode="multiple"
                      filterOption={false}
                      className="full-width"
                      onSearch={(value) => this.findUnits(value, true)}
                      disabled={!this.formRef.current?.getFieldValue('projectId')}>
                      {this.renderOptions(unitOptions)}
                    </Select>
                  </Form.Item>
                )}
              </Col>

              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item
                  label={L('CONTRACT_COMPANY')}
                  {...formVerticalLayout}
                  name="companyId"
                  rules={rules.companyId}>
                  <Select
                    showSearch
                    allowClear
                    filterOption={false}
                    className="full-width"
                    onSearch={this.findCompanies}>
                    {this.renderOptions(companyOptions)}
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item
                  label={L('CONTRACT_NAME')}
                  {...formVerticalLayout}
                  name="contractName"
                  rules={rules.contractName}>
                  <Input />
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item
                  label={L('CONTRACT_NUMBER')}
                  {...formVerticalLayout}
                  name="contractNo"
                  rules={rules.contractNo}>
                  <Input />
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item
                  label={L('CONTRACT_CATEGORY')}
                  {...formVerticalLayout}
                  name="contractCategoryId"
                  rules={rules.contractCategoryId}>
                  <Select
                    showSearch
                    allowClear
                    className="full-width"
                    filterOption={filterOptions}
                    onSearch={(value) => this.findContractCategories(value)}
                    onChange={(e) => {
                      if (e === 1) {
                        this.setState({ haveProcessPayment: true })
                      } else {
                        this.setState({ haveProcessPayment: false })
                      }
                    }}>
                    {this.renderOptions(contractCategoryOptions)}
                  </Select>
                </Form.Item>
              </Col>
              <Col md={{ span: 8 }} sm={{ span: 8 }}>
                <Form.Item name={'contractTypeCode'} label={this.L('CONTRACT_TYPE')} rules={rules.contractTypeCode}>
                  <Radio.Group>
                    {contractTypes.map((contractType) => {
                      return (
                        <Radio value={contractType.value} key={contractType.value}>
                          {L(contractType.name)}
                        </Radio>
                      )
                    })}
                  </Radio.Group>
                </Form.Item>
              </Col>
              {this.state.haveProcessPayment && (
                <Col md={{ span: 8 }} sm={{ span: 8 }}>
                  <Form.Item name="progressPayments" label={' '}>
                    <Button size="small" type="primary" onClick={() => this.setState({ modalVisible: true })}>
                      {this.L('PROGRES_PAYMENTS')}
                    </Button>
                  </Form.Item>
                </Col>
              )}
              {this.state.modalVisible && (
                <Col md={{ span: 24 }} sm={{ span: 24 }} className="mb-3 pb-3">
                  <ModalContractPayment
                    data={this.props.contractStore.editContract}
                    onSave={(values) => {
                      this.formRef.current.setFields([{ name: 'progressPayments', value: values }])
                      this.setState({ modalVisible: false })
                    }}
                    onCancel={() => this.setState({ modalVisible: false })}
                  />
                </Col>
              )}
              <Col md={{ span: 8 }} sm={{ span: 8 }}>
                {contractTypeConst.CONTRACT_ANNEX === this.formRef.current?.getFieldValue('contractTypeCode') && (
                  <Form.Item name={'contractParentId'} label={this.L('CONTRACT_PARENT')}>
                    <Select
                      showSearch
                      allowClear
                      className="full-width"
                      filterOption={filterOptions}
                      onSearch={(value) => this.findContracts(value)}>
                      {(contractOptions || []).map((contract, index) => (
                        <Select.Option key={index} value={contract?.id}>
                          {contract.contractName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
              </Col>
              <Col md={{ span: 8 }} sm={{ span: 8 }}>
                <Form.Item name={'signedDate'} label={this.L('CONTRACT_SINGED_DATE')}>
                  <DatePicker format={dateFormat} style={{ width: '100%' }} placeholder={L('SELECT_DATE')} />
                </Form.Item>
              </Col>
              <Col md={{ span: 8 }} sm={{ span: 8 }}>
                <Form.Item name={'validDate'} label={this.L('CONTRACT_START_DATE')}>
                  <DatePicker
                    disabledDate={(current) => {
                      const expiredDate = this.formRef.current.getFieldValue('expiredDate')
                      return current && current > expiredDate?.endOf('day')
                    }}
                    format={dateFormat}
                    style={{ width: '100%' }}
                    placeholder={L('SELECT_DATE')}
                  />
                </Form.Item>
              </Col>
              <Col md={{ span: 8 }} sm={{ span: 8 }}>
                <Form.Item name={'expiredDate'} label={this.L('CONTRACT_EXPIRED_DATE')}>
                  <DatePicker
                    disabledDate={(current) => {
                      const validDate = this.formRef.current.getFieldValue('validDate')
                      return current && current < validDate?.endOf('day')
                    }}
                    format={dateFormat}
                    style={{ width: '100%' }}
                    placeholder={L('SELECT_DATE')}
                  />
                </Form.Item>
              </Col>
              <Col md={{ span: 8 }} sm={{ span: 8 }}>
                <Form.Item name={'unitPrice'} label={this.L('CONTRACT_PRICE')} rules={rules.unitPrice}>
                  <CurrencyInput onChange={this.updateAmount} />
                </Form.Item>
              </Col>
              <Col md={{ span: 8 }} sm={{ span: 8 }}>
                <Form.Item name={'usageTimes'} label={this.L('CONTRACT_USAGE_TIMES')} rules={rules.usageTimes}>
                  <InputNumber min={0} className={'full-width'} onChange={this.updateAmount} />
                </Form.Item>
              </Col>
              <Col md={{ span: 8 }} sm={{ span: 8 }}>
                <Form.Item name={'contractAmount'} label={this.L('CONTRACT_AMOUNT')}>
                  <CurrencyInput />
                </Form.Item>
              </Col>
              <Col md={{ span: 8 }} sm={{ span: 8 }}>
                <Form.Item name={'taxPercentage'} label={this.L('CONTRACT_TAX')}>
                  <InputNumber min={0} className={'full-width'} />
                </Form.Item>
              </Col>
              {/*<Col md={{ span: 8 }} sm={{ span: 8 }}>*/}
              {/*  <Form.Item name={'representative'}*/}
              {/*             label={this.L('CONTRACT_REPRESENTATIVE')}>*/}
              {/*    <Select*/}
              {/*      showSearch*/}
              {/*      allowClear*/}
              {/*      className="full-width"*/}
              {/*      filterOption={filterOptions}*/}
              {/*    >*/}
              {/*      {this.renderOptions(representativeList)}*/}
              {/*    </Select>*/}
              {/*  </Form.Item>*/}
              {/*</Col>*/}
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item label={L('CONTRACT_PAYMENT_TERM')} {...formVerticalLayout} name="paymentTerm">
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item label={L('CONTRACT_COMMENT')} {...formVerticalLayout} name="description">
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <FileUploadWrapV2
                  multiple
                  parentId={this.state.idDocument}
                  fileStore={this.props.fileStore}
                  onRemoveFile={this.onRemoveFile}
                  beforeUploadFile={this.beforeUploadFile}
                  acceptedFileTypes={fileTypeGroup.documentAndImage}
                  maxSize={25}
                  totalSize={50}
                />
              </Col>
            </Row>
          </Form>
        </Card>
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(ContractDetail)
