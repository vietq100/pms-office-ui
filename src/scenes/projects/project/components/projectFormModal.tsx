import * as React from 'react'

import { Modal } from 'antd'
import ProjectForm from './projectForm'
import { L } from '../../../../lib/abpUtility'

export interface ICreateOrUpdateUserProps {
  visible: boolean
  onCancel: () => void
  onCreate: () => void
  formRef: any
}

class ProjectFormModal extends React.Component<ICreateOrUpdateUserProps> {
  state = {
    confirmDirty: false
  }

  render() {
    const { visible, onCancel, onCreate, formRef } = this.props

    return (
      <Modal
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={onCancel}
        onOk={onCreate}
        title={L('PROJECT_MODAL_TITLE')}>
        <ProjectForm formRef={formRef} />
      </Modal>
    )
  }
}

export default ProjectFormModal
