import { inject, observer } from 'mobx-react'
import { Form, Modal, Input, Row, Col, Select, DatePicker } from 'antd'
import { L, isGrantedAny } from '@lib/abpUtility'
import Stores from '@stores/storeIdentifier'
import AppConsts, { appPermissions, dateFormat, fileTypeGroup } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import NumberInput from '@components/Inputs/NumberInput'
import AppComponentBase from '@components/AppComponentBase'
import InventoryItemsStore from '@stores/inventory/inventoryItemsStore'
import InventoryStockInOutStore from '@stores/inventory/inventoryStockInOutStore'
import FileStore from '@stores/common/fileStore'
import { rulesStockOut } from './validation'
import FileUploadWrapV2 from '@components/FileUploadV2'

const { formVerticalLayout } = AppConsts

interface IInventoryStockOutModalProps {
  inventoryItemsStore?: InventoryItemsStore
  inventoryStockInOutStore?: InventoryStockInOutStore
  fileStore?: FileStore
  formRef: any
  visible: boolean
  onCreate: any
  onCancel: any
  isView?: boolean
}

@inject(Stores.InventoryItemsStore, Stores.FileStore, Stores.InventoryStockInOutStore)
@observer
class InventoryStockOutModal extends AppComponentBase<IInventoryStockOutModalProps> {
  state = {
    confirmDirty: false,
    loading: false,
    files: [] as any
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
    if (field === 'inventoryId') {
      const inventory = this.props.inventoryItemsStore?.inventoryItemsOptions.find((item) => item.value === value)
      this.props.formRef.current.setFieldsValue({
        currentQuantity: inventory.data.quantity
      })
    }
  }

  onSubmit = (values) => this.props.onCreate(values, this.state.files)

  public render() {
    const { visible, onCancel, formRef, inventoryItemsStore, isView, inventoryStockInOutStore } = this.props
    return (
      <Modal
        title={L('INVENTORY_STOCK_OUT')}
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
          <Row gutter={16}>
            <Col md={{ span: 12 }} sm={{ span: 12 }}>
              <Form.Item
                label={L('INVENTORY_ITEM')}
                {...formVerticalLayout}
                name="inventoryId"
                rules={rulesStockOut.inventoryId}>
                <Select
                  style={{ width: '100%' }}
                  onChange={(value) => this.onChange('inventoryId', value)}
                  disabled={isView}>
                  {this.renderOptions(inventoryItemsStore?.inventoryItemsOptions)}
                </Select>
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
              <Form.Item
                label={L('INVENTORY_CURRENT_QUANTITY')}
                {...formVerticalLayout}
                name="currentQuantity"
                rules={rulesStockOut.currentQuantity}>
                <NumberInput disabled />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('INVENTORY_QUANTITY')}
                {...formVerticalLayout}
                name="quantity"
                rules={rulesStockOut.quantity}>
                <NumberInput disabled={isView} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('INVENTORY_OUTPUT_DATE')}
                {...formVerticalLayout}
                name="outputDate"
                rules={rulesStockOut.outputDate}>
                <DatePicker
                  className="full-width"
                  format={dateFormat}
                  placeholder={L('SELECT_DATE')}
                  disabled={isView}
                />
              </Form.Item>
            </Col>
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <Form.Item
                label={L('DESCRIPTION')}
                {...formVerticalLayout}
                name="description"
                rules={rulesStockOut.description}>
                <Input.TextArea rows={3} disabled={isView} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[24, 24]}>
            <Col md={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
              {this.props.fileStore && (
                <FileUploadWrapV2
                  parentId={inventoryStockInOutStore?.editStockOut.documentId}
                  fileStore={this.props.fileStore}
                  onRemoveFile={this.onRemoveFile}
                  disabled={isView}
                  beforeUploadFile={this.beforeUploadFile}
                  acceptedFileTypes={[...fileTypeGroup.images, ...fileTypeGroup.documents]}></FileUploadWrapV2>
              )}
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default InventoryStockOutModal
