import { L } from '@lib/abpUtility'
import { Button } from 'antd'

const LoginSocial = () => {
  const GoogleIcon = <img src="/assets/icons/GoogleIcon.svg" height="20px" className="mx-3" />
  const AppleIcon = <img src="/assets/icons/AppleIcon.svg" height="20px" className="mx-3" />
  const MicrosoftIcon = <img src="/assets/icons/MicrosoftIcon.svg" height="20px" className="mx-3" />

  return (
    <div className="w-100">
      <div className="d-inline-block  w-100">
        <Button shape="round" icon={AppleIcon} className="w-100 my-1 text-left">
          {L('CONTINUE_WITH_APPLE')}
        </Button>
      </div>
      <div className="d-inline-block w-100">
        <Button shape="round" icon={GoogleIcon} className="w-100 my-1 text-left">
          {L('CONTINUE_WITH_GOOGLE')}
        </Button>
      </div>
      <div className="d-inline-block  w-100">
        <Button shape="round" icon={MicrosoftIcon} className="w-100 my-1 text-left">
          {L('CONTINUE_WITH_MICROSOFT')}
        </Button>
      </div>
    </div>
  )
}

export default LoginSocial
