import { DeleteOutlined } from '@ant-design/icons'
import CommentList from '@components/CommentList'
import DataTable from '@components/DataTable'
import WrapPageScroll from '@components/WrapPageScroll'
import { isGrantedAny, L } from '@lib/abpUtility'
import AppConsts, { appPermissions, moduleIds } from '@lib/appconst'
import ShopOrderStore from '@stores/member/shopOrderStore/shopOrderList'
import ShopProductStore from '@stores/member/shopProduct/shopProductList'
import SessionStore from '@stores/sessionStore'
import CommentStore from '@stores/common/commentStore'
import Stores from '@stores/storeIdentifier'
import { Button, Col, DatePicker, InputNumber, Row, Select, Table, Tabs, Form } from 'antd'
import ButtonGroup from 'antd/lib/button/button-group'
import { inject, observer } from 'mobx-react'
import { useEffect, useState } from 'react'
import FeedbackStore from '@stores/communication/feedbackStore'
import Title from 'antd/lib/typography/Title'

import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
const { TabPane } = Tabs
const { align } = AppConsts
const { Option } = Select

interface Props {
  shopOrderStore: ShopOrderStore
  shopProductStore: ShopProductStore
  sessionStore: SessionStore
  commentStore: CommentStore
  feedbackStore: FeedbackStore
}
interface OrderStateProps {
  id: number
  quantity: number
  unitPrice: number
  product: any
  totalAmount: number
}
const tabKeys = {
  tabWorkOrder: 'ORDER_INFO',
  tabMessage: 'ORDER_MESSAGE'
}
const useForceUpdate = () => {
  const set = useState(0)[1]
  return () => set((s) => s + 1)
}
const ShopOrderDetail = inject(
  Stores.ShopProductStore,
  Stores.ShopOrderStore,
  Stores.FeedbackStore,
  Stores.WorkflowStore,
  Stores.UserStore,
  Stores.ProjectStore,
  Stores.CommentStore,
  Stores.SessionStore
)(
  observer((props: Props) => {
    const forceUpdate = useForceUpdate()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [totalAmount, setTotalAmount] = useState(0)
    const [orderDetails, setOrderDetails] = useState<Array<OrderStateProps>>([])
    const params = useParams()
    const navigate = useNavigate()
    const getDetail = async () => {
      setLoading(true)
      const id: any = params?.id
      await props.shopOrderStore.get(id)
      if (props.shopOrderStore.editShopOrder) {
        setOrderDetails(props.shopOrderStore.editShopOrder.orderDetails)
        let totalcost = 0
        props.shopOrderStore.editShopOrder.orderDetails.map((product) => {
          return (totalcost = totalcost + product.totalAmount)
        })
        setTotalAmount(totalcost)
        form.setFieldsValue({
          orderStatusId: props.shopOrderStore.editShopOrder?.orderStatusId,
          shippingDate: dayjs(props.shopOrderStore.editShopOrder?.shippingDate)
        })
      }
      setLoading(false)
    }
    const getOrderStatus = async () => {
      await props.shopOrderStore.getOrderStatus()
      // form.setFieldsValue({
      //   orderStatusId: props.shopOrderStore.editShopOrder?.orderStatusId,
      //   shippingDate: moment(props.shopOrderStore.editShopOrder?.shippingDate)
      // })
    }
    useEffect(() => {
      if (!props.shopOrderStore.orderStatus[0]) getOrderStatus()
      getDetail()
    }, [])

    const handleIncreItemQuantity = (item) => {
      item.quantity = item.quantity + 1
      item.totalAmount = item.totalAmount + item.unitPrice
      setTotalAmount(totalAmount + item.unitPrice)
      const newOrderDetails = orderDetails
      newOrderDetails.splice(orderDetails.indexOf(item), 1, item)
      setOrderDetails(newOrderDetails)
      forceUpdate()
    }
    const handleDecreItemQuantity = (item) => {
      if (item.quantity === 0) return
      item.quantity = item.quantity - 1
      item.totalAmount = item.totalAmount - item.unitPrice
      setTotalAmount(totalAmount - item.unitPrice)
      const newOrderDetails = orderDetails
      newOrderDetails.splice(orderDetails.indexOf(item), 1, item)
      setOrderDetails(newOrderDetails)
      forceUpdate()
    }
    const handleDeleteQuantity = (item) => {
      if (item.quantity === 0) return
      item.quantity = 0
      setTotalAmount(totalAmount - item.totalAmount)
      item.totalAmount = 0

      const newOrderDetails = orderDetails
      newOrderDetails.splice(orderDetails.indexOf(item), 1, item)
      setOrderDetails(newOrderDetails)
      forceUpdate()
    }
    const columns = [
      {
        title: L('ORDER_DETAIL_ID'),
        dataIndex: 'id',
        key: 'id',
        width: 60,
        ellipsis: true,
        render: (id) => <>{id}</>
      },
      {
        title: L('ORDER_PRODUCT_NAME'),
        dataIndex: 'product',
        key: 'product',
        width: 260,
        ellipsis: true,
        render: (product) => <>{product.name}</>
      },
      {
        title: L('ORDER_QUANTITY'),
        dataIndex: 'quantity',
        key: 'quantity',
        width: 120,
        align: align.right,
        render: (quantity) => <>{quantity}</>
      },
      {
        title: L('ORDER_UNIT_PRICE'),
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        width: 120,
        align: align.right,
        render: (unitPrice) => <>{unitPrice}</>
      },
      {
        title: L('ORDER_TOTAL_VALUE'),
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        width: 120,
        align: align.right,
        render: (totalAmount) => <>{totalAmount}</>
      },
      {
        title: L('ACTIONS'),
        dataIndex: 'operation',
        key: 'operation',
        fixed: align.right,
        align: align.right,
        width: 200,
        render: (text: string, item: any) => (
          <div>
            <ButtonGroup>
              <Button onClick={() => handleDecreItemQuantity(item)}>-</Button>
              <div style={{ width: '2.5rem' }} className="d-flex justify-content-center align-items-center">
                <span>{item?.quantity}</span>
              </div>
              <Button onClick={() => handleIncreItemQuantity(item)}>+</Button>
              <Button type="text" onClick={() => handleDeleteQuantity(item)}>
                <DeleteOutlined />
              </Button>
            </ButtonGroup>
          </div>
        )
      }
    ]
    const onSave = async () => {
      const updateStatusObj = {
        id: props.shopOrderStore.editShopOrder.id,
        shippingDate: dayjs(form.getFieldsValue().shippingDate).toISOString(),
        status: form.getFieldsValue().orderStatusId
      }
      await props.shopOrderStore.updateOrderDetail(updateStatusObj, orderDetails)
      navigate(-1)
    }
    const onCancel = () => {
      navigate(-1)
    }
    const renderActions = (isLoading) => {
      return (
        <Row gutter={4}>
          <Col sm={{ span: 24, offset: 0 }} flex="none">
            <Button className="mr-1" onClick={onCancel} shape="round">
              {L('BTN_CANCEL')}
            </Button>

            {isGrantedAny(appPermissions.shopOwner.update) && (
              <Button type="primary" onClick={onSave} loading={isLoading} shape="round">
                {L('BTN_SAVE')}
              </Button>
            )}
          </Col>
        </Row>
      )
    }
    return (
      <>
        <Tabs
          defaultActiveKey={props.shopOrderStore.activeMesTab ? tabKeys.tabMessage : tabKeys.tabWorkOrder}
          onTabClick={(tabKey) => {
            if (tabKey === tabKeys.tabMessage) {
              const params = {
                conversationUniqueId: props.shopOrderStore.editShopOrder?.uniqueId,
                moduleId: moduleIds.order,
                maxResultCount: 10,
                skipCount: 0,
                isIncludeFile: true,
                isPrivate: false
              }
              props.commentStore.getAll(params)
            }
          }}>
          <TabPane tab={L(tabKeys.tabWorkOrder)} key={tabKeys.tabWorkOrder}>
            <WrapPageScroll renderActions={() => renderActions(loading)}>
              <Form form={form} size="middle">
                <div className="w-100 d-flex justify-content-end ">
                  <Title level={3}>
                    {L('ORDER_VALUE')} : {totalAmount} {L('VNĐ')}
                  </Title>
                </div>
                <DataTable>
                  <Table
                    size="middle"
                    className="custom-ant-table"
                    rowKey={(record) => record.id}
                    columns={columns}
                    pagination={false}
                    loading={props.shopOrderStore.isLoading}
                    dataSource={orderDetails === undefined ? [] : orderDetails}
                  />
                </DataTable>
                <Row className="mt-3" gutter={16}>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <label>{L('ORDER_STATUS')}</label>
                    <Form.Item name="orderStatusId">
                      <Select
                        allowClear
                        className="w-100"
                        showSearch
                        placeholder={L('SELECT_STATUS')}
                        optionFilterProp="children">
                        {props.shopOrderStore.orderStatus.map((order, index) => {
                          return (
                            <Option value={order.id} key={index}>
                              {order.code}
                            </Option>
                          )
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <label>{L('ORDER_SHIPPING_DATE')}</label>
                    <Form.Item name="shippingDate">
                      <DatePicker className="w-100" />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <label>{L('ORDER_SHIPPING_COST')}</label>

                    <InputNumber
                      className="w-100"
                      formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Col>
                </Row>
              </Form>
            </WrapPageScroll>
          </TabPane>
          <TabPane tab={L(tabKeys.tabMessage)} key={tabKeys.tabMessage}>
            <CommentList
              moduleId={moduleIds.order}
              parentId={props.shopOrderStore.editShopOrder?.uniqueId}
              commentStore={props.commentStore}
              sessionStore={props.sessionStore}
              isPrivate={false}
            />
          </TabPane>
        </Tabs>
      </>
    )
  })
)

export default ShopOrderDetail
