import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { Form, Modal, Input, Row, Col, Select, DatePicker, InputNumber } from 'antd'
import { L, isGrantedAny } from '@lib/abpUtility'
import AppConsts, { appPermissions, dateFormat, fileTypeGroup } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import NumberInput from '@components/Inputs/NumberInput'
import { rulesStockIn } from './validation'
import AppComponentBase from '@components/AppComponentBase'
import FileStore from '@stores/common/fileStore'
import InventoryBrandStore from '@stores/inventory/inventoryBrandStore'
import InventoryItemsStore from '@stores/inventory/inventoryItemsStore'
import InventoryStockInOutStore from '@stores/inventory/inventoryStockInOutStore'
import CompanyStore from '@stores/project/companyStore'
import { isNumber } from 'lodash'
import FileUploadWrapV2 from '@components/FileUploadV2'
import { inputNumberFormatter } from '@lib/helper'

const { formVerticalLayout } = AppConsts

interface IInventoryStockInModalProps {
  fileStore?: FileStore
  inventoryBrandStore?: InventoryBrandStore
  inventoryItemsStore?: InventoryItemsStore
  inventoryStockInOutStore?: InventoryStockInOutStore
  companyStore?: CompanyStore
  formRef: any
  visible: boolean
  onCreate: any
  onCancel: any
  isView?: boolean
}

@inject(
  Stores.InventoryBrandStore,
  Stores.InventoryItemsStore,
  Stores.FileStore,
  Stores.CompanyStore,
  Stores.InventoryStockInOutStore
)
@observer
class InventoryStockInModal extends AppComponentBase<IInventoryStockInModalProps> {
  state = {
    confirmDirty: false,
    loading: false,
    files: [] as any
  }

  async componentDidMount() {
    this.props.inventoryItemsStore?.filterOptions({})
    this.props.inventoryBrandStore?.filterOptions({})
    this.props.companyStore?.filterOptions({})
  }

  onRemoveFile = (file: any) => {
    const index = this.state.files.indexOf(file)
    const newFileList = [...this.state.files]
    newFileList.splice(index, 1)
    this.setState({ files: newFileList })
  }

  beforeUploadFile = (file) => {
    this.setState({ files: [...this.state.files, file] })
    return false
  }

  onChange = (field, value) => {
    const { formRef } = this.props
    if (field === 'inventoryId') {
      const inventory = this.props.inventoryItemsStore?.inventoryItemsOptions.find((item) => item.value === value)
      formRef.current.setFieldsValue({
        currentQuantity: inventory.data.quantity
      })
    }
    if (field === 'quantity' || field === 'unitPrice') {
      const values = formRef.current.getFieldsValue()
      if (values.quantity && values.unitPrice && isNumber(values.quantity) && isNumber(values.unitPrice)) {
        formRef.current.setFieldsValue({
          cost: values.quantity * values.unitPrice
        })
      }
    }
  }

  onSubmit = (values) => this.props.onCreate(values, this.state.files)

  public render() {
    const {
      visible,
      onCancel,
      formRef,
      inventoryItemsStore,
      inventoryBrandStore,
      companyStore,
      fileStore,
      inventoryStockInOutStore,
      isView
    } = this.props
    return (
      <Modal
        title={L(isView ? 'VIEW' : 'ADD')}
        visible={visible}
        okText={L('BTN_SAVE')}
        onOk={this.onSubmit}
        cancelText={L('BTN_CANCEL')}
        onCancel={onCancel}
        destroyOnClose
        maskClosable={false}
        okButtonProps={{
          disabled: !isGrantedAny(appPermissions.inventory.create, appPermissions.inventory.update),
          className: !isGrantedAny(appPermissions.inventory.create, appPermissions.inventory.update) ? 'd-none' : ''
        }}>
        <Form layout="vertical" ref={formRef} validateMessages={validateMessages} size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('INVENTORY_ITEM')}
                {...formVerticalLayout}
                name="inventoryId"
                rules={rulesStockIn.inventoryId}>
                <Select
                  style={{ width: '100%' }}
                  onChange={(value) => this.onChange('inventoryId', value)}
                  disabled={isView}>
                  {this.renderOptions(inventoryItemsStore?.inventoryItemsOptions)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('INVENTORY_CURRENT_QUANTITY')}
                {...formVerticalLayout}
                name="currentQuantity"
                rules={rulesStockIn.currentQuantity}>
                <NumberInput placeholder={L('INVENTORY_CURRENT_QUANTITY')} disabled />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('INVENTORY_QUANTITY')}
                {...formVerticalLayout}
                name="quantity"
                rules={rulesStockIn.quantity}>
                <InputNumber
                  formatter={(value) => inputNumberFormatter(value)}
                  className="full-width"
                  placeholder={L('INVENTORY_QUANTITY')}
                  disabled={isView}
                  onChange={(value) => this.onChange('quantity', value)}
                />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('INVENTORY_UNIT_PRICE')} {...formVerticalLayout} name="unitPrice">
                <InputNumber
                  formatter={(value) => inputNumberFormatter(value)}
                  className="full-width"
                  placeholder={L('INVENTORY_UNIT_PRICE')}
                  disabled={isView}
                  onChange={(value) => this.onChange('unitPrice', value)}
                />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('INVENTORY_TOTAL_VALUE')} {...formVerticalLayout} name="cost">
                <InputNumber
                  className="full-width"
                  disabled={isView}
                  formatter={(value) => inputNumberFormatter(value)}
                />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('INVENTORY_INPUT_DATE')}
                {...formVerticalLayout}
                name="inputDate"
                rules={rulesStockIn.inputDate}>
                <DatePicker
                  className="full-width"
                  format={dateFormat}
                  placeholder={L('SELECT_DATE')}
                  disabled={isView}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('INVENTORY_DELIVERY_NUMBER')} {...formVerticalLayout} name="deliveryNo">
                <Input disabled={isView} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('INVENTORY_COMPANY')} {...formVerticalLayout} name="companyId">
                <Select style={{ width: '100%' }} disabled={isView}>
                  {this.renderOptions(companyStore?.companyOptions)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('INVENTORY_BRAND')} {...formVerticalLayout} name="brandId">
                <Select style={{ width: '100%' }} disabled={isView}>
                  {this.renderOptions(inventoryBrandStore?.inventoryBrandOptions)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('DESCRIPTION')}
                {...formVerticalLayout}
                name="description"
                rules={rulesStockIn.description}>
                <Input.TextArea rows={3} disabled={isView} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[24, 24]}>
            <Col md={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
              <FileUploadWrapV2
                parentId={inventoryStockInOutStore?.editStockIn.documentId}
                fileStore={fileStore!}
                onRemoveFile={this.onRemoveFile}
                disabled={isView}
                beforeUploadFile={this.beforeUploadFile}
                acceptedFileTypes={[...fileTypeGroup.images, ...fileTypeGroup.documents]}
              />
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default InventoryStockInModal
