import { InboxOutlined } from '@ant-design/icons'
import { L, LNotification } from '@lib/abpUtility'
import { Form, Modal, Select } from 'antd'
import Dragger from 'antd/es/upload/Dragger'
import React from 'react'
import PackageFeeStore from '@stores/fee/packageFeeStore'
import { FormInstance } from 'antd/lib/form'
import last from 'lodash/last'
import { notifyError, notifySuccess } from '@lib/helper'
import ProjectStore from '@stores/project/projectStore'
import { IPackageFee } from '@models/fee'
import debounce from 'lodash/debounce'
import packageFeeService from '@services/fee/packageFeeService'
import projectService from '@services/project/projectService'
import { validateMessages } from '@lib/validation'

interface Props {
  visible: boolean
  onClose: () => void
  onOk: (file, packageId, description) => Promise<any>
  packageFeeStore?: PackageFeeStore
  projectStore?: ProjectStore
}

interface State {
  file?: any
  uploading?: boolean
  fileName?: string
  projects: Array<{ value: number; label: string }>
  packages: Array<IPackageFee>
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
      projects: []
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
      keyword: value
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
      this.setState({ uploading: true })
      const { file } = this.state
      await this.form?.current?.validateFields()
      const formData = this.form.current?.getFieldsValue() || {}
      if (!file) return notifyError(L('ERROR'), L('FEE_IMPORT_FILE_REQUIRED'))
      await this.props.onOk(file, Number(formData.packageId), formData.description)
      notifySuccess(LNotification('SUCCESS'), LNotification(L('FEE_IMPORTED_FEE_SUCCESS')))
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
        confirmLoading={this.state.uploading}>
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
      </Modal>
    )
  }
}
