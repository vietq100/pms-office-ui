import React, { useRef } from 'react'
import { Button, Row, Col } from 'antd'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'
import { CloseOutlined } from '@ant-design/icons'
import { XYCoord } from 'dnd-core'
import { SubCategoryItemProps } from './SubCategory.d'

const style = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
  cursor: 'move'
}

interface DragItem {
  index: number
  id: string
  type: string
}

export const SubCategoryItem: React.FC<SubCategoryItemProps> = ({
  id,
  text,
  isActive,
  index,
  moveCard,
  onFinishedDrag,
  activateOrDeactivate
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [, drop] = useDrop({
    accept: 'card',
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) {
        return
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      moveCard(dragIndex, hoverIndex)
      item.index = hoverIndex
    }
  })

  const [{ isDragging }, drag] = useDrag({
    item: { type: 'card', id, index },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging()
    }),
    end(item: any | undefined, monitor: any) {
      const dropResult: any = monitor.getDropResult()
      if (item && dropResult) {
        onFinishedDrag(item, dropResult)
      }
    }
  })

  const opacity = isDragging ? 0 : 1
  drag(drop(ref))
  return (
    <div ref={ref} style={{ ...style, opacity }}>
      <Row>
        <Col flex="auto" style={{ textAlign: 'left' }}>
          {text}
        </Col>
        <Col style={{ textAlign: 'right' }}>
          <Button
            size="small"
            className="ml-1"
            shape="circle"
            icon={<CloseOutlined />}
            onClick={() => activateOrDeactivate(id, !isActive)}
          />
        </Col>
      </Row>
    </div>
  )
}
