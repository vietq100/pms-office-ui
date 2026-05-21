import DataTable from '@components/DataTable'
import CurrencyInput from '@components/Inputs/CurrencyInput'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { formatCurrency, renderDate, renderOptions } from '@lib/helper'
import { Button, Col, Collapse, DatePicker, Form, Input, Row, Select, Table } from 'antd'
import { useForm } from 'antd/es/form/Form'
// import Modal from 'antd/lib/modal/Modal'
import moment from 'moment'
import React from 'react'
const { formVerticalLayout } = AppConsts
const { Panel } = Collapse

interface Props {
  onSave: (values: any) => void
  data: any
  onCancel: () => void
}
interface someProps {
  processPaymentType: number
  startDate: string
  dueDate: string
  totalAmount: number
}
const yearOptions = [
  { value: 1, name: 1 },
  { value: 2, name: 2 },
  { value: 3, name: 3 },
  { value: 4, name: 4 },
  { value: 5, name: 5 }
]

const processPaymentType = [
  { value: 1, name: L('YEAR') },
  { value: 2, name: L('MONTH') },
  { value: 3, name: L('QUARTER') }
]

const columns = [
  {
    title: L('YEAR'),
    dataIndex: 'year',
    key: 'year',
    width: 140
  },
  {
    title: L('PAYMENT_TYPE'),
    dataIndex: 'processPaymentType',
    key: 'processPaymentType',
    width: 180,
    render: (processPaymentType) => (
      <>
        {processPaymentType === 1 && L('YEAR')}
        {processPaymentType === 2 && L('MONTH')}
        {processPaymentType === 3 && L('QUARTER')}
      </>
    )
  },
  {
    title: L('TOTAL_AMOUNT'),
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    width: 320,
    render: (totalAmount) => <>{formatCurrency(totalAmount)}</>
  },
  {
    title: L('START_DATE'),
    dataIndex: 'startDate',
    key: 'startDate',
    width: 260,
    render: (startDate) => <div>{renderDate(startDate)}</div>
  },
  {
    title: L('DUE_DATE'),
    dataIndex: 'dueDate',
    key: 'dueDate',
    width: 260,
    render: (dueDate) => <div>{renderDate(dueDate)}</div>
  },
  {
    title: L('STATUS'),
    dataIndex: 'status',
    key: 'status',
    width: 200,
    render: () => <div>{L('UN_BILLED')}</div>
  }
]
const ModalContractPayment = ({ onCancel, onSave, data }: Props) => {
  const [form] = useForm()
  const [isGenerated, setIsGenerated] = React.useState(false)
  const [yearValues, setYearValues] = React.useState<any>(0)
  const [generateData, setGenerateData] = React.useState<any[]>([])
  const [progressPaymentDetails, setProgressPaymentDetails] = React.useState<any>()
  React.useEffect(() => {
    if (data.progressPayment) {
      setGenerateData(data.progressPayment.progressPaymentDetails)
      setIsGenerated(true)
      form.setFieldsValue(data.progressPayment)
    } else {
      clearForm()
    }
  }, [data])
  const handleSave = async () => {
    const values = await form.getFieldsValue()
    onSave({
      ...values,
      progressPaymentDetails: generateData
    })
    setProgressPaymentDetails(undefined)
    setYearValues(0)
  }
  const clearForm = () => {
    setProgressPaymentDetails(undefined)
    setGenerateData([])
    setYearValues(0)
    setIsGenerated(false)
    form.resetFields()
  }
  const handleChangeForm = async (index, key, value) => {
    let newI
    if (progressPaymentDetails !== undefined) {
      const newProgressPaymentDetails = [...progressPaymentDetails]
      newI = { ...newProgressPaymentDetails[index], [key]: value }
      newProgressPaymentDetails.splice(index, 1, newI)
      setProgressPaymentDetails(newProgressPaymentDetails)
    }
  }

  const handleGenerate = () => {
    const generateData: any[] = []
    progressPaymentDetails.map((item, index) => {
      if (item.processPaymentType === 2) {
        const processItem1 = {
          year: index + 1,
          processPaymentType: 2,
          startDate: moment(item.startDate).toISOString(),
          dueDate: moment(item.startDate).add(item.dueDate, 'd').toISOString(),
          totalAmount: item.totalAmount,
          description: form.getFieldValue('description')
        }
        const processItem2 = {
          ...processItem1,
          startDate: moment(item.startDate).add(1, 'M').toISOString(),
          dueDate: moment(item.startDate).add(1, 'M').add(item.dueDate, 'd').toISOString()
        }
        const processItem3 = {
          ...processItem1,
          startDate: moment(item.startDate).add(2, 'M').toISOString(),
          dueDate: moment(item.startDate).add(2, 'M').add(item.dueDate, 'd').toISOString()
        }
        const processItem4 = {
          ...processItem1,
          startDate: moment(item.startDate).add(3, 'M').toISOString(),
          dueDate: moment(item.startDate).add(3, 'M').add(item.dueDate, 'd').toISOString()
        }
        const processItem5 = {
          ...processItem1,
          startDate: moment(item.startDate).add(4, 'M').toISOString(),
          dueDate: moment(item.startDate).add(4, 'M').add(item.dueDate, 'd').toISOString()
        }
        const processItem6 = {
          ...processItem1,
          startDate: moment(item.startDate).add(5, 'M').toISOString(),
          dueDate: moment(item.startDate).add(5, 'M').add(item.dueDate, 'd').toISOString()
        }
        const processItem7 = {
          ...processItem1,
          startDate: moment(item.startDate).add(6, 'M').toISOString(),
          dueDate: moment(item.startDate).add(6, 'M').add(item.dueDate, 'd').toISOString()
        }
        const processItem8 = {
          ...processItem1,
          startDate: moment(item.startDate).add(7, 'M').toISOString(),
          dueDate: moment(item.startDate).add(7, 'M').add(item.dueDate, 'd').toISOString()
        }
        const processItem9 = {
          ...processItem1,
          startDate: moment(item.startDate).add(8, 'M').toISOString(),
          dueDate: moment(item.startDate).add(8, 'M').add(item.dueDate, 'd').toISOString()
        }
        const processItem10 = {
          ...processItem1,
          startDate: moment(item.startDate).add(9, 'M').toISOString(),
          dueDate: moment(item.startDate).add(9, 'M').add(item.dueDate, 'd').toISOString()
        }
        const processItem11 = {
          ...processItem1,
          startDate: moment(item.startDate).add(10, 'M').toISOString(),
          dueDate: moment(item.startDate).add(10, 'M').add(item.dueDate, 'd').toISOString()
        }
        const processItem12 = {
          ...processItem1,
          startDate: moment(item.startDate).add(11, 'M').toISOString(),
          dueDate: moment(item.startDate).add(11, 'M').add(item.dueDate, 'd').toISOString()
        }
        generateData.push(
          processItem1,
          processItem2,
          processItem3,
          processItem4,
          processItem5,
          processItem6,
          processItem7,
          processItem8,
          processItem9,
          processItem10,
          processItem11,
          processItem12
        )
      } else if (item.processPaymentType === 3) {
        const processItem1 = {
          year: index + 1,
          processPaymentType: 3,
          startDate: moment(item.startDate).toISOString(),
          dueDate: moment(item.startDate).add(item.dueDate, 'd').toISOString(),
          totalAmount: item.totalAmount,
          description: form.getFieldValue('description')
        }
        const processItem2 = {
          ...processItem1,
          startDate: moment(item.startDate).add(3, 'M').toISOString(),
          dueDate: moment(item.startDate).add(3, 'M').add(item.dueDate, 'd').toISOString()
        }
        const processItem3 = {
          ...processItem1,
          startDate: moment(item.startDate).add(6, 'M').toISOString(),
          dueDate: moment(item.startDate).add(6, 'M').add(item.dueDate, 'd').toISOString()
        }
        const processItem4 = {
          ...processItem1,
          startDate: moment(item.startDate).add(9, 'M').toISOString(),
          dueDate: moment(item.startDate).add(9, 'M').add(item.dueDate, 'd').toISOString()
        }
        generateData.push(processItem1, processItem2, processItem3, processItem4)
      } else {
        const processItem = {
          year: index + 1,
          processPaymentType: 1,
          startDate: moment(item.startDate).toISOString(),
          dueDate: moment(item.startDate).add(item.dueDate, 'd').toISOString(),
          totalAmount: item.totalAmount,
          description: form.getFieldValue('description')
        }
        generateData.push(processItem)
      }
    })
    setGenerateData(generateData)
    setIsGenerated(true)
  }
  React.useEffect(() => {
    const newItem: someProps = {
      processPaymentType: 0,
      startDate: '',
      dueDate: '',
      totalAmount: 0
    }
    const newArrayItem = Array.from(Array(yearValues).keys()).map(() => {
      return newItem
    })
    setProgressPaymentDetails(newArrayItem)
  }, [yearValues])

  const handleClear = () => {
    clearForm()
    onCancel()
  }
  return (
    // <Modal
    //   visible={visible}
    //   cancelText={L('BTN_CANCEL')}
    //   okText={L('BTN_SAVE')}
    //   onCancel={() => {
    //     onCancel()
    //   }}
    //   onOk={handleSave}
    //   title={L('PROCESS_PAYMENTS')}
    //   width={'90%'}
    // >
    <Collapse bordered={false}>
      <Panel header={L('PROCESS_PAYMENTS')} key="1">
        <Form form={form} layout={'vertical'} size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('YEAR_LENGTH')} name="year" {...formVerticalLayout}>
                <Select className="full-width" onChange={(e) => setYearValues(e)}>
                  {renderOptions(yearOptions)}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('DESCRIPTION')} name="description" {...formVerticalLayout}>
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }} className="border-bottom-dashed">
              <Row gutter={[16, 0]}>
                <Col sm={{ span: 4, offset: 0 }}>{L('YEAR')}</Col>
                <Col sm={{ span: 5, offset: 0 }}>{L('PAYMENT_TYPE')}</Col>
                <Col sm={{ span: 5, offset: 0 }}>{L('VALUES')}</Col>
                <Col sm={{ span: 5, offset: 0 }}>{L('START_DATE')}</Col>
                <Col sm={{ span: 5, offset: 0 }}>{L('DUE_DATE')}</Col>
              </Row>
            </Col>

            {(progressPaymentDetails || []).map((_item, index) => (
              <Col sm={{ span: 24, offset: 0 }} className="mt-3" key={index}>
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 4, offset: 0 }}>
                    {L('YEAR')} {index + 1}
                  </Col>
                  <Col sm={{ span: 5, offset: 0 }}>
                    <Select
                      // size="large"
                      className="w-100"
                      onChange={(e) => {
                        handleChangeForm(index, 'processPaymentType', e)
                      }}>
                      {renderOptions(processPaymentType)}
                    </Select>
                  </Col>
                  <Col sm={{ span: 5, offset: 0 }}>
                    <CurrencyInput
                      onChange={(e) => {
                        handleChangeForm(index, 'totalAmount', e)
                      }}
                    />
                  </Col>
                  <Col sm={{ span: 5, offset: 0 }}>
                    <DatePicker
                      // size="large"
                      className="w-100"
                      onChange={(e) => {
                        handleChangeForm(index, 'startDate', e)
                      }}
                    />
                  </Col>
                  <Col sm={{ span: 5, offset: 0 }}>
                    {/* <InputNumber
                      size="large"
                      className="w-100"
                      onChange={(e) => {
                        handleChangeForm(index, 'dueDate', e)
                      }}
                    /> */}

                    <DatePicker
                      // size="large"
                      className="w-100"
                      onChange={(e) => {
                        handleChangeForm(index, 'dueDate', e)
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            ))}
            <div className="w-100 d-flex justify-content-end pr-3 pt-3">
              <Button size="small" type="primary" onClick={handleGenerate}>
                {L('GENERATE')}
              </Button>
            </div>
            {isGenerated && (
              <>
                <Col sm={{ span: 24, offset: 0 }} className="mt-3">
                  {L('CONTRACT_PROCESS_PAYMENT')}
                </Col>

                <DataTable>
                  <Table
                    // size="large"
                    className="custom-ant-table"
                    columns={columns}
                    pagination={false}
                    dataSource={generateData}
                    scroll={{ x: 800, scrollToFirstRowOnChange: true }}
                  />
                </DataTable>
              </>
            )}
            <div className="w-100 d-flex justify-content-end pr-3 pt-3">
              <Button size="small" className="ml-3 mr-3" onClick={handleClear}>
                {L('BTN_CANCEL')}
              </Button>
              <Button type="primary" size="small" onClick={handleSave}>
                {L('BTN_SAVE')}
              </Button>
            </div>
          </Row>
        </Form>
      </Panel>
    </Collapse>
  )
}

export default ModalContractPayment
