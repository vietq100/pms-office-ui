import { useEffect, useState } from 'react'
import { Row, Col, Drawer, Alert } from 'antd'
import { L, LNotification } from '@lib/abpUtility'
import { notifySuccess } from '@lib/helper'
import Button from 'antd/lib/button'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

const SortDrawer = ({ visible, data, handleSave, setVisibleDrawer }) => {
  const [sortItems, setSortItems] = useState(data || [])

  useEffect(() => {
    if (data) {
      setSortItems(data)
    }
  }, [data])

  const onDragEnd = async ({ source: src, destination: des }: DropResult) => {
    if (!des || src.droppableId !== des.droppableId) return

    setSortItems(reorder(sortItems, src.index, des.index))
  }

  const onSave = async () => {
    const data = sortItems.map((item) => item.id)
    await handleSave(data)
    notifySuccess(LNotification('SUCCESS'), LNotification(L('SAVING_SUCCESSFULLY')))
    setVisibleDrawer()
  }

  return (
    <Drawer
      title={L('DRAWER_SORT_TITLE')}
      width={420}
      onClose={() => setVisibleDrawer(false)}
      open={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div className="text-right">
          <Button onClick={() => setVisibleDrawer(false)} className="mr-1">
            {L('BTN_CANCEL')}
          </Button>
          <Button onClick={() => onSave()} type="primary">
            {L('BTN_SAVE')}
          </Button>
        </div>
      }>
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 24, offset: 0 }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Alert message={L('DRAG_DROP_TO_REARRANGE_ORDER_MESSAGE')} type="info" />
            <div className="d-flex mt-3">
              <Droppable droppableId="sortItem" direction="vertical">
                {(providedSortItems) => (
                  <div style={{ flex: '0 1 100%' }} ref={providedSortItems.innerRef}>
                    {(sortItems || []).map((item: any, inx) => (
                      <Draggable key={`f-drag-${item.id}`} draggableId={`f-${item.id}`} index={inx}>
                        {(dragProvided) => (
                          <div
                            className="sort-item mb-2 mr-1"
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}>
                            {item.name}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {providedSortItems.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>
        </Col>
      </Row>
    </Drawer>
  )
}

export default SortDrawer
