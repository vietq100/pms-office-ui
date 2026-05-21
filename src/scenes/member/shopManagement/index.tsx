import AvatarUpload from '@components/FileUpload/AvatarUpload'
import FileUploadWrapV2 from '@components/FileUploadV2'
import WrapPageScroll from '@components/WrapPageScroll'
import { L } from '@lib/abpUtility'
import AppConsts, { fileTypeGroup, moduleAvatar } from '@lib/appconst'
import RoleStore from '@stores/administrator/roleStore'
import UserStore from '@stores/administrator/userStore'
import FileStore from '@stores/common/fileStore'
import ShopOwnerStore from '@stores/member/shopOwner/shopOwnerStore'
import ProjectStore from '@stores/project/projectStore'
import SessionStore from '@stores/sessionStore'
import Stores from '@stores/storeIdentifier'
import { Button, Card, Col, Input, Row, Form, Checkbox, Modal } from 'antd'
// import { Store } from 'antd/es/form/interface'
import { inject, observer } from 'mobx-react'
import { useEffect, useState } from 'react'

const { formVerticalLayout } = AppConsts

interface Props {
  shopOwnerStore: ShopOwnerStore
  projectStore: ProjectStore
  roleStore: RoleStore
  fileStore: FileStore
  sessionStore: SessionStore
  userStore: UserStore
}

const ShopManagement = inject(
  Stores.ShopOwnerStore,
  Stores.ProjectStore,
  Stores.RoleStore,
  Stores.FileStore,
  Stores.SessionStore,
  Stores.UserStore
)(
  observer((props: Props) => {
    const [haveShop, setHaveShop] = useState<boolean>(false)
    const [isRegistrationCertificate, setIsRegistrationCertificate] = useState<boolean>(false)
    const [files, setFiles] = useState<Array<any>>([])
    const [form] = Form.useForm()
    const getMyShop = async () => {
      await props.shopOwnerStore.getAll({
        maxResultCount: 10,
        skipCount: 0,
        Keyword: props.sessionStore.currentLogin.user.emailAddress,
        IsActive: true
      })
      if (props.shopOwnerStore.shopOwners.items[0]?.id) {
        setHaveShop(true)
        await props.shopOwnerStore.get(props.shopOwnerStore.shopOwners.items[0].id)
        form.setFieldsValue(props.shopOwnerStore.editShopOwner)
        setIsRegistrationCertificate(props.shopOwnerStore.editShopOwner.isRegistrationCertificate)
      }
    }
    useEffect(() => {
      getMyShop()
    }, [haveShop])

    const renderActions = () => {
      return (
        <Row gutter={4}>
          <Col flex="none"></Col>
          <Col flex="auto">
            <Button type="primary" className="mx-3" onClick={() => onSave()} shape="round">
              {L('BTN_SAVE')}
            </Button>
            <Button type="primary" danger shape="round">
              {L('BTN_DEACTIVATE')}
            </Button>
          </Col>
        </Row>
      )
    }

    const onRemoveFile = (file) => {
      const index = files.indexOf(file)
      const newFileList = [...files]
      newFileList.splice(index, 1)
      setFiles(newFileList)
    }

    const beforeUploadFile = (file) => {
      setFiles([...files, file])
      return false
    }

    const onSave = async () => {
      try {
        const values = await form.validateFields()
        await props.shopOwnerStore.update(
          {
            ...props.shopOwnerStore.editShopOwner,
            ...values
          },
          files
        )
        form.setFieldsValue({ values })
      } catch (errorInfo) {
        Modal.warning({
          title: L('Please input data')
        })
      }
    }
    return (
      <>
        {!haveShop && (
          <div className="w-100 d-flex justify-content-center">
            <p>{L('YOU_DONT_HAVE_SHOP')}</p>
          </div>
        )}
        {haveShop && (
          <WrapPageScroll renderActions={() => renderActions()}>
            <Card
              bordered={false}
              id="shop-owner-detail"
              cover={
                <div style={{ position: 'relative' }}>
                  <div className="cover-avatar" />
                  <div style={{ position: 'absolute', bottom: 0, right: '30px' }}>
                    <AvatarUpload
                      userStore={props.userStore}
                      module={moduleAvatar.shopOwner}
                      parentId={props.shopOwnerStore?.editShopOwner?.id}
                      profilePictureId={props.shopOwnerStore?.editShopOwner?.profilePictureId}></AvatarUpload>
                  </div>
                </div>
              }>
              <Form name="basic" initialValues={{ remember: true }} form={form} size="middle">
                <Row gutter={8}>
                  <Col span={24}>
                    <Form.Item
                      {...formVerticalLayout}
                      name="shopName"
                      rules={[
                        {
                          required: true,
                          message: 'Please input your shop name !'
                        }
                      ]}
                      label={L('SHOP_NAME')}>
                      <Input placeholder="Shop Name*" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      {...formVerticalLayout}
                      name="address"
                      rules={[
                        {
                          required: true,
                          message: 'Please input your shop address !'
                        }
                      ]}
                      label={L('SHOP_ADDRESS')}>
                      <Input placeholder="Shop Address*" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      {...formVerticalLayout}
                      name="phoneNumber"
                      rules={[
                        {
                          required: true,
                          message: 'Please input your shop phone number !'
                        }
                      ]}
                      label={L('SHOP_PHONE_NUMBER')}>
                      <Input placeholder="Phone Number*" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      {...formVerticalLayout}
                      name="emailAddress"
                      rules={[
                        {
                          required: true,
                          message: 'Please input your shop email !'
                        }
                      ]}
                      label={L('SHOP_EMAIL')}>
                      <Input placeholder="Email" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item name="isRegistrationCertificate" valuePropName="checked">
                      <Checkbox onChange={(e) => setIsRegistrationCertificate(e.target.checked)}>
                        {L('HAS_BUSINESS_REGISTRATION_CERTIFICATE')}
                      </Checkbox>
                    </Form.Item>
                    {isRegistrationCertificate && (
                      <>
                        <Form.Item
                          {...formVerticalLayout}
                          name="companyCode"
                          rules={[
                            {
                              required: true,
                              message: 'Please input your company code !'
                            }
                          ]}
                          label={L('COMPANY_CODE')}>
                          <Input placeholder="Company Code*" />
                        </Form.Item>
                      </>
                    )}
                  </Col>
                  <Col span={12}>
                    <FileUploadWrapV2
                      maxSize={25}
                      parentId={props.shopOwnerStore.editShopOwner?.uniqueId}
                      fileStore={props.fileStore}
                      onRemoveFile={onRemoveFile}
                      beforeUploadFile={beforeUploadFile}
                      acceptedFileTypes={fileTypeGroup.documentAndImage}></FileUploadWrapV2>
                  </Col>
                </Row>
              </Form>
            </Card>
          </WrapPageScroll>
        )}
        <style scoped>
          {`
          .ant-card .ant-card-body {
            padding: 5px;
          }
          `}
        </style>
      </>
    )
  })
)

export default ShopManagement
