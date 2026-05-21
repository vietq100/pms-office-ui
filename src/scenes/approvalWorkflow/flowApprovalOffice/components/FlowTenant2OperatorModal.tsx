import { Form, Modal, Col, Row, Button, Tabs, Select, Input, Table } from 'antd'
import { isGrantedAny, L } from '../../../../lib/abpUtility'
import AppConsts, { appPermissions } from '../../../../lib/appconst'
import AppComponentBase from '../../../../components/AppComponentBase'
import { validateMessages } from '../../../../lib/validation'
import React from 'react'
import approvalWorkflowService from '@services/approvalWorkflow/approvalWorkflowService'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
import companyService from '@services/project/companyService'
import flowOperator2ObjectService from '@services/approvalWorkflow/flowOperator2ObjectService'
import { debounce } from 'lodash'
import FlowApprovalOfficeStore from '@stores/approvalWorkflow/flowApprovalOffice/flowApprovalOfficeStore'
import { notifyError } from '@lib/helper'

const { positionTypeEnum, listRequestType } = AppConsts
const tabKeys = {
  tabOperator: 'TAB_OPERATOR',
  tabCompany: 'TAB_COMPANY'
}

export interface IBuildingFormProps {
  FlowApprovalOfficeStore: FlowApprovalOfficeStore
  idDetail: any
  visible: boolean
  onCancel: () => void
}

class FlowTenant2OperatorModal extends AppComponentBase<IBuildingFormProps, any> {
  formOperatorConfig: any = React.createRef()
  formCompanyConfig: any = React.createRef()
  state = {
    tabActiveKey: tabKeys.tabOperator,
    listPositionOperator: [] as any,
    listCompany: [] as any,
    listPositionCompny: [] as any,
    isShowUpdateCompany: false,
    idCompany: null,
    filters: { isActive: 'true' },
    listCompanyConfig: [] as any,
    isWarningNull: false
  }

  componentDidUpdate = async (prevProps: Readonly<IBuildingFormProps>) => {
    if (!prevProps.visible && this.props.visible) {
      if (this.props.visible) {
        this.getListPositionOperator('')
        this.getListCompany('')
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
    const companyId = this.props.FlowApprovalOfficeStore.editoprator2Object?.tenant?.companyId

    if (this.props.FlowApprovalOfficeStore.editoprator2Object.operators.length < 1) {
      this.setState({ isBlockTabCompany: true })
    } else {
      this.setState({ isBlockTabCompany: false })
    }
    if (companyId) {
      this.getListPositionCompany(this.props.FlowApprovalOfficeStore.editoprator2Object?.tenant?.companyId, false)
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

  getListPositionCompany = async (companyId: string, clear: boolean) => {
    const filter = {
      companyId,
      skipCount: 0,
      isActive: true,
      maxResultCount: 50
    }

    const result = await approvalWorkflowService.getAll(filter)
    this.setState({ listPositionCompny: result.items })
    if (clear) {
      this.formCompanyConfig.current.setFieldValue(['tenant', 'approvers'], [])
    }
  }

  getListCompany = async (keyword: string) => {
    const filter = {
      keyword,
      skipCount: 0,
      maxResultCount: 20,
      isActive: true
    }
    const result = await companyService.getAll(filter)
    this.setState({ listCompany: result.items })
  }

  changeTab = (tabKey) => {
    if (tabKey === tabKeys.tabCompany) {
      this.getCompanyPositionLever(this.props.idDetail)
    }
    this.setState({ tabActiveKey: tabKey })
    this.setState({ isShowUpdateCompany: false })
  }

  gotoDetail = async (id?) => {
    this.setState({ isShowUpdateCompany: true })
    if (id) {
      this.getListPositionCompany(id, false)
      await this.props.FlowApprovalOfficeStore.getDetailRequestConfigTenant({
        companyId: id,
        requestConfigId: this.props.idDetail
      })
      const dataFrom = {
        tenant: {
          companyId: id,
          approvers:
            this.props.FlowApprovalOfficeStore.companyConfig?.positions?.map((item) => ({
              positionId: item?.id,
              step: item?.step
            })) ?? []
        }
      }
      this.formCompanyConfig.current.setFieldsValue({ ...dataFrom })

      // this.formCompanyConfig.current?.setFieldsValue(tenant)
    }
  }

  onCloseDetail = () => {
    this.formCompanyConfig.current.resetFields()
    this.setState({ isShowUpdateCompany: false })
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
        this.setState({ tabActiveKey: tabKeys.tabCompany })
      }

      this.getCompanyPositionLever(this.props.idDetail)
    })
  }

  onSaveConfig = async () => {
    this.onSaveOperator().then((configOperator) => this.onSaveCompany(configOperator))
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

  onSaveCompany = async (configOperator) => {
    console.log(configOperator)
    const formCompany = this.formCompanyConfig.current

    const configCompany = await formCompany.validateFields()

    if (this.props.idDetail) {
      await this.props.FlowApprovalOfficeStore.update({
        id: this.props.idDetail,
        tenant: {
          companyId: configCompany?.tenant?.companyId,
          approvers: configCompany?.tenant?.approvers.map((item, index) => ({
            positionId: item?.positionId,
            step: index + 1
          }))
        },
        operators: configOperator.operators?.map((item, index) => ({
          positionId: item?.positionId,
          step: configCompany?.tenant?.approvers.length + index + 1
        }))
      }).then(() => {
        this.setState({ isShowUpdateCompany: false })
        this.getCompanyPositionLever(this.props.idDetail)
      })
    } else {
      notifyError(L('ERROR'), L('ENTITY_NOT_FOUND'))
    }

    this.setState({ isShowUpdateCompany: false })
  }

  getCompanyPositionLever = async (idRequestType: number) => {
    const result = await flowOperator2ObjectService.getAllRequestConfigCompany({
      ...this.state.filters,
      requestConfigId: idRequestType
    })

    this.setState({ listCompanyConfig: result })
  }

  render() {
    const { visible, onCancel, idDetail } = this.props
    const columns = [
      {
        title: L('FLOW_APPROVAL_COMPANY'),
        dataIndex: 'company',
        key: 'company',
        ellipsis: true,
        width: '45%',
        render: (company, item) => (
          <div className="ml-1">
            <a onClick={() => this.gotoDetail(item?.companyId)}>{company?.companyName}</a>
          </div>
        )
      },
      {
        title: L('FLOW_APPROVAL_LEVER_APPROVAL'),
        dataIndex: 'positions',
        key: 'positions',
        ellipsis: true,
        render: (positions) => (
          <div>
            {positions.map((item) => (
              <span
                style={{
                  marginRight: '3px',
                  width: 'fit-content',
                  borderRadius: '8px',
                  lineHeight: 2,
                  fontWeight: 500,
                  padding: '4px 8px',
                  color: '#111820',
                  backgroundColor: '#DEE3ED'
                }}
                key={item?.id}>
                {item?.name}
              </span>
            ))}
          </div>
        )
      }
    ]
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
              {this.state.tabActiveKey === tabKeys.tabCompany && this.state.isShowUpdateCompany && (
                <>
                  <Button onClick={this.onCloseDetail}>{L('BTN_CANCEL')}</Button>
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
              tab={L(tabKeys.tabCompany)}
              key={tabKeys.tabCompany}
              disabled={this.state.tabActiveKey === tabKeys.tabOperator}>
              {this.state.isShowUpdateCompany ? (
                <Form ref={this.formCompanyConfig} layout="vertical" validateMessages={validateMessages} size="middle">
                  <Row gutter={[16, 0]}>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <Form.Item
                        label={L('POSITION_COMPANY')}
                        name={['tenant', 'companyId']}
                        rules={[{ required: true }]}>
                        <Select
                          onChange={(id) => this.getListPositionCompany(id, true)}
                          allowClear
                          style={{ width: '100%' }}>
                          {this.state.listCompany.map((item: any) => (
                            <Select.Option key={item?.id} value={item?.id}>
                              {item?.companyName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col sm={{ span: 24, offset: 0 }}>
                      <label>{L('REQUEST_CONFIG')}</label>
                    </Col>

                    <Col sm={{ span: 24, offset: 0 }}>
                      <Form.List name={['tenant', 'approvers']}>
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
                                          {this.state.listPositionCompny.map((item: any) => (
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
              ) : (
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 24, offset: 0 }} className="d-flex justify-content-end mb-1">
                    <Button type="primary" onClick={() => this.gotoDetail(undefined)}>
                      {L('BTN_CREATE_FLOW_APPROVAL_COMPANY')}
                    </Button>
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <Table
                      size="middle"
                      className="custom-ant-table custom-ant-row"
                      rowKey={(record) => record.id}
                      columns={columns}
                      pagination={false}
                      loading={this.props.FlowApprovalOfficeStore.isLoading}
                      dataSource={this.state.listCompanyConfig}
                      scroll={{ x: 1000, y: 500, scrollToFirstRowOnChange: true }}
                    />
                  </Col>
                </Row>
              )}
            </Tabs.TabPane>
          </Tabs>
        </Modal>
      )
    )
  }
}

export default FlowTenant2OperatorModal
