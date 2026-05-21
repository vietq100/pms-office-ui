import { Button, Col, Form, Input, Row } from 'antd'

import AppComponentBase from '../../../../components/AppComponentBase'
import { L } from '@lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import { validateMessages } from '@lib/validation'
import Card from 'antd/lib/card'
import ProjectStore from '@stores/project/projectStore'
import FormInput from '@components/FormItem/FormInput'
import FormTextArea from '@components/FormItem/FormTextArea'
import AppConsts from '@lib/appconst'

// import rules from './project.validation'

const { bankCode } = AppConsts

export interface IProjectsProps {
  formRef: any
  projectStore: ProjectStore
  projectId: number
}

export interface IProjectsState {
  projectId: number
  abnormalEmail: Array<string>
  abnormalTime: string
  abnormalNumber: string
  visiblebankOBA: boolean
  visiblebankDBA: boolean
  listImage: any[]
}

@inject(Stores.ProjectStore, Stores.BuildingStore, Stores.FileStore)
@observer
class ProjectSetting extends AppComponentBase<IProjectsProps, IProjectsState> {
  state = {
    projectId: 0,
    abnormalEmail: [],
    abnormalTime: '',
    abnormalNumber: '',
    visiblebankOBA: false,
    visiblebankDBA: true,
    listImage: [] as any
  }

  async componentDidMount() {
    await this.getProjectBankSetting(this.props.projectId)
    const bankOBA = this.props.projectStore.editProjectBankSetting?.filter((item) => item?.code === 'OBA')
    bankOBA?.length > 0 ? this.setState({ visiblebankOBA: true }) : this.setState({ visiblebankOBA: false })
    const bankDBA = this.props.projectStore.editProjectBankSetting?.filter((item) => item?.code === 'DBA')

    bankDBA?.length > 0 ? this.setState({ visiblebankDBA: true }) : this.setState({ visiblebankDBA: false })

    this.props.formRef.current.setFieldsValue({
      bankOBA: bankOBA,
      bankDBA: bankDBA
    })
  }

  async getProjectBankSetting(id) {
    if (!id) {
      await this.props.projectStore.initProjectBankSetting()
    } else {
      await this.props.projectStore.getProjectBankSetting(id)
    }
  }

  public render() {
    return (
      <Card bordered={false} style={{ minHeight: 700 }}>
        <Form ref={this.props.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
          <Row gutter={[64, 4]}>
            {/* Operation Bank Account - OBA */}
            <Col span={12}>
              <h3>{L('OPERATION_BANK_ACCOUNT')} </h3>
              <Form.List name="bankOBA">
                {(fields, { add, remove }) => (
                  <Row gutter={[4, 4]}>
                    {fields.map(({ key, name, ...restField }) => (
                      <Col key={key} span={24}>
                        <Row gutter={[4, 4]}>
                          <Col sm={{ span: 12, offset: 0 }} style={{ display: 'none' }}>
                            <Form.Item
                              initialValue={bankCode.operationBankAccount}
                              label={L('BANK_ACCOUNT_CODE')}
                              name={[name, 'code']}
                              messageVariables={{
                                label: L('BANK_ACCOUNT_NUMBER')
                              }}
                              {...restField}
                              rules={[{ required: true, max: 64 }]}>
                              <Input size="middle" />
                            </Form.Item>
                            {/* <FormInput
                          {...restField}
                          name={[name, 'accountNo']}
                          label={L('BANK_ACCOUNT_NUMBER')}
                          rule={[{ required: true, max: 64 }]}
                        /> */}
                          </Col>
                          <Col sm={{ span: 12, offset: 0 }}>
                            <Form.Item
                              label={L('BANK_ACCOUNT_NUMBER')}
                              name={[name, 'accountNo']}
                              messageVariables={{
                                label: L('BANK_ACCOUNT_NUMBER')
                              }}
                              {...restField}
                              rules={[{ required: true, max: 64 }]}>
                              <Input size="middle" />
                            </Form.Item>
                          </Col>
                          <Col sm={{ span: 12, offset: 0 }}>
                            <FormInput
                              name={[name, 'beneficiaryName']}
                              label={L('BENEFICIARY_NAME')}
                              rule={[{ required: true, max: 64 }]}
                            />
                          </Col>
                          <Col sm={{ span: 12, offset: 0 }}>
                            <FormInput
                              name={[name, 'branchName']}
                              label={L('BANK_NAME')}
                              rule={[{ required: true, max: 250 }]}
                            />
                          </Col>
                          <Col sm={{ span: 24, offset: 0 }}>
                            <FormTextArea
                              name={[name, 'description']}
                              label={L('DESCRIPTION')}
                              rows={5}
                              rule={[{ required: true, max: 2000 }]}
                            />
                          </Col>
                          <Col span={24}>
                            <Button
                              className="full-width"
                              size="middle"
                              onClick={() => {
                                this.setState({ visiblebankOBA: false }), remove(name)
                              }}>
                              {L('REMOVE')}
                            </Button>
                          </Col>
                        </Row>
                      </Col>
                    ))}
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Form.Item>
                        <Button
                          style={{
                            marginTop: 40,
                            display: this.state.visiblebankOBA ? 'none' : ''
                          }}
                          className="full-width"
                          size="middle"
                          type="primary"
                          onClick={() => {
                            this.setState({ visiblebankOBA: true }), add()
                          }}>
                          {L('ADD_NEW')}
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              </Form.List>
            </Col>

            {/* Deposit Bank Account - DBA */}
            <Col span={12}>
              <h3>{L('DEPOSIT_BANK_ACCOUNT')} </h3>
              <Form.List name="bankDBA">
                {(fields, { add, remove }) => (
                  <Row gutter={[4, 4]}>
                    {fields.map(({ key, name, ...restField }) => (
                      <Col key={key} span={24}>
                        <Row gutter={[4, 4]}>
                          <Col sm={{ span: 12, offset: 0 }} style={{ display: 'none' }}>
                            <Form.Item
                              initialValue={bankCode.depositBankAccount}
                              label={L('BANK_ACCOUNT_CODE')}
                              name={[name, 'code']}
                              messageVariables={{
                                label: L('BANK_ACCOUNT_NUMBER')
                              }}
                              {...restField}
                              rules={[{ required: true, max: 64 }]}>
                              <Input size="middle" />
                            </Form.Item>
                            {/* <FormInput
                          {...restField}
                          name={[name, 'accountNo']}
                          label={L('BANK_ACCOUNT_NUMBER')}
                          rule={[{ required: true, max: 64 }]}
                        /> */}
                          </Col>
                          <Col sm={{ span: 12, offset: 0 }}>
                            <Form.Item
                              label={L('BANK_ACCOUNT_NUMBER')}
                              name={[name, 'accountNo']}
                              messageVariables={{
                                label: L('BANK_ACCOUNT_NUMBER')
                              }}
                              {...restField}
                              rules={[{ required: true, max: 64 }]}>
                              <Input size="middle" />
                            </Form.Item>
                          </Col>
                          <Col sm={{ span: 12, offset: 0 }}>
                            <FormInput
                              name={[name, 'beneficiaryName']}
                              label={L('BENEFICIARY_NAME')}
                              rule={[{ required: true, max: 64 }]}
                            />
                          </Col>
                          <Col sm={{ span: 12, offset: 0 }}>
                            <FormInput
                              name={[name, 'branchName']}
                              label={L('BANK_NAME')}
                              rule={[{ required: true, max: 250 }]}
                            />
                          </Col>
                          <Col sm={{ span: 24, offset: 0 }}>
                            <FormTextArea
                              name={[name, 'description']}
                              label={L('DESCRIPTION')}
                              rows={5}
                              rule={[{ required: true, max: 2000 }]}
                            />
                          </Col>
                          <Col span={24}>
                            <Button
                              className="full-width"
                              size="middle"
                              onClick={() => {
                                this.setState({ visiblebankDBA: false }), remove(name)
                              }}>
                              {L('REMOVE')}
                            </Button>
                          </Col>
                        </Row>
                      </Col>
                    ))}
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Form.Item>
                        <Button
                          style={{
                            marginTop: 40,
                            display: this.state.visiblebankDBA ? 'none' : ''
                          }}
                          className="full-width"
                          size="middle"
                          type="primary"
                          onClick={() => {
                            this.setState({ visiblebankDBA: true }), add()
                          }}>
                          {L('ADD_NEW')}
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              </Form.List>
            </Col>
          </Row>
        </Form>
      </Card>
    )
  }
}

export default ProjectSetting
