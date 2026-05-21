import FileImages from '@components/FileUpload/FileImages'
import { L } from '@lib/abpUtility'
import { QUESTION_VIEW_MODE } from '@lib/appconst'
import { IEFormResponseAnswerModel, IFormQuestionModel } from '@models/eForm/EFormModel'
import { Col, Empty } from 'antd'
import { useEffect, useState } from 'react'

interface EFormQuestionProps {
  formQuestion?: IFormQuestionModel
  questionAnswer?: IEFormResponseAnswerModel
  viewMode?: number
}

function EFormQuestionImage({ formQuestion, questionAnswer, viewMode }: EFormQuestionProps) {
  const [files, setFiles] = useState([] as any)
  useEffect(() => {
    setFiles(
      (questionAnswer?.images || []).map((item) => {
        return { ...item.files, url: item.files?.fileUrl }
      })
    )
  }, [questionAnswer])

  const emptyImages = (
    <Empty
      image="/assets/images/bg-empty.svg"
      imageStyle={{
        height: 60
      }}
      description={<span>{L('EFORM_SECTION_EMPTY_IMAGES')}</span>}></Empty>
  )

  return (
    <Col sm={{ span: 24, offset: 0 }} className="mt-3">
      <div className="mb-1">
        <strong style={{ fontSize: 12 }}>
          {formQuestion?.isMandatory && <span style={{ color: 'red', fontSize: 10 }}>* </span>}
          {formQuestion?.label}
        </strong>
      </div>
      {viewMode === QUESTION_VIEW_MODE.viewResponse &&
        (files.length > 0 ? <FileImages files={files} wrapClass="" /> : emptyImages)}

      {viewMode === QUESTION_VIEW_MODE.answerQuestion &&
        (files.length > 0 ? <FileImages files={files} wrapClass="" /> : emptyImages)}
    </Col>
  )
}

export default EFormQuestionImage
