import { Form, Modal, Row, Col, Input, Checkbox, Button } from 'antd'
import { L } from '@lib/abpUtility'
import React, { useState } from 'react'
import { validateMessages } from '@lib/validation'
import AppConsts from '@lib/appconst'

const { inspectionChecklistHandover } = AppConsts

export const ModalCreateDefect = ({ visible, onCancel, data, listQuestion, onSubmitWithDefect }: any) => {
  const [form] = Form.useForm()
  const [dataAfterGroup, setDataAfterGroup] = useState([] as any)
  const [countCheck, setCountCheck] = useState<number>(0)
  React.useEffect(() => {
    if (visible) {
      groupAnswerWithPage(data?.answers)
    }
  }, [visible])

  const groupAnswerWithPage = async (dataArray) => {
    form.resetFields()
    setCountCheck(0)
    const dataFilter = await dataArray.reduce((acc, answer) => {
      const { formPageId } = answer
      if (!acc[formPageId]) {
        acc[formPageId] = []
      }
      acc[formPageId].push(answer)
      return acc
    }, {} as { [key: number]: any[] })
    const dataGroup = await listQuestion.map((page) => ({
      id: page.id,
      name: page.name,
      answers: dataFilter[page.id.toString()] || []
    }))

    setDataAfterGroup(dataGroup)
  }

  const onSave = async () => {
    return form.validateFields().then(async (values: any) => {
      console.log(values)
      const answers = [] as any
      Object.keys(values).map((key) => {
        answers.push(...values[key])
      })
      const body = { ...data, answers: answers }
      onSubmitWithDefect(body)
      onCancel(false)
    })
  }
  const onCancelModal = () => {
    form.resetFields()
    onCancel(false)
  }

  return (
    <Modal
      closable={false}
      open={visible}
      cancelText={L('BTN_CANCEL')}
      okText={L('BTN_SAVE')}
      footer={
        <div className="text-right">
          <Button onClick={onCancelModal} className="mr-1">
            {L('BTN_CANCEL')}
          </Button>
          <Button onClick={onSave} type="primary">
            {L('BTN_CREATE_DEFECT_{0}', countCheck)}
          </Button>
        </div>
      }
      title={
        <div style={{ textAlign: 'center' }}>
          <strong>{L('CREATE_DEFECT')}</strong>
        </div>
      }>
      <div className="mb-2">
        <span>{L('NOTE_CREATE_DEFECT')}</span>
      </div>
      <Form form={form} layout={'vertical'} size="middle" validateMessages={validateMessages}>
        {dataAfterGroup.map((question: any, index) => {
          return (
            <Row key={index}>
              <Col span={24}>
                <div style={{ padding: '4px 6px', backgroundColor: '#F2F4F8', width: '100%', borderRadius: '6px' }}>
                  <strong>{question?.name}</strong>
                </div>
                <Col span={24}>
                  <Form.List name={`answers_${index}`} initialValue={question.answers.map((answer) => answer)}>
                    {(fields) => {
                      return (
                        <Row gutter={[0, 6]}>
                          {fields.map((field) =>
                            question.answers[field?.name]?.answerRating === inspectionChecklistHandover.POOR ? (
                              <>
                                <Col sm={{ span: 24, offset: 0 }} key={field.key}>
                                  <Form.Item hidden label={L('ID_QUESTION')} name={[field.name, 'id']}>
                                    <Input disabled={true} value={1} size="middle" />
                                  </Form.Item>
                                </Col>
                                <Col sm={{ span: 12, offset: 0 }} key={field.key}>
                                  <label>{question.answers[field?.name]?.label}</label>
                                </Col>
                                <Col sm={{ span: 12, offset: 0 }} key={field.key} style={{ textAlign: 'end' }}>
                                  <Form.Item name={[field.name, 'isDefect']} valuePropName="checked">
                                    <Checkbox
                                      onChange={(value) =>
                                        value?.target?.checked
                                          ? setCountCheck((prevCount) => prevCount + 1)
                                          : setCountCheck((prevCount) => prevCount - 1)
                                      }></Checkbox>
                                  </Form.Item>
                                </Col>
                              </>
                            ) : (
                              <></>
                            )
                          )}
                        </Row>
                      )
                    }}
                  </Form.List>
                </Col>
              </Col>
            </Row>
          )
        })}
      </Form>
    </Modal>
  )
}
