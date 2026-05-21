import React, { useEffect, useState } from 'react'
import { Card, Spin } from 'antd'
import { useDrop } from 'react-dnd'
import { PIPELINE_VIEW_TYPES } from '../enum'
import { IPipelineContainerProps } from './PipeLine.d'
import { PipelineItem } from './PipelineItem'
import InfiniteScroll from 'react-infinite-scroller'

export const PipelineContainer: React.FC<IPipelineContainerProps> = ({
  index,
  status,
  listPlanMaintenance,
  navigateToDetail,
  onFinishedDrop,
  planMaintenancePipelineStore
}) => {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (listPlanMaintenance) {
      setPlans(listPlanMaintenance.items)
    }
  }, [listPlanMaintenance])
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: PIPELINE_VIEW_TYPES.BOX,
    drop: () => ({ statusId: status.id }),
    collect: (monitor: any) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })

  const isActive = canDrop && isOver
  const pipelineStyles = isActive ? { border: '1.5px dashed #b0b0b0' } : {}
  const handleLoadMore = async () => {
    setLoading(true)
    try {
      await planMaintenancePipelineStore.getMore(status.id, {
        maxResultCount: 20,
        skipCount: listPlanMaintenance.items.length
      })
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }
  return (
    <Card className="pipeline-view-container" style={{ borderColor: status.colorCode }} key={index}>
      <div key={`status`} style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
          <div className="pipeline-view-heading">{status.name}</div>
          <Spin spinning={loading} className="h-100 w-100">
            <div className="wrap-pipeline-scrollable" ref={drop} style={pipelineStyles}>
              <InfiniteScroll
                initialLoad={false}
                pageStart={0}
                loadMore={handleLoadMore}
                hasMore={plans.length < (listPlanMaintenance?.totalCount || 20)}
                useWindow={false}>
                {plans.map((item, planIndex) => (
                  <PipelineItem
                    pm={item}
                    planIndex={planIndex}
                    statusId={status.id}
                    navigateToDetail={navigateToDetail}
                    onFinishedDrop={onFinishedDrop}
                    key={planIndex}
                  />
                ))}
              </InfiniteScroll>
            </div>
          </Spin>
        </div>
      </div>
    </Card>
  )
}
