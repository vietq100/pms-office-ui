import { Form, Modal, Col, Row, Button, Tabs, Select, Input } from 'antd'
import { isGrantedAny, L } from '../../../../lib/abpUtility'
import AppConsts, { appPermissions } from '../../../../lib/appconst'
import AppComponentBase from '../../../../components/AppComponentBase'
import { validateMessages } from '../../../../lib/validation'
import React from 'react'
import approvalWorkflowService from '@services/approvalWorkflow/approvalWorkflowService'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
import flowOperator2ObjectService from '@services/approvalWorkflow/flowOperator2ObjectService'
import { debounce } from 'lodash'
import FlowApprovalOfficeStore from '@stores/approvalWorkflow/flowApprovalOffice/flowApprovalOfficeStore'
import { notifyError } from '@lib/helper'

const { positionTypeEnum, listRequestType } = AppConsts
const tabKeys = {
  tabOperator: 'TAB_OPERATOR',
  tabDeveloper: 'TAB_DEVELOPER'
}

export interface IBuildingFormProps {
  FlowApprovalOfficeStore: FlowApprovalOfficeStore
  idDetail: any
  visible: boolean
  onCancel: () => void
}

class FlowOperator2DeveloperModal extends AppComponentBase<IBuildingFormProps, any> {
  formOperatorConfig: any = React.createRef()
  formDeveloperConfig: any = React.createRef()
  state = {
    tabActiveKey: tabKeys.tabOperator,
    listPositionOperator: [] as any,
    listDeveloper: [] as any,
    listPositionCompny: [] as any,
    filters: { isActive: 'true' },
    isWarningNull: false
  }

  componentDidUpdate = async (prevProps: Readonly<IBuildingFormProps>) => {
    if (!prevProps.visible && this.props.visible) {
      if (this.props.visible) {
        this.getListPositionOperator('')
        this.getListPositionDelevoper(false)
        this.getListPositionDeveloper('')
        if (this.props.idDetail) {
          this.setState({ tabActiveKey: tabKeys.tabOperator })
          this.getDetail(this.props.idDetail)
        } else {
          this.formOperatorConfig.current?.resetFields()
        }
      }
    }
  }

  getDetail = async (idDetail) => {
    await this.props.FlowApprovalOfficeStore.get(idDetail)
    const developers = this.props.FlowApprovalOfficeStore.editoprator2Object?.developers

    if (developers?.length > 0) {
      this.getListPositionDelevoper(false)
    }

    this.formOperatorConfig.current?.setFieldsValue(this.props.FlowApprovalOfficeStore.editoprator2Object)
  }

  getListPositionOperator = debounce(async (keyword: string) => {
    const filter = {
      typeId: positionTypeEnum.Operator,
      skipCount: 0,
      maxResultCount: 20,
      isActive: true,
      keyword
    }
    const result = await approvalWorkflowService.getAll(filter)
    this.setState({ listPositionOperator: result.items })
  }, 300)

  getListPositionDelevoper = async (clear: boolean) => {
    const filter = {
      skipCount: 0,
      isActive: true,
      maxResultCount: 50
    }

    const result = await approvalWorkflowService.getAll(filter)
    this.setState({ listPositionCompny: result.items })
    if (clear) {
      this.formDeveloperConfig.current.setFieldValue('developers', [])
    } else {
      this.formDeveloperConfig.current.setFieldValue(
        'developers',
        this.props.FlowApprovalOfficeStore.editoprator2Object?.developers
      )
    }
  }

  getListPositionDeveloper = async (keyword: string) => {
    const filter = {
      typeId: positionTypeEnum.Developer,
      skipCount: 0,
      maxResultCount: 20,
      isActive: true,
      keyword
    }
    const result = await approvalWorkflowService.getAll(filter)
    this.setState({ listDeveloper: result.items })
  }

  changeTab = (tabKey) => {
    if (tabKey === tabKeys.tabDeveloper) {
      this.getDeveloperPositionLever(this.props.idDetail)
    }
    this.setState({ tabActiveKey: tabKey })
    this.setState({ isShowUpdateDeveloper: false })
  }

  gotoDetail = async (id?) => {
    this.setState({ isShowUpdateDeveloper: true })
    if (id) {
      this.getListPositionDelevoper(false)
      await this.props.FlowApprovalOfficeStore.getDetailRequestConfigTenant({
        companyId: id,
        requestConfigId: this.props.idDetail
      })
      const dataFrom = {
        developers:
          this.props.FlowApprovalOfficeStore.developerConfig?.positions?.map((item) => ({
            positionId: item?.id,
            step: item?.step
          })) ?? []
      }

      this.formDeveloperConfig.current.setFieldsValue({ ...dataFrom })
    }
  }

  onCloseDetail = () => {
    this.formDeveloperConfig.current.resetFields()
    this.setState({ isShowUpdateDeveloper: false })
  }

  checkAddRow = (addFn: () => void) => {
    addFn()
    this.setState({ isWarningNull: false })
  }

  onNextStep = () => {
    const form = this.formOperatorConfig.current

    form.validateFields().then((values: any) => {
      if (!values.operators || values.operators.length < 1) {
        this.setState({ isWarningNull: true })
      } else {
        this.setState({ isWarningNull: false })
        this.setState({ tabActiveKey: tabKeys.tabDeveloper })
      }

      this.getDeveloperPositionLever(this.props.idDetail)
    })
  }

  onSaveConfig = async () => {
    this.onSaveOperator().then((configOperator) => this.onSaveDeveloper(configOperator))
  }

  onSaveOperator = async () => {
    const formOperator = this.formOperatorConfig.current
    const configOperator = await formOperator.validateFields()
    //Save config oprator trước
    await this.props.FlowApprovalOfficeStore.updateSimpleRequestConfig({
      id: this.props.idDetail,
      operators: configOperator.operators?.map((item, index) => ({
        positionId: item?.positionId,
        step: index + 1
      }))
    })

    return configOperator
  }

  onSaveDeveloper = async (configOperator) => {
    const formDeveloper = this.formDeveloperConfig.current

    const configDeveloper = await formDeveloper.validateFields()

    if (this.props.idDetail) {
      await this.props.FlowApprovalOfficeStore.update({
        id: this.props.idDetail,
        operators: configOperator.operators?.map((item, index) => ({
          positionId: item?.positionId,
          step: index + 1
        })),
        developers: configDeveloper?.developers?.map((item, index) => ({
          positionId: item?.positionId,
          step: configOperator.operators?.length + 1 + index
        }))
      }).then(() => {
        this.setState({ isShowUpdateDeveloper: false })
        this.getDeveloperPositionLeverApi(this.props.idDetail)
      })
    } else {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    this.setState({ isShowUpdateDeveloper: false })
  }

  getDeveloperPositionLeverApi = async (idRequestType: number) => {
    const result = await flowOperator2ObjectService.getAllRequestConfigDeveloper({
      ...this.state.filters,
      requestConfigId: idRequestType
    })

    this.setState({ listDeveloperConfig: result })
    // this.formDeveloperConfig.current.setFieldValue(
    //   'developers',
    //   this.props.FlowApprovalOfficeStore.editoprator2Object?.developers
    // )
  }

  getDeveloperPositionLever = async (idRequestType: number) => {
    const result = await flowOperator2ObjectService.getAllRequestConfigDeveloper({
      ...this.state.filters,
      requestConfigId: idRequestType
    })

    this.setState({ listDeveloperConfig: result })
    this.formDeveloperConfig.current.setFieldValue(
      'developers',
      this.props.FlowApprovalOfficeStore.editoprator2Object?.developers
    )
  }

  render() {
    const { visible, onCancel, idDetail } = this.props

    return (
      this.props.visible && (
        <Modal
          width={'70%'}
          open={visible}
          onCancel={onCancel}
          destroyOnClose
          title={
            listRequestType.find(
              (item) => item.value === this.props.FlowApprovalOfficeStore.editoprator2Object?.requestTypeId
            )?.label
          }
          footer={[
            <>
              {this.state.tabActiveKey === tabKeys.tabOperator && (
                <>
                  <Button onClick={onCancel}>{L('BTN_CANCEL')}</Button>
                  <Button
                    key="submit"
                    disabled={idDetail && !isGrantedAny(appPermissions.building.update)}
                    type="primary"
                    loading={this.props.FlowApprovalOfficeStore.isLoading}
                    onClick={this.onNextStep}>
                    {L('BTN_NEXT_STEP')}
                  </Button>
                </>
              )}
              {this.state.tabActiveKey === tabKeys.tabDeveloper && (
                <>
                  <Button onClick={onCancel}>{L('BTN_CANCEL')}</Button>
                  <Button
                    key="submit"
                    disabled={idDetail && !isGrantedAny(appPermissions.building.update)}
                    type="primary"
                    loading={this.props.FlowApprovalOfficeStore.isLoading}
                    onClick={this.onSaveConfig}>
                    {L('BTN_SAVE_COMPANY')}
                  </Button>
                </>
              )}
            </>
          ]}
          okButtonProps={{
            className: !isGrantedAny(appPermissions.building.create, appPermissions.building.update) ? 'd-none' : ''
          }}>
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 24, offset: 0 }} className="my-2">
              <label className="title-detail">{this.props.FlowApprovalOfficeStore.editoprator2Object?.name}</label>
            </Col>
          </Row>
          <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab} type="card">
            <Tabs.TabPane tab={L(tabKeys.tabOperator)} key={tabKeys.tabOperator}>
              <Form ref={this.formOperatorConfig} layout="vertical" validateMessages={validateMessages} size="middle">
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <label className="title-detail">{L('REQUEST_CONFIG')}</label>
                    {this.state.isWarningNull && (
                      <>
                        <br />
                        <label className=" text-danger">{L('REQUEST_CONFIG_NOT_NULL')}</label>
                      </>
                    )}
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <Form.List name="operators">
                      {(fields, { add, remove }) => {
                        return (
                          <Row gutter={[24, 24]}>
                            {fields.map((field, index) => (
                              <Col sm={{ span: 24, offset: 0 }} key={field.key}>
                                <Row gutter={[16, 0]} className="pt-3 d-flex align-items-center">
                                  <Col sm={{ span: 24, offset: 0 }} style={{ display: 'none' }}>
                                    <Form.Item
                                      label={L('POSITION_APPROVAL')}
                                      name={[field.name, 'step']}
                                      initialValue={index + 1}>
                                      <Input />
                                    </Form.Item>
                                  </Col>
                                  <Col sm={{ span: 4, offset: 0 }}>
                                    <label className="text-level-approval">
                                      {L('LEVER_APPROVAL')} {index + 1}
                                    </label>
                                  </Col>
                                  <Col sm={{ span: 9, offset: 0 }}>
                                    <Form.Item
                                      label={L('POSITION_APPROVAL')}
                                      name={[field.name, 'positionId']}
                                      rules={[{ required: true }]}>
                                      <Select
                                        onSearch={this.getListPositionOperator}
                                        allowClear
                                        showSearch
                                        filterOption={false}
                                        style={{ width: '100%' }}>
                                        {this.state.listPositionOperator.map((item: any) => (
                                          <Select.Option key={item?.id} value={item?.id}>
                                            {item?.name}
                                          </Select.Option>
                                        ))}
                                      </Select>
                                    </Form.Item>
                                  </Col>
                                  <Col sm={{ span: 1, offset: 0 }}>
                                    <Button type="dashed" shape="round" size="small" onClick={() => remove(index)}>
                                      <MinusOutlined />
                                    </Button>
                                  </Col>
                                </Row>
                              </Col>
                            ))}
                            <Col sm={{ span: 12, offset: 0 }}>
                              <Form.Item>
                                <Button type="primary" onClick={() => this.checkAddRow(add)}>
                                  {L('BTN_ADD_RESIDENT')}
                                </Button>
                              </Form.Item>
                            </Col>
                          </Row>
                        )
                      }}
                    </Form.List>
                  </Col>
                </Row>
              </Form>
            </Tabs.TabPane>

            <Tabs.TabPane
              tab={L(tabKeys.tabDeveloper)}
              key={tabKeys.tabDeveloper}
              disabled={this.state.tabActiveKey === tabKeys.tabOperator}>
              {
                <Form
                  ref={this.formDeveloperConfig}
                  layout="vertical"
                  validateMessages={validateMessages}
                  size="middle">
                  <Row gutter={[16, 0]}>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <label>{L('REQUEST_CONFIG')}</label>
                    </Col>

                    <Col sm={{ span: 24, offset: 0 }}>
                      <Form.List name={['developers']}>
                        {(fields, { add, remove }) => {
                          return (
                            <Row gutter={[24, 24]}>
                              {fields.map((field, index) => (
                                <Col sm={{ span: 24, offset: 0 }} key={field.key}>
                                  <Row gutter={[16, 0]} className="pt-3 d-flex align-items-center">
                                    <Col sm={{ span: 24, offset: 0 }} style={{ display: 'none' }}>
                                      <Form.Item
                                        label={L('POSITION_APPROVAL')}
                                        name={[field.name, 'step']}
                                        initialValue={index + 1}>
                                        <Input />
                                      </Form.Item>
                                    </Col>
                                    <Col sm={{ span: 3, offset: 0 }}>
                                      <label className="text-level-approval">
                                        {L('LEVER_APPROVAL')} {index + 1}
                                      </label>
                                    </Col>
                                    <Col sm={{ span: 8, offset: 0 }}>
                                      <Form.Item
                                        label={L('POSITION_APPROVAL')}
                                        name={[field.name, 'positionId']}
                                        rules={[{ required: true }]}>
                                        <Select allowClear style={{ width: '100%' }}>
                                          {this.state.listDeveloper.map((item: any) => (
                                            <Select.Option key={item?.id} value={item?.id}>
                                              {item?.name}
                                            </Select.Option>
                                          ))}
                                        </Select>
                                      </Form.Item>
                                    </Col>
                                    <Col sm={{ span: 1, offset: 0 }}>
                                      <Button type="dashed" shape="round" size="small" onClick={() => remove(index)}>
                                        <MinusOutlined />
                                      </Button>
                                    </Col>
                                  </Row>
                                </Col>
                              ))}
                              <Col sm={{ span: 12, offset: 0 }}>
                                <Button type="dashed" onClick={() => add()} className="full-width">
                                  <PlusOutlined /> {L('BTN_ADD_RESIDENT')}
                                </Button>
                              </Col>
                            </Row>
                          )
                        }}
                      </Form.List>
                    </Col>
                  </Row>
                </Form>
              }
            </Tabs.TabPane>
          </Tabs>
        </Modal>
      )
    )
  }
}

export default FlowOperator2DeveloperModal
