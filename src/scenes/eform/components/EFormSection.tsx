import { MinusCircleOutlined, OrderedListOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { L, LNotification } from '@lib/abpUtility'
import { FormQuestionModel, IFormSectionModel } from '@models/eForm/EFormModel'
import { OptionModel } from '@models/global'
import EFormStore from '@stores/eForm/eFormStore'
import { Button, Col, Empty, Modal, Row, Tooltip } from 'antd'
import debounce from 'lodash/debounce'
import { useState } from 'react'
// import EFormQuestion from './EFormQuestion'
import EFormSectionEdit from './EFormSectionEdit'
import { QuestionMoveModal } from './QuestionMoveModal'
import EFormQuestionItem from './EFormQuestionItem'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import eFormService from '@services/eForm/eFormService'
import { useParams } from 'react-router-dom'

const confirm = Modal.confirm

interface EFormSectionProps {
  eFormStore: EFormStore
  formSectionIndex?: number
  formSection: IFormSectionModel
  formQuestionTypes: OptionModel[]
}

function EFormSection({ eFormStore, formSectionIndex = 0, formSection, formQuestionTypes }: EFormSectionProps) {
  const [visible, setVisible] = useState(false)
  const openOrCloseUpdateOrderModal = () => {
    setVisible(!visible)
  }
  const { id } = useParams()
  const onAddQuestion = debounce(async () => {
    // TODO: fix hardcode form section index
    await eFormStore.addQuestion(formSectionIndex, new FormQuestionModel())
  }, 300)

  const onDeleteSection = debounce(async () => {
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DELETE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await eFormStore.deleteSection(formSection.id)
      }
    })
  }, 300)

  const onDeleteQuestion = debounce(async (questionId) => {
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DELETE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await eFormStore.deleteQuestion(formSectionIndex, questionId)
      }
    })
  }, 300)
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
  }
  const onDragEnd = async (result) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }
    const ids = reorder(
      formSection?.formQuestions.map((i) => i.id),
      result.source.index,
      result.destination.index
    )
    const body = {
      ids,
      formPageId: formSection?.id
    }
    const res = await eFormService.sortQuestionOrder(body)
    if (res) {
      eFormStore.get(Number(id))
    }
  }
  return (
    <Row gutter={[8, 0]} className="my-3 align-items-center">
      <Col flex="auto">
        <EFormSectionEdit
          eFormStore={eFormStore}
          formSection={formSection}
          formSectionIndex={formSectionIndex}></EFormSectionEdit>
      </Col>
      <Col flex={0}>
        <Tooltip placement="bottom" title={L('BTN_UPDATE_QUESTION_ORDER')}>
          <Button type="link" onClick={openOrCloseUpdateOrderModal}>
            <OrderedListOutlined />
          </Button>
        </Tooltip>
        <Tooltip placement="bottom" title={L('BTN_ADD_QUESTION')}>
          <Button type="link" onClick={onAddQuestion}>
            <PlusCircleOutlined className="form-button" />
          </Button>
        </Tooltip>
        <Tooltip placement="bottom" title={L('BTN_DELETE_SECTION')}>
          <Button type="link" onClick={onDeleteSection}>
            <MinusCircleOutlined className="form-button" />
          </Button>
        </Tooltip>
      </Col>
      <Col span={24}>
        {!formSection.formQuestions.length && (
          <Empty
            image="/assets/images/bg-empty.svg"
            imageStyle={{
              height: 60
            }}
            description={
              <span>
                {L('EFORM_SECTION_EMPTY_QUESTION_HINT')},{' '}
                <Button type="link" onClick={onAddQuestion} className="pl-0">
                  {L('EFORM_CLICK_HERE_TO_ADD')}
                </Button>
              </span>
            }></Empty>
        )}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {(formSection.formQuestions || []).map((question, index) => (
                  <EFormQuestionItem
                    key={question.id}
                    index={index}
                    question={question}
                    onDeleteQuestion={onDeleteQuestion}
                    formQuestionTypes={formQuestionTypes}
                    formSectionIndex={formSectionIndex}
                    eFormStore={eFormStore}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Col>
      <QuestionMoveModal
        visible={visible}
        onCancel={openOrCloseUpdateOrderModal}
        questions={formSection.formQuestions}
        formSectionId={formSection.id}
        eFormStore={eFormStore}
      />
      <style scoped>{`
        .relative {
          position: relative
        }
        .absolute {
          position: absolute
        }
      `}</style>
    </Row>
  )
}

export default EFormSection
