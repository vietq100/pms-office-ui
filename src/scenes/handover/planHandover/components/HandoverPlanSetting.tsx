import FormSelect from '@components/FormItem/FormSelect'
import { isGrantedAny, L } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import staffService from '@services/member/staff/staffService'
import HandoverStore from '@stores/handover/handoverStore'
import Form, { useForm } from 'antd/lib/form/Form'
import { Col, Row } from 'antd/lib/grid'
import Modal from 'antd/lib/modal'
import Select from 'antd/lib/select'
import debounce from 'lodash/debounce'
import React from 'react'

type Props = {
  handoverStore: HandoverStore
  visible: boolean
  closeModal: () => void
}

const HandoverPlanSetting = (props: Props) => {
  React.useEffect(() => {
    if (props.visible) {
      searchAssignedUser('')
      props.handoverStore.getHandoverPlanSetting().then(() => {
        const userIds = props.handoverStore.handoverPlanSetting.map((item) => item.id)
        setAssignedUser(props.handoverStore.handoverPlanSetting)
        form.setFieldsValue({ userIds })
      })
    }
  }, [props.visible])
  const onCancel = () => {
    props.closeModal()
  }

  const onCreate = async () => {
    const values = await form.validateFields()
    await props.handoverStore.updateHandoverPlanSetting(values)
    props.closeModal()
  }
  const [form] = useForm()
  const [assignedUser, setAssignedUser] = React.useState<any[]>([])
  const getUser = async (keyword?) => {
    const res = await staffService.getAll({ keyword })
    return res.items
  }
  const searchAssignedUser = async (keyword?) => {
    const res = await getUser(keyword)
    setAssignedUser(res)
  }
  return (
    <Modal
      open={props.visible}
      cancelText={L('BTN_CANCEL')}
      okText={L('BTN_SAVE')}
      onCancel={onCancel}
      onOk={onCreate}
      title={L('HANDOVER_PLAN_SETTING')}
      okButtonProps={{
        disabled: !isGrantedAny(appPermissions.handoverPlan.update)
      }}
      width={'75%'}>
      <Form form={form} layout="vertical" validateMessages={validateMessages} size="middle">
        <Row gutter={[16, 0]}>
          <Col sm={{ span: 24, offset: 0 }}>
            <FormSelect
              name="userIds"
              label={L('ASSIGNED_USER')}
              options={assignedUser}
              selectProps={{
                mode: 'multiple',
                onSearch: debounce(searchAssignedUser, 300)
              }}
              optionModal={(item, index) => (
                <Select.Option key={index} value={item.id}>
                  <div>{item.displayName}</div>
                  <div className="text-muted">{item.emailAddress}</div>
                </Select.Option>
              )}
            />
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default HandoverPlanSetting
