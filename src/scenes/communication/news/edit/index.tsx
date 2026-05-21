import { CKEditor } from '@ckeditor/ckeditor5-react'
import { Button, Col, Divider, Form, Input, InputNumber, Radio, Row, Switch, Upload } from 'antd'
import { FormInstance } from 'antd/lib/form'
import get from 'lodash/get'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { isGrantedAny, L, LNotification } from '@lib/abpUtility'
import { Language } from '@services/administrator/language/dto/language'
import NewsStore from '@stores/communication/newsStore'
import Stores from '@stores/storeIdentifier'
import utils from '@utils/utils'
import './news-edit.less'
import NewsCategoryStore from '@stores/communication/newsCategoryStore'
import ProjectStore from '@stores/project/projectStore'
import { toJS } from 'mobx'
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
import { ruleNews } from '@scenes/communication/news/edit/form-validation'
import { appPermissions, ckeditorToolbar } from '@lib/appconst'
import UnitStore from '@stores/project/unitStore'
import { EventType } from '@models/communication/News'
import map from 'lodash/map'
import uniqBy from 'lodash/unionBy'
import buildingService from '@services/project/buildingService'
import unitService from '@services/project/unitService'
import AppComponentBase from '@components/AppComponentBase'
import withRouter from '@components/Layout/Router/withRouter'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

const rules = {
  categoryId: [{ required: true }],
  projectIds: [{ required: true }],
  unitIds: [{ required: true }],
  sortOrder: [{ required: true }],
  ...ruleNews
}

interface NewsEditState {
  selectedLanguage: string
  editorError: boolean
  saving: boolean
  imageUrl: any
  imageFile: File | Blob | undefined
  image: ImageFile | null
  isAllProject: boolean
  isAllUnit: boolean
  publishToProject: boolean
  loading: boolean
  buildings: any
  unitTypes: any
  units: any
  filterUnit: any
}

interface NewsEditProps {
  navigate: any
  params: any
  newsStore: NewsStore
  projectStore: ProjectStore
  newsCategoryStore: NewsCategoryStore
  unitStore: UnitStore
}
const MAX_RESULT_COUNT = 1000
@inject(Stores.NewsStore, Stores.NewsCategoryStore, Stores.ProjectStore, Stores.UnitStore)
@observer
class NewsEditor extends AppComponentBase<NewsEditProps, NewsEditState> {
  languages: Language[]
  form = React.createRef<FormInstance>()
  categoryParams = { maxResultCount: MAX_RESULT_COUNT, isActive: true }
  projectParams = { maxResultCount: MAX_RESULT_COUNT, isActive: true }

  constructor(props: NewsEditProps) {
    super(props)
    this.languages = utils.getLanguages()

    this.state = {
      selectedLanguage: get(global['abp'], 'localization.currentLanguage.name') || this.languages[0].name,
      editorError: false,
      saving: false,
      imageUrl: null,
      imageFile: undefined,
      image: null,
      isAllProject: false,
      isAllUnit: false,
      publishToProject: true,
      loading: true,
      buildings: [],
      unitTypes: [],
      units: [],
      filterUnit: {
        maxResultCount: MAX_RESULT_COUNT,
        isActive: true,
        projectId: undefined,
        buildingId: undefined,
        typeId: undefined
      }
    }
  }

  async componentDidMount() {
    const newsId = get(this.props, 'params.id')
    const { newsStore, newsCategoryStore, projectStore, unitStore } = this.props

    await Promise.all([
      unitStore.getUnitTypes(),
      newsCategoryStore.getAll(this.categoryParams),
      projectStore.filterOptions(this.projectParams)
    ])

    if (newsId) {
      await newsStore.getForEdit(newsId)
      newsStore.computeEditedNews()
      const images = await newsStore.getImage(newsStore.editedNews.uniqueId)
      await this.props.unitStore.getUnitsByProjectIds(newsStore.editedNews.projectIds, this.state.filterUnit)

      if (images && images.length) {
        this.setState({
          image: images[0] as any,
          isAllProject: newsStore.editedNews.isAllProject,
          imageUrl: buildFileUrlWithEncToken((images[0] as any).fileUrl)
        })
      }
      const getComputedData = newsStore.editSingleLanguageNews[this.state.selectedLanguage]
      const categoryId = newsStore.editedNews?.categoryId || ''
      const projectIds = newsStore.editedNews?.isAllProject ? [-1] : toJS(newsStore.editedNews?.projectIds)
      const isPublicToProject = newsStore.editedNews.eventType === EventType.PROJECT
      this.form.current?.setFieldsValue({
        ...getComputedData,
        categoryId,
        projectIds,
        eventType: isPublicToProject,
        unitIds: map(newsStore.editedNews.units, 'id'),
        isActive: newsStore.editedNews?.isActive,
        sortOrder: newsStore.editedNews.sortOrder
      })
      this.setState({
        publishToProject: isPublicToProject,
        units: newsStore.editedNews.units || []
      })
    } else {
      newsStore.createEmptyNews()
    }

    this.setState({
      loading: false
    })
  }

  componentWillUnmount(): void {
    this.props.newsStore.resetForm()
  }

  onChangeLanguage = (event) => {
    const { newsStore } = this.props
    const formData = this.form.current?.getFieldsValue()
    newsStore.updateEditedSingleLanguageNews(this.state.selectedLanguage, {
      ...formData
    })
    this.setState({ selectedLanguage: event.target.value, editorError: false }, () => {
      const getData = this.props.newsStore.editSingleLanguageNews[this.state.selectedLanguage]
      this.form.current?.setFieldsValue({
        ...getData,
        categoryId: formData?.categoryId,
        projectIds: formData?.projectIds,
        unitIds: formData?.unitIds,
        isActive: formData?.isActive,
        sortOrder: formData?.sortOrder,
        eventType: formData?.eventType
      })
    })
  }

  onContentChange = (event, editor) => {
    const { selectedLanguage, editorError } = this.state
    const content = editor.getData()
    this.props.newsStore.updateEditedSingleLanguageNews(selectedLanguage, {
      content
    })
    if (editorError) {
      this.setState({ editorError: false })
    }
  }

  onSave = async () => {
    const editNewsId = get(this.props, 'params.id')
    const { newsStore } = this.props
    const { selectedLanguage, isAllProject } = this.state
    const formData = this.form.current?.getFieldsValue() || {}

    this.form.current?.validateFields().then(() => {
      if (!trim(newsStore.editSingleLanguageNews[this.state.selectedLanguage].content)) {
        this.setState({ editorError: true })
        return
      }
      const computedData = newsStore.computeFormData(
        {
          subject: formData.subject,
          shortDescription: formData.shortDescription
        },
        selectedLanguage
      )

      const payload = {
        ...computedData,
        isAllProject,
        projectIds: isAllProject ? [] : formData.projectIds,
        categoryId: formData.categoryId,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
        eventType: formData.eventType ? 1 : 2,
        unitIds: formData.unitIds || []
      }

      let updatedNews
      this.setState({ saving: true }, async () => {
        if (editNewsId) {
          await newsStore.update({
            ...payload,
            id: newsStore.editedNews?.id
          })
          updatedNews = newsStore.editedNews
        } else {
          updatedNews = await newsStore.create(payload)
        }
        const { imageFile, image } = this.state
        if (imageFile) {
          // delete old file
          if (image) {
            await newsStore.deleteImage(image.guid)
          }
          await newsStore.uploadImage(updatedNews.uniqueId, this.state.imageFile)
        }
        notifySuccess(
          LNotification('SUCCESS'),
          LNotification(L(editNewsId ? 'NEWS_UPDATE_SUCCESSFULLY' : 'NEWS_CREATE_SUCCESSFULLY'))
        )
        this.props.navigate(-1)
      })
    })
  }

  renderButtonActions = () => (
    <Row>
      <Col flex="1"></Col>
      <Col className={'mr-2 ml-auto'}>
        <Button onClick={() => this.props.navigate(-1)} shape="round">
          {L('BTN_CANCEL')}
        </Button>
      </Col>
      {isGrantedAny(appPermissions.news.create, appPermissions.news.update) && (
        <Col>
          <Button type="primary" onClick={this.onSave} loading={this.state.saving} shape="round">
            {L('BTN_SAVE')}
          </Button>
        </Col>
      )}
    </Row>
  )

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

  handleProjectChange = async (projectIds: number[]) => {
    const isAllProject = projectIds.includes(-1)
    if (isAllProject) {
      this.form.current?.setFieldsValue({ projectIds: [-1] })
    }
    this.setState({ isAllProject })
  }

  handleSelectAllUnit = (value, isAllUnit) => {
    const isSelectAll = value.includes(-1)
    if (isSelectAll) {
      const unitIds = isAllUnit ? (this.state.units || []).map((item) => item.id) : []
      this.form.current?.setFieldsValue({ unitIds })
      this.setState({ isAllUnit })
    }
  }

  getProjectBuilding = async (projectId) => {
    if (!projectId) {
      this.setState({
        buildings: [],
        filterUnit: { ...this.state.filterUnit, projectId }
      })
      this.form.current?.setFieldsValue({ buildingId: undefined })
      return
    }
    const { items } = await buildingService.getAll({ projectId })
    this.handleUnitSearch('')
    this.setState({
      buildings: items,
      filterUnit: { ...this.state.filterUnit, projectId }
    })
    this.form.current?.setFieldsValue({ buildingId: undefined })
  }

  onPublishChange = (checked: boolean) => {
    this.setState({ publishToProject: checked })
    if (checked) {
      this.form.current?.setFields([
        {
          name: 'unitIds',
          touched: false,
          validating: false,
          errors: [],
          value: []
        },
        {
          name: 'projectIds',
          touched: false,
          validating: false,
          errors: [],
          value: []
        }
      ])
    }
  }

  handleProjectSearch = (value) => {
    return this.props.projectStore?.filterOptions({ keyword: value })
  }

  handleUnitSearch = async (keyword) => {
    const form = this.form.current
    if (!form) {
      return
    }
    const projectId = form.getFieldValue('projectId')
    const buildingId = form.getFieldValue('buildingId')
    const unitTypeId = form.getFieldValue('unitTypeId')
    const units = await unitService.filterAllOptions({
      ...this.state.filterUnit,
      projectId,
      buildingId,
      typeId: unitTypeId,
      keyword
    })

    this.setState({ units })
  }

  render() {
    const { isAllProject, buildings, units, filterUnit, isAllUnit } = this.state
    const {
      projectStore,
      newsCategoryStore,
      newsStore,
      unitStore: { unitTypes }
    } = this.props
    let projects = projectStore.projectOptions

    const newsId = get(this.props, 'params.id')
    if (newsId && newsStore.editedNews) {
      projects = uniqBy([...toJS(projectStore.projectOptions), ...toJS(newsStore.editedNews.projects)], 'id')
    }

    const editorContent = get(this.props, `newsStore.editSingleLanguageNews[${this.state.selectedLanguage}].content`)

    return (
      <WrapPageScroll renderActions={this.renderButtonActions}>
        <div className="news-edit-container">
          <div className="news-edit-banner">
            <img
              src={this.state.imageUrl || noPhoto}
              alt=""
              className={this.state.imageUrl ? '' : 'no-photo'}
              style={{ objectFit: 'cover', maxWidth: 128, maxHeight: 128 }}
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
          <div className="news-edit-content">
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
            <div className="news-edit-form mt-1">
              <Form
                ref={this.form}
                name="newsForm"
                layout="vertical"
                validateMessages={validateMessages}
                initialValues={{ isActive: true, eventType: true }}
                size="middle">
                <Row gutter={16}>
                  <Col md={{ span: 8 }} sm={{ span: 24 }}>
                    <Form.Item name="categoryId" label={L('NEWS_FILTER_CATEGORY')} rules={rules.categoryId}>
                      <Select allowClear showSearch filterOption={filterOptions}>
                        {newsCategoryStore.pageResult?.items?.map((category, index) => (
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
                  <Col md={{ span: 3 }} sm={{ span: 24 }}>
                    <Form.Item name="isActive" label={L('NEWS_ACTIVE')} valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col md={{ span: 3 }} sm={{ span: 24 }}>
                    <Form.Item name="eventType" label={L('NEWS_NOTIFY')} valuePropName="checked">
                      <Switch
                        checkedChildren={L('UNIT_PROJECT')}
                        unCheckedChildren={L('FILTER_UNIT')}
                        onChange={this.onPublishChange}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                {this.state.publishToProject && (
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name="projectIds"
                        label={L('NEWS_PROJECT')}
                        rules={!this.state.publishToProject ? [] : rules.unitIds}>
                        <Select
                          allowClear
                          showArrow
                          showSearch
                          mode="multiple"
                          style={{ width: '100%' }}
                          filterOption={false}
                          onChange={this.handleProjectChange}
                          onSearch={debounce(this.handleProjectSearch, 200)}
                          disabled={!this.state.publishToProject}
                          autoClearSearchValue={false}>
                          <Select.Option key={0} value={-1}>
                            {L('NEWS_ALL_PROJECTS')}
                          </Select.Option>
                          {projects.map((project) => (
                            <Select.Option key={project.id} value={project.id} disabled={isAllProject}>
                              {project.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                {!this.state.publishToProject && (
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="projectId" label={L('NEWS_PROJECT')}>
                        <Select
                          allowClear
                          showArrow
                          showSearch
                          style={{ width: '100%' }}
                          filterOption={false}
                          onChange={this.getProjectBuilding}>
                          {projects.map((project) => (
                            <Select.Option key={project.id} value={project.id}>
                              {project.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="buildingId" label={L('BUILDING')}>
                        <Select
                          allowClear
                          showArrow
                          style={{ width: '100%' }}
                          disabled={!filterUnit.projectId}
                          onChange={() => this.handleUnitSearch('')}>
                          {buildings.map((building) => (
                            <Select.Option key={building.id} value={building.id}>
                              {building.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="unitTypeId" label={L('FILTER_UNIT_TYPE')}>
                        <Select
                          allowClear
                          showArrow
                          style={{ width: '100%' }}
                          filterOption={false}
                          disabled={!filterUnit.projectId}>
                          {this.renderOptions(unitTypes)}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="unitIds" label={L('FILTER_UNIT')} rules={rules.unitIds}>
                        <Select
                          allowClear
                          showArrow
                          showSearch
                          mode="multiple"
                          filterOption={false}
                          style={{ width: '100%' }}
                          onSearch={debounce(this.handleUnitSearch, 200)}
                          onChange={(value) => this.handleSelectAllUnit(value, !isAllUnit)}
                          disabled={!filterUnit.projectId}>
                          <Select.Option key={0} value={-1}>
                            {L(isAllUnit ? 'DESELECT_ALL' : 'SELECT_ALL')}
                          </Select.Option>
                          {units.map((unit) => (
                            <Select.Option key={unit.id} value={unit.id}>
                              {unit.fullUnitCode}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                <Form.Item name="subject" label={L('NEWS_SUBJECT')} rules={rules.subject}>
                  <Input />
                </Form.Item>
                <Form.Item name="shortDescription" label={L('NEWS_SHORT_DESCRIPTION')} rules={rules.description}>
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Form>
              <div className="flex column mt-1 mb-1">
                <div>
                  <span className="error">*</span>
                  <label>{L('NEWS_CONTENT')}</label>
                </div>
              </div>
              <div
                className={`flex column news-editor ${this.state.editorError ? 'error' : ''}`}
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
                {this.state.editorError && <span className="error">{L('NEWS_CONTENT_REQUIRED')}</span>}
              </div>
            </div>
          </div>
        </div>
      </WrapPageScroll>
    )
  }
}

export default withRouter(NewsEditor)
