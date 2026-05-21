import { L } from '@lib/abpUtility'
import AppConsts, { dateFormat, dateTimeFormat, QUESTION_TYPES } from '@lib/appconst'
import { formatNumber } from '@lib/helper'
import EFormStore from '@stores/eForm/eFormStore'
import Card from 'antd/es/card'
import Divider from 'antd/lib/divider'
import moment from 'moment'
const { authorization } = AppConsts

type Props = {
  eFormStore: EFormStore
}
const renderCardAnwser = (question, anwser, key) => (
  // <Card className="my-1" key={key}>
  //   <h3>{question}</h3>
  //   <Divider style={{ margin: 6 }} />
  //   <div>{anwser}</div>
  // </Card>
  <Card className="my-1" key={key}>
    <p
      className="news-d-content"
      dangerouslySetInnerHTML={{
        __html: question || ''
      }}
    />
    {anwser !== null && (
      <>
        <Divider style={{ margin: 6 }} />
        <div>{anwser}</div>
      </>
    )}
  </Card>
)
const renderCardInformation = (editEFormResponse?) => {
  return editEFormResponse ? (
    <Card className="my-1">
      <div className="d-flex align-items-center">
        <div className="w-50">
          <div>
            {L('DISPLAY_NAME')} : {editEFormResponse.userAnswer.displayName}
          </div>
          <div>
            {L('USER_NAME')} : {editEFormResponse.userAnswer.name}
          </div>
          <div>
            {L('PHONE_NUMBER')} : {editEFormResponse.userAnswer.phoneNumber}
          </div>
          <div>
            {L('EMAIL')} : {editEFormResponse.userAnswer.emailAddress}
          </div>
          <div>
            {L('FULL_UNIT_CODE')} : {editEFormResponse.fullUnitCode}
          </div>
        </div>
        <Divider type="vertical" plain />
        <div className="w-50">
          <div>
            {L('SUBMIT_TIME')} : {moment(editEFormResponse.creationTime).format(dateTimeFormat)}
          </div>
          <div>
            {L('STATUS')} : {editEFormResponse.status?.name}
          </div>
        </div>
      </div>
    </Card>
  ) : null
}
const EResponseDetailForPrinting = (props: Props) => {
  const projectLogo = localStorage.getItem(authorization.projectPictureUrl)
  return props.eFormStore?.editEFormResponse ? (
    <div>
      <div className="w-100 d-flex justify-content-between">
        <img className="rounded-pill" height="100" src="/assets/images/logo-horizontal.png" />
        {projectLogo && <img height="100" className="rounded-pill" src={projectLogo} />}
      </div>
      <h3 className="w-100 m-3 p-3 text-center">{props.eFormStore.editEFormResponse.form?.formName}</h3>
      <div>
        {renderCardInformation(props.eFormStore?.editEFormResponse)}
        {props.eFormStore.editEFormResponse.formPrinting.map((section, index) => (
          <div className="my-2" key={index}>
            <h3>{section.name}</h3>
            {section.formQuestions.map((question, index) => {
              const anwserResult = props.eFormStore.editEFormResponse?.answers?.find(
                (a) => a.questionId === question.id
              )
              const answerContent =
                anwserResult?.answerContent ||
                (anwserResult?.answerNumeric && formatNumber(anwserResult?.answerNumeric, 'en')) ||
                anwserResult?.answerDate?.format(dateFormat) ||
                (anwserResult?.optionIds?.length &&
                  question.answers?.find((item) => anwserResult?.optionIds?.includes(item.id))?.description) ||
                (anwserResult?.images?.length &&
                  anwserResult?.images.map((img, ind) => (
                    <img src={img.files.fileUrl} width={120} className="m-1" key={ind} />
                  )))

              return renderCardAnwser(
                question.label,
                question.questionType.id === QUESTION_TYPES[9].id ? null : answerContent,
                index
              )
            })}
          </div>
        ))}
      </div>
      <div className="w-100 d-flex justify-content-around my-3">
        <div className="fw-bold py-3" style={{ height: 120, borderBottom: '1px dashed black' }}>
          {L('STAFF_SIGNED')}
        </div>
        <div className="fw-bold py-3" style={{ height: 120, borderBottom: '1px dashed black' }}>
          {L('CUSTOMER_SIGNED')}
        </div>
      </div>
    </div>
  ) : null
}

export default EResponseDetailForPrinting
