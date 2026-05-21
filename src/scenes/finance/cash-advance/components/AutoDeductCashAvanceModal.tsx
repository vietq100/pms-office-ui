import { L, LNotification, isGrantedAny } from '@lib/abpUtility'
import { Button, Col, Form, Modal, Row } from 'antd'
import React from 'react'
import debounce from 'lodash/debounce'
import packageFeeService from '@services/fee/packageFeeService'
import { validateMessages } from '@lib/validation'
import FormSelect from '@components/FormItem/FormSelect'
import FormCheckbox from '@components/FormItem/FormCheckbox'
import AppConst, { appPermissions } from '@lib/appconst'
import AppComponentBase from '@components/AppComponentBase'
import CashAdvanceStore from '@stores/finance/cashAdvanceStore'
import DeductCashAdvancePreview from './DeductCashAdvancePreview'
const { pageSize } = AppConst

const confirm = Modal.confirm
interface Props {
  visible: boolean
  onCancel: () => void
  onCancelAndRefresh: () => void
  cashAdvanceStore: CashAdvanceStore
  isMultiple: boolean
  unitIds: any[]
}

interface State {
  listPackage: any[]
  isLoading: boolean
  showPreview: boolean
  dataSend: any
  maxResultCount: number
  skipCount: number
}

export default class AutoDeductCashAvanceModal extends AppComponentBase<Props, State> {
  form: any = React.createRef()

  state = {
    listPackage: [],
    isLoading: false,
    showPreview: false,
    dataSend: undefined,
    maxResultCount: pageSize.pageSize_10,
    skipCount: 0
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible) {
      if (this.props.visible) {
        this.handlePackageSearch('')
      }
    }
  }

  onPreviewDeduct = () => {
    this.form.current.validateFields().then(async (values: any) => {
      if (this.props.isMultiple) {
        const unitIds = this.props.unitIds
        this.setState({ dataSend: { ...values, unitIds } })
      } else {
        this.setState({ dataSend: values })
      }

      this.props.onCancel()
      this.setState({ showPreview: true })
    })
  }

  // getAutoDeductCashAdvance = async () => {
  //   this.form.current.validateFields().then(async (values: any) => {
  //     await this.props.cashAdvanceStore.getAutoDeductCashAdvance({
  //       packageId: values.packageId,
  //       isGroupReceipt: values.isGroupReceipt,
  //       isClearAllOutstanding: values.isClearAllOutstanding,
  //       maxResultCount: this.state.maxResultCount,
  //       skipCount: this.state.skipCount
  //     })

  //     this.setState({
  //       dataSend: this.props.cashAdvanceStore.pageDeduct.items
  //     })
  //   })
  // }
  onSave = () => {
    this.form.current.validateFields().then(async (values: any) => {
      if (this.props.isMultiple === true) {
        //deduct multiple

        await this.handleSubmit({
          unitIds: this.props.unitIds,
          ...values
        })
      } else {
        // deduct all
        await this.handleSubmit(values)
      }
    })
  }

  handleSubmit = async (values) => {
    const self = this
    confirm({
      title: LNotification('DO_YOU_WANT_TO_AUTO_DEDUC_TITLE'),
      content: LNotification('DO_YOU_WANT_TO_AUTO_DEDUC_CONTENT'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      async onOk() {
        self.setState({ isLoading: true })
        await self.props.cashAdvanceStore.autoDeductCashAdvance({ ...values })
        self.setState({ dataSend: undefined })
        self.setState({ isLoading: false })
        await self.form.current.resetFields()
        self.props.onCancelAndRefresh()
      }
    })
  }

  handlePackageSearch = async (value) => {
    const packages = await packageFeeService.filter({
      keyword: value
    })
    this.setState({ listPackage: packages })
  }

  render(): React.ReactNode {
    const { visible, onCancel } = this.props

    return (
      <>
        <Modal
          open={visible}
          destroyOnClose
          maskClosable={false}
          title={
            this.props.unitIds?.length > 0
              ? L('CASH_AVANCE_MODAL_DEDUCT_TITLE')
              : L('CASH_AVANCE_MODAL_ALL_DEDUCT_TITLE')
          }
          cancelText={L('BTN_CANCEL')}
          onCancel={() => {
            onCancel(), this.setState({ dataSend: undefined })
          }}
          footer={[
            <>
              <Button
                onClick={() => {
                  onCancel()
                }}>
                {L('BTN_CANCEL')}
              </Button>
              <Button
                onClick={() => {
                  this.onPreviewDeduct()
                }}>
                {L('BTN_PRIVIEW')}
              </Button>
              <Button type="primary" loading={this.state.isLoading} onClick={this.onSave}>
                {L('BTN_SAVE')}
              </Button>
            </>
          ]}
          okButtonProps={{
            disabled: !isGrantedAny(appPermissions.feeNotice.create),
            className: !isGrantedAny(appPermissions.feeNotice.create) ? 'd-none' : ''
          }}>
          <Form layout="vertical" ref={this.form} validateMessages={validateMessages} size="middle">
            <Row gutter={16}>
              <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <FormSelect
                  label={L('CASH_AVANCE_PACKAGE')}
                  name="packageId"
                  options={this.state.listPackage}
                  selectProps={{
                    onSearch: debounce(this.handlePackageSearch, 300)
                  }}
                />
              </Col>

              <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <FormCheckbox initialValue={false} label={L('IS_GROUP_RECEIPT')} name="isGroupReceipt" />
              </Col>
              <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <FormCheckbox initialValue={false} label={L('IS_CLEAR_ALL_OUTSTANDING')} name="isClearAllOutstanding" />
              </Col>
            </Row>
          </Form>
        </Modal>

        <DeductCashAdvancePreview
          visible={this.state.showPreview}
          onCancel={() => {
            this.setState({ showPreview: false })
          }}
          dataSend={this.state.dataSend}
          cashAdvanceStore={this.props.cashAdvanceStore}
        />
      </>
    )
  }
}
