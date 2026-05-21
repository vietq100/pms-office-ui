import * as React from 'react'

import { Button, Card, Col, Form, Input, Modal, Row, Select } from 'antd'
import AppComponentBase from '../../../../components/AppComponentBase'
import { isGrantedAny, L, LNotification } from '../../../../lib/abpUtility'
import MasterDataStore from '../../../../stores/administrator/masterDataStore'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import AppConsts, { appPermissions } from '../../../../lib/appconst'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import rules from '../components/validation'
import ProjectStore from '../../../../stores/project/projectStore'
import BuildingStore from '../../../../stores/project/buildingStore'
import { validateMessages } from '../../../../lib/validation'
import MultiLanguageInput from '@components/Inputs/MultiLanguageInput'
import withRouter from '@components/Layout/Router/withRouter'
import NoRole from '@components/ComponentNoRole'
import { debounce } from 'lodash'
import { filterOptions } from '@lib/helper'

const { formVerticalLayout } = AppConsts

export interface IMasterDatasProps {
  params: any
  navigate: any
  masterDataStore: MasterDataStore
  projectStore: ProjectStore
  buildingStore: BuildingStore
}

export interface IMasterDatasState {
  isDirty: boolean
}

const confirm = Modal.confirm

@inject(Stores.MasterDataStore)
@observer
class MasterDataDetail extends AppComponentBase<IMasterDatasProps, IMasterDatasState> {
  formRef: any = React.createRef()
  state = {
    isDirty: false
  }

  async componentDidMount() {
    this.isGranted(appPermissions.adminMasterData.detail) &&
      (await Promise.all([this.props.masterDataStore.getTargetOptions({}), this.getDetail(this.props.params?.id)]))
  }

  async getDetail(id) {
    if (!id) {
      await this.props.masterDataStore.createMasterData()
    } else {
      await this.props.masterDataStore.get(id)
    }
    this.formRef.current.setFieldsValue({
      ...this.props.masterDataStore.editMasterData
    })
  }

  findTarget = debounce(async (keyword?) => {
    await this.props.masterDataStore.getTargetOptions({ keyword: keyword })
  }, 300)

  onSave = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.masterDataStore.editMasterData?.id) {
        await this.props.masterDataStore.update({
          ...this.props.masterDataStore.editMasterData,
          ...values
        })
      } else {
        await this.props.masterDataStore.create(values)
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

  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {isGrantedAny(appPermissions.adminMasterData.create, appPermissions.adminMasterData.update) && (
            <Button
              type="primary"
              disabled={this.props.params?.id && !this.isGranted(appPermissions.adminMasterData.update)}
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
      masterDataStore: { targetOptions, isLoading }
    } = this.props

    return this.isGranted(appPermissions.adminMasterData.detail) ? (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Card>
          <Form ref={this.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
            <Row gutter={[16, 0]}>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item label={L('TARGET')} {...formVerticalLayout} name="target">
                  <Select
                    showSearch
                    showArrow
                    className="full-width"
                    filterOption={filterOptions}
                    onClear={() => this.props.masterDataStore.getTargetOptions}>
                    {this.renderOptions(targetOptions)}
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item label={L('CODE')} {...formVerticalLayout} name="code" rules={rules.code}>
                  <Input />
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item label={L('NAME')} {...formVerticalLayout} name="names" rules={rules.name}>
                  <MultiLanguageInput />
                </Form.Item>
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item label={L('DESCRIPTION')} {...formVerticalLayout} name="description">
                  <Input />
                </Form.Item>
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

export default withRouter(MasterDataDetail)
