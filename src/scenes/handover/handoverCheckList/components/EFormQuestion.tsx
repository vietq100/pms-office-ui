import FormCKEditor from '@components/FormItem/FormCKEditor'
import FormInput from '@components/FormItem/FormInput'
import FormSelect from '@components/FormItem/FormSelect'
import FormCheckbox from '@components/Inputs/CheckboxInput/FormCheckbox'
import { L } from '@lib/abpUtility'
import { QUESTION_TYPES } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import { IFormQuestionModel } from '@models/eForm/EFormModel'
import { OptionModel } from '@models/global'
import EFormStore from '@stores/eForm/eFormStore'
import { Card, Col, Row, Form } from 'antd'
import { useForm } from 'antd/es/form/Form'
import debounce from 'lodash/debounce'
import React from 'react'
import EFormQuestionDropdown from './question/QuestionDropdown'
import EFormQuestionMultiChoice from './question/QuestionMultiChoice'
import { questionRules } from './validation'

interface EFormQuestionProps {
  eFormStore: EFormStore
  formSectionIndex?: number
  formQuestionIndex?: number
  formQuestion: IFormQuestionModel
  formQuestionTypes?: OptionModel[]
}

function EFormQuestion({
  eFormStore,
  formSectionIndex = 0,
  formQuestionIndex = 0,
  formQuestion,
  formQuestionTypes
}: EFormQuestionProps) {
  const [formType, setFormType] = React.useState(0)
  const triggerRerender = (e) => {
    setFormType(e)
  }
  React.useEffect(() => {
    setFormType(formQuestion.questionTypeId)
  }, [])
  const [form] = useForm()
  const questionTypeHasOptions = Object.keys(QUESTION_TYPES)
    .filter((key) => QUESTION_TYPES[key].hasOptions)
    .map((key) => QUESTION_TYPES[key].id)

  const onUpdateQuestion = debounce(async () => {
    await form.validateFields().then(async (values: any) => {
      const { questionTypeId } = values
      const hasOptions = questionTypeHasOptions.includes(questionTypeId)
      const answers = hasOptions
        ? values.answers.length > 0
          ? values.answers
          : [{ description: 'Option 1' }]
        : undefined

      if (questionTypeId) {
        const question = {
          ...formQuestion,
          ...values,
          answers,
          isInspection: questionTypeId === 10 ? true : false, // 10 là loại dành cho handover
          questionType: { id: questionTypeId },
          hasOptions
        }

        await eFormStore.editQuestion(formSectionIndex, formQuestionIndex, question)
      }
    })
  }, 1000)

  return (
    <Form
      form={form}
      autoComplete="off"
      initialValues={formQuestion}
      onValuesChange={onUpdateQuestion}
      validateMessages={validateMessages}>
      <Card size="small" className="mb-2 pt-3">
        <Row gutter={[8, 8]}>
          <Col sm={{ span: 6, offset: 0 }}>
            <FormSelect
              isFormVerticalLayout={false}
              rule={questionRules.questionTypeId}
              label={L('EFORM_QUESTION_TYPE')}
              name={'questionTypeId'}
              onChange={triggerRerender}
              options={formQuestionTypes || []}
            />
          </Col>
          {formType === QUESTION_TYPES[9].id ? (
            <Col span={24}>
              <FormCKEditor
                // rule={questionRules.questionLabel}
                label={L('EFORM_QUESTION_LABEL', formQuestionIndex + 1)}
                name={'label'}
                // placeholder={'EFORM_QUESTION_LABEL_PLACEHOLDER'}
              />
            </Col>
          ) : (
            <>
              <Col flex="auto">
                <FormInput
                  isFormVerticalLayout={false}
                  rule={questionRules.questionLabel}
                  label={L('EFORM_QUESTION_LABEL', formQuestionIndex + 1)}
                  name={'label'}
                  placeholder={'EFORM_QUESTION_LABEL_PLACEHOLDER'}
                />
              </Col>
              <Col flex="auto">
                <FormInput
                  isFormVerticalLayout={false}
                  rule={questionRules.questionDescription}
                  label={L('EFORM_QUESTION_DESCRIPTION', formQuestionIndex + 1)}
                  name={'description'}
                />
              </Col>
              <Col>
                <label></label>
                <FormCheckbox label={L('EFORM_QUESTION_IS_REQUIRED')} name="isMandatory"></FormCheckbox>
              </Col>

              {formType === QUESTION_TYPES[1].id && <EFormQuestionMultiChoice />}
              {formType === QUESTION_TYPES[2].id && <EFormQuestionDropdown />}
            </>
          )}
        </Row>
      </Card>
    </Form>
  )
}

export default EFormQuestion
