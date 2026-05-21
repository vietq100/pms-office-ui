import * as React from 'react'
import { Card } from 'antd'

export interface IDataTableProps {
  renderActions: any
  disable?: boolean
}

const WrapPageScroll: React.FunctionComponent<IDataTableProps> = ({ renderActions, disable = false, ...props }) => {
  return (
    <>
      <div style={{ marginBottom: !disable ? '68px' : 0, paddingBottom: !disable ? '72px' : 0 }}>{props.children}</div>
      {renderActions() && (
        <>
          {!disable && (
            <div className="wrap-page-footer text-right collapse-width">
              <Card bordered={false}>{renderActions()}</Card>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default WrapPageScroll
