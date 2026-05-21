import { useState } from 'react'
import { Form, Modal, Input, Row, Col, Select, DatePicker, Switch } from 'antd'
import { L, isGrantedAny, LNotification } from '@lib/abpUtility'
import { appPermissions, fileTypeGroup } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import { notifySuccess } from '@lib/helper'
import { styles } from '@lib/formLayout'
import CurrencyInput from '@components/Inputs/CurrencyInput'
import AppConsts from '@lib/appconst'
import debounce from 'lodash/debounce'
import rules from '../../assetDetail/validation'
import FileUploadWrapV2 from '@components/FileUploadV2'

const { formVerticalLayout, formHorizontalLayout } = AppConsts

const AssetModal = ({
  visible,
  handleOK,
  data,
  handleCancel,
  onClose,
  assetStore,
  assetTypesStore,
  fileStore,
  companyStore
}) => {
  const values = {}
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const onOK = async () => {
    setLoading(true)
    return form
      .validateFields()
      .then(async () => {
        const dataForm = form.getFieldsValue() || {}
        await handleOK({ ...dataForm, id: data.id })
        setLoading(false)
        notifySuccess(LNotification('SUCCESS'), LNotification(L('ITEM_UPDATE_SUCCEED')))
        onClose()
        form.resetFields()
      })
      .catch(() => setLoading(false))
  }

  const onRemoveFile = () => {
    throw new Error('Not implement')
  }

  const beforeUploadFile = () => {
    return false
  }

  const handleSearchAssetType = async (keyword) => await assetTypesStore.getAll({ keyword })

  const handleSearchCompany = async (keyword) => await companyStore.getAll({ keyword })

  return (
    <>
      <Modal
        title={L('ASSET_TYPE')}
        visible={visible}
        okText={L('BTN_SAVE')}
        onOk={onOK}
        cancelText={L('BTN_CANCEL')}
        onCancel={handleCancel}
        confirmLoading={loading}
        destroyOnClose
        maskClosable={false}
        okButtonProps={{
          disabled: !isGrantedAny(appPermissions.asset.create, appPermissions.asset.update),
          className: !isGrantedAny(appPermissions.asset.create, appPermissions.asset.update) ? 'd-none' : ''
        }}>
        <Form layout="vertical" initialValues={values} form={form} validateMessages={validateMessages} size="middle">
          <Row gutter={16}>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
              <Form.Item
                label={L('ASSET_TYPE_NAME')}
                {...formVerticalLayout}
                name="assetTypeId"
                // rules={rules.assetTypeId}
              >
                <Select
                  showArrow
                  showSearch
                  allowClear
                  onSearch={debounce(handleSearchAssetType)}
                  filterOption={false}
                  style={styles.width100}>
                  {assetTypesStore.pageResult?.items?.map((item: any, index) => (
                    <Select.Option key={index} value={item.value}>
                      {item?.assetTypeName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
              <Form.Item
                label={L('ASSET_COMPANY')}
                {...formVerticalLayout}
                name="companyId"
                // rules={rules.companyId}
              >
                <Select
                  showArrow
                  showSearch
                  allowClear
                  style={styles.width100}
                  onSearch={debounce(handleSearchCompany)}
                  filterOption={false}>
                  {companyStore.companies.items.map((item: any, index) => (
                    <Select.Option key={index} value={item}>
                      {item}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
              <Form.Item
                label={L('ASSET_NAME')}
                {...formVerticalLayout}
                style={styles.width100}
                name="assetName"
                rules={rules.assetName}>
                <Input onChange={({ target: { value } }) => value} style={styles.width100} />
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
              <Form.Item label={L('ASSET_SERIAL_NUMBER')} {...formVerticalLayout} name="serialNumber">
                <Input onChange={({ target: { value } }) => value} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
              <Form.Item
                label={L('ASSET_PURCHASED_DATE')}
                {...formVerticalLayout}
                name="purchasedDate"
                style={styles.width100}>
                <DatePicker
                  onChange={(_date, dateString) => dateString}
                  placeholder={L('ASSET_PURCHASED_DATE')}
                  style={styles.width100}
                />
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
              <Form.Item
                label={L('ASSET_WARRANTY_DATE')}
                {...formVerticalLayout}
                name="warrantDate"
                style={styles.width100}>
                <DatePicker
                  onChange={(_date, dateString) => dateString}
                  placeholder={L('ASSET_WARRANTY_DATE')}
                  style={styles.width100}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <Form.Item label={L('ASSET_PRICE')} {...formVerticalLayout} name="price">
                <CurrencyInput />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <Form.Item
                label={L('ASSET_DESCRIPTION')}
                {...formVerticalLayout}
                name="description"
                style={styles.width100}
                rules={rules.description}>
                <Input.TextArea onChange={({ target: { value } }) => value} rows={3} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <Form.Item label={L('ASSET_REMINDER')} {...formHorizontalLayout} name="assetReminder">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col md={{ span: 24, offset: 0 }} sm={{ span: 24, offset: 0 }}>
              <FileUploadWrapV2
                parentId={assetStore.editAsset.documentFileId}
                fileStore={fileStore}
                onRemoveFile={onRemoveFile}
                beforeUploadFile={beforeUploadFile}
                acceptedFileTypes={[...fileTypeGroup.images, ...fileTypeGroup.documents]}></FileUploadWrapV2>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}

export default AssetModal
