import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import FormInput from '@components/FormItem/FormInput'
import FormSelect from '@components/FormItem/FormSelect'
import { L } from '@lib/abpUtility'
import { IEFormResponseAnswerModel, IFormQuestionModel } from '@models/eForm/EFormModel'
import { Button, Col, Form, Row } from 'antd'
import { questionRules } from '../validation'
import { QUESTION_VIEW_MODE } from '@lib/appconst'

interface EFormQuestionProps {
  formQuestion?: IFormQuestionModel
  questionAnswer?: IEFormResponseAnswerModel
  viewMode?: number
}

function EFormQuestionDropdown({ formQuestion, viewMode = QUESTION_VIEW_MODE.editQuestion }: EFormQuestionProps) {
  return (
    <Col sm={{ span: 24, offset: 0 }}>
      {viewMode !== QUESTION_VIEW_MODE.viewResponse && (
        <Form.List name="answers">
          {(fields, { add, remove }) => {
            const newAnswer = {
              description: `Option ${(fields.length || 0) + 1}`
            }

            return (
              <>
                {fields.map(({ key, name, ...restField }) => {
                  const optionOrder = key
                  const optionLabel = L('{0}_FORM_ANSWER_OPTION_NUMBER_{1}', optionOrder, optionOrder)
                  return (
                    <Row key={key} gutter={[8, 8]}>
                      <Col sm={{ span: 6, offset: 0 }} style={{ lineHeight: '44px' }}>
                        <Row>
                          <Col flex={1}>{optionLabel}</Col>
                          <Col flex={0}>
                            <MinusCircleOutlined onClick={() => remove(name)} />
                          </Col>
                        </Row>
                      </Col>
                      <Col sm={{ span: 18, offset: 0 }}>
                        <FormInput
                          {...restField}
                          rule={questionRules.questionDescription}
                          name={[name, 'description']}
                          formItemClass="mb-2"
                        />
                      </Col>
                    </Row>
                  )
                })}
                <Button type="dashed" onClick={() => add(newAnswer)} block icon={<PlusOutlined />}>
                  {L('BTN_ADD_OPTION')}
                </Button>
              </>
            )
          }}
        </Form.List>
      )}
      {viewMode === QUESTION_VIEW_MODE.viewResponse && (
        <FormSelect
          label={formQuestion?.label}
          placeholder={formQuestion?.description}
          name={['responseAnswer', 'optionIds']}
          disabled={true}
          formItemClass="mt-3"
          options={formQuestion?.answers || []}
          rule={[{ required: formQuestion?.isMandatory }]}
        />
      )}
    </Col>
  )
}

export default EFormQuestionDropdown
