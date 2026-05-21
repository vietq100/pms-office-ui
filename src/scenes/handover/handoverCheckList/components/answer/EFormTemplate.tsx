import { OptionModel } from '@models/global'
import EFormStore from '@stores/eForm/eFormStore'
import Stores from '@stores/storeIdentifier'
import { inject, observer } from 'mobx-react'
import { useEffect, useState } from 'react'
import EFormSection from './EFormSection'

interface EFormTemplateProps {
  eFormStore: EFormStore
}
const EFormTemplate = inject(Stores.EFormStore)(
  observer(({ eFormStore }: EFormTemplateProps) => {
    const [questionTypes, setQuestionTypes] = useState([] as OptionModel[])
    useEffect(() => {
      const initData = async () => {
        await eFormStore.getQuestionTypes()
        setQuestionTypes(OptionModel.assigns(eFormStore.questionTypes))
      }

      initData()
    }, [])

    return (
      <>
        {(eFormStore.editEForm.formPages || []).map((data, index) => (
          <EFormSection
            key={index}
            formSectionIndex={index}
            formSection={data}
            formQuestionTypes={questionTypes}
            eFormStore={eFormStore}
          />
        ))}
      </>
    )
  })
)
export default EFormTemplate
