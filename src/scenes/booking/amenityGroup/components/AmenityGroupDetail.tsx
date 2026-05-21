import React from 'react'

import Col from 'antd/es/col'
import Form from 'antd/es/form'
import Row from 'antd/es/row'
import Card from 'antd/es/card'
import Input from 'antd/es/input'
import Button from 'antd/es/button'
import Modal from 'antd/es/modal'
import Switch from 'antd/es/switch'
import Tabs from 'antd/es/tabs'
import Select from 'antd/es/select'
import { validateMessages } from '../../../../lib/validation'
import AppConsts, { appPermissions } from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import AppComponentBase from '../../../../components/AppComponentBase'
import ProjectStore from '../../../../stores/project/projectStore'
import { isGrantedAny, L, LNotification } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import rules from './validation'
import TextArea from 'antd/es/input/TextArea'
import AmenityGroupStore from '@stores/booking/amenityGroupStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import NumberInput from '@components/Inputs/NumberInput'
import withRouter from '@components/Layout/Router/withRouter'

const { TabPane } = Tabs
const { formVerticalLayout, bookingTimes } = AppConsts
const confirm = Modal.confirm
const tabKeys = {
  tabInfo: 'AMENITY_GROUP_TAB_INFO',
  tabAuditLog: 'AMENITY_TAB_AUDIT_LOG'
}

export interface IAmenityGroupFormProps {
  params: any
  navigate: any
  amenityGroupStore: AmenityGroupStore
  projectStore: ProjectStore
}
export interface IAmenityGroupFormState {
  isDirty: boolean
  tabActiveKey: string
}

@inject(Stores.AmenityGroupStore, Stores.ProjectStore)
@observer
class AmenityGroupDetail extends AppComponentBase<IAmenityGroupFormProps, IAmenityGroupFormState> {
  formRef: any = React.createRef()

  state = {
    isDirty: false,
    tabActiveKey: tabKeys.tabInfo
  }

  async componentDidMount() {
    await this.init(this.props.params?.id)
  }

  async init(id?) {
    if (!id) {
      await this.props.amenityGroupStore.createAmenityGroupModel()
    } else {
      await this.props.amenityGroupStore.get(id)
    }

    this.formRef.current.setFieldsValue({
      ...this.props.amenityGroupStore.editAmenityGroup
    })
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  onSave = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.amenityGroupStore.editAmenityGroup?.id) {
        await this.props.amenityGroupStore.update({
          ...this.props.amenityGroupStore.editAmenityGroup,
          ...values
        })
      } else {
        await this.props.amenityGroupStore.create(values)
      }

      this.props.navigate({
        pathname: portalLayouts.amenitySettingManagement.path,
        search: 'amenityGroup'
      })
    })
  }

  onCancel = () => {
    if (this.state.isDirty) {
      confirm({
        title: LNotification('ARE_YOU_SURE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          this.props.navigate({
            pathname: portalLayouts.amenitySettingManagement.path,
            search: 'amenityGroup'
          })
        }
      })
      return
    }
    this.props.navigate({
      pathname: portalLayouts.amenitySettingManagement.path,
      search: 'amenityGroup'
    })
  }

  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {isGrantedAny(appPermissions.amenityGroup.create, appPermissions.amenityGroup.update) && (
            <Button
              type="primary"
              disabled={this.props.params?.id && !this.isGranted(appPermissions.amenityGroup.update)}
              onClick={this.onSave}
              loading={isLoading}
              shape="round">
              {L('BTN_SAVE')}
            </Button>
          )}
        </Col>
      </Row>
    )
  }

  public render() {
    const {
      amenityGroupStore: { isLoading }
    } = this.props

    return (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Form ref={this.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
          <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab}>
            <TabPane tab={L(tabKeys.tabInfo)} key={tabKeys.tabInfo}>
              <Card bordered={false}>
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <Form.Item label={L('AMENITY_GROUP_NAME')} {...formVerticalLayout} name="name" rules={rules.name}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('AMENITY_GROUP_NUMBER_OF_LIMIT')} {...formVerticalLayout} name="numberOfLimit">
                      <NumberInput />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('AMENITY_GROUP_NUMBER_PER_TIME')} {...formVerticalLayout} name="numberOfTimes">
                      <NumberInput />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('AMENITY_GROUP_UNIT_TIME')} {...formVerticalLayout} name="timeUnit">
                      <Select style={{ width: '100%' }} showArrow>
                        {this.renderOptions(bookingTimes)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('AMENITY_STATUS')}
                      {...formVerticalLayout}
                      name="isActive"
                      valuePropName="checked">
                      <Switch defaultChecked />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <Form.Item label={L('AMENITY_GROUP_DESCRIPTION')} {...formVerticalLayout} name="description">
                      <TextArea autoSize={{ minRows: 2, maxRows: 2 }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </TabPane>
          </Tabs>
        </Form>
      </WrapPageScroll>
    )
  }
}

export default withRouter(AmenityGroupDetail)
