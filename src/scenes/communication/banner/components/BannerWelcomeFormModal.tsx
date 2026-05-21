import { useEffect, useState } from 'react'
import { Form, Modal, Row, Col, DatePicker } from 'antd'
import { L, LError, isGranted } from '@lib/abpUtility'
import AppConsts, { appPermissions, dateTimeFormat, fileTypeGroup } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import rules from './validation'
import FormTextArea from '@components/FormItem/FormTextArea'
import FormInput from '@components/FormItem/FormInput'
import ConfirmReason from '@components/Modals/ConfirmReason'
import FormSwitch from '@components/FormItem/FormSwitch'

import FormSelect from '@components/FormItem/FormSelect'
import FileUploadWrapV2 from '@components/FileUploadV2'
import dayjs from 'dayjs'

const { formVerticalLayout, bannerTypeIds } = AppConsts

const disabledDate = (current) => {
  return current < dayjs().subtract(1, 'day') ? true : false
}

const { RangePicker } = DatePicker
const AnnouncementFormModal = ({ visible, data, handleOK, handleCancel, bannerStore, fileStore }) => {
  const [form] = Form.useForm()
  const [initialValues, setInitialValues] = useState({})
  const [visibleConfirm, setVisibleConfirm] = useState(false)
  const [fileLength, setFileLength] = useState(0)
  const [files, setFiles] = useState([] as any)
  const [isBanner, setIsBanner] = useState(false)

  useEffect(() => {
    bannerStore.getBannerWelcomeTypes()

    setInitialValues(data)
    if (data?.id) {
      form.setFieldsValue({
        ...data,
        fromToDate: [dayjs(data.startDate), dayjs(data.endDate)]
      })
    } else {
      form.resetFields()
    }
  }, [data])

  const onRemoveFile = (file) => {
    const index = files.indexOf(file)
    const newFileList = files
    newFileList.splice(index, 1)
    setFiles(newFileList)
  }

  const beforeUploadFile = (file) => {
    setFiles([...files, file])
    return false
  }

  const onOk = async () => {
    form.validateFields().then(async () => {
      const dataForm = form.getFieldsValue() || {}

      if (files.length > 1 && dataForm.announcementTypeId === bannerTypeIds.banner) {
        return form.setFields([
          {
            name: 'isCheckBanner',
            errors: [LError('PLEASE_SELECT_ONE_WITH_TYPE_BANNER')]
          }
        ])
      } else {
        if (data.id) {
          if (fileLength < 1 && files.length < 1) {
            return form.setFields([
              {
                name: 'isCheckBanner',
                errors: [LError('PLEASE_SELECT_IMAGE')]
              }
            ])
          }
          if (fileLength > 1 && dataForm.announcementTypeId === bannerTypeIds.banner) {
            return form.setFields([
              {
                name: 'isCheckBanner',
                errors: [LError('PLEASE_SELECT_ONE_WITH_TYPE_BANNER')]
              }
            ])
          }
          {
            isGranted(appPermissions.announcement.update) &&
              (await bannerStore.update(
                {
                  ...dataForm,
                  id: data.id,
                  startDate: dayjs(dataForm.fromToDate[0]).toISOString(),
                  endDate: dayjs(dataForm.fromToDate[1]).toISOString()
                },
                files
              ))
          }
        } else {
          if (files.length < 1) {
            return form.setFields([
              {
                name: 'isCheckBanner',
                errors: [LError('PLEASE_SELECT_IMAGE')]
              }
            ])
          }
          await bannerStore.create({ ...data, ...dataForm }, files)
        }
      }
      await handleOK()
      handleCancel()
      setFiles([])
      form.resetFields()
    })
  }

  const onCancel = async () => {
    setFiles([])
    form.resetFields()
    handleCancel()
  }

  const checkIsBanner = (value) => {
    value === bannerTypeIds.banner ? setIsBanner(true) : setIsBanner(false)
  }
  const onCancelRequest = async (reasonCancel) => {
    if (!data?.id) {
      return
    }

    await bannerStore.cancelRequest({ id: data.id, reasonCancel })
    setVisibleConfirm(false)
    await handleOK()
    handleCancel()
  }
  const getFileLength = async (value) => {
    setFileLength(value)
  }
  return (
    <>
      <Modal
        title={L('BANNER_WELCOME_FORM_TITLE')}
        okText={L('BTN_SAVE')}
        open={visible}
        confirmLoading={bannerStore.isLoading}
        destroyOnClose
        width={600}
        maskClosable={false}
        // okButtonProps={{
        //   disabled: data.id && !isGranted(appPermissions.announcement.update)
        // }}
        onCancel={onCancel}
        onOk={onOk}
        forceRender>
        <Form
          layout="vertical"
          initialValues={initialValues}
          form={form}
          validateMessages={validateMessages}
          size="middle">
          <Row gutter={16}>
            <Col md={{ span: 24 }}>
              <FormSelect
                placeholder={L('PLACEHOLDER_INPUT_TYPE_BANNER')}
                label="BANNER_WELCOME_TYPE"
                name="announcementTypeId"
                options={bannerStore.bannerTypes}
                onChange={(value) => checkIsBanner(value)}
                rule={rules.bannerTypeId}
              />
            </Col>
            <Col sm={{ span: 24 }}>
              <FormInput
                placeholder={L('PLACEHOLDER_INPUT_SUBJECT_BANNER')}
                label="BANNER_WELCOME_SUBJECT"
                name="subject"
                rule={rules.subject}
              />
            </Col>
            <Col sm={{ span: 24 }}>
              <Form.Item
                rules={rules.fromToDate}
                label={L('BANNER_WELCOME_FROM_TO_DATE')}
                name={'fromToDate'}
                {...formVerticalLayout}>
                <RangePicker
                  disabledDate={disabledDate}
                  className="full-width"
                  format={dateTimeFormat}
                  showTime={{
                    defaultValue: [dayjs('00:00', 'HH:mm'), dayjs('23:59', 'HH:mm')]
                  }}
                />
              </Form.Item>
            </Col>
            <Col md={{ span: 24 }}>
              <FormTextArea
                placeholder={L('PLACEHOLDER_INPUT_TYPE_DESCRIPTION')}
                label="BANNER_WELCOME_DESCRIPTION"
                name="message"
                rule={rules.message}
                rows={2}
              />
            </Col>

            <Form.Item name="isCheckBanner">{/* <Input disabled={true} className="d-none" /> */}</Form.Item>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('BANNER_WELCOME_PICTURE_OR_VIDEO')} {...formVerticalLayout}>
                <FileUploadWrapV2
                  maxFile={isBanner ? 1 : 8}
                  parentId={bannerStore.editBannerWelcome?.uniqueId}
                  fileStore={fileStore}
                  onRemoveFile={onRemoveFile}
                  beforeUploadFile={beforeUploadFile}
                  acceptedFileTypes={fileTypeGroup.images}
                  specialModuleName="ANNOUNCEMENT"
                  getFileLength={getFileLength}
                />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <FormSwitch label="BANNER_WELCOME_ACTIVE_STATUS" name="isActive" />
            </Col>
          </Row>
        </Form>
      </Modal>
      <ConfirmReason
        title="BANNER_WELCOME_CONFIRM_CANCEL_TITLE"
        confirmMessage="BANNER_WELCOME_CONFIRM_CANCEL_MESSAGE"
        onOk={onCancelRequest}
        onCancel={setVisibleConfirm}
        visible={visibleConfirm}
      />
    </>
  )
}

export default AnnouncementFormModal
