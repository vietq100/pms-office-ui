import * as React from 'react'

import { Button, Card, Col, Form, Input, Modal, Row } from 'antd'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import AppComponentBase from '@components/AppComponentBase'
import { isGrantedAny, L, LNotification } from '@lib/abpUtility'
import { PlusOutlined } from '@ant-design/icons/lib'
import InventoryCategoryStore from '@stores/inventory/inventoryCategoryStore'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppConsts, { appPermissions } from '@lib/appconst'
import WrapPageScroll from '@components/WrapPageScroll'
import rules from './validation'
import { validateMessages } from '@lib/validation'
import MultiLanguageInput from '@components/Inputs/MultiLanguageInput'
import NumberInput from '@components/Inputs/NumberInput'
import { SubCategoryContainer } from './components/SubCategoryContainer'
import withRouter from '@components/Layout/Router/withRouter'
import NoRole from '@components/ComponentNoRole'
import { InventoryCategorySubModal } from './components/InventoryCategorySubModal'

const { formVerticalLayout } = AppConsts

export interface IProjectsProps {
  params: any
  navigate: any
  inventoryCategoryStore: InventoryCategoryStore
}

export interface IProjectsState {
  files: any[]
  isDirty: boolean
  loading: boolean
  projectId: number
  modalVisible: boolean
}

const confirm = Modal.confirm

@inject(Stores.InventoryCategoryStore)
@observer
class InventoryCategoryDetail extends AppComponentBase<IProjectsProps, IProjectsState> {
  formRef: any = React.createRef()
  formRefSubCategory: any = React.createRef()

  state = {
    files: [] as any[],
    isDirty: false,
    loading: false,
    projectId: 0,
    modalVisible: false
  }

  async componentDidMount() {
    this.isGranted(appPermissions.inventory.detail) &&
      (await Promise.all([
        this.getDetail(),
        this.props.inventoryCategoryStore.filterOptions({
          isIncludeParentNotChild: true
        })
      ]))
  }

  async getDetail() {
    await this.props.inventoryCategoryStore.get(this.props.params?.id)
    await this.getChildren()
    this.formRef.current?.setFieldsValue({
      ...this.props.inventoryCategoryStore?.editInventoryCategory
    })
  }

  async getChildren() {
    await this.props.inventoryCategoryStore.getChildren(this.props.params?.id)
  }

  onSave = () => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      if (this.props.inventoryCategoryStore?.editInventoryCategory?.id) {
        await this.props.inventoryCategoryStore.update({
          ...this.props.inventoryCategoryStore?.editInventoryCategory,
          ...values
        })
      } else {
        await this.props.inventoryCategoryStore.create(values)
      }

      await this.getDetail()
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

  Modal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }

  createOrUpdateModalOpen = async () => {
    this.Modal()
  }

  onCancelModal = async (isRefresh) => {
    if (isRefresh) {
      await this.getChildren()
    }
    this.setState({ modalVisible: false })
  }

  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {isGrantedAny(appPermissions.project.create, appPermissions.project.update) && (
            <Button type="primary" onClick={this.onSave} loading={isLoading} shape="round">
              {L('BTN_SAVE')}
            </Button>
          )}
        </Col>
      </Row>
    )
  }

  onUpdateSort = async (ids: Array<number>) => {
    const {
      editInventoryCategory: { id }
    } = this.props.inventoryCategoryStore
    await this.props.inventoryCategoryStore.sort(id, ids)
    await this.getChildren()
  }

  activateOrDeactivate = async (id: number, isActive: boolean) => {
    const self = this
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await self.props.inventoryCategoryStore.activateOrDeactivate(id, isActive)
        await self.getChildren()
      }
    })
  }

  public render() {
    const { isLoading, subCategories, inventoryCategoryOptions } = this.props.inventoryCategoryStore
    return this.isGranted(appPermissions.inventory.detail) ? (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Row gutter={[16, 0]}>
          <Col sm={{ span: 16, offset: 0 }}>
            <Card style={{ minHeight: 200 }}>
              <Form ref={this.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
                <Row gutter={16}>
                  <Col md={{ span: 24 }} sm={{ span: 24 }}>
                    <Form.Item label={L('NAME')} {...formVerticalLayout} name="names" rules={rules.names}>
                      <MultiLanguageInput />
                    </Form.Item>
                  </Col>
                  <Col md={{ span: 12 }} sm={{ span: 24 }}>
                    <Form.Item label={L('SORT_ORDER')} {...formVerticalLayout} name="sortOrder">
                      <NumberInput />
                    </Form.Item>
                  </Col>
                  {/* {editInventoryCategory.parent && editInventoryCategory.parentId && (
                    <Col md={{ span: 12 }} sm={{ span: 24 }}>
                      <Form.Item label={L('MAIN_CATEGORY')} {...formVerticalLayout} name="parentId" >
                        <Select showSearch allowClear className="full-width">
                          {this.renderOptions(inventoryCategoryOptions)}
                        </Select>
                      </Form.Item>
                    </Col>
                  )} */}
                  <Col
                    // md={{
                    //   span: editInventoryCategory.parent && editInventoryCategory.parentId ? 24 : 12
                    // }}
                    md={12}
                    sm={{ span: 24 }}>
                    <Form.Item label={L('DESCRIPTION')} {...formVerticalLayout} name="description">
                      <Input.TextArea
                        // rows={editInventoryCategory.parent && editInventoryCategory.parentId ? 3 : 1}
                        rows={1}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
          <Col sm={{ span: 8, offset: 0 }} className="text-center">
            <Card style={{ minHeight: 200 }}>
              <Row
                className="mb-1 pb-1"
                justify="space-between"
                gutter={[8, 16]}
                style={{ borderBottom: '1px solid rgba(0,0,0,.125)' }}>
                <Col span={18} style={{ textAlign: 'left' }}>
                  <label>{L('SUB_CATEGORY')}</label>
                </Col>
                <Col span={6} style={{ textAlign: 'right' }}>
                  <Button
                    size="small"
                    className="ml-1"
                    shape="circle"
                    icon={<PlusOutlined />}
                    onClick={() => this.createOrUpdateModalOpen()}
                  />
                </Col>
              </Row>
              <DndProvider backend={HTML5Backend}>
                <SubCategoryContainer
                  listSubCategory={subCategories}
                  onUpdateSort={this.onUpdateSort}
                  activateOrDeactivate={this.activateOrDeactivate}
                />
              </DndProvider>
            </Card>
          </Col>
        </Row>

        <InventoryCategorySubModal
          inventoryCategoryStore={this.props.inventoryCategoryStore}
          visible={this.state.modalVisible}
          parentId={this.props.params?.id}
          inventoryCategoryOptions={inventoryCategoryOptions}
          rend
          onCancel={(isRefresh) => this.onCancelModal(isRefresh)}
        />
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(InventoryCategoryDetail)
