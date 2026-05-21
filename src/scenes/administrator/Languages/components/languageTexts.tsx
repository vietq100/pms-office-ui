import * as React from 'react'

import { Col, Input, Modal, Row, Table, Select } from 'antd'
import { inject, observer } from 'mobx-react'

import AppComponentBase from '../../../../components/AppComponentBase'
import LanguageTextFormModal from './languageTextFormModal'
import { EntityDto } from '../../../../services/dto/entityDto'
import { LanguageTextInputDto, LanguageTextDto } from '../../../../services/administrator/language/dto/languageTextDto'
import { L, LNotification } from '../../../../lib/abpUtility'
import Stores from '../../../../stores/storeIdentifier'
import LanguageStore from '../../../../stores/administrator/languageStore'
import DataTable from '../../../../components/DataTable'

import AppConsts, { appPermissions } from '../../../../lib/appconst'
import debounce from 'lodash/debounce'
import withRouter from '@components/Layout/Router/withRouter'
import NoRole from '@components/ComponentNoRole'

const { localization } = AppConsts

export interface ILanguageProps {
  params: any
  languageStore: LanguageStore
}

export interface ILanguageState {
  modalVisible: boolean
  maxResultCount: number
  skipCount: number
  modalType: string
  filters: any
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.LanguageStore)
@observer
class Language extends AppComponentBase<ILanguageProps, ILanguageState> {
  formRef: any = React.createRef()
  languageSources: any = abp.localization.sources || []
  languages: any = abp.localization.languages || []
  state = {
    modalVisible: false,
    maxResultCount: 10,
    skipCount: 0,
    modalType: 'add',
    filters: {
      targetLanguageName: this.props.params?.id,
      sourceName: localization.defaultLocalizationSourceName,
      filterText: ''
    }
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.adminLanguage.changeText) && (await this.getAll())
  }

  getAll = async () => {
    await this.props.languageStore.getAllLanguageText({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      ...this.state.filters
    })
  }

  handleTableChange = (pagination: any) => {
    this.setState({ skipCount: (pagination.current - 1) * this.state.maxResultCount! }, async () => await this.getAll())
  }

  Modal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }

  createOrUpdateModalOpen = async (entityDto: LanguageTextDto | null) => {
    const body: LanguageTextInputDto = {
      languageName: this.state.filters.targetLanguageName,
      sourceName: this.state.filters.sourceName,
      key: entityDto?.key || this.state.filters.filterText || '',
      value: entityDto?.targetValue || ''
    }
    await this.props.languageStore.createLanguageText(body)
    this.setState({ modalType: entityDto ? 'edit' : 'add' })
    this.Modal()
    this.formRef.current.setFieldsValue({
      ...this.props.languageStore.editLanguageText
    })
  }

  delete(input: EntityDto) {
    const self = this
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk() {
        self.props.languageStore.deleteLanguageText(input)
      }
    })
  }

  handleCreate = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      await this.props.languageStore.createOrUpdateLanguageText(values)
      await this.getAll()
      this.setState({ modalVisible: false })
      form.resetFields()
    })
  }

  updateSearch = debounce((name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }, 100)

  handleSearch = (name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => await this.getAll())
  }

  public render() {
    const { languageTexts } = this.props.languageStore
    const { filters } = this.state
    const columns = [
      {
        title: L('LANGUAGE_TEXT_KEY'),
        dataIndex: 'key',
        width: '25%',
        ellipsis: true,
        render: (key: string, item: any) => (
          <Row>
            <Col sm={{ span: 24, offset: 0 }}>
              <a
                style={{ color: item.colorCode }}
                onClick={
                  this.isGranted(appPermissions.adminLanguage.update)
                    ? () => this.createOrUpdateModalOpen(item)
                    : undefined
                }
                className="link-text-table ml-2">
                {key}
              </a>
            </Col>
          </Row>
        )
      },

      {
        title: L('LANGUAGE_TEXT_BASE_VALUE'),
        dataIndex: 'baseValue',
        key: 'baseValue',
        width: '25%',
        ellipsis: true,
        render: (text: string) => <>{text}</>
      },
      {
        title: L('LANGUAGE_TEXT_TARGET_VALUE'),
        dataIndex: 'targetValue',
        key: 'targetValue',
        width: '25%',
        ellipsis: true,
        render: (text: string) => <>{text}</>
      }
    ]

    const keywordPlaceHolder = `${this.L('LANGUAGE_TEXT_KEY')}, ${this.L('LANGUAGE_TEXT_BASE_VALUE')},  ${this.L(
      'LANGUAGE_TEXT_TARGET_VALUE'
    )}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_TARGET_LANGUAGE')}</label>
          <Select
            className="full-width"
            value={filters.targetLanguageName}
            onChange={(value) => this.handleSearch('targetLanguageName', value)}>
            {this.languages &&
              this.languages.map((language, index) => (
                <Select.Option key={index} value={language.name}>
                  <i className={language.icon} /> {language.displayName}
                </Select.Option>
              ))}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_SOURCE')}</label>
          <Select
            className="full-width"
            value={filters.sourceName}
            onChange={(value) => this.handleSearch('sourceName', value)}>
            {this.languageSources &&
              this.languageSources.map((source, index) => (
                <Select.Option key={index} value={source.name}>
                  {source.name}
                </Select.Option>
              ))}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{this.L('FILTER_KEYWORD')}</label>
          <Search
            placeholder={keywordPlaceHolder}
            onChange={(value) => this.updateSearch('keyword', value.target?.value)}
            onSearch={(value) => this.handleSearch('filterText', value)}
          />
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.adminLanguage.changeText) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={() => this.handleSearch('', '')}
          title={this.L('LANGUAGE_TEXT_LIST')}
          onCreate={() => this.createOrUpdateModalOpen(null)}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: languageTexts === undefined ? 0 : languageTexts.totalCount,
            onChange: this.handleTableChange
          }}>
          <Table
            size="middle"
            className="custom-ant-table custom-ant-row"
            columns={columns}
            pagination={false}
            loading={this.props.languageStore.isLoading}
            dataSource={languageTexts === undefined ? [] : languageTexts.items}
          />
        </DataTable>
        <LanguageTextFormModal
          formRef={this.formRef}
          visible={this.state.modalVisible}
          onCancel={() =>
            this.setState({
              modalVisible: false
            })
          }
          modalType={this.state.modalType}
          onCreate={this.handleCreate}
          loading={this.props.languageStore?.isLoading}
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(Language)
