import { QUESTION_TYPES, QUESTION_VIEW_MODE } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import { IEFormResponseAnswerModel, IFormQuestionModel } from '@models/eForm/EFormModel'
import { OptionModel } from '@models/global'
import EFormQuestionImage from '@scenes/eform/components/question/QuestionImage'
import QuestionLabel from '@scenes/eform/components/question/QuestionLabel'
import EFormStore from '@stores/eForm/eFormStore'
import { Card, Row, Form } from 'antd'
import { useForm } from 'antd/es/form/Form'
import EFormQuestionDateTime from '../../components/question/QuestionDateTime'
import EFormQuestionDropdown from '../../components/question/QuestionDropdown'
import EFormQuestionMultiChoice from '../../components/question/QuestionMultiChoice'
import EFormQuestionNumber from '../../components/question/QuestionNumber'
import EFormQuestionTextArea from '../../components/question/QuestionTextArea'
import EFormQuestionTextbox from '../../components/question/QuestionTextbox'
import EFormQuestionInspection from '../../components/question/QuestionInspection'

interface EFormQuestionProps {
  eFormStore: EFormStore
  formSectionIndex?: number
  formQuestionIndex?: number
  formQuestion: IFormQuestionModel
  formQuestionTypes?: OptionModel[]
  questionAnswer: IEFormResponseAnswerModel
}

function EResponseAnswer({ formQuestion, questionAnswer }: EFormQuestionProps) {
  const [form] = useForm()
  return (
    <Form
      layout={'vertical'}
      form={form}
      autoComplete="off"
      initialValues={formQuestion}
      validateMessages={validateMessages}>
      <Card size="small" className="mb-2 pt-3">
        <Row gutter={[8, 8]}>
          {formQuestion.questionTypeId === QUESTION_TYPES[1].id && (
            <EFormQuestionMultiChoice
              formQuestion={formQuestion}
              questionAnswer={questionAnswer}
              viewMode={QUESTION_VIEW_MODE.answerQuestion}
            />
          )}
          {formQuestion.questionTypeId === QUESTION_TYPES[2].id && (
            <EFormQuestionDropdown
              formQuestion={formQuestion}
              questionAnswer={questionAnswer}
              viewMode={QUESTION_VIEW_MODE.answerQuestion}
            />
          )}
          {formQuestion.questionTypeId === QUESTION_TYPES[3].id && (
            <EFormQuestionTextbox
              formQuestion={formQuestion}
              questionAnswer={questionAnswer}
              viewMode={QUESTION_VIEW_MODE.answerQuestion}
            />
          )}
          {formQuestion.questionTypeId === QUESTION_TYPES[4].id && (
            <EFormQuestionTextArea
              formQuestion={formQuestion}
              questionAnswer={questionAnswer}
              viewMode={QUESTION_VIEW_MODE.answerQuestion}
            />
          )}
          {formQuestion.questionTypeId === QUESTION_TYPES[5].id && (
            <EFormQuestionDateTime
              formQuestion={formQuestion}
              questionAnswer={questionAnswer}
              viewMode={QUESTION_VIEW_MODE.answerQuestion}
            />
          )}
          {formQuestion.questionTypeId === QUESTION_TYPES[6].id && (
            <EFormQuestionNumber
              formQuestion={formQuestion}
              questionAnswer={questionAnswer}
              viewMode={QUESTION_VIEW_MODE.answerQuestion}
            />
          )}
          {formQuestion.questionTypeId === QUESTION_TYPES[8].id && (
            <EFormQuestionImage
              formQuestion={formQuestion}
              questionAnswer={questionAnswer}
              viewMode={QUESTION_VIEW_MODE.answerQuestion}
            />
          )}
          {formQuestion.questionTypeId === QUESTION_TYPES[9].id && (
            <QuestionLabel
              formQuestion={formQuestion}
              questionAnswer={questionAnswer}
              viewMode={QUESTION_VIEW_MODE.viewResponse}
            />
          )}
          {formQuestion.questionTypeId === QUESTION_TYPES[10].id && (
            <EFormQuestionInspection
              formQuestion={formQuestion}
              questionAnswer={questionAnswer}
              viewMode={QUESTION_VIEW_MODE.answerQuestion}
            />
          )}
        </Row>
      </Card>
    </Form>
  )
}

export default EResponseAnswer
