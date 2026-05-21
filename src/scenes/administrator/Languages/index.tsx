import * as React from 'react'

import { Col, Dropdown, Input, Menu, Modal, Row, Table } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import { inject, observer } from 'mobx-react'

import AppComponentBase from '../../../components/AppComponentBase'
import LanguageFormModal from './components/languageFormModal'
import { EntityDto } from '../../../services/dto/entityDto'
import { L, LNotification } from '../../../lib/abpUtility'
import Stores from '../../../stores/storeIdentifier'
import LanguageStore from '../../../stores/administrator/languageStore'
import DataTable from '../../../components/DataTable'

import AppConsts, { appPermissions } from '../../../lib/appconst'
import { portalLayouts } from '../../../components/Layout/Router/router.config'
import debounce from 'lodash/debounce'
import getColumns from './columns'
import withRouter from '@components/Layout/Router/withRouter'
import NoRole from '@components/ComponentNoRole'

const { align } = AppConsts
export interface ILanguageProps {
  navigate: any
  languageStore: LanguageStore
}

export interface ILanguageState {
  modalVisible: boolean
  maxResultCount: number
  skipCount: number
  languageId: number
  filter: string
}

const confirm = Modal.confirm
const Search = Input.Search

@inject(Stores.LanguageStore)
@observer
class Language extends AppComponentBase<ILanguageProps, ILanguageState> {
  formRef: any = React.createRef()

  state = {
    modalVisible: false,
    maxResultCount: 10,
    skipCount: 0,
    languageId: 0,
    filter: ''
  }

  get currentPage() {
    return Math.floor(this.state.skipCount / this.state.maxResultCount) + 1
  }

  async componentDidMount() {
    this.isGranted(appPermissions.adminLanguage.page) && (await this.getAll())
  }

  async getAll() {
    await this.props.languageStore.getAll({
      maxResultCount: this.state.maxResultCount,
      skipCount: this.state.skipCount,
      keyword: this.state.filter
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

  createOrUpdateModalOpen = async (entityDto: EntityDto) => {
    if (entityDto.id === 0) {
      await this.props.languageStore.createLanguage()
    } else {
      await this.props.languageStore.get(entityDto)
    }

    this.setState({ languageId: entityDto.id })
    this.Modal()

    this.formRef.current.setFieldsValue({
      ...this.props.languageStore.editLanguage
    })
  }

  delete(input: EntityDto) {
    const self = this
    confirm({
      title: LNotification('DO_YOU_WANT_TO_DEACTIVATE_THIS_ITEM'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk() {
        self.props.languageStore.delete(input)
      }
    })
  }

  handleCreate = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.state.languageId === 0) {
        await this.props.languageStore.create(values)
      } else {
        await this.props.languageStore.update({
          id: this.state.languageId,
          ...values
        })
      }

      await this.getAll()
      this.setState({ modalVisible: false })
      form.resetFields()
    })
  }

  updateSearch = debounce((event) => {
    this.setState({ filter: event.target?.value })
  }, 100)

  handleSearch = (value: string) => {
    this.setState({ filter: value, skipCount: 0 }, async () => await this.getAll())
  }

  gotoLanguageText = (id) => {
    const { navigate } = this.props
    navigate(portalLayouts.adminLanguageTexts.path.replace(':id', id))
  }

  public render() {
    const { languages } = this.props.languageStore
    const columns = getColumns({
      title: L('LANGUAGE_FLAG'),
      dataIndex: 'icon',
      width: '15%',
      align: align.center,
      render: (icon: string, item: any) => (
        <Row>
          <Col sm={{ span: 21, offset: 0 }}>
            <a
              style={{ color: item.colorCode }}
              onClick={() => this.isGranted(appPermissions.adminLanguage.update) && this.gotoLanguageText(item.name)}
              className="link-text-table">
              <div>
                <i className={icon} />
              </div>
            </a>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.adminLanguage.delete) && (
                    <Menu.Item onClick={() => this.delete({ id: item.id })}>{L('BTN_DEACTIVATE')}</Menu.Item>
                  )}
                </Menu>
              }
              placement="bottomLeft">
              <button className="button-action-hiden-table-cell">
                <EllipsisOutlined />
              </button>
            </Dropdown>
          </Col>
        </Row>
      )
    })
    const keywordPlaceHolder = `${this.L('LANGUAGE_NAME')}`
    const filterComponent = (
      <Row>
        <Col sm={{ span: 10, offset: 0 }}>
          <Search
            maxLength={200}
            placeholder={keywordPlaceHolder}
            onChange={this.updateSearch}
            onSearch={this.handleSearch}
          />
        </Col>
      </Row>
    )
    return this.isGranted(appPermissions.adminLanguage.page) ? (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={() => this.handleSearch(this.state.filter)}
          title={this.L('LANGUAGE_LIST')}
          onCreate={() => this.createOrUpdateModalOpen({ id: 0 })}
          pagination={{
            pageSize: this.state.maxResultCount,
            current: this.currentPage,
            total: languages === undefined ? 0 : languages.totalCount,
            onChange: this.handleTableChange
          }}
          createPermission={appPermissions.adminLanguage.create}>
          <Table
            size="middle"
            className="custom-ant-table"
            rowKey={(record) => record.id.toString()}
            columns={columns}
            pagination={false}
            loading={this.props.languageStore.isLoading}
            dataSource={languages === undefined ? [] : languages.items}
            onChange={this.handleTableChange}
          />
        </DataTable>
        <LanguageFormModal
          formRef={this.formRef}
          visible={this.state.modalVisible}
          onCancel={() =>
            this.setState({
              modalVisible: false
            })
          }
          modalType={this.state.languageId === 0 ? 'edit' : 'create'}
          onCreate={this.handleCreate}
        />
      </>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(Language)
