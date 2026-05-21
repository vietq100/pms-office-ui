import HomeOutlined from '@ant-design/icons/HomeOutlined'
import MailOutlined from '@ant-design/icons/MailOutlined'
import PhoneOutlined from '@ant-design/icons/PhoneOutlined'
import { L } from '@lib/abpUtility'
import userService from '@services/administrator/user/userService'
import Avatar from 'antd/lib/avatar'
import Card from 'antd/lib/card'
import Meta from 'antd/lib/card/Meta'
import React from 'react'

type Props = {
  detail: any
}

const ResidentDetailCard = ({ detail }: Props) => {
  React.useEffect(() => {
    if (detail?.profilePictureId) {
      userService.getProfilePictureById(detail.profilePictureId).then((res) => setUrl(res))
    } else {
      setUrl(undefined)
    }
  }, [detail])
  const [url, setUrl] = React.useState<string | undefined>(undefined)
  return (
    <Card className="mt-3 pb-1">
      <div className="text-large pt-2 pb-1">{L('RESIDENT_INFORMATION')}</div>
      {detail?.id ? (
        <>
          <Meta
            avatar={<Avatar src={url} />}
            title={detail?.displayName}
            description={
              <div>
                <div>
                  <MailOutlined className="text-muted" /> {detail.emailAddress}
                </div>
                <div>
                  <PhoneOutlined className="text-muted" /> {detail.phoneNumber}
                </div>
                <div>
                  <HomeOutlined className="text-muted" /> {detail.fullUnitCode}
                </div>
              </div>
            }
          />
        </>
      ) : (
        L('NO_RESIDENT_DETAIL')
      )}
    </Card>
  )
}

export default ResidentDetailCard
