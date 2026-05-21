import FormNumber from '@components/FormItem/FormNumber'
import NumberInputV1 from '@components/Inputs/NumberInputV1'
import { L } from '@lib/abpUtility'
import { QUESTION_VIEW_MODE } from '@lib/appconst'
import { IEFormResponseAnswerModel, IFormQuestionModel } from '@models/eForm/EFormModel'
import { Col, Form, InputNumber } from 'antd'

interface EFormQuestionProps {
  formQuestion?: IFormQuestionModel
  questionAnswer?: IEFormResponseAnswerModel
  viewMode?: number
}

function EFormQuestionNumber({ formQuestion, viewMode = QUESTION_VIEW_MODE.editQuestion }: EFormQuestionProps) {
  return (
    <Col sm={{ span: 24, offset: 0 }}>
      {viewMode === QUESTION_VIEW_MODE.editQuestion && (
        <InputNumber disabled size="large" className="w-100" placeholder={L('PLEASE_INPUT_A_NUMBER')} />
      )}
      {viewMode === QUESTION_VIEW_MODE.viewResponse && (
        <Form.Item
          label={<strong>{formQuestion?.label}</strong>}
          name={['responseAnswer', 'answerNumeric']}
          rules={[{ required: formQuestion?.isMandatory }]}
          className="mt-3">
          <NumberInputV1 min={0} disabled={true} />
        </Form.Item>

        // <FormNumber
        //   label={formQuestion?.label}
        //   placeholder={formQuestion?.description}
        //   name={['responseAnswer', 'answerNumeric']}
        //   disabled={true}
        //   formItemClass="mt-3"
        //   rule={[{ required: formQuestion?.isMandatory }]}
        // />
      )}
      {viewMode === QUESTION_VIEW_MODE.answerQuestion && (
        <FormNumber
          label={formQuestion?.label}
          placeholder={formQuestion?.description}
          name={['responseAnswer', 'answerNumeric']}
          formItemClass="mt-3"
          rule={[{ required: formQuestion?.isMandatory }]}
        />
      )}
    </Col>
  )
}

export default EFormQuestionNumber
