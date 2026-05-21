// import FileUploadWrap from '@components/FileUpload'
import ImageUpload from '@components/FileUpload/ImageUpload'
import withRouter from '@components/Layout/Router/withRouter'
import WrapPageScroll from '@components/WrapPageScroll'
import { isGrantedAny, L, LNotification } from '@lib/abpUtility'
import AppConsts, { appPermissions, fileTypeGroup } from '@lib/appconst'
import FileStore from '@stores/common/fileStore'
import ShopProductStore from '@stores/member/shopProduct/shopProductList'
import Stores from '@stores/storeIdentifier'
import { Card, Spin, Form, Row, Col, Button, Input, Select, Modal, InputNumber } from 'antd'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { FunctionComponent, useEffect, useState } from 'react'
import { rules } from './validation'

const { formVerticalLayout } = AppConsts
const { TextArea } = Input
const { Option } = Select
const { confirm } = Modal

interface Props {
  shopProductStore: ShopProductStore
  navigate: any
  params: any
  fileStore: FileStore
}

const productDetail: FunctionComponent<Props> = inject(
  Stores.ShopProductStore,
  Stores.ProjectStore,
  Stores.RoleStore,
  Stores.FileStore,
  Stores.SessionStore,
  Stores.UserStore
)(
  observer((props: Props) => {
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()
    const [files, setFiles] = useState<Array<any>>([])
    const getProductDetail = async () => {
      await props.shopProductStore.get(props?.params?.id)
      const res = toJS({
        ...props.shopProductStore.editShopProduct,
        productCategoryId: props.shopProductStore.editShopProduct.productCategory.id,
        productTypeId: props.shopProductStore.editShopProduct.productType.id,
        isPublished: props.shopProductStore.editShopProduct.isPublished.toString()
      })
      form.setFieldsValue(res)
    }
    const getProductCategory = async () => await props.shopProductStore.getProductCategory()
    useEffect(() => {
      if (!props.shopProductStore.productCategory[0]) {
        getProductCategory()
      }
      if (props?.params?.id) {
        getProductDetail()
      }
    }, [])

    const onCancel = () => {
      if (form.isFieldTouched('name')) {
        confirm({
          title: LNotification('ARE_YOU_SURE'),
          okText: L('BTN_YES'),
          cancelText: L('BTN_NO'),
          onOk: () => {
            props.navigate(-1)
          }
        })
        return
      }
      props.navigate(-1)
    }
    const onSave = async () => {
      setLoading(true)
      try {
        const values = await form.validateFields()
        const newValue = {
          ...values,
          isPublished: values.isPublished === 'true' ? true : false
        }
        if (props?.params?.id) {
          await props.shopProductStore.update({ ...newValue, id: props?.params?.id }, files)
        } else {
          await props.shopProductStore.create(newValue, files)
        }
        props.navigate(-1)
      } catch (errorInfo) {
        Modal.warning({
          title: L('Please input data')
        })
      } finally {
        setLoading(false)
      }
    }

    const renderActions = (isLoading) => {
      return (
        <Row gutter={4}>
          <Col sm={{ span: 24, offset: 0 }} flex="1" className="text-right">
            <Button className="mr-1" onClick={onCancel} shape="round">
              {L('BTN_CANCEL')}
            </Button>

            {isGrantedAny(appPermissions.product.create, appPermissions.product.update) && (
              <Button type="primary" onClick={onSave} loading={isLoading} shape="round">
                {L('BTN_SAVE')}
              </Button>
            )}
          </Col>
        </Row>
      )
    }

    const changeFile = (fileList) => {
      setFiles(fileList)
    }
    return (
      <>
        {loading && (
          <div className="w-100 d-flex justify-content-center">
            <Spin />
          </div>
        )}
        {!loading && (
          <WrapPageScroll renderActions={() => renderActions(loading)}>
            <Card bordered={false} id="shop-owner-detail" style={{ minHeight: 750 }}>
              <Form form={form} size="middle" layout={'vertical'}>
                <Row gutter={8}>
                  <Col span={16}>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          {...formVerticalLayout}
                          name="name"
                          label={L('PRODUCT_NAME')}
                          rules={rules.productName}>
                          <Input size="large" placeholder="Product Name*" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          {...formVerticalLayout}
                          name="description"
                          label={L('PRODUCT_DESCRIPTION')}
                          rules={rules.productDescription}>
                          <TextArea rows={4} placeholder="Product description*" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...formVerticalLayout}
                          name="quantity"
                          label={L('PRODUCT_QUANTITY')}
                          rules={rules.productQuantity}>
                          <InputNumber className="w-100" placeholder="Product quantity*" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...formVerticalLayout}
                          name="unitPrice"
                          label={L('PRODUCT_PRICE')}
                          rules={rules.productPrice}>
                          <InputNumber
                            className="w-100"
                            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => (value || '').replace(/\$\s?|(,*)/g, '')}
                            // onChange={onChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...formVerticalLayout}
                          name="productCategoryId"
                          label={L('PRODUCT_CATEGORY')}
                          rules={rules.productCategory}>
                          <Select
                            className="w-100"
                            showSearch
                            placeholder="Select a category"
                            optionFilterProp="children">
                            {props.shopProductStore.productCategory.map((item, index) => {
                              if (item.targetName === 'Category') {
                                return (
                                  <Option value={item.id} key={index}>
                                    {item.code}
                                  </Option>
                                )
                              } else return null
                            })}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          {...formVerticalLayout}
                          name="productTypeId"
                          label={L('PRODUCT_TYPE')}
                          rules={rules.productType}>
                          <Select className="w-100" showSearch placeholder="Select a type" optionFilterProp="children">
                            {props.shopProductStore.productCategory.map((item, index) => {
                              if (item.targetName === 'ProductType') {
                                return (
                                  <Option value={item.id} key={index}>
                                    {item.code}
                                  </Option>
                                )
                              } else return null
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...formVerticalLayout}
                          name="isPublished"
                          label={L('PRODUCT_PUBLISHED')}
                          rules={rules.productPublished}>
                          <Select className="w-100" showSearch placeholder="Select a type" optionFilterProp="children">
                            <Option value="false">{L('UNPUBLISHED')}</Option>
                            <Option value="true">{L('PUBLISHED')}</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={8}>
                    <ImageUpload
                      parentId={props?.params?.id ? props.shopProductStore.editShopProduct?.uniqueId : null}
                      maxSize={2}
                      changeFile={changeFile}
                      fileStore={props.fileStore}
                      acceptedFileTypes={fileTypeGroup.images}
                    />
                  </Col>
                </Row>
              </Form>
            </Card>
          </WrapPageScroll>
        )}
        <style scoped>
          {`
        .ant-input-number-handler-wrap {
          display: none !important
        }
        `}
        </style>
      </>
    )
  })
)

export default withRouter(productDetail)
