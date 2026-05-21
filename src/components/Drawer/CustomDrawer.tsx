import { L } from '@lib/abpUtility'
import { Button, Col, Drawer, Row, Space } from 'antd'
import React, { ReactNode } from 'react'

type Props = {
  title?: string
  titlePro?: ReactNode
  visible: boolean
  onClose: () => void
  onSave?: () => void
  onConfirm?: () => void
  useBottomAction?: boolean
  extraBottomContent?: ReactNode
  loading?: boolean
  fullWidth?: boolean
}

const CustomDrawer = (props: React.PropsWithChildren<Props>) => {
  const drawerWidth = props.fullWidth ? '100vw' : window.innerWidth < 600 ? '100vw' : '80vw'
  return (
    <Drawer
      title={props?.titlePro ? props?.titlePro : <span style={{ fontWeight: 600 }}>{props.title}</span>}
      placement="right"
      closable={false}
      onClose={props.onClose}
      open={props.visible}
      width={drawerWidth}
      extra={
        !props.useBottomAction && (
          <Space>
            <Button onClick={props.onClose} shape="round">
              {L('BTN_CANCEL')}
            </Button>

            <Button type="primary" onClick={props.onSave} shape="round">
              {L('BTN_SAVE')}
            </Button>
          </Space>
        )
      }>
      <div className="mb-3">{props.children}</div>
      {props.useBottomAction && (
        <>
          <div style={{ height: 60 }} />
          <div className="bottom-action-style">
            <Row className="d-flex justify-content-between align-items-center">
              <Col span={16} className="pl-1 pt-2">
                {props.extraBottomContent}
              </Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                <Button className="mr-1" onClick={props.onClose} shape="round">
                  {L('BTN_BACK')}
                </Button>
                {props.onConfirm && (
                  <Button
                    loading={props.loading}
                    type="primary"
                    className="mr-1"
                    onClick={props.onConfirm}
                    shape="round">
                    {L('BTN_CONFIRM')}
                  </Button>
                )}
                {props.onSave && (
                  <Button loading={props.loading} type="primary" className="mx-1" onClick={props.onSave} shape="round">
                    {L('BTN_SAVE')}
                  </Button>
                )}
              </Col>
            </Row>
          </div>
        </>
      )}
      <style scoped>{`
      .ant-drawer-content {
        position: relative !important;
      }
      .ant-drawer-body {
        padding-top: 4px !important;
      }
      .bottom-action-style {
        position: absolute  !important;
        width: 100%;
        bottom: 4px;
        right: 0;
        height: 60px;
        background-color: #FAF8EE
      }
      `}</style>
    </Drawer>
  )
}

export default CustomDrawer
