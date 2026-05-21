import React from 'react'
import { Button, Row, Col, Modal } from 'antd'
import { PrinterOutlined } from '@ant-design/icons'
import { L } from '@lib/abpUtility'
import { toJS } from 'mobx'
import { Card } from 'antd'
import QRCode from 'qrcode.react'
import AssetStore from '@stores/facility/assetStore'

interface AssetQRCodeProps {
  visible: boolean
  assetStore: AssetStore
  onCancel: () => void
}

const AssetQRCode: React.FC<AssetQRCodeProps> = ({ assetStore, visible, onCancel }) => {
  const ids = toJS(assetStore.itemsToQRCode)
  const qrcodes = ids
    .map((id) => assetStore.pageResult.items.find((asset) => asset.id === id))
    .filter((item) => item && item.code)

  const printElement = () => {
    if (typeof window != 'undefined' && typeof document != 'undefined') {
      const innerContents = document.getElementById('printQR')!.innerHTML
      if (!innerContents) {
        return
      }

      const popupWindow = window.open(
        '',
        '_blank',
        'width=800,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no'
      )
      if (popupWindow) {
        popupWindow.document.open()
        popupWindow.document.write(`<html><head>
            <link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" />
            <link rel="stylesheet" type="text/css" href="/assets/print-a4.css" />
          </head><body onload="window.print()">${innerContents}</html>`)
        popupWindow.document.close()
      }
    }
  }

  return (
    <Modal width={700} open={visible} onCancel={onCancel} onOk={onCancel} destroyOnClose maskClosable={false}>
      <Row gutter={12} justify="end">
        <Col sm={{ span: 24, offset: 0 }}>
          <Button
            style={{ marginTop: 30 }}
            type="primary"
            icon={<PrinterOutlined />}
            onClick={printElement}
            disabled={qrcodes.length === 0}>
            {L('PRINT')}
          </Button>
        </Col>
      </Row>
      {qrcodes.length > 0 && (
        <Card className="mt-1" id="printQR">
          <Row gutter={12} justify="center" align="middle">
            <Col
              className="page"
              style={{
                padding: '10px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap'
              }}>
              {qrcodes.map((item, i) => {
                const url = `${item.code}`
                return (
                  <div style={{ padding: '10px', margin: '0 auto', width: '33%' }} key={i}>
                    <div
                      className="qrcode-item"
                      style={{
                        margin: '0 auto',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'center',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                      <QRCode
                        imageSettings={{ height: 200, width: 200 }}
                        value={url}
                        size={200}
                        level={'H'}
                        renderAs="svg"
                        includeMargin={false}
                      />
                      <div className="mt-2 text-truncate">{item.assetName}</div>
                    </div>
                  </div>
                )
              })}
            </Col>
          </Row>
        </Card>
      )}
    </Modal>
  )
}

export default AssetQRCode
