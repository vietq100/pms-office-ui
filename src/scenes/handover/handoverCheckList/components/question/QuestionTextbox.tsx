import FormInput from '@components/FormItem/FormInput'

import { QUESTION_VIEW_MODE } from '@lib/appconst'
import { IEFormResponseAnswerModel, IFormQuestionModel } from '@models/eForm/EFormModel'
import { Col, Form, Input } from 'antd'

interface EFormQuestionProps {
  formQuestion?: IFormQuestionModel
  questionAnswer?: IEFormResponseAnswerModel
  viewMode?: number
}

function EFormQuestionTextbox({ formQuestion, viewMode = QUESTION_VIEW_MODE.editQuestion }: EFormQuestionProps) {
  return (
    <Col sm={{ span: 24, offset: 0 }}>
      {viewMode === QUESTION_VIEW_MODE.viewResponse && (
        <Form.Item
          label={<strong>{formQuestion?.label}</strong>}
          name={['responseAnswer', 'answerContent']}
          rules={[{ required: formQuestion?.isMandatory }]}
          className="mt-3">
          <Input disabled={true} size="middle" />
        </Form.Item>
        // <FormInput
        //   label={formQuestion?.label}
        //   placeholder={formQuestion?.description}
        //   name={['responseAnswer', 'answerContent']}
        //   disabled={true}
        //   formItemClass="mt-3"
        //   rule={[{ required: formQuestion?.isMandatory }]}
        // />
      )}
      {viewMode === QUESTION_VIEW_MODE.answerQuestion && (
        <FormInput
          label={formQuestion?.label}
          placeholder={formQuestion?.description}
          name={['responseAnswer', 'answerContent']}
          formItemClass="mt-3"
          rule={[{ required: formQuestion?.isMandatory }]}
        />
      )}
    </Col>
  )
}

export default EFormQuestionTextbox
