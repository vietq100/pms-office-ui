import FormRadioButton from '@components/FormItem/FormRadioButton'
import FormTextArea from '@components/FormItem/FormTextArea'
import { CammeraIcon, EditIcon, EditOffIcon, CammeraOffIcon } from '@components/Icon'
import AppConsts from '@lib/appconst'
import { Button, Col, Row } from 'antd'
import { useEffect, useState } from 'react'
import FormImageHandOver from './FormPhoto'
import FileStore from '@stores/common/fileStore'
import { L, LError } from '@lib/abpUtility'

const { inspectionRating, inspectionChecklistHandover } = AppConsts

interface IProps {
  formRef: any
  indexForm: number
  name: any
  label?: any
  rule?
  initValue?: any
  fileStore: FileStore
  isRequired: boolean
}

function FormHandOver({ formRef, indexForm, name, label, rule, initValue, fileStore, isRequired }: IProps) {
  const [isShowUpload, setIsShowUpload] = useState<boolean>(false)
  const [isShowText, setIsShowText] = useState<boolean>(false)
  useEffect(() => {
    if (initValue?.answerRating === inspectionChecklistHandover.POOR) {
      setIsShowText(true)
    } else {
      initValue?.answerContent ? setIsShowText(true) : setIsShowText(false)
    }

    initValue?.images?.length > 0 ? setIsShowUpload(true) : setIsShowUpload(false)
  }, [initValue])

  const onClickUpload = () => {
    setIsShowUpload(!isShowUpload)
  }

  const onClickText = () => {
    if (isShowText) {
      if (
        formRef.current.getFieldValue([`answers_${indexForm}`, name, 'answerRating']) ===
        inspectionChecklistHandover.POOR
      ) {
        return
      }
      formRef.current.setFieldValue([`answers_${indexForm}`, name, 'answerContent'], ' ')
    }
    setIsShowText(!isShowText)
  }

  const onChangeRadio = (value) => {
    if (value === inspectionChecklistHandover.POOR) {
      setIsShowText(true)
    } else {
      setIsShowText(false)
    }
  }

  return (
    <>
      <Col span={24} className="mt-2">
        <strong style={{ fontSize: 12 }}>
          {isRequired && <span style={{ color: 'red', fontSize: 10 }}>* </span>}
          {label}
        </strong>
      </Col>
      <Col span={24}>
        <Row className="mt-2">
          <Col span={15}>
            <FormRadioButton
              name={[name, 'answerRating']}
              options={inspectionRating}
              rule={rule}
              onChange={(value) => onChangeRadio(value?.target.value)}
            />
          </Col>
          <Col span={9} className="d-flex justify-content-end align-items-center">
            <Button size="small" shape="circle" type="text" className="mr-1" onClick={onClickUpload}>
              {isShowUpload ? <CammeraIcon /> : <CammeraOffIcon />}
            </Button>
            <Button size="small" shape="circle" type="text" onClick={onClickText}>
              {isShowText ? <EditIcon /> : <EditOffIcon />}
            </Button>
          </Col>
          {isShowText && (
            <Col span={24}>
              <FormTextArea
                minLength={1}
                rows={3}
                name={[name, 'answerContent']}
                rule={[
                  { required: isShowText, message: LError('REQUIRED_FIELD_{0}', L('DESCRIPTION_HANDOVER_CHECKLIST')) }
                ]}
              />
            </Col>
          )}
          {isShowUpload && (
            <Col span={24} className="mt-2">
              <FormImageHandOver
                showLabel={false}
                indexForm={indexForm}
                formRef={formRef}
                label={label}
                isRequired={false}
                listImage={initValue?.images}
                initValue={initValue?.imageNames}
                name={name}
                rule={rule}
                fileStore={fileStore}
              />
            </Col>
          )}
        </Row>
      </Col>
    </>
  )
}

export default FormHandOver
