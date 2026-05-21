import { L } from '@lib/abpUtility'
import Col from 'antd/lib/col'
import Row from 'antd/lib/row'

const Welcome = () => {
  const currentYear = new Date().getFullYear()
  return (
    <>
      <Row className="page-welcome">
        <Col span={24} className="col-right">
          <span className="footer-copy-right">{L('COPY_RIGHT_{0}', currentYear)}</span>
        </Col>
      </Row>
      <style scoped>{`
      .page-welcome {
        height: 100%;
        width: 100%
      }
      .col-right {
        display: flex;
        width: 100%;
        align-items: flex-end;
        justify-content: center;
        background-repeat: no-repeat;
        background-position: center;
        background-image: url('../../assets/images/auth/bg-frame.svg');
  
        .footer-copy-right {
          position: absolute;
          bottom: 20px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.87);
          font-family: Open Sans, sans-serif;;
          font-style: normal;
          font-weight: normal;
        }
      }
      `}</style>
    </>
  )
}

export default Welcome
