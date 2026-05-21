import { L } from '@lib/abpUtility'
import EFormStore from '@stores/eForm/eFormStore'
import Card from 'antd/es/card'
import Checkbox from 'antd/es/checkbox'
import Divider from 'antd/lib/divider'

type Props = {
  eFormStore: EFormStore
}
const renderCardAnwser = (question, key) => {
  let renderAnwserBox: any = null
  switch (question.questionTypeId) {
    case 9:
      renderAnwserBox = <></>
      break
    case 2:
      renderAnwserBox = (
        <>
          <Divider style={{ margin: 6 }} />
          <div className="mx-1">
            {question.answers.map((answer, index) => (
              <div className="m-2" key={index}>
                <Checkbox>{answer.description}</Checkbox>
              </div>
            ))}
          </div>
        </>
      )
      break

    case 4:
      renderAnwserBox = (
        <>
          <Divider style={{ margin: 6 }} />
          <div className="border-bottom-dashed mt-5 mx-1" />
          <div className="border-bottom-dashed mt-5 mx-1" />
          <div className="border-bottom-dashed mt-5 mx-1" />
        </>
      )
      break
    default:
      renderAnwserBox = (
        <>
          <Divider style={{ margin: 6 }} />
          <div className="border-bottom-dashed mt-5 mx-1" />
        </>
      )
  }
  return (
    <Card className="my-1" key={key}>
      <p
        className="news-d-content"
        dangerouslySetInnerHTML={{
          __html: question.label || ''
        }}
      />
      {renderAnwserBox}
    </Card>
  )
}
const renderCardInformation = () => {
  return (
    <Card className="my-1">
      <div className="border-bottom-dashed">{L('DISPLAY_NAME')} :</div>
      <div className="border-bottom-dashed">{L('PHONE_NUMBER')} :</div>
      <div className="border-bottom-dashed">{L('EMAIL')} :</div>
      <div className="border-bottom-dashed">{L('FULL_UNIT_CODE')} :</div>
    </Card>
  )
}
const EFormForPrinting = (props: Props) => {
  return (
    <div>
      {renderCardInformation()}
      {props.eFormStore.editEForm?.formPages?.map((section, index) => (
        <div className="my-2" key={index}>
          <h3>{section.name}</h3>
          {section.formQuestions.map((question, index) => {
            return renderCardAnwser(question, index)
          })}
        </div>
      ))}
    </div>
  )
}

export default EFormForPrinting
