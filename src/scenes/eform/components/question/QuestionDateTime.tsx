import FormDatePicker from '@components/FormItem/FormDatePicker'
import { L } from '@lib/abpUtility'
import { QUESTION_VIEW_MODE } from '@lib/appconst'
import { IEFormResponseAnswerModel, IFormQuestionModel } from '@models/eForm/EFormModel'
import { Col, DatePicker } from 'antd'

interface EFormQuestionProps {
  formQuestion?: IFormQuestionModel
  questionAnswer?: IEFormResponseAnswerModel
  viewMode?: number
}

function EFormQuestionDateTime({ formQuestion, viewMode = QUESTION_VIEW_MODE.editQuestion }: EFormQuestionProps) {
  return (
    <Col sm={{ span: 24, offset: 0 }}>
      {viewMode !== QUESTION_VIEW_MODE.viewResponse && (
        <DatePicker disabled size="large" className="w-100" placeholder={L('PLEASE_SELECT_A_DATE')} />
      )}
      {viewMode === QUESTION_VIEW_MODE.viewResponse && (
        <FormDatePicker
          label={formQuestion?.label}
          placeholder={formQuestion?.description}
          name={['responseAnswer', 'answerDate']}
          disabled={true}
          formItemClass="mt-3"
          rule={[{ required: formQuestion?.isMandatory }]}
        />
      )}
    </Col>
  )
}

export default EFormQuestionDateTime
