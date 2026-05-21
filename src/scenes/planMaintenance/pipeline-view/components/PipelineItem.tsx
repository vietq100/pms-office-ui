import React from 'react'
import { Tag } from 'antd'
import { useDrag, DragSourceMonitor } from 'react-dnd'
import { L } from '@lib/abpUtility'
import { renderDateTime } from '@lib/helper'
import { PIPELINE_VIEW_TYPES } from '../enum'
import { IPipelineItemProps, IPipelineDragItem, IPipelineDropResult } from './PipeLine'

export const PipelineItem: React.FC<IPipelineItemProps> = ({
  pm,
  statusId,
  planIndex,
  navigateToDetail,
  onFinishedDrop
}) => {
  const [{ opacity }, drag] = useDrag({
    item: { statusId, type: PIPELINE_VIEW_TYPES.BOX, planId: pm.id, planIndex },
    end(item: IPipelineDragItem | undefined, monitor: DragSourceMonitor) {
      const dropResult: IPipelineDropResult = monitor.getDropResult()
      if (item && dropResult) {
        onFinishedDrop(item.planId, dropResult.statusId)
      }
    },
    collect: (monitor: any) => ({
      opacity: monitor.isDragging() ? 0.5 : 1
    })
  })

  return (
    <div className="pipeline-item" key={planIndex} ref={drag} style={{ opacity }} onClick={() => navigateToDetail(pm)}>
      <div onClick={() => navigateToDetail(pm)} className="pipeline-item-drag-content">
        <div className="title">
          <span className="text-truncate">
            #{pm.id} <b>{pm.name}</b>
          </span>
          <Tag
            className="cell-round ml-2"
            color={pm.priority && pm.priority.colorCode ? pm.priority.colorCode : '#ccc'}>
            {pm.priority ? pm.priority.name : 'other'}
          </Tag>
        </div>
        <div className="description text-muted" style={{ marginTop: '5px' }}>
          <span>{pm.description}</span>
        </div>
        <div className="more-info">
          <div className="row">
            <div className="col">
              <span>{L('START_DATE')}</span>
              <label>
                <b>{L('PLANNED')}:</b> {renderDateTime(pm.startDate)}
              </label>
              <label>
                <b>{L('ACTUAL')}:</b> {renderDateTime(pm.actualStartDate)}
              </label>
            </div>
            <div className="col">
              <span>{L('END_DATE')}</span>
              <label>
                <b>{L('PLANNED')}:</b> {renderDateTime(pm.endDate)}
              </label>
              <label>
                <b>{L('ACTUAL')}:</b> {renderDateTime(pm.actualEndDate)}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
