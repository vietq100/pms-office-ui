import { CKEditor } from '@ckeditor/ckeditor5-react'
import { Button, Col, DatePicker, Divider, Form, Input, InputNumber, Radio, Row, Switch, Upload } from 'antd'
import { FormInstance } from 'antd/lib/form'
import get from 'lodash/get'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { isGrantedAny, L, LNotification } from '@lib/abpUtility'
import { Language } from '@services/administrator/language/dto/language'
import EventStore from '@stores/communication/eventStore'
import Stores from '@stores/storeIdentifier'
import utils from '@utils/utils'
import './event-edit.less'
import EventCategoryStore from '@stores/communication/eventCategoryStore'
import ProjectStore from '@stores/project/projectStore'
import trim from 'lodash/trim'
import WrapPageScroll from '@components/WrapPageScroll'
import { PlusOutlined } from '@ant-design/icons/lib'
import { UploadChangeParam } from 'antd/lib/upload/interface'
import last from 'lodash/last'
import { buildFileUrlWithEncToken, filterOptions, image2Base64, notifySuccess } from '@lib/helper'
import { validateMessages } from '@lib/validation'
import { ImageFile } from '@models/File'
import noPhoto from '@assets/images/logo-horizontal.png'
import Select from '@components/Select'
import debounce from 'lodash/debounce'
import { ruleEvent } from '@scenes/communication/events/edit/form-validation'
import { appPermissions, ckeditorToolbar, dateTimeFormat } from '@lib/appconst'
import AppComponentBase from '@components/AppComponentBase'
import withRouter from '@components/Layout/Router/withRouter'
import dayjs from 'dayjs'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
const rules = {
  categoryId: [{ required: true }],
  projectIds: [{ required: true }],
  unitIds: [{ required: true }],
  sortOrder: [{ required: true }],
  buildingIds: [{ required: false }],
  ...ruleEvent
}

interface EventEditState {
  selectedLanguage: string
  editorError: boolean
  saving: boolean
  imageUrl: any
  imageFile: File | Blob | undefined
  image: ImageFile | null
  loading: boolean
}

interface EventEditProps {
  navigate: any
  eventStore: EventStore
  projectStore: ProjectStore
  eventCategoryStore: EventCategoryStore
}

const MAX_RESULT_COUNT = 1000
@inject(Stores.EventStore, Stores.EventCategoryStore, Stores.ProjectStore, Stores.UnitStore)
@observer
class EventEditor extends AppComponentBase<EventEditProps, EventEditState> {
  languages: Language[]
  form = React.createRef<FormInstance>()
  categoryParams = { maxResultCount: MAX_RESULT_COUNT, isActive: true }
  projectParams = { maxResultCount: MAX_RESULT_COUNT, isActive: true }

  constructor(props: EventEditProps) {
    super(props)
    this.languages = utils.getLanguages()

    this.state = {
      selectedLanguage: get(global['abp'], 'localization.currentLanguage.name') || this.languages[0].name,
      editorError: false,
      saving: false,
      imageUrl: null,
      imageFile: undefined,
      image: null,
      loading: true
    }
  }

  async componentDidMount() {
    const eventId = get(this.props, 'params.id')
    const { eventStore, eventCategoryStore, projectStore } = this.props

    await Promise.all([eventCategoryStore.getAll(this.categoryParams), projectStore.filterBuildingOptions({})])

    if (eventId) {
      await eventStore.getForEdit(eventId)
      eventStore.computeEditedEvent()
      const images = await eventStore.getImage(eventStore.editedEvent.uniqueId)

      if (images && images.length) {
        this.setState({
          image: images[0] as any,
          imageUrl: buildFileUrlWithEncToken((images[0] as any).fileUrl)
        })
      }
      const getComputedData = eventStore.editSingleLanguageEvent[this.state.selectedLanguage]
      this.form.current?.setFieldsValue({
        ...(eventStore?.editedEvent || {}),
        ...getComputedData
      })
    } else {
      eventStore.createEmptyEvent()
    }

    this.setState({
      loading: false
    })
  }

  componentWillUnmount(): void {
    this.props.eventStore.resetForm()
  }

  onChangeLanguage = (event) => {
    const { eventStore } = this.props
    const formData = this.form.current?.getFieldsValue()
    eventStore.updateEditedSingleLanguageEvent(this.state.selectedLanguage, {
      ...formData
    })
    this.setState({ selectedLanguage: event.target.value, editorError: false }, () => {
      const getData = this.props.eventStore.editSingleLanguageEvent[this.state.selectedLanguage]
      this.form.current?.setFieldsValue({
        ...(formData || {}),
        ...getData
      })
    })
  }

  onContentChange = (event, editor) => {
    const { selectedLanguage, editorError } = this.state
    const content = editor.getData()
    this.props.eventStore.updateEditedSingleLanguageEvent(selectedLanguage, {
      content
    })
    if (editorError) {
      this.setState({ editorError: false })
    }
  }

  onSave = async () => {
    const editEventId = get(this.props, 'params.id')
    const { eventStore } = this.props
    const { selectedLanguage } = this.state
    const formData = this.form.current?.getFieldsValue() || {}

    this.form.current?.validateFields().then(() => {
      if (!trim(eventStore.editSingleLanguageEvent[this.state.selectedLanguage].content)) {
        this.setState({ editorError: true })
        return
      }
      const computedData = eventStore.computeFormData(
        {
          subject: formData.subject,
          shortDescription: formData.shortDescription
        },
        selectedLanguage
      )

      const payload = {
        ...formData,
        ...computedData
      }

      let updatedEvent
      this.setState({ saving: true }, async () => {
        if (editEventId) {
          await eventStore.update({
            ...payload,
            id: eventStore.editedEvent?.id
          })
          updatedEvent = eventStore.editedEvent
        } else {
          updatedEvent = await eventStore.create(payload)
        }
        const { imageFile, image } = this.state
        if (imageFile) {
          // delete old file
          if (image) {
            await eventStore.deleteImage(image.guid)
          }
          await eventStore.uploadImage(updatedEvent.uniqueId, this.state.imageFile)
        }
        notifySuccess(LNotification('SUCCESS'), LNotification('EVENT_UPDATE_SUCCESSFULLY'))
        this.props.navigate(-1)
      })
    })
  }

  sendNotification = async () => {
    const editEventId = get(this.props, 'params.id')
    const { eventStore } = this.props
    if (editEventId) {
      await eventStore.sendNotification(editEventId)
      notifySuccess(LNotification('SUCCESS'), LNotification('EVENT_SEND_NOTIFICATION_SUCCESSFULLY'))
    }
  }

  renderButtonActions = () => {
    const editEventId = get(this.props, 'params.id')
    const { editedEvent } = this.props.eventStore
    return (
      <Row>
        <Col flex="0">
          {isGrantedAny(appPermissions.event.create, appPermissions.event.update) &&
            !editedEvent?.isSendNotification &&
            editEventId > 0 && (
              <Button
                type="primary"
                // ghost
                onClick={this.sendNotification}
                loading={this.state.saving}
                shape="round">
                {L('BTN_SEND_NOTIFICATION')}
              </Button>
            )}
        </Col>
        <Col flex="1">
          <Button onClick={() => this.props.navigate(-1)} className="mr-2" shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {isGrantedAny(appPermissions.event.create, appPermissions.event.update) && (
            <Button type="primary" onClick={this.onSave} loading={this.state.saving} shape="round">
              {L('BTN_SAVE')}
            </Button>
          )}
        </Col>
      </Row>
    )
  }

  uploadButton = () => (
    <div>
      <PlusOutlined />
      <div className="ant-upload-text">{L('BTN_UPLOAD')}</div>
    </div>
  )

  handleUploadChange = async (info: UploadChangeParam<any>) => {
    const { fileList = [] } = info
    if (fileList.length) {
      const file = last(fileList)?.originFileObj
      this.setState({
        imageFile: file,
        imageUrl: await image2Base64(file)
      })
    }
  }

  render() {
    const {
      eventCategoryStore,
      eventStore,
      projectStore: { buildingOptions }
    } = this.props
    const { categories } = eventCategoryStore
    const { editedEvent } = eventStore

    const currentDate = dayjs()
    const startDate = this.form.current?.getFieldValue('startTime')
    const endDate = this.form.current?.getFieldValue('endTime')
    const editorContent = get(this.props, `eventStore.editSingleLanguageEvent[${this.state.selectedLanguage}].content`)

    return (
      <WrapPageScroll renderActions={this.renderButtonActions}>
        <div className="event-edit-container flex column">
          <div className="event-edit-banner">
            <img
              src={this.state.imageUrl || noPhoto}
              alt=""
              className={this.state.imageUrl ? '' : 'no-photo'}
              style={{ objectFit: 'cover', maxHeight: 128, maxWidth: 128 }}
            />
            <Upload
              name="avatar"
              accept=".jpg, .jpeg, .png"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={this.handleUploadChange}>
              {this.uploadButton()}
            </Upload>
          </div>
          <div className="event-edit-content">
            <h3>{L('NEWS_SELECT_LANGUAGE_TO_CREATE_UPDATE')}</h3>
            <Radio.Group value={this.state.selectedLanguage} onChange={this.onChangeLanguage}>
              {this.languages.map((lang) => (
                <Radio.Button key={lang.name} value={lang.name}>
                  <i className={lang.icon} />
                  &nbsp;{lang.displayName}
                </Radio.Button>
              ))}
            </Radio.Group>
            <Divider />
            <div className="event-edit-form mt-1">
              <Form
                ref={this.form}
                name="eventForm"
                layout="vertical"
                validateMessages={validateMessages}
                initialValues={{ isActive: true, eventType: true }}
                size="middle">
                <Row gutter={16}>
                  <Col md={{ span: 24 }} sm={{ span: 24 }}>
                    <Form.Item name="isActive" label={L('EVENT_ACTIVE')} valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col md={{ span: 8 }} sm={{ span: 24 }}>
                    <Form.Item name="categoryId" label={L('EVENT_FILTER_CATEGORY')} rules={rules.categoryId}>
                      <Select allowClear showSearch filterOption={filterOptions}>
                        {categories.map((category, index) => (
                          <Select.Option key={index} value={category.id}>
                            {category.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col md={{ span: 8 }} sm={{ span: 24 }}>
                    <Form.Item name={'sortOrder'} label={L('FILTER_SORT_ORDER')} rules={rules.sortOrder}>
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('AMENITY_BUILDING')} name="buildingIds" rules={rules.buildingIds}>
                      <Select style={{ width: '100%' }} mode="multiple" showArrow>
                        {this.renderOptions(buildingOptions)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col md={{ span: 8 }} sm={{ span: 24 }}>
                    <Form.Item name="location" label={L('EVENT_LOCATION')}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col md={{ span: 8 }} sm={{ span: 24 }}>
                    <Form.Item name="startTime" label={L('EVENT_START_DATE')}>
                      <DatePicker
                        format={dateTimeFormat}
                        style={{ width: '100%' }}
                        disabledDate={(d) =>
                          (!editedEvent?.id && d.isBefore(currentDate)) || (endDate && (!d || d.isAfter(endDate)))
                        }
                        placeholder={L('SELECT_DATE')}
                        showTime
                      />
                    </Form.Item>
                  </Col>
                  <Col md={{ span: 8 }} sm={{ span: 24 }}>
                    <Form.Item name="endTime" label={L('EVENT_END_DATE')}>
                      <DatePicker
                        format={dateTimeFormat}
                        style={{ width: '100%' }}
                        disabledDate={(d) =>
                          (!editedEvent?.id && d.isBefore(currentDate)) || (startDate && (!d || d.isAfter(startDate)))
                        }
                        placeholder={L('SELECT_DATE')}
                        showTime
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="subject" label={L('EVENT_SUBJECT')} rules={rules.subject}>
                  <Input />
                </Form.Item>
                <Form.Item name="shortDescription" label={L('EVENT_SHORT_DESCRIPTION')} rules={rules.description}>
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Form>
              <div className="flex column mt-1 mb-1">
                <div>
                  <span className="error">*</span>
                  <label>{L('EVENT_CONTENT')}</label>
                </div>
              </div>
              <div
                className={`flex column event-editor ${this.state.editorError ? 'error' : ''}`}
                style={{ minHeight: 200 }}>
                {!this.state.loading && (
                  <CKEditor
                    editor={ClassicEditor}
                    config={{
                      language: get(global['abp'], 'localization.currentLanguage.name') || this.languages[0].name,
                      ...ckeditorToolbar
                    }}
                    data={editorContent}
                    onChange={debounce(this.onContentChange, 200)}
                  />
                )}
                {this.state.editorError && <span className="error">{L('EVENT_CONTENT_REQUIRED')}</span>}
              </div>
            </div>
          </div>
        </div>
      </WrapPageScroll>
    )
  }
}
export default withRouter(EventEditor)
