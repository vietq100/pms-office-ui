import { L } from '@lib/abpUtility'
import { Button, Card, Input } from 'antd'
import React from 'react'
import './index.less'

interface Props {
  loading: boolean | undefined
  handleConfirmCodeSubmit: (code: string) => void
  handleBackToLogin: () => void
}

const SecurityConfirm = (props: Props) => {
  const [code, setCode] = React.useState('')
  return (
    <>
      <Card className="rounded-pill h-100 d-flex flex-column justify-content-around align-items-center column-wrap">
        <div className="text-center my-3">
          <img src="../../../assets/images/logo-horizontal.png" alt="logo-horizontal" className="logo-horizontal" />
          <br />
          <img src="../../../assets/images/auth/union.png" alt="logo-union" />
          <p className="mt-3 welcome-message">{L('WELCOME_MESSAGE')}</p>
        </div>
        <div style={{ height: '40px' }} />
        <h3 className="my-3 text-center">{L('SECURITY_CODE_SENT_TO_YOUR_EMAIL')}</h3>
        <Input className="my-3" onChange={(event) => setCode(event.target.value)} />
        <Button
          style={{ width: '100%', marginTop: '16px' }}
          onClick={() => props.handleConfirmCodeSubmit(code)}
          type="primary"
          loading={props.loading || false}
          shape="round">
          {L('BTN_LOGIN')}
        </Button>
        <Button onClick={() => props.handleBackToLogin()} style={{ width: '100%', marginTop: '16px' }} shape="round">
          {L('BTN_GO_BACK')}
        </Button>
      </Card>
    </>
  )
}

export default SecurityConfirm
