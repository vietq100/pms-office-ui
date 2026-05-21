import { Button, Modal, Tabs } from 'antd'
import { L, LNotification } from '@lib/abpUtility'
import React, { useEffect, useState } from 'react'
import AppConsts from '@lib/appconst'
const confirm = Modal.confirm
const { announcementStatus } = AppConsts
const { announcementTypes } = AppConsts
export const PreviewAnnouncement = ({ visible, onCancel, data, statusCode, onOk }: any) => {
  const [textInMobile, setTextInMobile] = useState<any>()
  const [textInEmail, setTextInEmail] = useState<any>()
  useEffect(() => {
    if (visible === true) {
      resizeTextInMobile()
      resizeTextEmail()
    }
  }, [visible])
  const [onShow, setOnShow] = useState(false)
  const tabKeys = {
    announcementApp: 'TAB_ANNOUNCEMENT_CONTENT_APP',
    announcemenEmail: 'TAB_ANNOUNCEMENT_CONTENT_EMAIL'
  }

  const resizeTextInMobile = () => {
    const htmlString = data?.content?.htmlText
    const modifyImageSize = (html) => {
      const tempElement = document.createElement('div')
      tempElement.innerHTML = html

      const imgElements = Array.from(tempElement.getElementsByTagName('img'))

      for (const img of imgElements) {
        img.style.maxHeight = '100%' // Set the desired height
      }

      const tableElements = Array.from(tempElement.getElementsByTagName('table'))

      for (const table of tableElements) {
        table.style.maxWidth = '80%' // Set the desired height
      }

      return tempElement.innerHTML
    }

    const modifiedHtmlString = modifyImageSize(htmlString).replace(/font-size:/g, 'font-size: 11px;')
    setTextInMobile(modifiedHtmlString)
  }
  const resizeTextEmail = () => {
    const htmlString = data?.content?.htmlText
    const modifyImageSize = (html) => {
      const tempElement = document.createElement('div')
      tempElement.innerHTML = html

      const imgElements = Array.from(tempElement.getElementsByTagName('img'))

      for (const img of imgElements) {
        img.style.maxHeight = '100%' // Set the desired height
      }

      return tempElement.innerHTML
    }

    const modifiedHtmlString = modifyImageSize(htmlString)
    setTextInEmail(modifiedHtmlString)
  }
  const [tabActiveKey, setTabActiveKey] = React.useState<any>(tabKeys.announcementApp)

  const onNextToSave = () => {
    if (statusCode === announcementStatus.readyForPublish) {
      confirm({
        title: LNotification('PREVIEW_CONFIRM_SEND_TITLE'),
        content: LNotification('PREVIEW_CONFIRM_SEND_CONTENT'),
        okText: L('YES'),
        cancelText: L('NO'),
        onOk: async () => {
          onOk()
          onCancel()
        }
      })
    }
    if (statusCode === announcementStatus.completed) {
      setOnShow(true)
    }
  }

  const onSend = () => {
    onOk()
    setOnShow(false)
    onCancel()
  }

  const changeTab = (tabKey) => {
    setTabActiveKey({ tabActiveKey: tabKey })
  }
  const divStyle = {
    width: '22vw',
    border: '1px solid #000000',
    height: '70vh',
    overflow: 'auto'
  }

  const contentStyle = {
    maxWidth: '100%',
    transform: 'scale(1)',
    transformOrigin: 'top left'
  }

  const divEmailStyle = {
    width: '70vw',
    border: '1px solid #000000',
    height: '70vh',
    overflow: 'auto'
  }

  const contentEmailStyle = {
    transform: 'scale(1)'
  }
  return (
    <>
      <Modal
        width={'70vw'}
        title={L('PREVIEW_ANNOUNCEMENT_BEFORE_SEND')}
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={statusCode === announcementStatus.readyForPublish ? L('BTN_SEND_ANNO') : L('BTN_NEXT')}
        onCancel={onCancel}
        onOk={onNextToSave}
        destroyOnClose
        maskClosable={false}
        style={{ display: 'flex', justifyContent: 'center', top: 15 }}>
        <Tabs defaultActiveKey={tabActiveKey} onTabClick={() => changeTab}>
          {(data?.campaignType === announcementTypes.email_inApp || data?.campaignType === announcementTypes.inApp) && (
            <Tabs.TabPane
              tab={L(tabKeys.announcementApp)}
              key={tabKeys.announcementApp}
              style={{ justifyContent: 'center' }}>
              <div style={divStyle}>
                <div style={contentStyle} dangerouslySetInnerHTML={{ __html: textInMobile }} />
              </div>
            </Tabs.TabPane>
          )}
          {(data?.campaignType === announcementTypes.email_inApp || data?.campaignType === announcementTypes.email) && (
            <Tabs.TabPane
              tab={L(tabKeys.announcemenEmail)}
              key={tabKeys.announcemenEmail}
              style={{ justifyContent: 'center' }}>
              <div style={divEmailStyle}>
                <div style={contentEmailStyle} dangerouslySetInnerHTML={{ __html: textInEmail }} />
              </div>
            </Tabs.TabPane>
          )}
        </Tabs>
      </Modal>
      {onShow && (
        <Modal
          open={onShow}
          width={600}
          maskClosable={true}
          title={L('SEND_ANNO')}
          onCancel={() => setOnShow(false)}
          footer={[
            <Button key="back" onClick={() => setOnShow(false)}>
              {L('BTN_CANCEL')}
            </Button>,
            <Button key="submit" type="primary" onClick={onSend}>
              {L('BTN_SEND_ONLY_NO_RECEIVER')}
            </Button>
          ]}>
          {L('PREVIEW_TO_SENT_CONTENT')}
        </Modal>
      )}
    </>
  )
}
