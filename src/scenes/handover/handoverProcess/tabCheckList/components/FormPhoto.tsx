import ListImageUploadHandOverEfrom from '@components/FileUploadV2/ImageUploadHandOverEform'
import TagsInput from '@components/Inputs/TagsInput'
import AppConsts from '@lib/appconst'
import FileStore from '@stores/common/fileStore'
import { Col, Form } from 'antd'
import { useEffect, useState } from 'react'

const { dataType } = AppConsts

interface IProps {
  indexForm: number
  formRef: any
  name: any
  label?: any
  rule?
  listImage?: any[]
  initValue?: any[]
  fileStore: FileStore
  showLabel: boolean
  isRequired: boolean
}

const FormImageHandOver = ({
  indexForm,
  formRef,
  name,
  label,
  rule,
  listImage,
  initValue,
  fileStore,
  showLabel,
  isRequired
}: IProps) => {
  const [files, setFiles] = useState([] as any)
  const [values, setValues] = useState([] as any)
  useEffect(() => {
    setValues(initValue ? [...initValue] : [])

    formRef.current.setFieldValue([`answers_${indexForm}`, name, 'imageNames'], initValue ? [...initValue] : [])

    setFiles(
      (listImage || []).map((item) => {
        return { ...item.files, url: item.files?.fileUrl }
      })
    )
  }, [listImage])

  const onRemoveImage = (guiId: string) => {
    const array = values.filter((item) => item !== guiId)

    formRef.current.setFieldValue([`answers_${indexForm}`, name, 'imageNames'], [...array])
  }

  const onUpload = (guiId: string) => {
    const array = values
    array.push(guiId)
    setValues(array)
    formRef.current.setFieldValue([`answers_${indexForm}`, name, 'imageNames'], [...array])
  }

  return (
    <>
      {showLabel && (
        <Col sm={{ span: 24, offset: 0 }} className="mt-3">
          <strong style={{ fontSize: 12 }}>
            {isRequired && <span style={{ color: 'red', fontSize: 10 }}>* </span>}
            {label}
          </strong>
        </Col>
      )}
      <Col span={24}>
        <ListImageUploadHandOverEfrom
          onUpload={onUpload}
          onRemoveFile={onRemoveImage}
          fileStore={fileStore}
          initialFileList={files}
        />
      </Col>
      <Col span={24}>
        <Form.Item style={{ height: '0px' }} name={[name, 'imageNames']} rules={rule}>
          <TagsInput type={dataType.string} hidden />
        </Form.Item>
      </Col>

      {/* <style scoped>
        {`
     .ant-form-item .ant-form-item-control-input  {
       min-height: 0px;
       height:0px
      }`}
      </style> */}
    </>
  )
}

export default FormImageHandOver
