import { Col, DatePicker, Form, Modal, Row, Switch, Select } from 'antd'
import AppComponentBase from '../../../../components/AppComponentBase'

import { L, LError } from '../../../../lib/abpUtility'
import { ruleDocument } from './validation'
import AppConsts, { dateFormat } from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import LibraryStore from '../../../../stores/communication/libraryStore'
import MultiLanguageInput from '../../../../components/Inputs/MultiLanguageInput'
import MultiLanguageTextArea from '../../../../components/Inputs/MultiLanguageInput/TextArea'
import ProjectStore from '../../../../stores/project/projectStore'
import FileStore from '../../../../stores/common/fileStore'
import { validateMessages } from '../../../../lib/validation'
import FileUploadWrapV2 from '@components/FileUploadV2'

const { formVerticalLayout } = AppConsts

export interface IResidentFormProps {
  projectStore: ProjectStore
  libraryStore: LibraryStore
  fileStore: FileStore
  visible: boolean
  onCancel: () => void
  onCreate: (files) => void
  formRef: any
}
@inject(Stores.LibraryStore, Stores.FileStore)
@observer
class DocumentFileFormModal extends AppComponentBase<IResidentFormProps> {
  state = {
    confirmDirty: false,
    files: [] as any,
    fileLength: 0
  }

  componentDidMount(): void {
    this.findFolders('')
  }

  findFolders = async (keyword?) => {
    const form = this.props.formRef.current
    form.setFieldsValue({ libraryId: null })
    await this.props.libraryStore.filterOptions({
      keyword,
      isActive: true,
      isPublic: true
    })
  }

  getFile = async (file) => {
    this.setState({ files: file })
  }
  getFileLength = async (fileLength) => {
    this.setState({ fileLength: fileLength })
  }
  handleCreate = () => {
    const { onCreate } = this.props

    if (this.state.fileLength < 1) {
      return this.props.formRef.current.setFields([
        {
          name: 'noteError',
          errors: [LError('FILE_IS_NOT_EMPTY')]
        }
      ])
    } else {
      onCreate(this.state.files)
    }
  }

  onRemoveFile = (file) => {
    const index = this.state.files.indexOf(file)
    const newFileList = [...this.state.files]
    newFileList.splice(index, 1)
    this.setState({ files: newFileList })
  }

  beforeUploadFile = (file) => {
    this.setState({ files: [...this.state.files, file] })
    return false
  }

  render() {
    const {
      visible,
      onCancel,
      formRef,
      libraryStore: { folderOptions, editDocument }
    } = this.props

    return (
      <Modal
        width={800}
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={onCancel}
        onOk={this.handleCreate}
        title={editDocument?.id ? L('EDIT_DOCUMENT_FILE_PUBLIC') : L('CREATE_DOCUMENT_FILE_PUBLIC')}
        confirmLoading={this.props.libraryStore.isLoadingDocument}>
        <Form ref={formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('LIBRARY_DOCUMENT_NAME')}
                {...formVerticalLayout}
                name="names"
                rules={ruleDocument.fileName}>
                <MultiLanguageInput />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('LIBRARY_FOLDER')}
                {...formVerticalLayout}
                name="libraryId"
                rules={ruleDocument.libraryId}>
                <Select showSearch allowClear className="full-width" filterOption={false} onSearch={this.findFolders}>
                  {this.renderOptions(folderOptions)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('LIBRARY_TAKEN_DOWN_DATE')} {...formVerticalLayout} name="takenDownDate">
                <DatePicker className="full-width" format={dateFormat} placeholder={L('SELECT_DATE')} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('LIBRARY_EXPIRED_DATE')} {...formVerticalLayout} name="expiredDate">
                <DatePicker className="full-width" format={dateFormat} placeholder={L('SELECT_DATE')} />
              </Form.Item>
            </Col>
            {editDocument?.id > 0 && (
              <Col sm={{ span: 12, offset: 0 }}>
                <Form.Item
                  label={L('UNIT_ACTIVE_STATUS')}
                  {...formVerticalLayout}
                  name="isActive"
                  valuePropName="checked">
                  <Switch defaultChecked />
                </Form.Item>
              </Col>
            )}
            {/* <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('LIBRARY_DOCUMENT_LOCATION')} {...formVerticalLayout} name="position">
                <Input />
              </Form.Item>
            </Col> */}
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('LIBRARY_DOCUMENT_DESCRIPTION')}
                {...formVerticalLayout}
                name="descriptions"
                rules={ruleDocument.description}>
                <MultiLanguageTextArea />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={''} {...formVerticalLayout} name="noteError"></Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <FileUploadWrapV2
                parentId={this.props.libraryStore.editDocument?.uniqueId}
                fileStore={this.props.fileStore}
                onRemoveFile={this.onRemoveFile}
                beforeUploadFile={this.beforeUploadFile}
                maxFile={1}
                maxSize={25}
                getFile={this.getFile}
                getFileLength={this.getFileLength}
              />
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default DocumentFileFormModal
