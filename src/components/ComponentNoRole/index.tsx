import { AppComponentListBase } from '@components/AppComponentBase'

import { L } from '@lib/abpUtility'

class NoRole extends AppComponentListBase<any, any> {
  render() {
    return (
      <>
        <label> {L('YOU_NO_ROLE')}</label>
      </>
    )
  }
}

export default NoRole
