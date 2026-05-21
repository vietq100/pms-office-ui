import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons'
import FormInput from '@components/FormItem/FormInput'
import { L } from '@lib/abpUtility'
import { validateMessages } from '@lib/validation'
import { IFormSectionModel } from '@models/eForm/EFormModel'
import EFormStore from '@stores/eForm/eFormStore'
import { Button, Col, Form, Row, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import debounce from 'lodash/debounce'
import { useState } from 'react'
import { sectionRules } from './validation'

interface EFormSectionEditProps {
  eFormStore: EFormStore
  formSectionIndex?: number
  formSection: IFormSectionModel
}

function EFormSectionEdit({ eFormStore, formSectionIndex = 0, formSection }: EFormSectionEditProps) {
  const [form] = useForm()
  const [isEditing, setIsEditing] = useState(false)

  const onOffEditMode = () => {
    const _isEditing = !isEditing
    setIsEditing(_isEditing)
    if (_isEditing) {
      form.setFieldsValue(formSection)
    }
  }

  const onUpdateSection = debounce(async () => {
    // TODO: fix hardcode form section index
    form.validateFields().then(async (values: any) => {
      await eFormStore.updateSection(formSectionIndex, {
        id: formSection.id,
        ...values
      })
      onOffEditMode()
    })
  }, 200)

  const handleCancel = debounce(async () => {
    onOffEditMode()
  }, 200)

  return (
    <Form form={form} autoComplete="off" initialValues={formSection} validateMessages={validateMessages}>
      {!isEditing && (
        <h3 className="mb-1">
          {formSection.name + ' '}
          <Button type="link" onClick={onOffEditMode}>
            <EditOutlined />
          </Button>
        </h3>
      )}
      {isEditing && (
        <Row gutter={[8, 8]} className="align-items-center">
          <Col span={8} className="mb-1">
            <FormInput formItemClass="mb-0" name="name" rule={sectionRules.name} />
          </Col>
          <Col>
            <Tooltip placement="bottom" title={L('BTN_UPDATE')}>
              <Button type="link" onClick={onUpdateSection}>
                <CheckOutlined className="form-button" />
              </Button>
            </Tooltip>
            <Tooltip placement="bottom" title={L('BTN_CANCEL')}>
              <Button type="link" onClick={handleCancel}>
                <CloseOutlined className="form-button" />
              </Button>
            </Tooltip>
          </Col>
        </Row>
      )}
    </Form>
  )
}

export default EFormSectionEdit
