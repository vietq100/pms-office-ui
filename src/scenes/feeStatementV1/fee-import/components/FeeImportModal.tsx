import { DownloadOutlined, InboxOutlined } from '@ant-design/icons'
import { L, LNotification, isGrantedAny } from '@lib/abpUtility'
import { Button, Divider, Form, Modal, Select } from 'antd'
import Dragger from 'antd/es/upload/Dragger'
import React from 'react'

import { FormInstance } from 'antd/lib/form'
import last from 'lodash/last'
import { notifyError, notifySuccess } from '@lib/helper'

import { IPackageFee } from '@models/fee'
import debounce from 'lodash/debounce'
import packageFeeService from '@services/fee/packageFeeService'
import projectService from '@services/project/projectService'
import { validateMessages } from '@lib/validation'
import FormTextArea from '@components/FormItem/FormTextArea'
import { appPermissions } from '@lib/appconst'
import FeeStore from '@stores/fee/feeStore'

interface Props {
  visible: boolean
  onClose: () => void
  onOk: (file, packageId, description) => Promise<any>
  feeStore?: FeeStore
}

interface State {
  file?: any
  uploading?: boolean
  fileName?: string
  projects: Array<{ value: number; label: string }>
  packages: Array<IPackageFee>
  isLoading: boolean
}

export default class FeeImportModal extends React.PureComponent<Props, State> {
  form = React.createRef<FormInstance>()

  constructor(props) {
    super(props)
    this.state = {
      file: null,
      uploading: false,
      fileName: '',
      packages: [],
      projects: [],
      isLoading: false
    }
  }

  componentDidMount() {
    this.handlePackageSearch('')
    projectService.filterOptions({}).then((projects) => this.setState({ projects }))
  }

  handleFileChange = (fileUpload) => {
    const { fileList, file } = fileUpload
    const latestFile: any = last(fileList) || {}
    this.setState({ file: latestFile.originFileObj, fileName: file.name })
  }

  handleProjectChange = (value) => {
    if (value) {
      packageFeeService.filter({ projectId: value }).then((packages) => {
        this.setState({ packages })
      })
    } else {
      this.fetchProjects()
      this.setState({ packages: [] })
    }
  }
  handleProjectSearch = async (keyword) => {
    const projects = await projectService.filterOptions({ keyword })
    this.setState({ projects })
  }
  handlePackageSearch = debounce(async (value) => {
    const packages = await packageFeeService.filter({
      keyword: value,
      isClosed: false
    })
    this.setState({ packages })
  }, 100)

  handlePackageChange = async (value) => {
    if (!value) {
      const packages = await packageFeeService.filter({
        projectId: this.form.current?.getFieldValue('projectId')
      })
      this.setState({ packages })
    }
  }

  handleUpload = async () => {
    try {
      const { file } = this.state
      await this.form?.current?.validateFields()
      const formData = this.form.current?.getFieldsValue() || {}
      if (!file) return notifyError(L('ERROR'), L('FEE_IMPORT_FILE_REQUIRED'))
      this.setState({ uploading: true })
      this.setState({ isLoading: true })
      await this.props.onOk(file, Number(formData.packageId), formData.description)
      notifySuccess(LNotification('SUCCESS'), LNotification(L('FEE_IMPORTED_FEE_SUCCESS')))
      this.setState({ isLoading: false })
      this.setState({ uploading: false, file: null, fileName: '' })
    } catch (e) {
      this.setState({ uploading: false })
      throw e
    }
  }

  fetchProjects = () => {
    projectService.filterOptions({}).then((projects) => this.setState({ projects }))
  }

  render(): React.ReactNode {
    const { visible, onClose } = this.props
    const { packages } = this.state

    return (
      <Modal
        open={visible}
        destroyOnClose
        title={L('FEE_IMPORT_MODAL_TITLE')}
        cancelText={L('BTN_CANCEL')}
        onCancel={() => {
          this.setState({ file: null, fileName: '' })
          onClose()
        }}
        onOk={this.handleUpload}
        footer={[
          <>
            <Button
              onClick={() => {
                this.setState({ file: null, fileName: '' })
                onClose()
              }}>
              {L('BTN_CANCEL')}
            </Button>
            <Button type="primary" loading={this.state.isLoading} onClick={this.handleUpload}>
              {L('BTN_SAVE')}
            </Button>
          </>
        ]}
        confirmLoading={this.state.uploading}
        okButtonProps={{
          disabled: !isGrantedAny(appPermissions.feeGenerate.create),
          className: !isGrantedAny(appPermissions.feeGenerate.create) ? 'd-none' : ''
        }}>
        <Form layout="vertical" ref={this.form} validateMessages={validateMessages} size="middle">
          <Form.Item name="packageId" label={L('FEE_FILTER_PACKAGE')} rules={[{ required: true }]}>
            <Select
              showSearch
              showArrow
              allowClear
              filterOption={false}
              style={{ width: '100%' }}
              onChange={this.handlePackageChange}
              onSearch={this.handlePackageSearch}>
              {packages.map((pkg) => (
                <Select.Option value={`${pkg.id}`} key={pkg.id}>
                  {pkg.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <FormTextArea
            rows={3}
            label={L('FEE_IMPORT_MODAL_DESCRIPTION')}
            name="description"
            maxLength={2001}
            rule={[{ required: true, max: 2000 }]}
          />
        </Form>
        <div className="mt-3">
          <Dragger
            name="file"
            accept=".xls, .xlsx"
            beforeUpload={() => false}
            onChange={this.handleFileChange}
            showUploadList={false}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">{L('FEE_IMPORT_DESCRIPTION')}</p>
          </Dragger>
        </div>
        {this.state.fileName && (
          <span style={{ lineHeight: 2 }}>
            {L('FEE_UPLOADED_FILE')} <b>{this.state.fileName}</b>
          </span>
        )}
        <Divider />
        <Button type="primary" style={{ width: '100%' }} shape="round" onClick={this.props.feeStore?.downloadTemplate}>
          {L('DOWNLOAD_TEMPLATE')}
          <DownloadOutlined style={{ fontSize: '130%' }} />
        </Button>
      </Modal>
    )
  }
}
