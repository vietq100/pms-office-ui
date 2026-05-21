import { Form, Modal, Row, Col, Input } from 'antd'
import { L, isGrantedAny } from '@lib/abpUtility'
import { appPermissions, dateTimeFormat } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import rules from './validation'
import React from 'react'
import FormSelect from '@components/FormItem/FormSelect'
import FormTextArea from '@components/FormItem/FormTextArea'
import FormDateRangePicker from '@components/FormItem/FormDateRangePicker'
import amenityService from '@services/booking/amenityService'
import { debounce } from 'lodash'
import { removeDuplicateObjectInArray } from '@lib/helper'
import Select from 'antd/es/select'
import HomeOutlined from '@ant-design/icons/HomeOutlined'
import UserOutlined from '@ant-design/icons/UserOutlined'
import PhoneOutlined from '@ant-design/icons/PhoneOutlined'
import projectService from '@services/project/projectService'
import FormCurrency from '@components/FormItem/FormCurrency'

export const MonthlyPackageDetailModal = ({ visible, onCancel, dataDetail, amenityStore }: any) => {
  React.useEffect(() => {
    searchUnits('')
    searchAmenity('')
  }, [])
  React.useEffect(() => {
    if (visible && amenityStore?.monthlyPackageDetail) {
      form.setFieldsValue(amenityStore?.monthlyPackageDetail)
      const res = removeDuplicateObjectInArray([...amenities, ...amenityStore.monthlyPackageDetail.amenities], 'id')
      setAmenities(res)
    } else {
      form.resetFields()
    }
  }, [visible])
  const [form] = Form.useForm()
  const handleSubmit = async () => {
    const formValues = await form.validateFields()

    if (!amenityStore?.monthlyPackageDetail?.id) {
      const unitId = formValues.unitUserId.split('-')[0]
      const userId = formValues.unitUserId.split('-')[1]
      await amenityStore.updateMonthlyPackageDetail({
        ...formValues,
        unitId: unitId,
        userId: userId
      })
    } else {
      await amenityStore.updateMonthlyPackageDetail({
        ...formValues,
        unitId: amenityStore?.monthlyPackageDetail?.unitId,
        userId: amenityStore?.monthlyPackageDetail?.unitUserId.split('-')[1]
      })
    }

    onCancel()
  }
  const [amenities, setAmenities] = React.useState<any[]>([])
  const searchAmenity = async (keyword) => {
    const res = await amenityService.getSearchAmenity({
      keyword,
      isMonthlyTicket: true
    })
    setAmenities(res.items.map((item) => ({ id: item.id, label: item.amenityName })))
  }
  const [units, setUnits] = React.useState<any[]>([])
  const searchUnits = async (keyword) => {
    const res = await projectService.filterUnitUsers({
      keyword,
      isActive: true
    })
    setUnits(res)
  }
  return (
    <Modal
      title={dataDetail?.id ? L('EDIT_MONTHLY_PACKAGE') : L('ADD_MONTHLY_PACKAGE')}
      open={visible}
      okText={L('BTN_SAVE')}
      onOk={handleSubmit}
      cancelText={L('BTN_CANCEL')}
      onCancel={onCancel}
      destroyOnClose
      maskClosable={false}
      okButtonProps={{
        disabled: !isGrantedAny(
          appPermissions.amenityMonthlyPackage.create,
          appPermissions.amenityMonthlyPackage.update
        ),
        className: !isGrantedAny(
          appPermissions.amenityMonthlyPackage.create,
          appPermissions.amenityMonthlyPackage.update
        )
          ? 'd-none'
          : ''
      }}>
      <Form layout="vertical" form={form} validateMessages={validateMessages} size="middle">
        <Row gutter={16}>
          {visible && !amenityStore?.monthlyPackageDetail?.id && (
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <FormSelect
                label={L('MONTHLY_PACKAGE_USER')}
                rule={rules.required}
                name="unitUserId"
                options={units}
                disabled={dataDetail?.id}
                selectProps={{
                  onSearch: debounce(searchUnits, 300)
                }}
                optionModal={(option, index) => {
                  return !option.displayName ? null : (
                    <Select.Option key={index} value={option.optionValue}>
                      {option.displayName}
                      <div className="text-muted small" style={{ display: 'flex' }}>
                        <span className="mr-2 text-truncate" style={{ flex: 1 }}>
                          <HomeOutlined className="mr-1" />
                          {option.fullUnitCode}
                        </span>

                        <span className="mr-2 text-truncate" style={{ flex: 1 }}>
                          {option.emailAddress && option.emailAddress.length && (
                            <>
                              <UserOutlined className="mr-1" />
                              {option.userName}
                            </>
                          )}
                        </span>
                        <span className={'text-truncate'} style={{ flex: 1 }}>
                          {option.phoneNumber && option.phoneNumber.length && (
                            <>
                              <PhoneOutlined className="mr-1" />
                              {option.phoneNumber}
                            </>
                          )}
                        </span>
                      </div>
                    </Select.Option>
                  )
                }}
              />
            </Col>
          )}
          {visible && amenityStore?.monthlyPackageDetail?.id && (
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <Form.Item label={L('MONTHLY_PACKAGE_USER')}>
                <Input disabled={true} defaultValue={amenityStore?.monthlyPackageDetail?.user?.displayName} />
              </Form.Item>
            </Col>
          )}

          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <FormSelect
              label={L('AMENITY')}
              selectProps={{
                mode: 'multiple',
                onSearch: debounce(searchAmenity, 300)
              }}
              rule={rules.required}
              name="amenityIds"
              options={amenities}
            />
          </Col>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <FormCurrency min={0} label={L('PRICE')} name="price" />
          </Col>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <FormDateRangePicker
              dateTimeFormat={dateTimeFormat}
              name="time"
              rule={rules.required}
              label={L('PACKAGE_TIME')}
              dateTimeProps={{ showTime: true }}
            />
          </Col>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <FormTextArea label={L('DESCRIPTION')} name="description" rule={rules.description} />
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
