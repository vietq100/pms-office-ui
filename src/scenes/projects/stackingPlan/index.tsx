import * as React from 'react'
import { Card, Select } from 'antd'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { reduce, sum } from 'lodash'
import { L, isGranted } from '@lib/abpUtility'
import { formatNumber, renderDate, renderOptions } from '@lib/helper'
import './project-stacking-plan.less'
import ProjectStore from '@stores/project/projectStore'
import UnitStore from '@stores/project/unitStore'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import projectService from '@services/project/projectService'
import BuildingStore from '@stores/project/buildingStore'
import ProjectUnitChart from './ProjectUnitChart'
import ModalUnit from './ModalUnit'
import NoRole from '@components/ComponentNoRole'
import AppConst, { appPermissions } from '@lib/appconst'

const { activeStatusNotAll } = AppConst

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

const UnitEmpty = ({ width, size, handleClick }: { width: number; size: number; handleClick: any }) => {
  if (size <= 0) return null

  return (
    <div style={{ flexBasis: `${width}%` }} className="unit-item unit-empty mb-0" onClick={handleClick}>
      <p className="mb-0">{L('EMPTY')}</p>
      <small>{formatNumber(size)}</small>
    </div>
  )
}

export interface IProjectStackingPlanProps {
  projectId: number
  projectStore: ProjectStore
  unitStore: UnitStore
  buildingStore: BuildingStore
}

@inject(Stores.ProjectStore)
@inject(Stores.BuildingStore)
@inject(Stores.UnitStore)
@observer
class ProjectStackingPlan extends React.Component<IProjectStackingPlanProps, any> {
  formRef: any = React.createRef()
  state = {
    floors: [],
    unitGroups: {},
    selectedUnit: undefined,
    modalVisible: false,
    isActive: 'true',
    statisticFilter: {},
    selectedBuildingId: undefined
  }

  componentDidMount = async () => {
    if (!this.props.buildingStore.buildingOptions || !this.props.buildingStore.buildingOptions[0]) {
      isGranted(appPermissions.unit.page) &&
        (await Promise.all([
          this.props.buildingStore.filterOptions({
            maxResultCount: 100,
            skipCount: 0,
            isActive: true
          }),
          this.fetchData(this.props.buildingStore.buildingOptions[0]?.id)
        ]))
    } else {
      isGranted(appPermissions.unit.page) && (await this.fetchData(this.props.buildingStore.buildingOptions[0]?.id))
    }
  }

  hideOrShowModal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }

  onDragEnd = async ({ source: src, destination: des }: DropResult) => {
    if (!des || src.droppableId !== des.droppableId) return

    if (src.droppableId === 'floor') {
      this.setState(
        (prev) => ({ floors: reorder(prev.floors, src.index, des.index) }),
        async () => await projectService.updateFloorOrder(this.state.floors.map((p: any) => p.id))
      )
    } else {
      this.setState(
        (prev) => ({
          unitGroups: {
            ...prev.unitGroups,
            [src.droppableId]: [...reorder(prev.unitGroups[src.droppableId], src.index, des.index)]
          }
        }),
        () => projectService.updateUnitOrder(this.state.unitGroups[src.droppableId].map((p) => p.id))
      )
    }
  }

  sort = (a, b) => a.order - b.order

  fetchData = async (id?, isActive?) => {
    await this.props.projectStore.getListUnitStackingPlan(id, isActive ?? this.state.isActive)
    const floors = this.props.projectStore.floors.sort(this.sort)
    const unitGroups = reduce(
      this.props.projectStore.units,
      (result, unit) => {
        const key = `f-${unit.floorId}`
        if (!result[key]) result[key] = []
        result[key].push(unit)
        result[key].sort(this.sort)
        return result
      },
      {}
    )
    this.setState({ floors, unitGroups, selectedBuildingId: id })
  }

  renderUnitInFloor = (floor) => {
    floor.size = 360
    const key = `f-${floor.id}`
    const units: Array<any> = this.state.unitGroups[key] || []
    if (units.length < 1) {
      return (
        <UnitEmpty
          width={100}
          size={floor.size}
          handleClick={() => {
            this.setState({ modalVisible: true, selectedUnit: undefined })
          }}
        />
      )
    }
    const sumUnits = sum(units.map((unit) => unit.size))
    const percentUnits = 100 - (sumUnits / floor.size) * 100
    const getColor = (id) => {
      const coooollloorrrr = Math.floor(16077777 + id * 5555).toString(16)
      return '#' + coooollloorrrr
    }
    return (
      <>
        {units.map((unit, inx) => (
          <Draggable key={`unit-drag-${unit.id}`} draggableId={`u-${unit.id}`} index={inx}>
            {(dragProvided) => {
              const colorByStatus = getColor(unit.statusId)
              return (
                <div
                  ref={dragProvided.innerRef}
                  {...dragProvided.draggableProps}
                  {...dragProvided.dragHandleProps}
                  className={`unit-item ${unit.color || 'unit-empty'}`}
                  style={{
                    ...dragProvided.draggableProps.style,
                    flex: `0 1 ${(unit.size / floor.size) * 100}%`
                  }}
                  onClick={() => {
                    this.setState({ modalVisible: true, selectedUnit: unit.id })
                  }}>
                  <div className="unit-item-info" style={{ position: 'relative', zIndex: 1 }}>
                    <h3 className="mb-0 text-truncate">{unit.name}</h3>
                    <p className="text-secondary my-0">{unit.status.code}</p>

                    <p className="mb-0 text-truncate">
                      <small>{unit.orgTenantBusinessName}</small>
                    </p>
                    {unit.expiredDate && (
                      <div className="text-truncate">
                        {L('AVAILABLE')}: {renderDate(unit.expiredDate)}
                      </div>
                    )}
                  </div>
                  <div className="unit-item-bg" style={{ backgroundColor: colorByStatus }}></div>
                </div>
              )
            }}
          </Draggable>
        ))}
        {sumUnits !== 0 && (
          <UnitEmpty
            width={percentUnits}
            size={floor.size - sumUnits}
            handleClick={() => {
              this.setState({ modalVisible: true, selectedUnit: undefined })
            }}
          />
        )}
      </>
    )
  }

  renderFloors = () =>
    this.state.floors.map((floor: any, inx) => (
      <Draggable key={`f-drag-${floor.id}`} draggableId={`f-${floor.id}`} index={inx}>
        {(dragProvided) => (
          <div
            className="floor-item mb-2 mr-1"
            ref={dragProvided.innerRef}
            {...dragProvided.draggableProps}
            {...dragProvided.dragHandleProps}>
            <h2 className="mb-0">{floor.name}</h2>
            <small>
              {formatNumber(floor.size)}{' '}
              <span className="text-secondary">
                m<sup>2</sup>
              </span>
            </small>
          </div>
        )}
      </Draggable>
    ))

  render() {
    const { floors, selectedBuildingId } = this.state
    const { buildingOptions } = this.props.buildingStore
    return isGranted(appPermissions.unit.page) ? (
      <div style={{ overflowX: 'hidden' }}>
        <ProjectUnitChart filters={this.state.statisticFilter} />

        <Card className="stacking-plan ant-card-border-10" bordered={false}>
          <div className="d-flex">
            <div className="w-25 mr-1">
              <label>{L('BUILDING')}</label>
              <Select
                value={selectedBuildingId}
                onChange={(id) => this.fetchData(id)}
                filterOption={false}
                style={{ width: '100%' }}>
                {renderOptions(buildingOptions)}
              </Select>
            </div>
            <div className="w-20">
              <label>{L('STATUS')}</label>
              <Select
                defaultValue={this.state.isActive}
                onChange={async (value) => {
                  this.setState({ isActive: value }), await this.fetchData(selectedBuildingId, value)
                }}
                filterOption={false}
                style={{ width: '100%' }}>
                {renderOptions(activeStatusNotAll)}
              </Select>
            </div>
          </div>
          <div className="d-flex mt-3">
            <DragDropContext onDragEnd={this.onDragEnd}>
              <Droppable droppableId="floor" direction="vertical">
                {(providedFloor) => (
                  <div className="wrap-floors" ref={providedFloor.innerRef} {...providedFloor.droppableProps}>
                    {this.renderFloors()}
                    {providedFloor.placeholder}
                  </div>
                )}
              </Droppable>
              <div
                style={{
                  flex: '0 1 100%',
                  overflowX: 'auto',
                  overflowY: 'hidden'
                }}>
                {floors.map((floor: any) => (
                  <Droppable key={`f-drop-${floor.id}`} droppableId={`f-${floor.id}`} direction="horizontal">
                    {(providedUnit) => (
                      <div
                        className="d-flex wrap-units mb-2"
                        ref={providedUnit.innerRef}
                        {...providedUnit.droppableProps}
                        style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                        {this.renderUnitInFloor(floor)}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          </div>
        </Card>
        <ModalUnit
          unitStore={this.props.unitStore}
          projectStore={this.props.projectStore}
          visible={this.state.modalVisible}
          setVisible={async (v) => {
            this.setState({ modalVisible: v })
            await this.fetchData(selectedBuildingId)
          }}
          selectedUnit={this.state.selectedUnit}
        />
      </div>
    ) : (
      <NoRole />
    )
  }
}

export default ProjectStackingPlan
