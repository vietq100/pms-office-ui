import { Col, Form, Modal, Row, Select, InputNumber } from 'antd'
import AppComponentBase from '../../../../components/AppComponentBase'
import MultiLanguageInput from '../../../../components/Inputs/MultiLanguageInput'
import { L } from '../../../../lib/abpUtility'
import { ruleFolder } from './validation'
import AppConsts from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import LibraryStore from '../../../../stores/communication/libraryStore'
import ProjectStore from '../../../../stores/project/projectStore'
import RoleStore from '../../../../stores/administrator/roleStore'
import { filterOptions } from '../../../../lib/helper'
import { validateMessages } from '../../../../lib/validation'

const { formVerticalLayout } = AppConsts

export interface IResidentFormProps {
  libraryStore: LibraryStore
  projectStore: ProjectStore
  roleStore: RoleStore
  visible: boolean
  onCancel: () => void
  onCreate: () => void
  formRef: any
}
@inject(Stores.LibraryStore)
@inject(Stores.ProjectStore)
@inject(Stores.RoleStore)
@observer
class LibraryFolderPrivateFormModal extends AppComponentBase<IResidentFormProps> {
  state = {
    confirmDirty: false,
    projects: [],
    buildings: [],
    floors: [],
    unitTypes: [],
    units: { totalCount: 0, items: [] }
  }

  componentDidUpdate(prevProps: Readonly<IResidentFormProps>): void {
    if (!prevProps.visible && this.props.visible) {
      this.props.projectStore.filterBuildingOptions({})
    }
  }

  findBuildings = async (keyword?) => {
    this.props.projectStore.filterBuildingOptions({ keyword })
  }

  getAllRoles = async () => {
    this.props.roleStore.getAllRoles()
  }

  render() {
    const {
      visible,
      onCancel,
      onCreate,
      projectStore,
      formRef,
      libraryStore: { editFolder }
    } = this.props
    return (
      <Modal
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={onCancel}
        onOk={onCreate}
        title={editFolder?.id ? L('EDIT_FOLDER_PRIVATE') : L('CREATE_FOLDER_PRIVATE')}
        confirmLoading={this.props.libraryStore.isLoadingDocument}>
        <Form ref={formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('LIBRARY_FOLDER_NAME')} {...formVerticalLayout} name="names" rules={ruleFolder.name}>
                <MultiLanguageInput />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('BUILDING')} {...formVerticalLayout} name="buildingIds">
                <Select
                  showSearch
                  allowClear
                  showArrow
                  mode="multiple"
                  className="full-width"
                  filterOption={filterOptions}>
                  {this.renderOptions(projectStore?.buildingOptions)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('SORT_ORDER')} {...formVerticalLayout} name="sort">
                <InputNumber min={0} className="full-width" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default LibraryFolderPrivateFormModal
