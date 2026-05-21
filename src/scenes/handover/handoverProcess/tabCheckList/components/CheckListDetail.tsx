import React from 'react'
import { Col, Row, Button, Select, Badge, Card, Form, Input, DatePicker, Spin, Modal } from 'antd'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppComponentBase from '@components/AppComponentBase'
import { L, LError, LNotification } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import HandoverStore from '@stores/handover/handoverStore'
import withRouter from '@components/Layout/Router/withRouter'
import EFormStore from '@stores/eForm/eFormStore'
import { QUESTION_TYPES, dateFormat, moduleIds } from '@lib/appconst'
import EResponseSectionView from '@scenes/handover/handoverCheckList/eFormResponse/components/EResponseSectionView'
import { OptionModel } from '@models/global'
import { validateMessages } from '@lib/validation'
import FormImageHandOver from './FormPhoto'
import FormHandOver from './FormHandOver'
import FileStore from '@stores/common/fileStore'
import ReactToPrint from 'react-to-print'
import NumberInputV1 from '@components/Inputs/NumberInputV1'
import { ModalCreateDefect } from './ModalCreateDefect'
const { Option } = Select
const confirm = Modal.confirm
const pageStyleA5 = ` 
@page {
  size: a5;
  margin: 0 !important;
}

body {
  transform: scale(0.9);
  width: 100%;  
  transform-origin: top left;
  font-size: 12px !important;
  padding: 0mm !important;
}`

export interface IProps {
  idAnswer: any
  idFormQuestion: number
  showDetail: boolean
  handoverStore: HandoverStore
  eFormStore: EFormStore
  onCancel: (isReload) => void
  fileStore: FileStore
}

@inject(Stores.HandoverStore, Stores.EFormStore, Stores.FileStore)
@observer
class CheckListDetail extends AppComponentBase<IProps> {
  formRef: any = React.createRef()
  componentRef: any = React.createRef()

  state = {
    isDraft: false,
    parentId: undefined,
    listQuestion: [] as any,
    showCreateDefect: false,
    dataSave: {} as any,
    showDetail: false
  }

  componentDidUpdate = async (prevProps: Readonly<IProps>) => {
    if (!prevProps.showDetail && this.props.showDetail) {
      if (this.props.showDetail) {
        this.getInfoFormUserAnswer(this.props.idAnswer)
      }
    }
  }

  getInfoFormUserAnswer = async (id) => {
    this.setState({ showDetail: false })
    await this.props.eFormStore.getQuestionTypes()

    if (id) {
      await this.props.handoverStore.GetInfoFormUserAnswer(id)

      this.formRef.current.setFieldsValue({
        parentId: this.props.handoverStore.formAnswerInfo?.parentId,
        statusCode: this.props.handoverStore.formAnswerInfo?.statusCode
      })

      this.setState({ listQuestion: this.props.handoverStore.formAnswerInfo?.form?.formPages })

      if (this.props.handoverStore.formAnswerInfo.isDraft === false) {
        this.setState({ isDraft: false })
      } else {
        this.setState({ isDraft: true })
      }
    } else {
      await this.getFormQuestionById(this.props.idFormQuestion)
    }
    this.setState({ showDetail: true })
  }

  getFormQuestionById = async (id) => {
    await this.props.handoverStore.getListQuesionByIdForm(id)
    await this.setState({ listQuestion: this.props.handoverStore.listQuestionByForm?.formPages })

    this.formRef.current.setFieldsValue({
      parentId: id
    })

    this.setState({ parentId: id })
    this.setState({ isDraft: true })
  }

  onSave = (isDraft: boolean) => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.idAnswer) {
        const answers = [] as any
        Object.keys(values).map((key) => {
          answers.push(...values[key])
        })
        const body = {
          id: this.props.idAnswer,
          uniqueId: this.props.handoverStore.formAnswerInfo?.uniqueId,
          unitId: this.props.handoverStore.formAnswerInfo?.unitId,
          parentId: this.props.handoverStore.formAnswerInfo?.parentId,
          targetParentId: this.props.handoverStore.reservationHandoverDetail?.id,
          moduleId: moduleIds.handoverReservation,
          isDraft: isDraft,
          answers: answers.map((item) => ({
            ...item,
            // optionIds: Array.isArray(item?.optionIds) ? item?.optionIds : [item?.optionIds],
            options: Array.isArray(item?.optionIds)
              ? item?.optionIds.map((item) => ({
                  answerId: item
                }))
              : [{ answerId: item?.optionIds }],
            images: item?.imageNames?.map((guiId) => ({
              imageGuid: guiId
            }))
          }))
        }
        if (isDraft) {
          await this.props.handoverStore.updateUserAnswerForm(body)
          this.props.onCancel(true)
        } else {
          this.setState({ dataSave: body })
          this.setState({ showCreateDefect: true })
        }
      } else {
        const answers = [] as any
        Object.keys(values).map((key) => {
          answers.push(...values[key])
        })
        const body = {
          unitId: this.props.handoverStore.reservationHandoverDetail?.unit?.id,
          parentId: this.state.parentId,
          targetParentId: this.props.handoverStore.reservationHandoverDetail?.id,
          moduleId: moduleIds.handoverReservation,
          isDraft: isDraft,
          answers: answers.map((item) => ({
            ...item,
            // optionIds: Array.isArray(item?.optionIds) ? item?.optionIds : [item?.optionIds],
            options: Array.isArray(item?.optionIds)
              ? item?.optionIds.map((item) => ({
                  answerId: item
                }))
              : [{ answerId: item?.optionIds }],
            images: item?.imageNames.map((guiId) => ({
              imageGuid: guiId
            }))
          }))
        }
        if (isDraft) {
          await this.props.handoverStore.createUserAnswerForm(body)
          this.props.onCancel(true)
        } else {
          this.setState({ dataSave: body })
          this.setState({ showCreateDefect: true })
        }
      }
    })
  }

  createDefectAfterSubmit = () => {
    const dataCreateDefect = {
      id: this.props.handoverStore.formAnswerInfo?.id,
      unitId: this.props.handoverStore.formAnswerInfo?.unitId,
      isDraft: this.props.handoverStore.formAnswerInfo?.isDraft,
      moduleId: this.props.handoverStore.formAnswerInfo?.moduleId,
      targetParentId: this.props.handoverStore.formAnswerInfo?.targetParentId,
      parentId: this.props.handoverStore.formAnswerInfo?.parentId,
      answers:
        this.props.handoverStore.formAnswerInfo?.form?.formPages
          .map((item) =>
            item?.formQuestions.map((answer) => ({
              ...answer?.responseAnswer,
              label: answer?.label,
              formPageId: item?.id
            }))
          )
          .flat() ?? []
    }

    this.setState({ dataSave: dataCreateDefect })
    this.setState({ showCreateDefect: true })
  }

  cloneFormAfterSubmit = async () => {
    const body = {
      id: 0, // tạo mới
      unitId: this.props.handoverStore.formAnswerInfo?.unitId,
      isDraft: true, // clone ra 1 form trả lời mới trạng thái nháp
      moduleId: this.props.handoverStore.formAnswerInfo?.moduleId,
      targetParentId: this.props.handoverStore.formAnswerInfo?.targetParentId,
      parentId: this.props.handoverStore.formAnswerInfo?.parentId,
      answers:
        this.props.handoverStore.formAnswerInfo?.form?.formPages
          .map((item) =>
            item?.formQuestions.map((answer) => ({
              ...answer?.responseAnswer,
              label: answer?.label,
              formPageId: item?.id
            }))
          )
          .flat() ?? []
    }
    confirm({
      title: LNotification('DO_YOU_WANT_TO_CLONE_FORM_ANSWER'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.handoverStore.createUserAnswerForm(body)
        this.props.onCancel(true)
      }
    })
  }

  onSubmitWithDefect = async (body) => {
    if (body?.id) {
      await this.props.handoverStore.updateUserAnswerForm(body)
    } else {
      await this.props.handoverStore.createUserAnswerForm(body)
    }

    this.props.onCancel(true)
  }

  ChangeFormQuestion = async (idForm) => {
    console.log(idForm)
    await this.getFormQuestionById(idForm)
    await this.formRef.current.resetFields()
    this.formRef.current.setFieldsValue({
      parentId: idForm
    })
    await this.setState({ parentId: idForm })
  }

  onCancel = () => {
    this.props.onCancel(false)
    this.setState({ isDraft: undefined })
  }

  reactToPrintContent = () => {
    return this.componentRef.current
  }

  reactToPrintTriggerA5 = () => {
    return <Button type="primary">{L('PRINT')}</Button>
  }

  onCloseModalCreateDefect = () => {
    this.setState({ showCreateDefect: false })
  }

  updateResponseStatus = (statusCode) => {
    confirm({
      title: LNotification('DO_YOU_WANT_TO_UPPDATE_STATUS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        await this.props.eFormStore.updateResponseStatus(this.props.idAnswer, statusCode)
        this.props.onCancel(true)
      }
    })
  }

  renderActions = () => {
    return (
      <Row>
        <Col sm={{ span: 12, offset: 0 }} className="d-flex justify-content-start">
          <ReactToPrint
            bodyClass={'p-3'}
            content={this.reactToPrintContent}
            documentTitle={'IN'}
            removeAfterPrint
            pageStyle={pageStyleA5}
            trigger={this.reactToPrintTriggerA5}
          />
        </Col>
        <Col sm={{ span: 12, offset: 0 }} className="d-flex justify-content-end">
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>

          {this.state.isDraft ? (
            <>
              {/* Save nháp form*/}
              <Button type="primary" onClick={() => this.onSave(true)} className="mr-1" shape="round">
                {L('BTN_SAVE')}
              </Button>
              {/* submit form */}
              <Button type="primary" onClick={() => this.onSave(false)} shape="round">
                {L('BTN_SUBMIT')}
              </Button>
            </>
          ) : (
            <>
              {this.props.handoverStore.formAnswerInfo?.statusCode !== 'FORMCOMPLETED' && (
                <Button type="primary" onClick={this.createDefectAfterSubmit} className="mr-1" shape="round">
                  {L('BTN_CREATE_DEFECT')}
                </Button>
              )}
              {/* submit form */}
              <Button type="primary" onClick={this.cloneFormAfterSubmit} shape="round">
                {L('BTN_CLONE_CHECKLIST')}
              </Button>
            </>
          )}
        </Col>
      </Row>
    )
  }

  renderForm = (question, item, index) => {
    return (
      <>
        <Badge.Ribbon placement="start" text={L('EFORM_LABEL_{0}', item.name + 1)} key={question?.id}>
          <Card size="small" className="mb-2 pt-3">
            {/* SignSelect */}
            {question?.questionTypeId === QUESTION_TYPES[2].id && (
              <>
                <Col span={24}>
                  <Form.Item
                    hidden={true}
                    label={L('ID_QUESTION')}
                    name={[item.name, 'formPageId']}
                    initialValue={question?.formPageId}>
                    <Input disabled={true} value={1} size="middle" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    hidden={true}
                    label={L('ID_QUESTION')}
                    name={[item.name, 'id']}
                    initialValue={question?.responseAnswer?.questionId}>
                    <Input disabled={true} value={1} size="middle" />
                  </Form.Item>
                </Col>
                <Col span={24} className="mt-2">
                  <Form.Item
                    label={<strong>{L(question?.label)}</strong>}
                    name={[item.name, 'optionIds']}
                    rules={[
                      { required: question?.isMandatory, message: LError('REQUIRED_FIELD_{0}', L(question?.label)) }
                    ]}
                    initialValue={question?.responseAnswer?.optionIds[0]}>
                    <Select className="full-width">{this.renderOptions(question?.answers)}</Select>
                  </Form.Item>
                </Col>
              </>
            )}
            {/* Textbox */}
            {question?.questionTypeId === QUESTION_TYPES[3].id && (
              <>
                <Col span={24}>
                  <Form.Item
                    hidden={true}
                    label={L('ID_QUESTION')}
                    name={[item.name, 'formPageId']}
                    initialValue={question?.formPageId}>
                    <Input disabled={true} value={1} size="middle" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    hidden={true}
                    label={L('ID_QUESTION')}
                    name={[item.name, 'id']}
                    initialValue={question?.responseAnswer?.questionId}>
                    <Input disabled={true} value={1} size="middle" />
                  </Form.Item>
                </Col>
                <Col span={24} className="mt-2">
                  <Form.Item
                    label={<strong>{L(question?.label)}</strong>}
                    name={[item.name, 'answerContent']}
                    rules={[
                      { required: question?.isMandatory, message: LError('REQUIRED_FIELD_{0}', L(question?.label)) }
                    ]}
                    initialValue={question?.responseAnswer?.answerContent}>
                    <Input size="middle" placeholder={question?.description} />
                  </Form.Item>
                </Col>
              </>
            )}
            {/* Textarea */}
            {question?.questionTypeId === QUESTION_TYPES[4].id && (
              <>
                <Col span={24}>
                  <Form.Item
                    hidden={true}
                    label={L('ID_QUESTION')}
                    name={[item.name, 'formPageId']}
                    initialValue={question?.formPageId}>
                    <Input disabled={true} value={1} size="middle" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    hidden={true}
                    label={L('ID_QUESTION')}
                    name={[item.name, 'id']}
                    initialValue={question?.responseAnswer?.questionId}>
                    <Input disabled={true} value={1} size="middle" />
                  </Form.Item>
                </Col>
                <Col span={24} className="mt-2">
                  <Form.Item
                    label={<strong>{L(question?.label)}</strong>}
                    name={[item.name, 'answerContent']}
                    rules={[
                      { required: question?.isMandatory, message: LError('REQUIRED_FIELD_{0}', L(question?.label)) }
                    ]}
                    initialValue={question?.responseAnswer?.answerContent}>
                    <Input.TextArea rows={3} size="middle" placeholder={question?.description} />
                  </Form.Item>
                </Col>
              </>
            )}
            {/* Date/Time */}
            {question?.questionTypeId === QUESTION_TYPES[5].id && (
              <>
                <Col span={24}>
                  <Form.Item
                    hidden={true}
                    label={L('ID_QUESTION')}
                    name={[item.name, 'formPageId']}
                    initialValue={question?.formPageId}>
                    <Input disabled={true} value={1} size="middle" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    hidden={true}
                    label={L('ID_QUESTION')}
                    name={[item.name, 'id']}
                    initialValue={question?.responseAnswer?.questionId}>
                    <Input disabled={true} value={1} size="middle" />
                  </Form.Item>
                </Col>
                <Col span={24} className="mt-2">
                  <Form.Item
                    label={<strong>{L(question?.label)}</strong>}
                    name={[item.name, 'answerDate']}
                    rules={[
                      { required: question?.isMandatory, message: LError('REQUIRED_FIELD_{0}', L(question?.label)) }
                    ]}
                    initialValue={question?.responseAnswer?.answerContent}>
                    <DatePicker
                      size="middle"
                      className="full-width"
                      format={[dateFormat]}
                      placeholder={question?.description}
                    />
                  </Form.Item>
                </Col>
              </>
            )}
            {/* Number */}
            {question?.questionTypeId === QUESTION_TYPES[6].id && (
              <>
                <Col span={24}>
                  <Form.Item
                    hidden={true}
                    label={L('ID_QUESTION')}
                    name={[item.name, 'formPageId']}
                    initialValue={question?.formPageId}>
                    <Input disabled={true} value={1} size="middle" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    hidden={true}
                    label={L('ID_QUESTION')}
                    name={[item.name, 'id']}
                    initialValue={question?.responseAnswer?.questionId}>
                    <Input disabled={true} value={1} size="middle" />
                  </Form.Item>
                </Col>
                <Col span={24} className="mt-2">
                  <Form.Item
                    initialValue={question?.responseAnswer?.answerNumeric}
                    label={<strong>{L(question?.label)}</strong>}
                    name={[item.name, 'answerNumeric']}
                    rules={[
                      { required: question?.isMandatory, message: LError('REQUIRED_FIELD_{0}', L(question?.label)) }
                    ]}>
                    <NumberInputV1 min={0} />
                  </Form.Item>

                  {/* <FormNumber
                    label={L(question?.label)}
                    initialValue={question?.responseAnswer?.answerNumeric}
                    name={[item.name, 'answerNumeric']}
                    rule={[
                      { required: question?.isMandatory, message: LError('REQUIRED_FIELD_{0}', L(question?.label)) }
                    ]}
                  /> */}
                </Col>
              </>
            )}
            {/* Photo */}
            {question?.questionTypeId === QUESTION_TYPES[8].id && (
              <>
                <Col span={24}>
                  <Form.Item
                    hidden={true}
                    label={L('ID_QUESTION')}
                    name={[item.name, 'formPageId']}
                    initialValue={question?.formPageId}>
                    <Input disabled={true} value={1} size="middle" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item hidden={true} label={L('ID_QUESTION')} name={[item.name, 'id']}>
                    <Input disabled={true} value={1} size="middle" />
                  </Form.Item>
                </Col>
                <Col span={24} className="mt-2">
                  <FormImageHandOver
                    showLabel={true}
                    indexForm={index}
                    formRef={this.formRef}
                    label={L(question?.label)}
                    isRequired={question?.isMandatory}
                    listImage={question?.responseAnswer?.images}
                    initValue={question?.responseAnswer?.imageNames}
                    name={item.name}
                    rule={[
                      { required: question?.isMandatory, message: LError('REQUIRED_FIELD_{0}', L(question?.label)) }
                    ]}
                    fileStore={this.props.fileStore}
                  />
                </Col>
              </>
            )}
            {/*label  */}
            {question?.questionTypeId === QUESTION_TYPES[9].id && (
              <>
                <Col span={24} className="mt-2">
                  <p
                    dangerouslySetInnerHTML={{
                      __html: question?.label || ''
                    }}
                  />
                </Col>
              </>
            )}
            {/* handover */}
            {question?.questionTypeId === QUESTION_TYPES[10].id && (
              <div style={{ padding: '0px !important' }}>
                <Col span={24}>
                  <Col span={24}>
                    <Form.Item
                      hidden={true}
                      label={L('ID_QUESTION')}
                      name={[item.name, 'label']}
                      initialValue={question?.label}>
                      <Input disabled={true} value={1} size="middle" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      hidden={true}
                      label={L('ID_QUESTION')}
                      name={[item.name, 'formPageId']}
                      initialValue={question?.formPageId}>
                      <Input disabled={true} value={1} size="middle" />
                    </Form.Item>
                  </Col>
                  <Form.Item
                    hidden={true}
                    label={L('ID_QUESTION')}
                    name={[item.name, 'id']}
                    initialValue={question?.responseAnswer?.questionId}>
                    <Input disabled={true} value={1} size="middle" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <FormHandOver
                    fileStore={this.props.fileStore}
                    formRef={this.formRef}
                    indexForm={index}
                    isRequired={question?.isMandatory}
                    label={L(question?.label)}
                    initValue={question?.responseAnswer}
                    name={item.name}
                    rule={[
                      { required: question?.isMandatory, message: LError('REQUIRED_FIELD_{0}', L(question?.label)) }
                    ]}
                  />
                </Col>
              </div>
            )}
          </Card>
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
      </>
    )
  }

  public render() {
    return (
      <>
        <WrapPageScroll renderActions={() => this.renderActions()}>
          <div className="w-100" ref={this.componentRef}>
            <Form layout={'vertical'} ref={this.formRef} validateMessages={validateMessages}>
              <Row gutter={[4, 4]}>
                <Col span={12}>
                  <label>{L('FILTER_TEMPLATE_HANDOVER')}</label>
                  <Form.Item name="parentId">
                    <Select
                      disabled={this.props.idAnswer}
                      onChange={this.ChangeFormQuestion}
                      placeholder={L('FILTER_TEMPLATE_HANDOVER')}
                      style={{ width: '100%' }}>
                      {this.props.handoverStore.formListQuesion?.map((item, index) => (
                        <Select.Option key={index} value={item?.id}>
                          {item?.formName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                {!this.state.isDraft && (
                  <Col span={12}>
                    <label>{L('FILTER_STATUS_SUBMITED')}</label>
                    <Form.Item name="statusCode">
                      <Select
                        disabled={this.props.handoverStore.formAnswerInfo?.statusCode === 'FORMDRAFT' ? true : false} //FORMDRAFT là nháp, ngoài nháp k được edit
                        onChange={this.updateResponseStatus}
                        placeholder={L('FILTER_ACTIVE_STATUS')}
                        style={{ width: '100%' }}>
                        {(this.props.handoverStore.handOverCheckListStatus || []).map((option, index) => (
                          <Option key={index} value={option.code}>
                            {option.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </Form>
            {this.state.showDetail ? (
              <>
                {this.state.isDraft === true ? (
                  //câu hỏi đã tạo-> đang ở trạng thái chưa submit
                  <>
                    {this.props.idAnswer ? (
                      <>
                        <Form layout={'vertical'} ref={this.formRef} validateMessages={validateMessages}>
                          <div className="mt-3">
                            {this.state.listQuestion.map((item, index) => {
                              return (
                                <>
                                  <div key={item?.id} className="mt-3">
                                    <h3>{item?.name}</h3>
                                  </div>

                                  <Form.List
                                    name={`answers_${index}`}
                                    initialValue={item.formQuestions.map((item) => item?.responseAnswer)}>
                                    {(fields) => {
                                      return (
                                        <Row gutter={[0, 6]}>
                                          {fields.map((field) => (
                                            <Col sm={{ span: 24, offset: 0 }} key={field.key}>
                                              {this.renderForm(item.formQuestions[field.name], field, index)}
                                            </Col>
                                          ))}
                                        </Row>
                                      )
                                    }}
                                  </Form.List>
                                </>
                              )
                            })}
                          </div>
                        </Form>
                      </>
                    ) : this.props.handoverStore.isLoading ? (
                      <Spin />
                    ) : (
                      //tao moi
                      <>
                        <Form layout={'vertical'} ref={this.formRef} validateMessages={validateMessages}>
                          {this.state.listQuestion.map((item, index) => {
                            return (
                              <>
                                <div key={item?.id} className="mt-3">
                                  <h3>{item?.name}</h3>
                                </div>

                                <Form.List
                                  name={`answers_${index}`}
                                  initialValue={item?.formQuestions.map((item) => ({
                                    id: 0,
                                    formName: '',
                                    description: '',
                                    isActive: true,
                                    questionId: item?.id,
                                    answerContent: '',
                                    answerRating: null,
                                    answerDate: null,
                                    answerNumeric: null,
                                    comment: null,
                                    isDefect: false,
                                    images: [],
                                    options: [],
                                    imageNames: [],
                                    optionIds: []
                                  }))}>
                                  {(fields) => {
                                    return (
                                      <Row gutter={[0, 6]}>
                                        {fields.map((field) => (
                                          <Col sm={{ span: 24, offset: 0 }} key={field.key}>
                                            {this.renderForm(item?.formQuestions[field.name], field, index)}
                                          </Col>
                                        ))}
                                      </Row>
                                    )
                                  }}
                                </Form.List>
                              </>
                            )
                          })}
                        </Form>
                      </>
                    )}
                  </>
                ) : (
                  //câu hỏi đã tạo-> đang ở trạng thái đã submit -> only view
                  <>
                    {(this.props.handoverStore.formAnswerInfo?.form?.formPages || []).map((data, index) => (
                      <EResponseSectionView
                        key={index}
                        formSectionIndex={index}
                        formSection={data}
                        formQuestionTypes={OptionModel.assigns(this.props.eFormStore.questionTypes)}
                        eFormStore={this.props.eFormStore}
                        responseAnswer={this.props.handoverStore.formAnswerInfo?.responseAnswer}
                      />
                    ))}
                  </>
                )}
              </>
            ) : (
              <Spin />
            )}
          </div>
        </WrapPageScroll>

        <ModalCreateDefect
          visible={this.state.showCreateDefect}
          data={this.state.dataSave}
          onCancel={() => this.setState({ showCreateDefect: false })}
          listQuestion={this.state.listQuestion}
          onSubmitWithDefect={this.onSubmitWithDefect}
        />
      </>
    )
  }
}

export default withRouter(CheckListDetail)
