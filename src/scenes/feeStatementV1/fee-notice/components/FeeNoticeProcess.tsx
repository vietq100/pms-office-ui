import AppComponentBase from '@components/AppComponentBase'
import DataTable from '@components/DataTable'
import { Button, Col, Dropdown, Form, Input, Menu, Modal, Popover, Row, Select, Table } from 'antd'

import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { L, LError, LNotification } from '@lib/abpUtility'
import AppConst, { appPermissions } from '@lib/appconst'
import withRouter from '@components/Layout/Router/withRouter'
import FeeNoticeStore from '@stores/fee/feeNoticeStore'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EllipsisOutlined,
  ExclamationCircleFilled,
  FilePdfOutlined
} from '@ant-design/icons'
import { formatCurrency, renderDateTime } from '@lib/helper'
import WrapPageScroll from '@components/WrapPageScroll'
import PDFFileViewer from '@components/FileUploadV2/PdfFileViewer'
import { validateMessages } from '@lib/validation'
import React from 'react'
import './style.css'
import { ReactComponent as Pdf2 } from '../../../../assets/icons/pdf2.svg'
import { ExcelIcon } from '@components/Icon'

const confirm = Modal.confirm
const {
  pageSize,
  align,
  statusFeeNoticeDetail,
  isGenStatus,
  textConfirmPopup,
  statusFeeNoticeKey,
  statusFeeNoticeDetailKey
} = AppConst

interface State {
  skipCount: number
  filters: any
  previewVisiblePDFFile: boolean
  urlPdf: string
  visiblePopupConfirm: boolean
  idNeedConfirm: any
}

interface Props {
  navigate: any
  params: any
  feeNoticeStore: FeeNoticeStore
}

@inject(Stores.FeeNoticeStore)
@observer
class FeeNoticeProcess extends AppComponentBase<Props, State> {
  maxResultCount = pageSize.pageSize_20

  formConfirm: any = React.createRef()
  state = {
    skipCount: 0,
    users: [],
    record: [],
    filters: {
      keyword: ''
    },
    previewVisiblePDFFile: false,
    urlPdf: '',
    visiblePopupConfirm: false,
    idNeedConfirm: undefined
  }
  async componentDidMount() {
    await Promise.all([this.getAll()])
    console.log(this.props.feeNoticeStore.pagedResult)
  }

  getAll = async () => {
    await this.props.feeNoticeStore.getHistory({
      maxResultCount: this.maxResultCount,
      skipCount: this.state.skipCount,
      FeeNoticeId: this.props.params?.id,
      ...this.state.filters
    })
  }

  handlePagingChange = ({ current }) => {
    this.setState({ skipCount: --current * this.maxResultCount }, this.getAll)
  }
  handleSearch = (name, value) => {
    const { filters } = this.state

    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
      await this.getAll()
    })
  }
  onCancel = async () => {
    this.props.navigate(-1)
  }

  onViewPdf = (url) => {
    this.setState({ previewVisiblePDFFile: true })
    this.setState({ urlPdf: url })
  }
  handleCancelPreviewVisiblePdfFile = () => {
    this.setState({ previewVisiblePDFFile: false })
    this.setState({ urlPdf: '' })
  }

  sendSpecificNotice = async (id, isSendToMySelf) => {
    confirm({
      title: LNotification('DO_YOU_WANT_TO_SEND_THIS_ITEM'),
      content: LNotification('FEESTATEMENT_NOTICE_CONFIRM_ITEM_TO_DO'),
      okText: L('BTN_SEND'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.feeNoticeStore.sendSpecificNotice({ id, isSendToMySelf })
      }
    })
  }
  handleConfirm = async () => {
    this.formConfirm.current?.validateFields().then(async (values: any) => {
      if (values.valueCheck === textConfirmPopup.confirm) {
        await this.props.feeNoticeStore.cofirm(this.state.idNeedConfirm)
        this.setState({ visiblePopupConfirm: false, idNeedConfirm: undefined })
        this.formConfirm.current.resetFields()
      } else {
        return this.formConfirm.current.setFields([
          {
            name: 'valueCheck',
            errors: [LError('TEXT_CONFIRM_NOT_CORRECT')]
          }
        ])
      }
    })
  }

  cofirmFeeNotice = async () => {
    const id = this.props.params?.id
    this.setState({ idNeedConfirm: id })
    this.setState({ visiblePopupConfirm: true })
  }
  renderActions = () => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" shape="round" onClick={this.onCancel}>
            {L('BTN_CANCEL')}
          </Button>
          {this.isGranted(appPermissions.feeNotice.confirm) &&
            this.props.feeNoticeStore.statusConfirm === statusFeeNoticeKey.readyToSend && (
              <Button type="primary" className="mr-1" shape="round" onClick={this.cofirmFeeNotice}>
                {L('BTN_PREIVEW_CONFIRM')}
              </Button>
            )}
        </Col>
      </Row>
    )
  }

  handleExportFeeNotices = () => {
    this.props.feeNoticeStore.exportFeeNotices({
      feeNoticeId: this.props.params?.id,
      ...this.state.filters
    })
  }
  handlefeeNoticeAsZip = () => {
    this.props.feeNoticeStore.feeNoticeAsZip({
      feeNoticeId: this.props.params?.id,
      ...this.state.filters
    })
  }

  renderActionButton = () => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button
            type="primary"
            className="mr-1"
            shape="circle"
            icon={<ExcelIcon />}
            onClick={this.handleExportFeeNotices}
          />

          <Button type="primary" className="mr-1" icon={<Pdf2 />} shape="circle" onClick={this.handlefeeNoticeAsZip} />
        </Col>
      </Row>
    )
  }

  render() {
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col md={{ span: 6 }} sm={{ span: 24 }}>
          <span>{this.L('FILTER_KEYWORD')}</span>
          <Input.Search
            onSearch={(value) => this.handleSearch('keyword', value)}
            placeholder={`${this.L('FEE_NOTICE_PROGRESS_PLACEHODER')}`}
          />
        </Col>
        <Col sm={{ span: 5, offset: 0 }}>
          <label>{this.L('FILTER_FEE_NOTICE_DETAIL_STATUS')}</label>
          <Select
            allowClear
            mode="multiple"
            filterOption={false}
            onChange={(value) => this.handleSearch('StateCodes', value)}
            style={{ width: '100%' }}>
            {(statusFeeNoticeDetail || []).map((item, index) => (
              <Select.Option value={`${item.value}`} key={index}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 5, offset: 0 }}>
          <label>{this.L('FILTER_FEE_NOTICE_SEND_TO_EMAL')}</label>
          <Select
            showSearch
            filterOption={false}
            onChange={(value) => this.handleSearch('sendToEmailState', value)}
            style={{ width: '100%' }}>
            {(isGenStatus || []).map((item, index) => (
              <Select.Option value={`${item.value}`} key={index}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col sm={{ span: 5, offset: 0 }}>
          <label>{this.L('FILTER_FEE_NOTICE_SEND_TO_APP')}</label>
          <Select
            allowClear
            showSearch
            filterOption={false}
            onChange={(value) => this.handleSearch('sendToInAppState', value)}
            style={{ width: '100%' }}>
            {(isGenStatus || []).map((item, index) => (
              <Select.Option value={`${item.value}`} key={index}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    )

    return (
      <WrapPageScroll renderActions={() => this.renderActions()}>
        <DataTable
          actionGroups={this.renderActionButton}
          extraFilterComponent={filterComponent}
          onRefresh={this.getAll}
          title={this.L('FEE_RECEIPT_LIST')}
          pagination={{
            pageSize: this.maxResultCount,
            total: this.props.feeNoticeStore.pagedResult.totalCount,
            onChange: this.handlePagingChange
          }}>
          <Table
            size={'middle'}
            columns={this.columns}
            loading={this.props.feeNoticeStore.isLoading}
            dataSource={this.props.feeNoticeStore.pagedResult.items}
            scroll={{ x: 1024, scrollToFirstRowOnChange: true }}
            className="custom-ant-table custom-ant-row"
            pagination={false}
            rowKey={(record: any) => record.id}
          />
        </DataTable>
        <Modal
          style={{ top: 10 }}
          className="w-50"
          open={this.state.previewVisiblePDFFile}
          title={'READ PDF'}
          footer={null}
          onCancel={this.handleCancelPreviewVisiblePdfFile}>
          <PDFFileViewer src={this.state.urlPdf} />
        </Modal>

        <Modal
          width="25%"
          title={
            <>
              <ExclamationCircleFilled style={{ color: '#F0B86E' }} /> {L('DO_YOU_WANT_TO_CONFIRM_THIS_ITEM')}
            </>
          }
          open={this.state.visiblePopupConfirm}
          onOk={this.handleConfirm}
          onCancel={() => this.setState({ visiblePopupConfirm: false })}
          okText={L('BTN_SAVE')}
          cancelText={L('BTN_CANCEL')}>
          <Row style={{ marginBottom: '35px' }}>
            <Col span={12}>
              <div className="total-outstanding mr-1">
                {L('FEE_NOTICE_MODAL_TOTAL_UNITS')}
                <br />
                {this.props.feeNoticeStore.pagedResult.totalUnit}
              </div>
            </Col>
            <Col span={12}>
              <div className="total-outstanding">
                {L('FEE_NOTICE_MODAL_TOTAL_RECEIVERS')}
                <br />
                {this.props.feeNoticeStore.pagedResult.totalUnitUser}
              </div>
            </Col>
          </Row>
          {L('FEESTATEMENT_NOTICE_CONFIRM_ITEM_TO_DO')}
          <div className="mt-1"> {L('PLEASE_INPUT_CONFIRM')}</div>
          <Form layout="vertical" ref={this.formConfirm} validateMessages={validateMessages} size="small">
            <Row gutter={16}>
              <Col sm={{ span: 24 }}>
                <Form.Item name="valueCheck">
                  <Input size="small" placeholder={L('PLACEHOLDER_INPUT_CONFIRM')} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </WrapPageScroll>
    )
  }

  columns = [
    {
      title: L('FEE_NOTICE_COMPANY'),
      dataIndex: 'company',
      key: 'company',
      width: '10%',
      ellipsis: true,
      render: (company) => <label className="ml-2"> {company?.companyName}</label>
    },
    {
      title: L('FEE_NOTICE_USER'),
      dataIndex: 'user',
      key: 'user',
      width: '13%',
      ellipsis: true,
      render: (user, item) => (
        <Row style={{ justifyContent: 'space-between' }}>
          <Col sm={{ span: 20, offset: 0 }} className="col-info">
            <Popover content={user?.displayName} trigger="click">
              <div className="full-name text-truncate text-link-to-detail">
                <label className="ml-2"> {user?.displayName}</label>
              </div>
            </Popover>
          </Col>
          <Col sm={{ span: 4, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  <Menu.Item key={1} onClick={() => this.sendSpecificNotice(item.id, true)}>
                    {L('BTN_SEND_TO_MY_SELF')}
                  </Menu.Item>
                  <Menu.Item key={2} onClick={() => this.sendSpecificNotice(item.id, false)}>
                    {item.statusCode === statusFeeNoticeDetailKey.successfully
                      ? L('BTN_RE_SEND')
                      : item.statusCode === statusFeeNoticeDetailKey.failed
                      ? L('BTN_RE_SEND')
                      : L('BTN_SEND')}
                  </Menu.Item>
                </Menu>
              }
              placement="bottomLeft">
              <EllipsisOutlined className="button-action-hiden-table-cell" />
            </Dropdown>
          </Col>
        </Row>
      )
    },
    {
      title: L('FEE_NOTICE_EMAIL'),
      dataIndex: 'user',
      key: 'user',
      width: '10%',
      ellipsis: true,
      render: (user) => <> {user?.emailAddress}</>
    },
    {
      title: L('FEE_NOTICE_PHONE_NUMBER'),
      dataIndex: 'user',
      key: 'user',
      width: '9%',
      render: (user) => <> {user?.userName}</>
    },
    {
      title: L('FEE_NOTICE_TOTAL_AMOUNT'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: '8%',
      ellipsis: true,
      align: align.right,
      render: (totalAmount) => <> {formatCurrency(totalAmount)}</>
    },
    {
      title: L('SEND_TO_EMAIL'),
      dataIndex: 'sendToEmailState',
      key: 'sendToEmailState',
      width: '8%',
      align: align.center,

      render: (sendToEmailState) => (
        <>
          {sendToEmailState ? (
            <CheckCircleOutlined className="text-success" />
          ) : (
            <CloseCircleOutlined className="text-danger" />
          )}
        </>
      )
    },
    {
      title: L('SEND_TO_APP'),
      dataIndex: 'sendToInAppState',
      key: 'sendToInAppState',
      width: '8%',
      align: align.center,
      render: (sendToInAppState) => (
        <>
          {sendToInAppState ? (
            <CheckCircleOutlined className="text-success" />
          ) : (
            <CloseCircleOutlined className="text-danger" />
          )}
        </>
      )
    },
    {
      title: L('FEE_NOTICE_STATUS_SEND'),
      dataIndex: 'statusCode',
      key: 'statusCode',
      width: '10%',
      align: align.center,
      render: (statusCode) =>
        statusFeeNoticeDetail.map(
          (item) =>
            item.value === statusCode && (
              <a
                className="fs-7"
                style={{ color: item.color, backgroundColor: item.backgroundColor, borderRadius: 10, padding: 4 }}>
                {item.label}
              </a>
            )
        )
    },
    {
      title: L('EXECUTE_TIME'),
      dataIndex: 'executeTime',
      key: 'executeTime',
      ellipsis: true,
      width: '8%',
      render: (executeTime) => <>{renderDateTime(executeTime)}</>
    },
    {
      title: L('FEE_NOTICE_FILE'),
      dataIndex: 'id',
      key: 'id',
      width: '8%',
      ellipsis: true,
      render: (id, row) =>
        row?.file ? (
          <Row className="ml-2">
            <Col span={12}>
              <FilePdfOutlined onClick={() => this.onViewPdf(row?.file?.fileUrl)} />
            </Col>
            <Col span={12}>
              <a href={row?.file?.fileUrl}>
                <DownloadOutlined />
              </a>
            </Col>
          </Row>
        ) : (
          <></>
        )
    }
  ]
}

export default withRouter(FeeNoticeProcess)
