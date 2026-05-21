import { Form, Input, Modal, Row, Col } from 'antd'
import { isGrantedAny, L } from '../../../../lib/abpUtility'
import rules from './validation'
import AppConsts, { appPermissions } from '../../../../lib/appconst'
import AppComponentBase from '../../../../components/AppComponentBase'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import { validateMessages } from '../../../../lib/validation'
import ContractCategoryStore from '@stores/project/contractCategoryStore'
import MultiLanguageInput from '@components/Inputs/MultiLanguageInput'

const { formVerticalLayout } = AppConsts

export interface IContractCategoryFormProps {
  visible: boolean
  isUpdateForm: boolean
  onCancel: () => void
  onCreate: () => void
  formRef: any
  contractCategoryStore: ContractCategoryStore
}

@inject(Stores.ContractCategoryStore)
@observer
class ContractCategoryModal extends AppComponentBase<IContractCategoryFormProps> {
  state = {
    isDirty: false,
    isUpdateForm: false
  }

  render() {
    const {
      visible,
      onCancel,
      onCreate,
      formRef,
      isUpdateForm,
      contractCategoryStore: { editContractCategorySub }
    } = this.props

    return (
      <Modal
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={onCancel}
        onOk={onCreate}
        title={L(isUpdateForm ? 'EDIT' : 'CREATE')}
        okButtonProps={{
          disabled: !isGrantedAny(appPermissions.contractCategory.create, appPermissions.contractCategory.update),
          className: !isGrantedAny(appPermissions.contractCategory.create, appPermissions.contractCategory.update)
            ? 'd-none'
            : ''
        }}>
        <Form
          ref={formRef}
          layout="vertical"
          validateMessages={validateMessages}
          initialValues={editContractCategorySub}
          size="middle">
          <Row gutter={[16, 0]}>
            <Form.Item name="parentId" className="d-none">
              <Input />
            </Form.Item>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('CONTRACT_CATEGORY_NAME')} {...formVerticalLayout} name="names" rules={rules.name}>
                <MultiLanguageInput />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('CONTRACT_CATEGORY_CODE')} {...formVerticalLayout} name="code">
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('SORT_ORDER')} {...formVerticalLayout} name="sortOrder">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default ContractCategoryModal
