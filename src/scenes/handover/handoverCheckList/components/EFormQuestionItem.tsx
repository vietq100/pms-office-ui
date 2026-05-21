import { MinusCircleOutlined } from '@ant-design/icons'
import { L } from '@lib/abpUtility'
import EFormStore from '@stores/eForm/eFormStore'
import { Badge, Button, Tooltip } from 'antd'
import EFormQuestion from './EFormQuestion'
import { Draggable } from '@hello-pangea/dnd'
import { efromStatusPublic } from '@lib/appconst'

type Props = {
  question: any
  index: any
  onDeleteQuestion: (id) => void
  formSectionIndex: any
  formQuestionTypes: any
  eFormStore: EFormStore
}

const EFormQuestionItem = (props: Props) => {
  return (
    <Draggable key={props.index} draggableId={props.question.id.toString()} index={props.index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <Badge.Ribbon
            placement="start"
            text={
              <div className="relative">
                {L('EFORM_QUESTION_{0}', props.index + 1)}
                <span className="absolute">
                  <Tooltip placement="bottom" title={L('BTN_DELETE_QUESTION')}>
                    <Button
                      type="link"
                      className="ml-3 btn-delete-question"
                      onClick={() => props.onDeleteQuestion(props.question.id)}
                      disabled={props.eFormStore.editEForm?.statusId === efromStatusPublic.PUBLISHED}>
                      <MinusCircleOutlined />
                    </Button>
                  </Tooltip>
                </span>
              </div>
            }>
            <EFormQuestion
              eFormStore={props.eFormStore}
              formQuestion={props.question}
              formSectionIndex={props.formSectionIndex}
              formQuestionIndex={props.index}
              formQuestionTypes={props.formQuestionTypes}
            />
          </Badge.Ribbon>
          <style scoped>
            {`
       .ant-ribbon-corner{
          display:none
        }
         .ant-ribbon.ant-ribbon-placement-start{
         border-end-start-radius: 4px
         }
      `}
          </style>
        </div>
      )}
    </Draggable>
  )
}

export default EFormQuestionItem
