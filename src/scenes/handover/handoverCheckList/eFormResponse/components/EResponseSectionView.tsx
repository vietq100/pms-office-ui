import { L } from '@lib/abpUtility'
import { QUESTION_TYPES } from '@lib/appconst'
import { IFormSectionModel } from '@models/eForm/EFormModel'
import { OptionModel } from '@models/global'
import EFormStore from '@stores/eForm/eFormStore'
import { Badge, Col, Row } from 'antd'

import EResponseQuestion from './EResponseQuestion'

interface EResponseSectionProps {
  eFormStore: EFormStore
  formSectionIndex?: number
  formSection: IFormSectionModel
  formQuestionTypes: OptionModel[]
  responseAnswer: any
}

function EResponseSectionView({
  eFormStore,
  formSectionIndex = 0,
  formSection,
  formQuestionTypes,
  responseAnswer
}: EResponseSectionProps) {
  return (
    <Row gutter={[8, 0]} className="mt-1 align-items-center">
      <Col flex="auto">
        <h3 className="mb-1">{formSection.name}</h3>
      </Col>

      <Col span={24}>
        {(formSection.formQuestions || []).map((question, index) => (
          <Badge.Ribbon
            placement="start"
            text={
              question.questionTypeId === QUESTION_TYPES[9].id
                ? L('EFORM_LABEL_{0}', index + 1)
                : L('EFORM_QUESTION_{0}', index + 1)
            }
            key={question.id}>
            <EResponseQuestion
              eFormStore={eFormStore}
              formQuestion={question}
              formSectionIndex={formSectionIndex}
              formQuestionIndex={index}
              formQuestionTypes={formQuestionTypes}
              questionAnswer={responseAnswer ? responseAnswer[question.id] : undefined}
            />
          </Badge.Ribbon>
        ))}
      </Col>
      <style scoped>
        {`
        input:disabled {
          color: black !important;
          background-color: white !important
        }
        .ant-select-disabled .ant-select-selector {
          color: black !important;
          background-color: white !important;
        }
           .ant-ribbon-corner{
          display:none
        }
         .ant-ribbon.ant-ribbon-placement-start{
         border-end-start-radius: 4px
         }
      `}
      </style>
    </Row>
  )
}

export default EResponseSectionView
