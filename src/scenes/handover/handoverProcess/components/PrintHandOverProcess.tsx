import { L } from '@lib/abpUtility'
import { Button, Col, Modal, Row, Spin } from 'antd'
import React from 'react'
import { AppComponentListBase } from '@components/AppComponentBase'
import withRouter from '@components/Layout/Router/withRouter'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import HandoverStore from '@stores/handover/handoverStore'
import SyncfusionDocView from '@components/Inputs/SyncfusionDocView'

interface Props {
  open: boolean
  onClose: () => void
  id: any
  handoverStore: HandoverStore
}

interface State {
  maxResultCount: number
  skipCount: number
  filters: any
  dataForm: any
  isGetTemplate: boolean
}
@inject(Stores.HandoverStore)
@observer
class ExportFDReview extends AppComponentListBase<Props, State> {
  formRef: any = React.createRef()

  constructor(props) {
    super(props)
    this.state = {
      maxResultCount: 10,
      skipCount: 0,
      filters: { KeyWord: '', isActive: true },
      dataForm: '',
      isGetTemplate: false
    }
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.open !== this.props.open) {
      if (this.props.open) {
        await this.getTemplate()
      }
    }
  }
  getTemplate = async () => {
    await this.props.handoverStore.getHandOverReservationBindingData({ id: this.props.id })
    await this.setState({ dataForm: this.props.handoverStore.handOverReservationBindingData, isGetTemplate: true })
  }

  saveAsDocx = async () => {
    const documentEditorInstance = this.formRef?.current

    // Save the content as DOCX
    await documentEditorInstance.documentEditor.save(this.props.id, 'Docx')

    // Save the content to a Blob without actually saving it to a file
  }
  renderEditDoc = () => {
    const defaultDocx = this.state.dataForm
    return (
      <>
        {this.state.isGetTemplate && (
          <DelayedRender delay={90}>
            <SyncfusionDocView initValue={defaultDocx} rteRef={this.formRef} visible={this.props.open} />
          </DelayedRender>
        )}
      </>
    )
  }
  render(): React.ReactNode {
    const { open, onClose } = this.props

    return (
      <>
        <Modal
          open={open}
          destroyOnClose
          maskClosable={false}
          width={'75%'}
          style={{ top: 20 }}
          closable={false}
          okButtonProps={{ style: { display: 'none' } }}
          cancelButtonProps={{ style: { display: 'none' } }}
          title={
            <Row gutter={[12, 12]}>
              <Col sm={{ span: 12 }}>{/* <strong>{this.props.title}</strong> */}</Col>
              <Col sm={{ span: 12 }}>
                <div className="flex flex-row-reverse">
                  <Button className="button-primary" type="primary" onClick={this.saveAsDocx}>
                    {L('BTN_PRINT')}
                  </Button>
                  &ensp;
                  <Button className="custom-buttom-cancle" onClick={onClose}>
                    {L('BTN_CANCEL')}
                  </Button>
                </div>
              </Col>
            </Row>
          }
          onCancel={() => {
            onClose()
          }}>
          <Row gutter={[4, 0]}>
            <Col sm={{ span: 24 }}>{this.renderEditDoc()}</Col>
          </Row>
        </Modal>
        <style>{`
        .ant-modal-body{
          padding:0px
        }
        
        `}</style>
      </>
    )
  }
}
export default withRouter(ExportFDReview)
class DelayedRender extends AppComponentListBase {
  state = { shouldRender: false }
  timer: any
  componentDidMount() {
    this.timer = setTimeout(() => {
      this.setState({ shouldRender: true })
    }, this.props.delay)
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
  }

  render() {
    return this.state.shouldRender ? (
      this.props.children
    ) : (
      <div>
        <Spin size="large" className="h-100 w-100 mt-3" />
      </div>
    )
  }
}
