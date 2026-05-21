import FormRadioButton from '@components/FormItem/FormRadioButton'
import FormTextArea from '@components/FormItem/FormTextArea'
import { CammeraIcon, CammeraOffIcon, EditIcon, EditOffIcon } from '@components/Icon'
import { L } from '@lib/abpUtility'
import AppConsts, { QUESTION_VIEW_MODE } from '@lib/appconst'
import { IEFormResponseAnswerModel, IFormQuestionModel } from '@models/eForm/EFormModel'
import { Button, Col, InputNumber, Row } from 'antd'
import { useEffect, useState } from 'react'
import FileImages from '@components/FileUpload/FileImages'

const { inspectionRating } = AppConsts

interface EFormQuestionProps {
  formQuestion?: IFormQuestionModel
  questionAnswer?: IEFormResponseAnswerModel
  viewMode?: number
}

function EFormQuestionInspection({
  formQuestion,
  questionAnswer,
  viewMode = QUESTION_VIEW_MODE.editQuestion
}: EFormQuestionProps) {
  const [files, setFiles] = useState([] as any)
  const [isShowImage, setIsShowImage] = useState(false)
  const [isShowText, setIsShowText] = useState(false)
  useEffect(() => {
    setFiles(
      (questionAnswer?.images || []).map((item) => {
        return { ...item.files, url: item.files?.fileUrl }
      })
    )
    questionAnswer?.images && questionAnswer?.images.length > 0 ? setIsShowImage(true) : setIsShowImage(false)

    if (questionAnswer?.answerContent) {
      questionAnswer?.answerContent?.length > 0 ? setIsShowText(true) : setIsShowText(false)
    }
  }, [questionAnswer])

  return (
    <Col sm={{ span: 24, offset: 0 }}>
      {viewMode === QUESTION_VIEW_MODE.editQuestion && (
        <InputNumber disabled size="large" className="w-100" placeholder={L('PLEASE_INPUT_A_NUMBER')} />
      )}
      {viewMode === QUESTION_VIEW_MODE.viewResponse && (
        <div>
          <Row className="mt-2">
            <Col span={15}>
              <FormRadioButton
                disabled
                label={<strong>{formQuestion?.label}</strong>}
                name={['responseAnswer', 'answerRating']}
                options={inspectionRating}
                rule={[{ required: formQuestion?.isMandatory }]}
              />
            </Col>
            <Col span={9} className="d-flex justify-content-end align-items-center">
              <Button size="small" shape="circle" type="text" className="mr-1" disabled>
                {isShowImage ? <CammeraIcon /> : <CammeraOffIcon />}
              </Button>
              <Button size="small" shape="circle" type="text" disabled>
                {isShowText ? <EditIcon /> : <EditOffIcon />}
              </Button>
            </Col>
            {isShowText && (
              <Col span={24}>
                <FormTextArea
                  rows={5}
                  disabled={true}
                  name={['responseAnswer', 'answerContent']}
                  rule={[{ required: formQuestion?.isMandatory }]}
                />
              </Col>
            )}
            <Col span={24}>{isShowImage && (files.length > 0 ? <FileImages files={files} wrapClass="" /> : <></>)}</Col>
          </Row>
        </div>
      )}
      {viewMode === QUESTION_VIEW_MODE.answerQuestion && (
        <div>
          <Row className="mt-2">
            <Col span={15}>
              <FormRadioButton
                label={<strong>{formQuestion?.label}</strong>}
                name={['responseAnswer', 'answerRating']}
                options={inspectionRating}
                rule={[{ required: formQuestion?.isMandatory }]}
              />
            </Col>
            <Col span={9} className="d-flex justify-content-end align-items-center">
              <Button size="small" shape="circle" type="text" className="mr-1">
                <CammeraIcon />
              </Button>
              <Button size="small" shape="circle" type="text">
                <EditIcon />
              </Button>
            </Col>
            <Col span={24}>
              <FormTextArea
                placeholder={formQuestion?.description}
                rows={5}
                name={['responseAnswer', 'answerContent']}
                rule={[{ required: formQuestion?.isMandatory }]}
              />
            </Col>
            <Col span={24}>
              {viewMode === QUESTION_VIEW_MODE.answerQuestion &&
                (files.length > 0 ? <FileImages files={files} wrapClass="" /> : <></>)}
            </Col>
          </Row>
        </div>
      )}
    </Col>
  )
}

export default EFormQuestionInspection
