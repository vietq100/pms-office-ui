import FormInput from '@components/FormItem/FormInput'
import FormNumber from '@components/FormItem/FormNumber'
import FormSelect from '@components/FormItem/FormSelect'
import FormSwitch from '@components/FormItem/FormSwitch'
import FormTextArea from '@components/FormItem/FormTextArea'
import { L } from '@lib/abpUtility'
import AppConsts, { dateFormat } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import { OptionModel } from '@models/global'
import ProjectStore from '@stores/project/projectStore'
import UnitStore from '@stores/project/unitStore'
import Stores from '@stores/storeIdentifier'
import { Col, DatePicker, Form, Modal, Row, Spin } from 'antd'
import { inject } from 'mobx-react'
import { observer } from 'mobx-react-lite'
import React from 'react'
const { validate } = AppConsts

type Props = {
  unitStore: UnitStore
  projectStore: ProjectStore
  visible: boolean
  setVisible: (v: boolean) => void
  selectedUnit?: number
}

const ModalUnit = inject(
  Stores.UnitStore,
  Stores.ProjectStore
)(
  observer((props: Props) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = React.useState(false)
    const handleOk = async () => {
      const formValues = await form.validateFields()
      setLoading(true)
      if (props.selectedUnit) {
        await props.unitStore.update({
          ...props.unitStore.editUnit,
          ...formValues
        })
      } else {
        await props.unitStore.create(formValues)
      }
      setLoading(false)
      props.setVisible(false)
    }
    const handleCancel = () => {
      props.setVisible(false)
    }
    React.useEffect(() => {
      getDetail(props.selectedUnit)
      props.unitStore.getUnitTypes()
      props.unitStore.getUnitUseStatus()
      findBuildings('')
    }, [props.selectedUnit])
    const getDetail = async (id) => {
      setLoading(true)
      if (!id) {
        await props.unitStore?.createUnit()
      } else {
        await props.unitStore?.get(id)
        const { editUnit } = props.unitStore
        if (editUnit.id) {
          props.projectStore.buildingOptions = [new OptionModel(editUnit.building?.id, editUnit.building?.name)]
          props.projectStore.floorOptions = [new OptionModel(editUnit.floor?.id, editUnit.floor?.name)]
        }
        props.unitStore?.getUnitResident({
          unitId: id,
          isActive: true
          // ...state.filterUnitResidents
        })
      }
      form.setFieldsValue({ ...props.unitStore?.editUnit })
      setLoading(false)
    }
    const findBuildings = async (keyword?) => {
      props.projectStore.filterBuildingOptions({ keyword })
    }
    const buildFullUnitCode = async () => {
      const selectedBuildingId = form.getFieldValue('buildingId')
      const selectedFloorId = form.getFieldValue('floorId')
      const unitCode = form.getFieldValue('code')
      const { buildingOptions, floorOptions } = props.projectStore
      const selectedBuilding = selectedBuildingId
        ? buildingOptions.find((item: any) => item.value === selectedBuildingId)
        : ({} as any)
      const selectedFloor = selectedFloorId
        ? floorOptions.find((item: any) => item.value === selectedFloorId)
        : ({} as any)

      form.setFieldsValue({
        fullUnitCode: `${selectedBuilding.label || ''}-${selectedFloor.label || ''}-${unitCode}`
      })
    }
    const findFloors = async (keyword?) => {
      const buildingId = form.getFieldValue('buildingId')
      if (!buildingId) {
        form.setFieldsValue({ floorId: undefined })
        return
      }
      await props.projectStore.filterFloorOptions({
        keyword,
        buildingId
      })
    }
    return (
      <Modal title={L('UNIT_TAB_INFO')} visible={props.visible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout={'vertical'} validateMessages={validateMessages}>
          <Spin spinning={loading}>
            <Row gutter={[16, 0]}>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormSelect
                  label={L('BUILDING')}
                  name="buildingId"
                  options={props.projectStore.buildingOptions}
                  onChange={() => {
                    findFloors('')
                    buildFullUnitCode()
                  }}
                  disabled={!!props.selectedUnit}
                  selectProps={{ onSearch: findBuildings }}
                />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormSelect
                  label={L('FLOOR')}
                  name="floorId"
                  options={props.projectStore.floorOptions}
                  onChange={buildFullUnitCode}
                  disabled={!!props.selectedUnit}
                  selectProps={{ onSearch: findFloors }}
                />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormInput label={L('UNIT_CODE')} name="code" onChange={buildFullUnitCode} />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormInput label={L('UNIT_NAME')} name="name" />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormInput label={L('FULL_UNIT_CODE')} name="fullUnitCode" />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormSelect label={L('UNIT_TYPE')} name="typeId" options={props.unitStore?.unitTypes} />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormSelect label={L('UNIT_USE_STATUS')} name="statusId" options={props.unitStore?.unitUseStatus} />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormNumber label={L('UNIT_SIZE')} name="size" max={validate.maxNumber} />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormNumber label={L('UNIT_NUMBER_ROOM')} name="numOfRoom" />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormInput label={L('UNIT_PE_CODE')} name="peCode" />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item label={L('UNIT_HANDOVER_DATE')} name="handOverDate">
                  <DatePicker className="full-width" format={dateFormat} placeholder={L('SELECT_DATE')} size="large" />
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormSwitch label={L('UNIT_ACTIVE_STATUS')} name="isActive" />
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <FormTextArea label={L('FLOOR_DESCRIPTION')} name="description" rows={2} />
              </Col>
            </Row>
          </Spin>
        </Form>
      </Modal>
    )
  })
)

export default ModalUnit
