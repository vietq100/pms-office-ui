import { Modal, Table, Button, Col, Form } from 'antd'
import { CheckCircleFilled, CloseCircleFilled, DeleteOutlined, EditFilled } from '@ant-design/icons'
import withRouter from '@components/Layout/Router/withRouter'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { AppComponentListBase } from '@components/AppComponentBase'
import { isGrantedAny, L, LNotification } from '@lib/abpUtility'
import AppConsts, { appPermissions, appStatusColors } from '@lib/appconst'
import columnExchangeRate from './column'
import NoRole from '@components/ComponentNoRole'
import ExchangeRateStore from '@stores/exchangeRate/exchangeRateStore'
import React from 'react'
import { v4 as uuid } from 'uuid'
import { EditableCell } from '@components/DataTableV2/EditableCell'
import { validateMessages } from '@lib/validation'
import { notifySuccess } from '@lib/helper'
import dayjs from 'dayjs'

export interface IContactProfileProps {
  navigate: any
  params: any
  exchangeRateStore: ExchangeRateStore
}

const confirm = Modal.confirm
const { align } = AppConsts

@inject(Stores.ExchangeRateStore)
@observer
class ExchangeRatePage extends AppComponentListBase<IContactProfileProps> {
  state = {
    uniqueId: '',
    previousDataRow: undefined,
    listData: [] as any,
    visibleAction: false
  }

  formRef: any = React.createRef()
  isEditing = (record: any) => record.id === this.state.uniqueId

  async componentDidMount() {
    this.isGranted(appPermissions.contractor.page) && (await Promise.all([this.getAll()]))
  }

  getAll = async () => {
    await this.props.exchangeRateStore.getAll()
    this.setState({ listData: this.props.exchangeRateStore.listExchangeRate })
  }

  activateOrDeactivate = async (id: number, isActive) => {
    confirm({
      title: LNotification(isActive ? 'DO_YOU_WANT_TO_ACTIVATE_THIS_ITEM' : 'DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.exchangeRateStore.activateOrDeactivate(id, isActive)
      }
    })
  }

  handleAddRow = () => {
    this.setState({ visibleAction: true })
    this.formRef.current.resetFields()
    const newRow = { id: uuid() }

    const newData = [...this.props.exchangeRateStore.listExchangeRate]

    newData.unshift(newRow)

    this.setState({ listData: newData })
    this.setState({ uniqueId: newRow.id })
  }

  saveRow = async (id: any) => {
    console.log(id)
    const values = await this.formRef.current.validateFields()
    const foundItem = this.state.listData.find((item) => item.id === this.state.uniqueId)

    if (id) {
      if (typeof id !== 'number' ? true : false) {
        try {
          const body = Object.assign(foundItem, values)
          delete body.id
          await this.props.exchangeRateStore.create(body)
          notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
          this.getAll()
        } catch {
          this.getAll()
        }
      } else {
        try {
          values.id = id
          const body = Object.assign(foundItem, values)
          await this.props.exchangeRateStore.update(body)
          notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
          this.getAll()
        } catch {
          this.getAll()
        }
      }
    }

    this.setState({ visibleAction: false })
    this.setState({ uniqueId: '' })
    this.setState({ previousDataRow: undefined })
  }

  handleCancleRow = async (id) => {
    // check nếu k có data record trước khi edit đó thì xoá row luôn=> do khi tạo
    // mới thì chắc chắn không có data dòng trước đó
    if (this.state.previousDataRow === undefined) {
      const newList = this.state.listData.filter((item) => item.id !== id)
      this.setState({ listData: newList })
    }
    this.setState({ visibleAction: false })
    this.setState({ uniqueId: '' })
    this.setState({ previousDataRow: undefined })
  }

  handleDeleteRow = async (id) => {
    await this.props.exchangeRateStore.activateOrDeactivate(id, false)
    this.getAll()
  }

  public render() {
    const columns = columnExchangeRate(
      {
        title: L('FILE_DOCUMENT_ACTION'),
        dataIndex: 'action',
        key: 'action',
        fixed: align.right,
        align: align.center,
        width: '10%',
        render: (action, row) => {
          return this.state.uniqueId === row.id ? (
            <div className="d-flex justify-content-center w-100 ">
              <Button
                type="text"
                icon={<CheckCircleFilled style={{ color: appStatusColors.success }} />}
                onClick={() => this.saveRow(row.id)}
              />
              <Button
                type="text"
                icon={<CloseCircleFilled style={{ color: appStatusColors.error }} />}
                onClick={() => this.handleCancleRow(row.id)}
              />
            </div>
          ) : (
            <div className="d-flex justify-content-center w-100 ">
              {isGrantedAny(appPermissions.exchangeRate.update) && (
                <Button
                  disabled={this.state.visibleAction && this.state.uniqueId !== row.id}
                  size="small"
                  shape="circle"
                  className=" mr-1"
                  icon={<EditFilled />}
                  onClick={() => {
                    this.formRef.current.setFieldsValue({
                      ...row,
                      startDate: row.startDate ? dayjs(row.startDate) : null,
                      endDate: row.startDate ? dayjs(row.endDate) : null
                    })
                    this.setState({ uniqueId: row?.id, visibleAction: true, previousDataRow: { ...row } })
                  }}
                />
              )}

              {isGrantedAny(appPermissions.exchangeRate.delete) && (
                <Button
                  disabled={this.state.visibleAction && this.state.uniqueId !== row.id}
                  size="small"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  onClick={() => this.handleDeleteRow(row.id)}
                />
              )}
            </div>
          )
        }
      },
      this.isEditing
    )

    return this.isGranted(appPermissions.exchangeRate.page) ? (
      <>
        <Col sm={{ span: 24, offset: 0 }} className="mt-2">
          <label className="title-detail">{L('EXCHANGE_RATE_PAGE')}</label>
        </Col>
        <Col sm={{ span: 24, offset: 0 }} className="mt-2">
          <Form ref={this.formRef} layout={'vertical'} size="middle" validateMessages={validateMessages}>
            <Table
              pagination={false}
              size="small"
              components={{
                body: {
                  cell: EditableCell
                }
              }}
              bordered
              dataSource={this.state.listData}
              columns={columns}
              rowKey={(record) => record.id}
              scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
            />
          </Form>
          <style scoped>{`
                    .ant-table-wrapper{
                     margin-bottom: 0px
                   }
               `}</style>
          {isGrantedAny(appPermissions.exchangeRate.create) && (
            <Button type="primary" className="w-100" onClick={this.handleAddRow} disabled={this.state.visibleAction}>
              {L('ADD_NEW_ROW')}
            </Button>
          )}
        </Col>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(ExchangeRatePage)
