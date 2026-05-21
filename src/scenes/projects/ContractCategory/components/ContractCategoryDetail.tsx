import React from 'react'

import { Col, Form, Row, Card, Modal, Button, Input, Select } from 'antd'
import { isGrantedAny, L, LNotification } from '../../../../lib/abpUtility'
import { validateMessages } from '../../../../lib/validation'
import rules from './validation'
import AppConsts, { appPermissions } from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import ContractCategoryStore from '../../../../stores/project/contractCategoryStore'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import AppComponentBase from '../../../../components/AppComponentBase'
import { portalLayouts } from '../../../../components/Layout/Router/router.config'
import MultiLanguageInput from '@components/Inputs/MultiLanguageInput'
import debounce from 'lodash/debounce'
import { PlusCircleOutlined } from '@ant-design/icons/lib'
import './ContractCategoryDetail.less'
import ContractCategoryModal from '@scenes/projects/ContractCategory/components/ContractCategoryModal'
import NumberInput from '@components/Inputs/NumberInput'
import withRouter from '@components/Layout/Router/withRouter'
import NoRole from '@components/ComponentNoRole'

const { formVerticalLayout } = AppConsts
const { confirm } = Modal

export interface IContractFormProps {
  navigate: any
  params: any
  contractCategoryStore: ContractCategoryStore
}

@inject(Stores.ContractCategoryStore, Stores.ProjectStore, Stores.FileStore, Stores.SessionStore)
@observer
class ContractCategoryDetail extends AppComponentBase<IContractFormProps> {
  state = {
    isDirty: false,
    modalVisible: false,
    editSubId: 0
  }
  formRef: any = React.createRef()
  formSubRef: any = React.createRef()

  async componentDidMount() {
    this.isGranted(appPermissions.contractCategory.detail) &&
      (await Promise.all([this.getDetail(this.props?.params?.id), this.props.contractCategoryStore.filterOptions({})]))
  }

  getDetail = async (id?) => {
    if (!id) {
      await this.props.contractCategoryStore.createContractCategory()
    } else {
      await this.props.contractCategoryStore.get(id)
    }

    this.formRef.current.setFieldsValue({
      ...this.props.contractCategoryStore.editContractCategory
    })
  }

  openCreateOrEditContractCategorySubModal = async (id?) => {
    if (!id) {
      const { editContractCategory } = this.props.contractCategoryStore

      await this.props.contractCategoryStore.initContractCategorySub(editContractCategory?.id)
    } else {
      await this.props.contractCategoryStore.getContractCategorySub(id)
    }

    this.setState({ editSubId: id, modalVisible: true })

    this.formSubRef.current.setFieldsValue({
      ...this.props.contractCategoryStore.editContractCategorySub
    })
  }

  handleSearchParent = async (keyword) => {
    await this.props.contractCategoryStore.filterOptions({ keyword })
  }

  onSave = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.contractCategoryStore.editContractCategory?.id) {
        this.isGranted(appPermissions.contractCategory.update) &&
          (await this.props.contractCategoryStore.update({
            ...this.props.contractCategoryStore.editContractCategory,
            ...values
          }))
      } else {
        this.isGranted(appPermissions.contractCategory.create) &&
          (await this.props.contractCategoryStore.create(values))
      }
      this.props.navigate(portalLayouts.contractCategories.path)
    })
  }

  handleCreateOrUpdateContractSub = () => {
    const form = this.formSubRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.contractCategoryStore.editContractCategorySub?.id) {
        await this.props.contractCategoryStore.update({
          ...this.props.contractCategoryStore.editContractCategorySub,
          ...values
        })
      } else {
        await this.props.contractCategoryStore.createContractCategorySub(values)
      }

      this.getDetail(this.props.contractCategoryStore.editContractCategory?.id)
      this.setState({ modalVisible: false })
    })
  }

  onCancel = () => {
    if (this.state.isDirty) {
      confirm({
        title: LNotification('ARE_YOU_SURE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          this.props.navigate(portalLayouts.contractCategories.path)
        }
      })
      return
    }
    this.props.navigate(portalLayouts.contractCategories.path)
  }

  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {isGrantedAny(appPermissions.contractCategory.create, appPermissions.contractCategory.update) && (
            <Button
              type="primary"
              disabled={
                this.props.contractCategoryStore.editContractCategory?.id &&
                !isGrantedAny(appPermissions.contractCategory.update)
              }
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

  render() {
    const {
      contractCategoryStore: { isLoading, parents, editContractCategory }
    } = this.props
    const columnSpan = !editContractCategory.id ? 24 : editContractCategory.parentId > 0 ? 24 : 16

    return this.isGranted(appPermissions.companyContract.detail) ? (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Row gutter={[16, 0]}>
          <Col sm={{ span: columnSpan, offset: 0 }}>
            <Card bordered={false} style={{ minHeight: 750 }}>
              <Form
                ref={this.formRef}
                layout={'vertical'}
                onFinish={this.onSave}
                onAbort={this.onCancel}
                onValuesChange={() => this.setState({ isDirty: true })}
                validateMessages={validateMessages}
                size="middle">
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <Form.Item
                      label={L('CONTRACT_CATEGORY_NAME')}
                      {...formVerticalLayout}
                      name="names"
                      rules={rules.name}>
                      <MultiLanguageInput />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 12, offset: 0 }}>
                    <Form.Item label={L('CONTRACT_CATEGORY_CODE')} {...formVerticalLayout} name="code">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 12, offset: 0 }}>
                    <Form.Item label={L('SORT_ORDER')} {...formVerticalLayout} name="sortOrder">
                      <NumberInput />
                    </Form.Item>
                  </Col>
                  {!(editContractCategory.id && editContractCategory.children?.length) && (
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Form.Item label={L('PARENT')} {...formVerticalLayout} name="parentId">
                        <Select
                          showSearch
                          showArrow
                          allowClear
                          filterOption={false}
                          style={{ width: '100%' }}
                          onSearch={debounce(this.handleSearchParent, 200)}>
                          {this.renderOptions(parents)}
                        </Select>
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              </Form>
            </Card>
          </Col>
          {editContractCategory.id > 0 && !editContractCategory.parentId && (
            <Col sm={{ span: 8, offset: 0 }}>
              <Card
                bordered={false}
                size="small"
                title={L('CONTRACT_CATEGORY_SUB')}
                extra={
                  <PlusCircleOutlined
                    onClick={() =>
                      this.isGranted(appPermissions.contractCategory.update) &&
                      this.openCreateOrEditContractCategorySubModal()
                    }
                  />
                }>
                <div className="category-subs">
                  {(editContractCategory.children || []).map((item) => {
                    return (
                      <div
                        className="category-sub-item"
                        key={item.id}
                        onClick={() =>
                          this.isGranted(appPermissions.contractCategory.update) &&
                          this.openCreateOrEditContractCategorySubModal(item.id)
                        }>
                        {item.name}
                      </div>
                    )
                  })}
                </div>
              </Card>
            </Col>
          )}
        </Row>

        <ContractCategoryModal
          formRef={this.formSubRef}
          contractCategoryStore={this.props.contractCategoryStore}
          visible={this.state.modalVisible}
          isUpdateForm={this.state.editSubId > 0}
          onCancel={() =>
            this.setState({
              modalVisible: false
            })
          }
          onCreate={this.handleCreateOrUpdateContractSub}
        />
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(ContractCategoryDetail)
