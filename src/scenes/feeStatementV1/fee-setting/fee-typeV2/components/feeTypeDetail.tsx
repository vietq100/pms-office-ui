import React from 'react'

import { Form, Card, Row, Col, Button, Input, Switch, Radio } from 'antd'

import { inject, observer } from 'mobx-react'

import WrapPageScroll from '@components/WrapPageScroll'
import AppComponentBase from '@components/AppComponentBase'
import withRouter from '@components/Layout/Router/withRouter'
import { L, LError } from '@lib/abpUtility'
import FeeTypeStore from '@stores/fee/feeTypeStore'
import Stores from '@stores/storeIdentifier'
import AppConsts, { appPermissions } from '@lib/appconst'
import rules from './validation'
import MultiLanguageInput from '@components/Inputs/MultiLanguageInput'

import { validateMessages } from '@lib/validation'
import GenFeeManagement from './GenFeeManagement'
import type { RadioChangeEvent } from 'antd'
import GenFeeWaterTable from './GenFeeWaterTable'
import GenFeElectricTable from './GenFeElectricTable'
import GenFeeParkingTable from './GenFeeParkingTable'
import NoRole from '@components/ComponentNoRole'
import GenOvertimeFeeElectricTable from './GenOvertimeFeeElectricTable'
import GenFeeRent from './GenFeeRent'
const { formVerticalLayout, generateType, genType, purposeUsing } = AppConsts
// const confirm = Modal.confirm
export interface IFeeTypeProps {
  navigate: any
  feeTypeStore: FeeTypeStore
  params: any
}

@inject(Stores.FeeTypeStore)
@observer
class FeeTypeDetail extends AppComponentBase<IFeeTypeProps> {
  formRef: any = React.createRef()

  formWaterResidential: any = React.createRef()
  formWaterCommercial: any = React.createRef()
  formWaterOther: any = React.createRef()

  formElectricResidential: any = React.createRef()
  formElectricCommercial: any = React.createRef()
  formElectricOther: any = React.createRef()

  formParkingConfig: any = React.createRef()

  formManagement: any = React.createRef()

  get languages() {
    return abp.localization.languages.filter((val: any) => {
      return !val.isDisabled
    })
  }

  state = {
    isShowGenType: false,
    typeChooseGen: undefined,
    dataconfigELectric: [] as any,
    dataconfigWater: [] as any,
    isPassFormOther: false,
    isPassFormResidential: false,
    isPassFormCommercial: false
  }

  async componentDidMount() {
    this.isGranted(appPermissions.feeType.detail) && this.getDetail(this.props.params?.id)
  }
  generateType = Object.keys(generateType).map((key) => {
    return { label: L(key.toUpperCase()), value: generateType[key] }
  })
  getDetail = async (id?) => {
    if (!id) {
      this.props.feeTypeStore.createFeeType()
      this.formRef.current.setFieldsValue({
        ...this.props.feeTypeStore.editFeeType
      })
    } else {
      await this.props.feeTypeStore.get(id)
      await this.formRef.current.setFieldsValue({
        ...this.props.feeTypeStore.editFeeType
      })

      this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration?.isActive === true
        ? this.setState({ isShowGenType: true })
        : this.setState({ isShowGenType: false })
    }
    this.setState({
      typeChooseGen: this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration?.generateType
    })
  }

  onSave = async () => {
    this.formRef.current?.validateFields().then(async (values: any) => {
      if (!this.props.feeTypeStore.editFeeType?.id) {
        //create feetype when turn off setup config
        if (
          values.feeGenerateConfiguration.isActive === false ||
          values.feeGenerateConfiguration.isActive === undefined
        ) {
          values.feeGenerateConfiguration = null
          await this.props.feeTypeStore.create(values)
          this.props.navigate(-1)
        }
        //create feetype when turn on setup config
        else {
          this.createOrUpdate(values)
        }
      } else {
        //update feetype when turn off the pre-existing configuration
        if (values.feeGenerateConfiguration.isActive === true) {
          this.createOrUpdate(values)
        }
        //Update when existing configuration
        else {
          delete values.feeGenerateConfiguration
          this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration
            ? await this.props.feeTypeStore.update({
                ...values,
                id: this.props.feeTypeStore.editFeeType?.id,
                feeGenerateConfiguration: {
                  ...this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration,
                  isActive: false
                }
              })
            : await this.props.feeTypeStore.update({
                ...values,
                id: this.props.feeTypeStore.editFeeType?.id
              })
          this.props.navigate(-1)
        }
      }
    })
  }

  createOrUpdate = async (values) => {
    console.log(values)
    console.log(values.feeGenerateConfiguration.generateType)
    //reset dataconfig when call createOrUpdate, avoid duplicate many times
    this.setState({ dataconfigELectric: [] })
    this.setState({ dataconfigWater: [] })

    switch (values.feeGenerateConfiguration.generateType) {
      case 1:
        await this.formManagement.current?.validateFields().then(async (valuesManagement: any) => {
          // verify check null data
          if (valuesManagement.feeManagementConfigurations.length < 1) {
            return this.formManagement.current.setFields([
              {
                name: 'isDuplicate',
                errors: [LError('FEE_TYPE_GEN_NEED_VALUES')]
              }
            ])
          } else {
            valuesManagement.feeManagementConfigurations.map((item) => {
              item.description = valuesManagement.description
            })
            //update feetype when have fee configManagement
            if (this.props.feeTypeStore.editFeeType?.id) {
              await this.props.feeTypeStore.update({
                ...values,

                id: this.props.feeTypeStore.editFeeType?.id,
                feeGenerateConfiguration: {
                  feeTypeid: this.props.feeTypeStore.editFeeType?.id,
                  description: values.description,
                  generateType: values.feeGenerateConfiguration.generateType,
                  ...this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration,
                  feeManagementConfigurations: valuesManagement.feeManagementConfigurations,
                  isActive: true
                }
              })
              //create feetype and config
            } else {
              this.props.feeTypeStore.create({
                ...values,
                feeGenerateConfiguration: {
                  description: values.description,
                  generateType: values.feeGenerateConfiguration.generateType,
                  feeManagementConfigurations: valuesManagement.feeManagementConfigurations,
                  isActive: true
                }
              })
            }
            this.props.navigate(-1)
          }
        })
        break
      case 2:
        //verify form electric other, check null, pass => save config and continue
        await this.formElectricOther.current?.validateFields().then(async (valueELectric: any) => {
          // verify check null data
          if (valueELectric.feeElectricityConfigurations?.length < 1) {
            return this.formElectricOther.current.setFields([
              {
                name: 'isDuplicate',
                errors: [LError('FEE_TYPE_GEN_NEED_VALUES')]
              }
            ])
          } else {
            valueELectric.feeElectricityConfigurations.map((item) => {
              item.description = valueELectric.description
            })
            this.setState({
              dataconfigELectric: [...this.state.dataconfigELectric, ...valueELectric.feeElectricityConfigurations]
            })
            this.setState({ isPassFormOther: true })
          }
        })

        //verify form electric residential, check null, pass => save config and continue
        await this.formElectricResidential.current?.validateFields().then(async (valueELectric: any) => {
          // verify check null data
          if (valueELectric.feeElectricityConfigurations?.length < 1) {
            return this.formElectricResidential.current.setFields([
              {
                name: 'isDuplicate',
                errors: [LError('FEE_TYPE_GEN_NEED_VALUES')]
              }
            ])
          } else {
            valueELectric.feeElectricityConfigurations.map((item) => {
              item.description = valueELectric.description
            })

            this.setState({
              dataconfigELectric: [...this.state.dataconfigELectric, ...valueELectric.feeElectricityConfigurations]
            })

            this.setState({ isPassFormResidential: true })
          }
        })

        //verify form electric residential, check null, pass => save config and continue
        await this.formElectricCommercial.current?.validateFields().then(async (valueELectric: any) => {
          // verify check null data
          if (valueELectric.feeElectricityConfigurations.length < 1) {
            return this.formElectricCommercial.current.setFields([
              {
                name: 'isDuplicate',
                errors: [LError('FEE_TYPE_GEN_NEED_VALUES')]
              }
            ])
          } else {
            valueELectric.feeElectricityConfigurations.map((item) => {
              item.description = valueELectric.description
            })
            this.setState({
              dataconfigELectric: [...this.state.dataconfigELectric, ...valueELectric.feeElectricityConfigurations]
            })

            this.setState({ isPassFormCommercial: true })
          }
        })
        console.log(this.state.isPassFormOther, this.state.isPassFormResidential, this.state.isPassFormCommercial)
        if (
          this.state.isPassFormOther === true
          // &&
          // this.state.isPassFormResidential === true &&
          // this.state.isPassFormCommercial === true
        ) {
          this.setState({
            isPassFormOther: false,
            isPassFormResidential: false,
            isPassFormCommercial: false
          })
          if (this.props.feeTypeStore.editFeeType?.id) {
            await this.props.feeTypeStore.update({
              ...values,
              id: this.props.feeTypeStore.editFeeType?.id,
              feeGenerateConfiguration: {
                generateType: values.feeGenerateConfiguration.generateType,
                description: values.description,
                ...this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration,
                feeElectricityConfigurations: [...this.state.dataconfigELectric],
                isActive: true
              }
            })
          } else {
            this.props.feeTypeStore.create({
              ...values,
              feeGenerateConfiguration: {
                description: values.description,
                generateType: values.feeGenerateConfiguration.generateType,
                feeElectricityConfigurations: [...this.state.dataconfigELectric],
                isActive: true
              }
            })
          }

          this.props.navigate(-1)
        }

        break
      case 3:
        //verify form water other, check null, pass => save config and continue
        await this.formWaterOther.current?.validateFields().then(async (valueWater: any) => {
          // verify check null data
          if (valueWater.feeWaterConfigurations.length < 1) {
            return this.formWaterOther.current.setFields([
              {
                name: 'isDuplicate',
                errors: [LError('FEE_TYPE_GEN_NEED_VALUES')]
              }
            ])
          } else {
            valueWater.feeWaterConfigurations.map((item) => {
              item.description = valueWater.description
            })
            this.setState({
              dataconfigWater: [...this.state.dataconfigWater, ...valueWater.feeWaterConfigurations]
            })
            this.setState({ isPassFormOther: true })
          }
        })

        //verify form electric residential, check null, pass => save config and continue

        this.formWaterResidential.current?.validateFields().then(async (valueWater: any) => {
          // verify check null data
          if (valueWater.feeWaterConfigurations.length < 1) {
            return this.formWaterResidential.current.setFields([
              {
                name: 'isDuplicate',
                errors: [LError('FEE_TYPE_GEN_NEED_VALUES')]
              }
            ])
          } else {
            valueWater.feeWaterConfigurations.map((item) => {
              item.description = valueWater.description
            })
            this.setState({
              dataconfigWater: [...this.state.dataconfigWater, ...valueWater.feeWaterConfigurations]
            })
            this.setState({ isPassFormResidential: true })
          }
        })

        //verify form electric residential, check null, pass => save config and continue
        await this.formWaterCommercial.current?.validateFields().then(async (valueWater: any) => {
          // verify check null data
          if (valueWater.feeWaterConfigurations.length < 1) {
            return this.formWaterCommercial.current.setFields([
              {
                name: 'isDuplicate',
                errors: [LError('FEE_TYPE_GEN_NEED_VALUES')]
              }
            ])
          } else {
            valueWater.feeWaterConfigurations.map((item) => {
              item.description = valueWater.description
            })
            this.setState({
              dataconfigWater: [...this.state.dataconfigWater, ...valueWater.feeWaterConfigurations]
            })
            this.setState({ isPassFormCommercial: true })
          }
        })

        if (
          this.state.isPassFormOther === true &&
          this.state.isPassFormResidential === true &&
          this.state.isPassFormCommercial === true
        ) {
          this.setState({
            isPassFormOther: false,
            isPassFormResidential: false,
            isPassFormCommercial: false
          })
          if (this.props.feeTypeStore.editFeeType?.id) {
            await this.props.feeTypeStore.update({
              ...values,
              id: this.props.feeTypeStore.editFeeType?.id,
              feeGenerateConfiguration: {
                generateType: values.feeGenerateConfiguration.generateType,
                description: values.description,
                ...this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration,
                feeWaterConfigurations: [...this.state.dataconfigWater],
                isActive: true
              }
            })
          } else {
            this.props.feeTypeStore.create({
              ...values,
              feeGenerateConfiguration: {
                description: values.description,
                generateType: values.feeGenerateConfiguration.generateType,
                feeWaterConfigurations: [...this.state.dataconfigWater],
                isActive: true
              }
            })
          }

          this.props.navigate(-1)
        }
        break
      case 4:
        await this.formParkingConfig.current?.validateFields().then(async (valueParking: any) => {
          // verify check null data
          if (valueParking.feeParkingConfigurations.length < 1) {
            return this.formParkingConfig.current.setFields([
              {
                name: 'isDuplicate',
                errors: [LError('FEE_TYPE_GEN_NEED_VALUES')]
              }
            ])
          } else {
            valueParking.feeParkingConfigurations.map((item) => {
              item.description = valueParking.description
            })
            if (this.props.feeTypeStore.editFeeType?.id) {
              await this.props.feeTypeStore.update({
                ...values,
                id: this.props.feeTypeStore.editFeeType?.id,
                feeGenerateConfiguration: {
                  generateType: values.feeGenerateConfiguration.generateType,
                  description: values.description,
                  ...this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration,
                  feeParkingConfigurations: valueParking.feeParkingConfigurations,
                  isActive: true
                }
              })
            } else {
              this.props.feeTypeStore.create({
                ...values,
                feeGenerateConfiguration: {
                  description: values.description,
                  generateType: values.feeGenerateConfiguration.generateType,
                  feeParkingConfigurations: valueParking.feeParkingConfigurations,
                  isActive: true
                }
              })
            }
          }
          this.props.navigate(-1)
        })
        break
      case 5:
      case 6:
        await this.formParkingConfig.current?.validateFields().then(async (valueParking: any) => {
          // verify check null data
          if (valueParking.feeParkingConfigurations.length < 1) {
            return this.formParkingConfig.current.setFields([
              {
                name: 'isDuplicate',
                errors: [LError('FEE_TYPE_GEN_NEED_VALUES')]
              }
            ])
          } else {
            valueParking.feeParkingConfigurations.map((item) => {
              item.description = valueParking.description
            })
            if (this.props.feeTypeStore.editFeeType?.id) {
              await this.props.feeTypeStore.update({
                ...values,
                id: this.props.feeTypeStore.editFeeType?.id,
                feeGenerateConfiguration: {
                  generateType: values.feeGenerateConfiguration.generateType,
                  description: values.description,
                  ...this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration,
                  feeParkingConfigurations: valueParking.feeParkingConfigurations,
                  isActive: true
                }
              })
            } else {
              this.props.feeTypeStore.create({
                ...values,
                feeGenerateConfiguration: {
                  description: values.description,
                  generateType: values.feeGenerateConfiguration.generateType,
                  feeParkingConfigurations: valueParking.feeParkingConfigurations,
                  isActive: true
                }
              })
            }
          }
          this.props.navigate(-1)
        })
        break
      case 7:
      case 8:
        await this.formParkingConfig.current?.validateFields().then(async (valueParking: any) => {
          // verify check null data
          if (valueParking.feeParkingConfigurations.length < 1) {
            return this.formParkingConfig.current.setFields([
              {
                name: 'isDuplicate',
                errors: [LError('FEE_TYPE_GEN_NEED_VALUES')]
              }
            ])
          } else {
            valueParking.feeParkingConfigurations.map((item) => {
              item.description = valueParking.description
            })
            if (this.props.feeTypeStore.editFeeType?.id) {
              await this.props.feeTypeStore.update({
                ...values,
                id: this.props.feeTypeStore.editFeeType?.id,
                feeGenerateConfiguration: {
                  generateType: values.feeGenerateConfiguration.generateType,
                  description: values.description,
                  ...this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration,
                  feeParkingConfigurations: valueParking.feeParkingConfigurations,
                  isActive: true
                }
              })
            } else {
              this.props.feeTypeStore.create({
                ...values,
                feeGenerateConfiguration: {
                  description: values.description,
                  generateType: values.feeGenerateConfiguration.generateType,
                  feeParkingConfigurations: valueParking.feeParkingConfigurations,
                  isActive: true
                }
              })
            }
          }
          this.props.navigate(-1)
        })
        break
      case 9:
        //verify form electric other, check null, pass => save config and continue
        await this.formElectricOther.current?.validateFields().then(async (valueELectric: any) => {
          // verify check null data

          if (valueELectric.feeOvertimeElectricityConfigurations.length < 1) {
            return this.formElectricOther.current.setFields([
              {
                name: 'isDuplicate',
                errors: [LError('FEE_TYPE_GEN_NEED_VALUES')]
              }
            ])
          } else {
            valueELectric.feeOvertimeElectricityConfigurations.map((item) => {
              item.description = valueELectric.description
            })
            this.setState({
              dataconfigELectric: [
                ...this.state.dataconfigELectric,
                ...valueELectric.feeOvertimeElectricityConfigurations
              ]
            })
            this.setState({ isPassFormOther: true })
          }
        })

        if (this.state.isPassFormOther === true) {
          this.setState({
            isPassFormOther: false,
            isPassFormResidential: false,
            isPassFormCommercial: false
          })
          if (this.props.feeTypeStore.editFeeType?.id) {
            await this.props.feeTypeStore.update({
              ...values,
              id: this.props.feeTypeStore.editFeeType?.id,
              feeGenerateConfiguration: {
                generateType: values.feeGenerateConfiguration.generateType,
                description: values.description,
                ...this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration,
                feeOvertimeElectricityConfigurations: [...this.state.dataconfigELectric],
                isActive: true
              }
            })
          } else {
            this.props.feeTypeStore.create({
              ...values,
              feeGenerateConfiguration: {
                description: values.description,
                generateType: values.feeGenerateConfiguration.generateType,
                feeOvertimeElectricityConfigurations: [...this.state.dataconfigELectric],
                isActive: true
              }
            })
          }

          this.props.navigate(-1)
        }

        break
      case 10:
        await this.formManagement.current?.validateFields().then(async (valuesManagement: any) => {
          // verify check null data
          if (valuesManagement.feeRentConfigurations.length < 1) {
            return this.formManagement.current.setFields([
              {
                name: 'isDuplicate',
                errors: [LError('FEE_TYPE_GEN_NEED_VALUES')]
              }
            ])
          } else {
            valuesManagement.feeRentConfigurations.map((item) => {
              item.description = valuesManagement.description
            })
            //update feetype when have fee configManagement
            if (this.props.feeTypeStore.editFeeType?.id) {
              await this.props.feeTypeStore.update({
                ...values,

                id: this.props.feeTypeStore.editFeeType?.id,
                feeGenerateConfiguration: {
                  feeTypeid: this.props.feeTypeStore.editFeeType?.id,
                  description: values.description,
                  generateType: values.feeGenerateConfiguration.generateType,
                  ...this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration,
                  feeRentConfigurations: valuesManagement.feeRentConfigurations,
                  isActive: true
                }
              })
              //create feetype and config
            } else {
              this.props.feeTypeStore.create({
                ...values,
                feeGenerateConfiguration: {
                  description: values.description,
                  generateType: values.feeGenerateConfiguration.generateType,
                  feeRentConfigurations: valuesManagement.feeRentConfigurations,
                  isActive: true
                }
              })
            }
            this.props.navigate(-1)
          }
        })
        break
      default:
    }
  }
  onCancel = async () => {
    this.props.navigate(-1)
  }
  onChangeIsGen = (checked: boolean) => {
    this.setState({ isShowGenType: checked })
  }
  onSelectGenType = (e: RadioChangeEvent) => {
    this.setState({ typeChooseGen: e.target.value })
  }
  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" shape="round" onClick={this.onCancel}>
            {L('BTN_CANCEL')}
          </Button>

          {((!this.props.params?.id && this.isGranted(appPermissions.feeType.create)) ||
            (this.props.params?.id && this.isGranted(appPermissions.feeType.update))) && (
            <Button type="primary" onClick={this.onSave} loading={isLoading} shape="round">
              {L('BTN_SAVE')}
            </Button>
          )}
        </Col>
      </Row>
    )
  }

  public render() {
    const { isLoading } = this.props.feeTypeStore

    return this.isGranted(appPermissions.feeType.detail) ? (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Card bordered={false}>
          <Form
            ref={this.formRef}
            layout={'vertical'}
            onValuesChange={() => this.setState({ isDirty: true })}
            validateMessages={validateMessages}
            size="middle">
            <Row gutter={[16, 0]}>
              <Col sm={{ span: 12, offset: 0 }}>
                <Form.Item label={L('FEE_TYPE_DETAIL_TYPE')} {...formVerticalLayout} name="names" rules={rules.name}>
                  <MultiLanguageInput />
                </Form.Item>
              </Col>
              <Col sm={{ span: 12, offset: 0 }}>
                <Form.Item name="code" label={L('FEE_TYPE_DETAIL_CODE')} rules={rules.code}>
                  <Input />
                </Form.Item>
              </Col>
              {/* <Col sm={{ span: 12, offset: 0 }}>
                <Form.Item
                  label={L('FEE_TYPE_DETAIL_STARTDATE')}
                  {...formVerticalLayout}
                  name="fromDate"
                  rules={rules.fromDate}>
                  <DatePicker
                    className="full-width"
                    format={dateFormat}
                    placeholder={L('SELECT_DATE')}
                  />
                </Form.Item>
              </Col>
              <Col sm={{ span: 12, offset: 0 }}>
                <Form.Item
                  label={L('FEE_TYPE_DETAIL_ENDDATE')}
                  {...formVerticalLayout}
                  name="toDate"
                  rules={rules.endDate}>
                  <DatePicker
                    className="full-width"
                    format={dateFormat}
                    placeholder={L('SELECT_DATE')}
                  />
                </Form.Item>
              </Col> */}

              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item
                  label={L('FEE_TYPE_DETAIL_INPUT_DESCRIPTION')}
                  {...formVerticalLayout}
                  name="description"
                  rules={rules.description}>
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Col>
              {/* <Col sm={{ span: 3, offset: 0 }}>
                <Form.Item
                  label={L('FEE_TYPE_IS_REFUND')}
                  {...formVerticalLayout}
                  name="isRefundable"
                  initialValue={false}
                  valuePropName="checked">
                  <Switch defaultChecked={false} />
                </Form.Item>
              </Col> */}
              <Col sm={{ span: 3, offset: 0 }}>
                <Form.Item
                  label={L('FEE_TYPE_IS_NOTICE')}
                  {...formVerticalLayout}
                  name="isFeeNotification"
                  valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col sm={{ span: 3, offset: 0 }}>
                <Form.Item
                  label={L('FEE_TYPE_IS_GEN_FEE')}
                  {...formVerticalLayout}
                  name={['feeGenerateConfiguration', 'isActive']}
                  initialValue={false}
                  valuePropName="checked">
                  <Switch defaultChecked={false} onChange={this.onChangeIsGen} />
                </Form.Item>
              </Col>
              <Col
                sm={{ span: 24, offset: 0 }}
                style={{
                  display: this.state.isShowGenType === true ? '' : 'none'
                }}>
                <Form.Item
                  label={L('FEE_GEN_TYPE')}
                  name={['feeGenerateConfiguration', 'generateType']}
                  {...formVerticalLayout}
                  rules={[{ required: this.state.isShowGenType }]}>
                  <Radio.Group
                    onChange={this.onSelectGenType}
                    disabled={!this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration?.isActive ? false : true}>
                    {genType.map((option, index) => (
                      <Radio key={index} value={option.id}>
                        {option.label}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
        {this.state.isShowGenType === true && this.state.typeChooseGen === generateType.rent && (
          <Card style={{ marginTop: 10 }}>
            <Row>
              <label style={{ fontSize: 14, fontWeight: 'bold' }}>{L('GEN_FEE_MANAGEMENT')}</label>
            </Row>
            <GenFeeRent
              formManagement={this.formManagement}
              dataConfig={this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration}
            />
          </Card>
        )}

        {this.state.isShowGenType === true && this.state.typeChooseGen === generateType.management && (
          <Card style={{ marginTop: 10 }}>
            <Row>
              <label style={{ fontSize: 14, fontWeight: 'bold' }}>{L('GEN_FEE_MANAGEMENT')}</label>
            </Row>
            <GenFeeManagement
              formManagement={this.formManagement}
              dataConfig={this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration}
            />
          </Card>
        )}
        {this.state.isShowGenType === true && this.state.typeChooseGen === generateType.electric && (
          <>
            <Card style={{ marginTop: 10 }}>
              <label style={{ fontSize: 14, fontWeight: 'bold' }}>{L('GEN_FEE_ELECTRIC_OTHER')}</label>
              <GenFeElectricTable
                formEletricConfig={this.formElectricOther}
                dataConfig={this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration}
                purposeUsing={purposeUsing.orther}
              />
            </Card>
            {/* <Card style={{ marginTop: 10 }}>
              <label style={{ fontSize: 14, fontWeight: 'bold' }}>{L('GEN_FEE_WATER_RESIDENTAL')}</label>
              <GenFeElectricTable
                formEletricConfig={this.formElectricResidential}
                dataConfig={this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration}
                purposeUsing={purposeUsing.residential}
              />
            </Card>
            <Card style={{ marginTop: 10 }}>
              <label style={{ fontSize: 14, fontWeight: 'bold' }}>{L('GEN_FEE_WATER_COMERCEAL')}</label>
              <GenFeElectricTable
                formEletricConfig={this.formElectricCommercial}
                dataConfig={this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration}
                purposeUsing={purposeUsing.commercial}
              />
            </Card> */}
          </>
        )}
        {this.state.isShowGenType === true && this.state.typeChooseGen === generateType.water && (
          <>
            <Card style={{ marginTop: 10 }}>
              <label style={{ fontSize: 14, fontWeight: 'bold' }}>{L('GEN_FEE_WATER_OTHER')}</label>
              <GenFeeWaterTable
                formWaterConfig={this.formWaterOther}
                dataConfig={this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration}
                purposeUsing={purposeUsing.orther}
              />
            </Card>
            <Card style={{ marginTop: 10 }}>
              <label style={{ fontSize: 14, fontWeight: 'bold' }}>{L('GEN_FEE_WATER_RESIDENTAL')}</label>
              <GenFeeWaterTable
                formWaterConfig={this.formWaterResidential}
                dataConfig={this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration}
                purposeUsing={purposeUsing.residential}
              />
            </Card>
            <Card style={{ marginTop: 10 }}>
              <label style={{ fontSize: 14, fontWeight: 'bold' }}>{L('GEN_FEE_WATER_COMERCEAL')}</label>
              <GenFeeWaterTable
                formWaterConfig={this.formWaterCommercial}
                dataConfig={this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration}
                purposeUsing={purposeUsing.commercial}
              />
            </Card>
          </>
        )}
        {this.state.isShowGenType === true && this.state.typeChooseGen === generateType.parking && (
          <>
            <Card style={{ marginTop: 10 }}>
              <Row>
                <label style={{ fontSize: 14, fontWeight: 'bold' }}>{L('GEN_FEE_PARKING')}</label>
              </Row>
              <Row>
                {/* <label>
                    {L('GEN_FEE_PARKING_IS_ONLY_1_FEETYPE_1_CONFIG')}
                  </label> */}
              </Row>
              <GenFeeParkingTable
                formParkingConfig={this.formParkingConfig}
                dataConfig={this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration}
              />
            </Card>
          </>
        )}
        {this.state.isShowGenType === true && this.state.typeChooseGen === generateType.MotobikeParking12Hours && (
          <>
            <Card style={{ marginTop: 10 }}>
              <Row>
                <label style={{ fontSize: 14, fontWeight: 'bold' }}>{L('GEN_FEE_PARKING')}</label>
              </Row>
              <Row>
                {/* <label>
                    {L('GEN_FEE_PARKING_IS_ONLY_1_FEETYPE_1_CONFIG')}
                  </label> */}
              </Row>
              <GenFeeParkingTable
                formParkingConfig={this.formParkingConfig}
                dataConfig={this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration}
              />
            </Card>
          </>
        )}
        {this.state.isShowGenType === true && this.state.typeChooseGen === generateType.MotobikeParking24Hours && (
          <>
            <Card style={{ marginTop: 10 }}>
              <Row>
                <label style={{ fontSize: 14, fontWeight: 'bold' }}>{L('GEN_FEE_PARKING')}</label>
              </Row>
              <Row>
                {/* <label>
                    {L('GEN_FEE_PARKING_IS_ONLY_1_FEETYPE_1_CONFIG')}
                  </label> */}
              </Row>
              <GenFeeParkingTable
                formParkingConfig={this.formParkingConfig}
                dataConfig={this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration}
              />
            </Card>
          </>
        )}
        {this.state.isShowGenType === true && this.state.typeChooseGen === generateType.CarParking12Hours && (
          <>
            <Card style={{ marginTop: 10 }}>
              <Row>
                <label style={{ fontSize: 14, fontWeight: 'bold' }}>{L('GEN_FEE_PARKING')}</label>
              </Row>
              <Row>
                {/* <label>
                    {L('GEN_FEE_PARKING_IS_ONLY_1_FEETYPE_1_CONFIG')}
                  </label> */}
              </Row>
              <GenFeeParkingTable
                formParkingConfig={this.formParkingConfig}
                dataConfig={this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration}
              />
            </Card>
          </>
        )}
        {this.state.isShowGenType === true && this.state.typeChooseGen === generateType.CarParking24Hours && (
          <>
            <Card style={{ marginTop: 10 }}>
              <Row>
                <label style={{ fontSize: 14, fontWeight: 'bold' }}>{L('GEN_FEE_PARKING')}</label>
              </Row>
              <Row>
                {/* <label>
                    {L('GEN_FEE_PARKING_IS_ONLY_1_FEETYPE_1_CONFIG')}
                  </label> */}
              </Row>
              <GenFeeParkingTable
                formParkingConfig={this.formParkingConfig}
                dataConfig={this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration}
              />
            </Card>
          </>
        )}
        {this.state.isShowGenType === true && this.state.typeChooseGen === generateType.OvertimeElectricity && (
          <>
            <Card style={{ marginTop: 10 }}>
              <label style={{ fontSize: 14, fontWeight: 'bold' }}>{L('GEN_FEE_ELECTRIC_OTHER')}</label>
              <GenOvertimeFeeElectricTable
                formEletricConfig={this.formElectricOther}
                dataConfig={this.props.feeTypeStore.editFeeType?.feeGenerateConfiguration}
                purposeUsing={purposeUsing.orther}
              />
            </Card>
          </>
        )}
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(FeeTypeDetail)
