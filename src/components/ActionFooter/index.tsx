import * as React from 'react'
import Row from 'antd/lib/grid/row'
import Col from 'antd/lib/grid/col'

export interface IActionFooterProps {
  show?: boolean
}

const ActionFooter: React.FunctionComponent<IActionFooterProps> = ({ show, ...props }) => {
  const wrapClass = `action-footer animate__animated ${show ? 'animate__fadeInUp' : 'animate__fadeOutDown'}`
  return (
    <div className={wrapClass}>
      <Row>
        <Col className="wrap-action-footer">{props.children}</Col>
      </Row>
    </div>
  )
}

export default ActionFooter
