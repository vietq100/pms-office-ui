import { FormTemplateModel } from '@models/eForm/EFormModel'
import { OptionModel } from '@models/global'
import EFormStore from '@stores/eForm/eFormStore'
import Stores from '@stores/storeIdentifier'
import { inject, observer } from 'mobx-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import EResponseSection from './EResponseSection'

interface EFormResponseViewProps {
  eFormStore: EFormStore
}
const EFormResponseView = inject(Stores.EFormStore)(
  observer(({ eFormStore }: EFormResponseViewProps) => {
    const [questionTypes, setQuestionTypes] = useState([] as OptionModel[])
    const [eForm, setEForm] = useState<FormTemplateModel>()
    const [responseAnswer, setResponseAnswer] = useState()
    const { id } = useParams()
    useEffect(() => {
      const initData = async () => {
        await eFormStore.getQuestionTypes()
        await eFormStore.getResponseDetail(id)
        setQuestionTypes(OptionModel.assigns(eFormStore.questionTypes))

        const { form, responseAnswer } = eFormStore.editEFormResponse
        setEForm(form)
        setResponseAnswer(responseAnswer)
      }
      initData()
    }, [])

    return (
      <div>
        {(eForm?.formPages || []).map((data, index) => (
          <EResponseSection
            key={index}
            formSectionIndex={index}
            formSection={data}
            formQuestionTypes={questionTypes}
            eFormStore={eFormStore}
            responseAnswer={responseAnswer}
          />
        ))}
      </div>
    )
  })
)
export default EFormResponseView
