import { Form, Modal, Col, Row, Button, Select, Input } from 'antd'
import { L } from '../../../../lib/abpUtility'
import AppComponentBase from '../../../../components/AppComponentBase'
import { validateMessages } from '../../../../lib/validation'
import React from 'react'
import { debounce } from 'lodash'
import packageFeeService from '@services/fee/packageFeeService'
import AppConsts from '@lib/appconst'
import companyService from '@services/project/companyService'
import { addItemToList, filterOptions } from '@lib/helper'
import ElectricFormStore from '@stores/meterReading/electricFormStore'
import feeTypeService from '@services/fee/feeTypeService'

const { formVerticalLayout } = AppConsts

export interface IProps {
  visible: boolean
  onCancel: (isReload: boolean) => void
  electricFormStore: ElectricFormStore
}

class ModalCreateRequestElectric extends AppComponentBase<IProps> {
  formRef: any = React.createRef()
  state = {
    packageOptions: [] as any,
    listCompany: [] as any,
    isAllowCompanyExist: false,
    totalCompany: 0,
    namePackageNotify: '',

    feePackageCurrent: {} as any
  }

  componentDidUpdate = async (prevProps: Readonly<IProps>) => {
    if (!prevProps.visible && this.props.visible) {
      if (this.props.visible) {
        await this.handleCurrentFeePackage()
        await this.handlePackageSearch('')
        await this.getistCompanies()
        addItemToList(this.state.packageOptions, this.state.feePackageCurrent)

        this.formRef.current?.resetFields()
        this.formRef.current?.setFieldsValue({ feePackageId: this.state.feePackageCurrent?.id ?? undefined })

        this.setState({ isAllowCompanyExist: false })
      }
    }
  }

  handleCurrentFeePackage = async () => {
    const feePackageCurrent = await feeTypeService.getCurrent()

    this.setState({ feePackageCurrent })
  }

  handlePackageSearch = debounce(async (value) => {
    const packages = await packageFeeService.filter({
      keyword: value
    })
    this.setState({ packageOptions: packages })
  }, 300)

  getistCompanies = async () => {
    const listCompany = await companyService.getListCompany()

    this.setState({ listCompany })
  }

  handleSubmit = () => {
    const form = this.formRef.current

    form.validateFields().then((values: any) => {
      this.setState({ totalCompany: values.companyId?.length })
      this.checkRequestIsValid(values)
    })
  }

  checkRequestIsValid = async (dataCheck) => {
    await this.props.electricFormStore.checkRequestIsValid(dataCheck)

    if (this.props.electricFormStore.listIdCompanyError?.length > 0) {
      this.setState({ isAllowCompanyExist: true })
    } else {
      this.setState({ isAllowCompanyExist: false })
      this.createRequestElectric(dataCheck)
      this.props.onCancel(true)
    }
  }

  createRequestElectric = async (dataCreate?: any) => {
    console.log(dataCreate)
    const form = this.formRef.current
    if (dataCreate) {
      await this.props.electricFormStore.createRequestElectric(dataCreate)
    } else {
      form.validateFields().then(async (values: any) => {
        await this.props.electricFormStore.createRequestElectric(values)
        this.props.onCancel(true)
      })
    }
  }

  handleGetNameFeePackage = (id?) => {
    if (id) {
      const name = this.state.packageOptions.find((item) => item?.id === id)?.name

      this.setState({ namePackageNotify: name })
    } else {
      this.setState({ namePackageNotify: '' })
    }
  }

  render() {
    const { visible, onCancel } = this.props

    return (
      this.props.visible && (
        <Modal
          open={visible}
          onCancel={() => onCancel(false)}
          title={
            <div className="d-flex justify-content-center w-100">
              {!this.state.isAllowCompanyExist ? (
                L('TITLE_CREATE_REQUEST_ELECTRIC')
              ) : (
                <>
                  {L('TITLE_CREATE_REQUEST_ELECTRIC_MONTH')} {this.state.namePackageNotify}
                </>
              )}
            </div>
          }
          footer={[
            <>
              {!this.state.isAllowCompanyExist ? (
                <div className="d-flex justify-content-center">
                  <Button onClick={() => onCancel(false)}>{L('BTN_CANCEL')}</Button>
                  <Button key="submit" type="primary" onClick={this.handleSubmit}>
                    {L('BTN_SAVE')}
                  </Button>
                </div>
              ) : (
                <div className="d-flex justify-content-center">
                  <Button onClick={() => this.setState({ isAllowCompanyExist: false })}>{L('BTN_CANCEL')}</Button>
                  <Button key="submit" type="primary" onClick={() => this.createRequestElectric()}>
                    {L('BTN_OK')}
                  </Button>
                </div>
              )}
            </>
          ]}>
          <div style={{ display: this.state.isAllowCompanyExist ? 'none' : 'block' }}>
            <Form ref={this.formRef} layout="vertical" validateMessages={validateMessages} size="middle">
              <Row gutter={[16, 0]}>
                <Col sm={{ span: 24, offset: 0 }}>
                  <Form.Item
                    label={L('CONTRACT_COMPANY')}
                    {...formVerticalLayout}
                    name="companyId"
                    rules={[{ required: true }]}>
                    <Select mode="multiple" showSearch allowClear filterOption={filterOptions} className="full-width">
                      {this.renderOptions(this.state.listCompany)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col sm={{ span: 24, offset: 0 }}>
                  <Form.Item
                    label={L('METER_READING_PACKAGE')}
                    {...formVerticalLayout}
                    name="feePackageId"
                    rules={[{ required: true }]}>
                    <Select
                      showSearch
                      allowClear
                      filterOption={false}
                      className="full-width"
                      onSearch={this.handlePackageSearch}
                      onChange={this.handleGetNameFeePackage}>
                      {this.renderOptions(this.state.packageOptions)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col sm={{ span: 24, offset: 0 }}>
                  <Form.Item label={L('METER_NOTE')} {...formVerticalLayout} name="note">
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>

          <Row gutter={[16, 0]} style={{ display: this.state.isAllowCompanyExist ? 'block' : 'none' }}>
            <Col sm={{ span: 24, offset: 0 }}>
              <p>
                {L(
                  'CHECK_TOTAL_{0}_ITEMS_HAVE_{1}_EXIST',
                  this.state.totalCompany,
                  this.props.electricFormStore.listIdCompanyError?.length
                )}
              </p>
            </Col>
          </Row>
        </Modal>
      )
    )
  }
}

export default ModalCreateRequestElectric
