import React from 'react'
import { Form } from 'antd'
import SynfDocumentEditor from '@components/SyncfusionDocumentEditor/index'
import { AppComponentListBase } from '@components/AppComponentBase'
import withRouter from '@components/Layout/Router/withRouter'
export interface IProps {
  formRef: any
  name: any
  label: any
  initValue: any
}
export interface IStates {
  editorValue: any
}
class SynfDocumentEditorFormItem extends AppComponentListBase<IProps, IStates> {
  rteRef: any
  constructor(props) {
    super(props)
    this.rteRef = React.createRef()
    this.state = {
      editorValue: undefined
    }
  }

  handleEditorChange = async () => {
    const documentEditorInstance = this.rteRef?.current

    const sfdtBlob = await documentEditorInstance.documentEditor.saveAsBlob('Sfdt')
    const reader = new FileReader()
    reader.onload = () => {
      const contentAsString = reader.result
      this.setState({ editorValue: contentAsString })
      this.props.formRef.current.setFieldValue(this.props.name, this.state.editorValue)
    }
    await reader.readAsText(sfdtBlob)
  }

  render() {
    const { name, label } = this.props

    return (
      <>
        <Form.Item label={label} name={name}>
          <SynfDocumentEditor rteRef={this.rteRef} onChange={this.handleEditorChange} />
        </Form.Item>
      </>
    )
  }
}

export default withRouter(SynfDocumentEditorFormItem)
