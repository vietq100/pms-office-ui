import { IEFormResponseAnswerModel, IFormQuestionModel } from '@models/eForm/EFormModel'
import { Col } from 'antd'

interface EFormQuestionProps {
  formQuestion?: IFormQuestionModel
  questionAnswer?: IEFormResponseAnswerModel
  viewMode?: number
}

function QuestionLabel({ formQuestion }: EFormQuestionProps) {
  return (
    <Col sm={{ span: 24, offset: 0 }}>
      <p
        dangerouslySetInnerHTML={{
          __html: formQuestion?.label || ''
        }}
      />
    </Col>
  )
}

export default QuestionLabel
