import * as React from 'react'
import { Button, Card, Col, Row } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { L } from '@lib/abpUtility'

export interface IFilterProps {
  title?: string
  showHeader?: boolean
  handleRefresh?: () => void
  actionGroups?: () => React.ReactNode
  children?: React.ReactNode
}

const Filter: React.FunctionComponent<IFilterProps> = ({
  title,
  showHeader = true,
  handleRefresh,
  actionGroups,
  ...props
}) => {
  return (
    <>
      {!showHeader || (
        <Row>
          <Col
            xs={{ span: 10, offset: 0 }}
            sm={{ span: 10, offset: 0 }}
            md={{ span: 10, offset: 0 }}
            lg={{ span: 10, offset: 0 }}
            xl={{ span: 10, offset: 0 }}
            xxl={{ span: 10, offset: 0 }}>
            <h3>{title}</h3>
          </Col>
          <Col
            className={'text-right'}
            xs={{ span: 14, offset: 0 }}
            sm={{ span: 14, offset: 0 }}
            md={{ span: 14, offset: 0 }}
            lg={{ span: 14, offset: 0 }}
            xl={{ span: 14, offset: 0 }}
            xxl={{ span: 14, offset: 0 }}>
            {actionGroups && actionGroups()}
            {handleRefresh && (
              <Button
                type="primary"
                className="ml-2"
                size={'small'}
                shape="round"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}>
                {L('BTN_REFRESH')}
              </Button>
            )}
          </Col>
        </Row>
      )}
      <Card bordered={false} style={{ borderRadius: '24px' }}>
        {props.children}
      </Card>
    </>
  )
}

export default Filter
