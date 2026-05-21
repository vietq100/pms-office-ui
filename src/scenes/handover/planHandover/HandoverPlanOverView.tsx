import { randomLightColor } from '@components/DataTable/OverViewBar'
import { L } from '@lib/abpUtility'
import { hexToRGB } from '@lib/helper'
import HandoverStore from '@stores/handover/handoverStore'
import Card from 'antd/es/card'
import Collapse from 'antd/lib/collapse/Collapse'
import React from 'react'
import './statistic-item.less'

type Props = {
  handoverStore: HandoverStore
  handoverPlanOverview: any[]
}

const HandoverPlanOverView = (props: Props) => {
  React.useEffect(() => {
    props.handoverStore.getHandoverPlanOverview({})
  }, [])
  return (
    <Collapse defaultActiveKey={['0']} ghost>
      <Collapse.Panel header={<strong>{L('HANDOVER_PLAN_OVERVIEW')}</strong>} key="1">
        <div className="d-flex" style={{ overflowX: 'scroll' }}>
          <div />
          {(props.handoverStore.handoverPlanOverview || []).map((item, index) => {
            let total = 0
            let totalComplete = 0
            let isHandover = 0
            ;(item.floors || []).forEach((item: any) => {
              total = total + item.totalUnits
              totalComplete = totalComplete + item.totalCompleted
              isHandover = isHandover + item.totalInProgress
            })
            const color = item.color ?? randomLightColor()
            const backgroundColor = item.borderColorCode ?? `rgba(${hexToRGB(color)}, .1)`
            const descriptionColor = item.colorCode ?? `rgba(${hexToRGB(color)}, .95)`
            return (
              <Card
                key={index}
                bordered={false}
                style={{
                  borderRadius: 12,
                  backgroundColor,
                  minWidth: 420
                }}
                bodyStyle={{
                  display: 'flex',
                  color: descriptionColor
                }}
                className="m-1">
                <div className="d-flex align-items-center">
                  <span>
                    <div className="fw-bold fs-5">{item.building.name}</div>
                    <div className={`statistic-item-description ${totalComplete === total && 'text-success'}`}>
                      {L('COMPLETED')}&nbsp;:&nbsp;{totalComplete}/{total}
                    </div>
                    <div className="statistic-item-description">
                      {L('IS_HANDOVER')}&nbsp;:&nbsp;{isHandover}
                    </div>
                  </span>
                </div>
                <div
                  className="mx-2"
                  style={{
                    width: 2,
                    border: '1px solid lightgrey'
                  }}
                />
                <div>
                  <div>
                    <span className="fw-bold">{L('FLOORS')}</span>&nbsp;{'('}
                    {L('TOTAL')}-{L('TOTAL_COMPLETED')}-{L('IS_HANDOVER')}
                    {')'}
                  </div>
                  {(item.floors || []).map((floor, index) => (
                    <div
                      key={index}
                      className={`statistic-item-description ${
                        floor.totalUnits === floor.totalCompleted && 'text-success'
                      }`}>
                      <span className="fw-bold">{floor.floorCode}</span>&nbsp;
                      {'('}
                      {floor.totalUnits}-{floor.totalCompleted}-{floor.totalInProgress}
                      {')'}
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      </Collapse.Panel>
    </Collapse>
  )
}

export default HandoverPlanOverView
