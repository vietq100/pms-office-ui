import { PlusCircleOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { L, isGranted, isGrantedAny } from '@lib/abpUtility'
import { Button, Card, Col, Form, Row, Tooltip } from 'antd'
import EFormTemplate from './EFormTemplate'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import EFormStore from '@stores/eForm/eFormStore'
import { FormQuestionModel, FormSectionModel } from '@models/eForm/EFormModel'
import { useEffect } from 'react'
import { validateMessages } from '@lib/validation'
import { useForm } from 'antd/lib/form/Form'
import rules from './validation'
import FormInput from '@components/FormItem/FormInput'
import debounce from 'lodash/debounce'
import { useNavigate, useParams } from 'react-router-dom'
import { portalLayouts } from '@components/Layout/Router/router.config'
import ActionFooter from '@components/ActionFooter'
import ReactToPrint from 'react-to-print'
import React from 'react'
import EFormForPrinting from './EFormForPrinting'
import { appPermissions } from '@lib/appconst'
import NoRole from '@components/ComponentNoRole'

interface EFormCreateProps {
  eFormStore: EFormStore
}

const EFormCreate = inject(Stores.EFormStore)(
  observer(({ eFormStore }: EFormCreateProps) => {
    const navigate = useNavigate()
    const [form] = useForm()
    const { id } = useParams()

    isGranted(appPermissions.eForm.detail) &&
      useEffect(() => {
        const initData = async () => {
          id ? await eFormStore.get(Number(id)) : await eFormStore.createEForm()
          form.setFieldsValue(eFormStore.editEForm)
        }
        initData()
      }, [])

    const onAddQuestion = debounce(async () => {
      await eFormStore.addQuestion(0, new FormQuestionModel())
    }, 300)

    const onAddSection = debounce(async () => {
      const formSectionIndex = (eFormStore.editEForm.formPages?.length || 0) + 1

      // TODO: fix hardcode form section index
      await eFormStore.addSection(new FormSectionModel(eFormStore.editEForm.id, formSectionIndex))
    }, 300)

    const onUpdateForm = async () => {
      return form.validateFields().then(async () => {
        const dataForm = form.getFieldsValue() || {}
        // NOTE valued_at must set to 14:00: +08:00
        const updateData = {
          ...eFormStore.editEForm,
          ...dataForm
        }
        if (eFormStore.editEForm.id) {
          await eFormStore.update(updateData)
        } else {
          await eFormStore.create(updateData)
          navigate(portalLayouts.eFormEdit.path.replace(':id', eFormStore.editEForm?.id))
        }
      })
    }
    const componentRef = React.useRef(null)
    const reactToPrintContent = React.useCallback(() => {
      return componentRef.current
    }, [componentRef.current])
    const reactToPrintTrigger = React.useCallback(() => {
      return (
        <Button shape="round" className="mr-1 primary btn-icon-customize" type="primary">
          {L('PRINT')}
        </Button>
      )
    }, [])
    return isGranted(appPermissions.eForm.detail) ? (
      <div className="w-100 mb-3">
        <Card>
          <Form layout="vertical" form={form} validateMessages={validateMessages} size="middle">
            <Row gutter={16}>
              <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <FormInput name="formName" label={L('FORM_TITLE')} rule={rules.formName} />
              </Col>
            </Row>
          </Form>
        </Card>
        {eFormStore.editEForm && eFormStore.editEForm.id > 0 && (
          <Card className="w-100 d-flex justify-content-center align-items-center">
            <Tooltip placement="bottom" title={L('BTN_ADD_QUESTION')}>
              <Button type="link" onClick={onAddQuestion}>
                <PlusCircleOutlined className="form-button" />
              </Button>
            </Tooltip>
            <Tooltip placement="bottom" title={L('BTN_ADD_SECTION')}>
              <Button type="link" onClick={onAddSection}>
                <UnorderedListOutlined className="form-button" />
              </Button>
            </Tooltip>
          </Card>
        )}
        <EFormTemplate eFormStore={eFormStore} />
        <ActionFooter show={true}>
          {eFormStore.editEForm && eFormStore.editEForm.id > 0 && (
            <ReactToPrint
              bodyClass={'p-3'}
              content={reactToPrintContent}
              documentTitle={L('RESPONDING_FORM') + '_' + eFormStore.editEForm.id}
              removeAfterPrint
              trigger={reactToPrintTrigger}
            />
          )}

          {isGrantedAny(appPermissions.eForm.create, appPermissions.eForm.update) && (
            <Button
              disabled={!isGranted(appPermissions.eForm.update) && id ? true : false}
              shape="round"
              className="mr-1 primary btn-icon-customize"
              type="primary"
              onClick={onUpdateForm}>
              {L('BTN_UPDATE_FORM')}
            </Button>
          )}
          <Button shape="round" className="mr-1 btn-icon-customize" onClick={() => navigate(portalLayouts.eForms.path)}>
            {L('BTN_BACK_TO_LIST')}
          </Button>
        </ActionFooter>
        <div className="d-none">
          <div ref={componentRef} className="p-1">
            <EFormForPrinting eFormStore={eFormStore} />
          </div>
        </div>
      </div>
    ) : (
      <NoRole />
    )
  })
)

export default EFormCreate
