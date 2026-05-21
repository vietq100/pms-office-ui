import { Form, Modal, Row, Col } from 'antd'
import { L, isGranted } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import FormSelect from '@components/FormItem/FormSelect'
import { ruleMoveQuestion } from './validation'

export const QuestionMoveModal = ({ visible, onCancel, questions, eFormStore, formSectionId }: any) => {
  const [form] = Form.useForm()

  const updateOrder = async () => {
    const formValues = await form.validateFields()
    await eFormStore.updateQuestionOrder({
      ...formValues,
      formPageId: formSectionId
    })

    onCancel()
  }

  return (
    <Modal
      title={L('QUESTION_MOVE_TITLE_MODAL')}
      open={visible}
      okText={L('BTN_SAVE')}
      onOk={updateOrder}
      cancelText={L('BTN_CANCEL')}
      onCancel={onCancel}
      destroyOnClose
      maskClosable={false}
      okButtonProps={{
        disabled: !isGranted(appPermissions.eForm.update),
        className: !isGranted(appPermissions.eForm.update) ? 'd-none' : ''
      }}>
      <Form layout="vertical" form={form} validateMessages={validateMessages} size="middle">
        <Row gutter={16}>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <FormSelect
              label={L('EFORM_QUESTION_WANT_TO_MOVE')}
              name="id"
              rule={ruleMoveQuestion.id}
              options={questions}></FormSelect>
          </Col>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <FormSelect
              label={L('EFORM_QUESTION_TARGET')}
              name="targetId"
              rule={ruleMoveQuestion.targetId}
              options={questions}></FormSelect>
            <small>
              {L(
                '{0}_EFORM_QUESTION_TARGET_{1}_HINT_MESSAGE',
                L('EFORM_QUESTION_WANT_TO_MOVE'),
                L('EFORM_QUESTION_TARGET')
              )}
            </small>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
