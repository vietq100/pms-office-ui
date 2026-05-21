import FormInput from '@components/FormItem/FormInput'
import { L } from '@lib/abpUtility'
import { QUESTION_VIEW_MODE } from '@lib/appconst'
import { IEFormResponseAnswerModel, IFormQuestionModel } from '@models/eForm/EFormModel'
import { Col, Input } from 'antd'

interface EFormQuestionProps {
  formQuestion?: IFormQuestionModel
  questionAnswer?: IEFormResponseAnswerModel
  viewMode?: number
}

function EFormQuestionTextbox({ formQuestion, viewMode = QUESTION_VIEW_MODE.editQuestion }: EFormQuestionProps) {
  return (
    <Col sm={{ span: 24, offset: 0 }}>
      {viewMode !== QUESTION_VIEW_MODE.viewResponse && (
        <Input disabled size="large" className="w-100" placeholder={L('PLEASE_INPUT_A_TEXT')}></Input>
      )}
      {viewMode === QUESTION_VIEW_MODE.viewResponse && (
        <FormInput
          label={formQuestion?.label}
          placeholder={formQuestion?.description}
          name={['responseAnswer', 'answerContent']}
          disabled={true}
          formItemClass="mt-3"
          rule={[{ required: formQuestion?.isMandatory }]}
        />
      )}
    </Col>
  )
}

export default EFormQuestionTextbox
