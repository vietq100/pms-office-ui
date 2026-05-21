import ListImageUpload from '@components/FileUpload/ListUpload'
import FormInput from '@components/FormItem/FormInput'
import FormNumber from '@components/FormItem/FormNumber'
import FormSelect from '@components/FormItem/FormSelect'
import WrapPageScroll from '@components/WrapPageScroll'
import { isGranted, isGrantedAny, L } from '@lib/abpUtility'
import AppConsts, { appPermissions, moduleIds } from '@lib/appconst'
import staffService from '@services/member/staff/staffService'
import saleAndLeaseService from '@services/saleAndLease/saleAndLeaseService'
import FileStore from '@stores/common/fileStore'
import SaleAndLeaseStore from '@stores/saleAndLease/saleAndLeaseStore'
import Stores from '@stores/storeIdentifier'
import { Button, Card, Col, Form, Input, Row, Select, Spin, Tabs } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { debounce } from 'lodash'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import projectService from '@services/project/projectService'
import rules from './validation'
import CommentList from '@components/CommentList'
import SessionStore from '@stores/sessionStore'
import CommentStore from '@stores/common/commentStore'
import { bathroomStatus, bedroomStatus } from '../sale/FilterSale'
import { validateMessages } from '@lib/validation'
import NoRole from '@components/ComponentNoRole'
const { formVerticalLayout } = AppConsts
type Props = {
  saleAndLeaseStore: SaleAndLeaseStore
  commentStore: CommentStore
  sessionStore: SessionStore
}
const tabKeys = {
  information: 'TAB_INFORMATION',
  communication: 'TAB_COMMUNICATION'
}
const LeaseDetail = inject(
  Stores.SaleAndLeaseStore,
  Stores.CommentStore,
  Stores.SessionStore
)(
  observer((props: Props) => {
    const [createUser, setCreateUser] = React.useState<any[]>([])
    const [assignUser, setAssignUser] = React.useState<any[]>([])

    const getUser = async (keyword?) => {
      const res = await staffService.getAll({ keyword })
      return res.items
    }

    const getCreateUser = async (keyword?) => {
      const res = await projectService.filterUnitUsers({ keyword })
      return res
    }
    const params: any = useParams()
    isGranted(appPermissions.enquiry.detail) &&
      React.useEffect(() => {
        props.saleAndLeaseStore.getCurrentListStatus(params.id)

        if (params.id) {
          props.saleAndLeaseStore.getDetail(params.id).then(() => {
            form.setFieldsValue(props.saleAndLeaseStore.leaseDetail)
            props.saleAndLeaseStore.leaseDetail.user
              ? setCreateUser([props.saleAndLeaseStore.leaseDetail.user])
              : searchCreateUser()
            props.saleAndLeaseStore.leaseDetail.assignUser
              ? setAssignUser([props.saleAndLeaseStore.leaseDetail.assignUser])
              : searchAssignUser()
            if (props.saleAndLeaseStore.leaseDetail.uniqueId) {
              saleAndLeaseService
                .getPhoto(props.saleAndLeaseStore.leaseDetail.uniqueId)
                .then((res: any) => setImages(res))
            }
          })
        } else {
          form.setFields([{ name: 'enquiryStatusId', value: 2 }])
          searchCreateUser()
          searchAssignUser()
        }
      }, [])

    const searchCreateUser = async (keyword?) => {
      const res = await getCreateUser(keyword)
      setCreateUser(res)
    }
    const searchAssignUser = async (keyword?) => {
      const res = await getUser(keyword)
      setAssignUser(res)
    }
    const [form] = useForm()
    const navigate = useNavigate()
    const onCancel = () => {
      navigate(-1)
    }
    const onSave = async () => {
      const values = await form.validateFields()
      if (params.id) {
        await props.saleAndLeaseStore.updateLease(values, Images)
      } else {
        await props.saleAndLeaseStore.createLease(values, Images)
      }
      navigate(-1)
    }
    const renderActions = (isLoading) => {
      return (
        <Row gutter={4}>
          <Col sm={{ span: 24, offset: 0 }} flex="end">
            <Button className="mr-1" onClick={onCancel} shape="round">
              {L('BTN_CANCEL')}
            </Button>

            {isGrantedAny(appPermissions.enquiry.update, appPermissions.enquiry.create) &&
              tabActiveKey === tabKeys.information && (
                <Button type="primary" onClick={onSave} loading={isLoading} shape="round">
                  {L('BTN_SAVE')}
                </Button>
              )}
          </Col>
        </Row>
      )
    }
    const [tabActiveKey, setTabActiveKey] = React.useState(tabKeys.information)
    const changeTab = (tabKey) => {
      setTabActiveKey(tabKey)
      if (tabKey === tabKeys.communication) {
        const params = {
          conversationUniqueId: props.saleAndLeaseStore.leaseDetail?.uniqueId,
          moduleId: moduleIds.enquiry,
          maxResultCount: 10,
          skipCount: 0,
          isIncludeFile: true,
          isPrivate: false
        }
        props.commentStore.getAll(params)
      }
    }
    const [Images, setImages] = React.useState<any[]>([])
    const handleSelectUser = async (userId) => {
      const user = createUser.find((item) => item.id === userId)
      form.setFields([{ name: 'unitId', value: user.unitId }])
    }
    return isGranted(appPermissions.enquiry.detail) ? (
      <WrapPageScroll renderActions={() => renderActions(props.saleAndLeaseStore.isLoading)}>
        <Tabs activeKey={tabActiveKey} onTabClick={changeTab} type="card">
          <Tabs.TabPane tab={L('INFORMATION')} key={tabKeys.information}>
            <Card bordered={false} style={{ minHeight: 600 }}>
              <Spin spinning={props.saleAndLeaseStore.isLoading ?? false}>
                <Form form={form} layout={'vertical'} validateMessages={validateMessages}>
                  <Row gutter={[8, 8]}>
                    <Col sm={{ span: 0, offset: 0 }}>
                      <FormInput name="unitId" label={''} />
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <FormInput name="title" label={L('TITLE')} rule={rules.title} />
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <FormSelect
                        rule={rules.required}
                        name="userId"
                        label={L('CREATE_USER')}
                        options={createUser}
                        selectProps={{
                          onSearch: debounce(searchCreateUser, 300),
                          onSelect: (e) => handleSelectUser(e)
                        }}
                        optionModal={(item, index) => (
                          <Select.Option key={index} value={item.id}>
                            <div>{item.displayName}</div>
                            <div className="text-muted">
                              {item.phoneNumber} {item.fullUnitCode ? '- ' + item.fullUnitCode : ''}
                            </div>
                          </Select.Option>
                        )}
                      />
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <FormSelect
                        rule={rules.required}
                        name="numOfBedroom"
                        label={L('NUMBER_BEDROOM')}
                        options={bedroomStatus}
                      />
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <FormNumber rule={rules.required} name="size" label={L('UNIT_SIZE')} />
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <FormSelect
                        rule={rules.required}
                        name="numOfBathroom"
                        label={L('NUMBER_BATHROOM')}
                        options={bathroomStatus}
                      />
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <FormNumber rule={rules.price} max={15} name="price" label={L('PRICE')} />
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <FormSelect
                        rule={rules.required}
                        name="currencyCode"
                        label={L('CURRENCY')}
                        options={[
                          { value: 'VND', label: 'VNĐ' },
                          { value: 'USD', label: 'USD' }
                        ]}
                      />
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      {/* <FormTextArea
                        rule={rules.description}
                        name="description"
                        label={L('DESCRIPTION')}
                        maxLength={2000}
                      /> */}
                      <Form.Item
                        label={L('DESCRIPTION')}
                        {...formVerticalLayout}
                        name="description"
                        rules={rules.description}>
                        <Input.TextArea rows={2} />
                      </Form.Item>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }}>
                      <label>{L('IMAGE')}</label>
                      <ListImageUpload
                        maxFile={8}
                        maxSize={3}
                        fileStore={new FileStore()}
                        initialFileList={Images}
                        changeFile={(fileList) => setImages(fileList)}
                      />
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <FormSelect
                        rule={rules.required}
                        name="assignUserId"
                        label={L('ASSIGN_USER')}
                        options={assignUser}
                        selectProps={{
                          onSearch: debounce(searchAssignUser, 300)
                        }}
                        optionModal={(item, index) => (
                          <Select.Option key={index} value={item.id}>
                            <div>{item.displayName}</div>
                            <div className="text-muted">{item.emailAddress}</div>
                          </Select.Option>
                        )}
                      />
                    </Col>
                    <Col sm={{ span: 12, offset: 0 }}>
                      <FormSelect
                        rule={rules.required}
                        disabled={!params.id}
                        name="enquiryStatusId"
                        label={L('STATUS')}
                        options={props.saleAndLeaseStore.currentStatusList}
                      />
                    </Col>
                  </Row>
                </Form>
              </Spin>
            </Card>
          </Tabs.TabPane>
          <Tabs.TabPane tab={L('COMMUNICATION')} key={tabKeys.communication} disabled={!params.id}>
            <CommentList
              moduleId={moduleIds.enquiry}
              parentId={props.saleAndLeaseStore.leaseDetail?.uniqueId}
              commentStore={props.commentStore}
              sessionStore={props.sessionStore}
              isPrivate={false}
            />
          </Tabs.TabPane>
        </Tabs>
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  })
)

export default LeaseDetail
