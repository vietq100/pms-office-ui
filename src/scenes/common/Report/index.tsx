import React from 'react'
import { Button, Col, DatePicker, Form, Modal, Row } from 'antd'
import Filter from '@components/Filter'
import { L } from '@lib/abpUtility'
import WorkOrderProject from '../Dashboard/components/WorkOrderProject'
import WorkOrderType from '../Dashboard/components/WorkOrderType'
import WorkOrderStatus from '../Dashboard/components/WorkOrderStatus'
import WorkOrderEmployee from '../Dashboard/components/WorkOrderEmployee'
import WorkOrderRatingEmployee from '../Dashboard/components/WorkOrderRatingEmployee'
import { dateFormat } from '@lib/appconst'
import FeePackageSummary from '../Dashboard/components/FeeStatementReport/FeePackageSummary'
import FeeDashboardDeposit from '../Dashboard/components/FeeStatementReport/FeeDashboardDeposit'
import FormCheckbox from '@components/Inputs/CheckboxInput/FormCheckbox'
import { useNavigate } from 'react-router-dom'
import { publicLayout } from '@components/Layout/Router/router.config'
import ResidentReport from '../Dashboard/components/ResidentReport/ResidentReport'

export const reportKeys = {
  woProject: 'REPORT_WORK_ORDER_PROJECT',
  woType: 'REPORT_WORK_ORDER_TYPE',
  woStatus: 'REPORT_WORK_ORDER_STATUS',
  woEmployee: 'REPORT_WORK_ORDER_EMPLOYEE',
  woRatingEmployee: 'REPORT_WORK_ORDER_RATING_EMPLOYEE',
  feePackageSummary: 'REPORT_FEE_PACKAGE_SUMMARY',
  feeDashboardDeposit: 'REPORT_FEE_DASHBOARD_DEPOSIT'
}
const Report = () => {
  const [form] = Form.useForm()
  const [filter, setFilter] = React.useState<any>()
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleOk = async () => {
    setIsModalVisible(false)
    const result = await form.validateFields()
    setDisplayReportList(result)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }
  const [displayReportList, setDisplayReportList] = React.useState({
    woProject: true,
    woType: true,
    woStatus: true,
    woEmployee: true,
    woRatingEmployee: true,
    feePackageSummary: true,
    feeDashboardDeposit: true,
    resident: true
  })
  const handleChange = async (values) => {
    if (values) {
      const fromDate = values[0].toISOString()
      const toDate = values[1].toISOString()
      setFilter({ fromDate, toDate })
    } else {
      setFilter({ fromDate: null, toDate: null })
    }
  }
  const navigate = useNavigate()
  const handlePrintReport = () => {
    navigate({
      pathname: publicLayout.printReport.path,
      search: JSON.stringify({ displayReportList, filter })
    })
  }
  return (
    <>
      <Modal title={L('REPORT_LIST')} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form
          form={form}
          labelCol={{
            span: 8
          }}
          wrapperCol={{
            span: 16
          }}
          initialValues={displayReportList}>
          <FormCheckbox label={L('REPORT_RESIDENT')} name="resident" />
          <FormCheckbox label={L('REPORT_WORK_ORDER_PROJECT')} name="woProject" />
          <FormCheckbox label={L('REPORT_WORK_ORDER_TYPE')} name="woType" />
          <FormCheckbox label={L('REPORT_WORK_ORDER_STATUS')} name="woStatus" />
          <FormCheckbox label={L('REPORT_WORK_ORDER_EMPLOYEE')} name="woEmployee" />
          <FormCheckbox label={L('REPORT_WORK_ORDER_RATING_EMPLOYEE')} name="woRatingEmployee" />
          <FormCheckbox label={L('REPORT_FEE_PACKAGE_SUMMARY')} name="feePackageSummary" />
          <FormCheckbox label={L('REPORT_FEE_DASHBOARD_DEPOSIT')} name="feeDashboardDeposit" />
        </Form>
      </Modal>
      <Filter title={L('REPORT')}>
        <Row gutter={[16, 16]}>
          <Col sm={{ span: 12 }}>
            <DatePicker.RangePicker className="w-100" format={dateFormat} onChange={handleChange} />
          </Col>
          <Col sm={{ span: 6 }} className="text-center">
            <Button type="primary" onClick={showModal}>
              {L('CUSTOM_DISPLAY_REPORT')}
            </Button>
          </Col>
          <Col sm={{ span: 6 }} className="text-center">
            <Button type="primary" onClick={handlePrintReport}>
              {L('PRINT_REPORT')}
            </Button>
          </Col>
        </Row>
      </Filter>
      <div className="m-2" />
      <Row>
        {displayReportList.woProject && (
          <Col sm={{ span: 24 }}>
            <WorkOrderProject filters={filter} />
          </Col>
        )}
      </Row>
      <Row gutter={[16, 16]} className="mt-3">
        {displayReportList.resident && (
          <Col sm={{ span: 24 }}>
            <ResidentReport filters={filter} />
          </Col>
        )}
        {displayReportList.woType && (
          <Col sm={{ span: 12 }}>
            <WorkOrderType filters={filter} />
          </Col>
        )}
        {displayReportList.woStatus && (
          <Col sm={{ span: 12 }}>
            <WorkOrderStatus filters={filter} />
          </Col>
        )}
        {displayReportList.woEmployee && (
          <Col sm={{ span: 24 }}>
            <WorkOrderEmployee filters={filter} />
          </Col>
        )}
        {displayReportList.woRatingEmployee && (
          <Col sm={{ span: 24 }}>
            <WorkOrderRatingEmployee filters={filter} />
          </Col>
        )}
        {displayReportList.feePackageSummary && (
          <Col sm={{ span: 24 }}>
            <FeePackageSummary filters={filter} />
          </Col>
        )}
        {displayReportList.feeDashboardDeposit && (
          <Col sm={{ span: 24 }}>
            <FeeDashboardDeposit filters={filter} />
          </Col>
        )}
      </Row>
    </>
  )
}

export default Report
