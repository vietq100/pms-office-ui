import { useEffect, useState } from 'react'
import { Col, Form, Row, Card, Modal, Button, Input, Select, Tabs, Table, Tag, Typography } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import { isGranted, isGrantedAny, L, LNotification } from '../../../../lib/abpUtility'
import { validateMessages } from '../../../../lib/validation'
import AppConsts, { appPermissions, fileTypeGroup } from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import CompanyStore from '../../../../stores/project/companyStore'
import SalesOrganizationStore from '../../../../stores/project/salesOrganizationStore'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import ProjectStore from '../../../../stores/project/projectStore'
import { portalLayouts } from '../../../../components/Layout/Router/router.config'
import { UnitUserModel } from '../../../../models/User/IUserModel'
import FileStore from '../../../../stores/common/fileStore'
import SessionStore from '../../../../stores/sessionStore'
import rules from './validation'
import withRouter from '@components/Layout/Router/withRouter'
import FileUploadWrapV2 from '@components/FileUploadV2'
import NoRole from '@components/ComponentNoRole'
import FormInput from '@components/FormItem/FormInput'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import { BpType } from '../../../../models/Project/Company/CompanyModel'
import { notifyError, notifySuccess } from '../../../../lib/helper'
import { renderDateTime } from '../../../../lib/helper'
import dayjs from 'dayjs'
import FormSelect from '@components/FormItem/FormSelect'
import CustomerGroupStore from '@stores/project/customerGroupStore'
import FormNumber from '@components/FormItem/FormNumber'
import { countryOptionEnum } from '@lib/enum'

const { companyType } = AppConsts
const { confirm } = Modal
const { Option } = Select

const tabKeys = {
  tabInfo: 'tabInfo',
  tabSyncHistory: 'tabSyncHistory'
}

export interface ICompanyFormProps {
  navigate: any
  params: any
  companyStore: CompanyStore
  projectStore: ProjectStore
  fileStore: FileStore
  sessionStore: SessionStore
  salesOrganizationStore: SalesOrganizationStore
  customerGroupStore: CustomerGroupStore
}

const CompanyDetail = inject(
  Stores.CompanyStore,
  Stores.ProjectStore,
  Stores.FileStore,
  Stores.SessionStore,
  Stores.CustomerGroupStore,
  Stores.SalesOrganizationStore
)(
  observer((props: ICompanyFormProps) => {
    const { companyStore, projectStore, fileStore, navigate, params, salesOrganizationStore, customerGroupStore } =
      props
    const [isDirty, setIsDirty] = useState(false)
    const [tabActiveKey, setTabActiveKey] = useState(tabKeys.tabInfo)
    const [files, setFiles] = useState<any[]>([])
    const [idDocument, setIdDocument] = useState<any>(undefined)
    const [bpType, setBpType] = useState<number | undefined>(undefined)
    const [syncHistoryModalData, setSyncHistoryModalData] = useState<any>(null)
    const [form] = Form.useForm()

    const initDefault = async () => {
      const { editCompany } = companyStore
      if (editCompany?.id) {
        projectStore.unitUserOptions = [UnitUserModel.assign(companyStore.editCompany)]
      }
    }

    const getDetail = async (id?) => {
      if (!id) {
        fileStore.currentFiles = []
        await companyStore.createCompany()
      } else {
        await companyStore.get(id)
        setIdDocument(companyStore.editCompany?.documentFileId)
        setBpType(companyStore.editCompany?.bpType)
      }
      form.setFieldsValue({ ...companyStore.editCompany })
    }

    useEffect(() => {
      if (isGranted(appPermissions.company.detail)) {
        getDetail(params?.id).then(() => initDefault())
        salesOrganizationStore.getAll(true)
        customerGroupStore.getAll(true)
        projectStore.getListCountry({})
        projectStore.getListProvince({})
        projectStore.getListDistrict({})
        projectStore.getListCommune({})
      }
    }, [])

    const beforeUploadFile = (file) => {
      setFiles((prev) => [...prev, file])
      return false
    }

    const onRemoveFile = (file) => {
      setFiles((prev) => {
        const newList = [...prev]
        newList.splice(newList.indexOf(file), 1)
        return newList
      })
    }

    const onSave = () => {
      form.validateFields().then(async (values: any) => {
        if (companyStore.editCompany?.id) {
          isGranted(appPermissions.company.update) &&
            (await companyStore.update(
              {
                ...companyStore.editCompany,
                ...values,
                companyTypeId: companyType.tenant,

                companyName:
                  values.bpType === BpType.Organization
                    ? values.companyName?.trim()
                    : values.firstName + ' ' + values.lastName,
                companyLegalName:
                  values.bpType === BpType.Organization
                    ? values.companyLegalName?.trim()
                    : values.firstName + ' ' + values.lastName
              },
              files
            ))
        } else {
          isGranted(appPermissions.company.update) &&
            (await companyStore.create({ ...values, companyTypeId: companyType.tenant }, files))
        }
        navigate(portalLayouts.companies.path)
      })
    }

    const onCancel = () => {
      if (isDirty) {
        confirm({
          title: LNotification('ARE_YOU_SURE'),
          okText: L('BTN_YES'),
          cancelText: L('BTN_NO'),
          onOk: () => navigate(portalLayouts.companies.path)
        })
        return
      }
      navigate(portalLayouts.companies.path)
    }
    const onSyncToSap = async () => {
      Modal.confirm({
        title: LNotification('CONFIRM_SYNC_SAP'),
        okText: L('BTN_CONFIRM'),
        cancelText: L('_NO'),
        onOk: async () => {
          const id = companyStore.editCompany?.id
          if (!id) return
          const result = await companyStore.syncToSap(id)
          if (result?.success) {
            notifySuccess(LNotification('SUCCESS'), result.sapPartnerNumber || '')
            await getDetail(id)
          } else {
            notifyError(L('ERROR'), result?.errorMessage || L('SYNC_FAILED'))
          }
        }
      })
    }

    const onOpenSyncHistory = async () => {
      const id = companyStore.editCompany?.id
      if (!id) return
      await companyStore.getSyncHistory(id)
    }

    const renderSapStatus = () => {
      const { editCompany } = companyStore
      if (!editCompany?.id) return null
      return (
        <Row gutter={[16, 8]} style={{ marginBottom: 8 }}>
          <Col>
            {editCompany.isSyncedToSap ? (
              <Tag color="success">
                {L('COMPANY_SAP_SYNCED')} — {editCompany.sapPartnerNumber}
              </Tag>
            ) : (
              <Tag color="default">{L('COMPANY_SAP_NOT_SYNCED')}</Tag>
            )}
          </Col>
          {isGranted(appPermissions.company.syncSap) && (
            <Col>
              <Button
                icon={<SyncOutlined />}
                size="small"
                loading={companyStore.isSyncing}
                onClick={onSyncToSap}
                shape="round">
                {L('COMPANY_BTN_SYNC_SAP')}
              </Button>
            </Col>
          )}
        </Row>
      )
    }

    const syncHistoryColumns = [
      {
        title: L('COMPANY_SYNC_TIME'),
        dataIndex: 'createdTime',
        render: (v) => renderDateTime(dayjs(v))
      },
      {
        title: L('COMPANY_SYNC_STATUS'),
        dataIndex: 'status',
        render: (v) => <Tag color="success">{v}</Tag>
      },
      {
        title: L('COMPANY_SAP_PARTNER_NUMBER'),
        dataIndex: 'responsePayload'
      },
      {
        title: L('COMPANY_SYNC_ATTEMPT'),
        dataIndex: 'attemptNumber'
      },
      {
        title: '',
        render: (_, record) => (
          <Button size="small" onClick={() => setSyncHistoryModalData(record)}>
            {L('BTN_VIEW')}
          </Button>
        )
      }
    ]

    const renderActions = (isLoading?) => (
      <Row>
        <Col sm={{ span: 24 }}>
          <Button className="mr-1" onClick={onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {tabActiveKey === tabKeys.tabInfo &&
            isGranted(companyStore.editCompany?.id ? appPermissions.company.update : appPermissions.company.create) && (
              <Button
                type="primary"
                disabled={companyStore.editCompany?.id && !isGrantedAny(appPermissions.company.update)}
                onClick={onSave}
                loading={isLoading}
                shape="round">
                {L('BTN_SAVE')}
              </Button>
            )}
        </Col>
      </Row>
    )

    if (!isGranted(appPermissions.company.detail)) return <NoRole />

    const isOrg = bpType === BpType.Organization
    const isPersonal = bpType === BpType.Personal
    const { countryOptions, provinceOptions, districtOptions, communeOptions } = projectStore
    const formcontactCountryId = Form.useWatch('contactCountryId', form)
    const formpermanentCountryId = Form.useWatch('permanentCountryId', form)
    const formcontactProvinceId = Form.useWatch('contactProvinceId', form)
    const formcontactDistrictId = Form.useWatch('contactDistrictId', form)
    const formpermanentProvinceId = Form.useWatch('permanentProvinceId', form)
    const formpermanentDistrictId = Form.useWatch('permanentDistrictId', form)

    return (
      <WrapPageScroll renderActions={() => renderActions(companyStore.isLoading)}>
        <Card bordered={false} style={{ minHeight: 750 }}>
          {renderSapStatus()}
          <Tabs
            activeKey={tabActiveKey}
            onChange={async (key) => {
              setTabActiveKey(key)
              if (key === tabKeys.tabSyncHistory) await onOpenSyncHistory()
            }}>
            <Tabs.TabPane tab={L('COMPANY_TAB_INFO')} key={tabKeys.tabInfo}>
              <Form
                form={form}
                layout="vertical"
                onFinish={onSave}
                onValuesChange={(changed) => {
                  setIsDirty(true)
                  if (changed.bpType !== undefined) setBpType(changed.bpType)
                }}
                validateMessages={validateMessages}
                size="middle">
                {/* ── Thông tin chung ── */}
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 6 }}>
                    <Form.Item label={L('COMPANY_BP_TYPE')} name="bpType" rules={rules.bpType}>
                      <Select placeholder={L('COMPANY_BP_TYPE')}>
                        <Option value={BpType.Personal}>{L('COMPANY_BP_PERSONAL')}</Option>
                        <Option value={BpType.Organization}>{L('COMPANY_BP_ORGANIZATION')}</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  {isOrg && (
                    <>
                      <Col sm={{ span: 6 }}>
                        <Form.Item label={L('COMPANY_CUSTOMER_GROUP')} name="bpKind" rules={rules.required}>
                          <Select
                            showSearch
                            optionFilterProp="label"
                            placeholder={L('COMPANY_CUSTOMER_GROUP')}
                            loading={customerGroupStore.isLoading}
                            options={customerGroupStore.customerGroups.map((s) => ({
                              value: s.code,
                              label: `${s.code} - ${s.name}`
                            }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 6 }}>
                        <Form.Item
                          label={L('COMPANY_NAME')}
                          name="companyName"
                          rules={[...rules.maxText200, ...rules.required]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col sm={{ span: 6 }}>
                        <Form.Item
                          label={L('COMPANY_LEGAL_NAME')}
                          name="companyLegalName"
                          rules={[...rules.maxText200, ...rules.required]}>
                          <Input />
                        </Form.Item>
                      </Col>
                    </>
                  )}

                  <Col sm={{ span: 6 }}>
                    <Form.Item
                      label={L('COMPANY_TAX')}
                      name="companyTax"
                      rules={[...rules.required, ...rules.maxText60]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <Form.Item label={L('COMPANY_CODE')} name="companyCode" rules={rules.maxText30}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <Form.Item
                      label={L('COMPANY_EMAIL')}
                      name="primaryEmail"
                      rules={[...rules.emailAddress, ...(isPersonal ? [] : rules.required)]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <Form.Item label={L('COMPANY_MOBILE')} name="primaryPhone" rules={rules.phoneNumber}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <Form.Item label={L('COMPANY_ADDRESS')} name="primaryAddress" rules={rules.address}>
                      <Input.TextArea rows={1} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <Form.Item label={L('COMPANY_SECONDARY_EMAIL')} name="secondEmail" rules={rules.emailAddress}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <Form.Item label={L('COMPANY_SECONDARY_MOBILE')} name="secondPhone" rules={rules.phoneNumber2}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <Form.Item label={L('COMPANY_SECONDARY_ADDRESS')} name="secondAddress" rules={rules.address}>
                      <Input.TextArea rows={1} />
                    </Form.Item>
                  </Col>
                </Row>

                {/* ── SAP Config ── */}

                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 6 }}>
                    <Form.Item label={L('COMPANY_SALES_ORG')} name="salesOrganizationId" rules={rules.required}>
                      <Select
                        showSearch
                        optionFilterProp="label"
                        placeholder={L('COMPANY_SALES_ORG')}
                        loading={salesOrganizationStore.isLoading}
                        options={salesOrganizationStore.salesOrganizations.map((s) => ({
                          value: s.id,
                          label: `${s.salesOrg} - ${s.name}`
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* ── Địa chỉ liên lạc ── */}

                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 6 }}>
                    <FormSelect
                      label={L('COMPANY_CONTACT_COUNTRY')}
                      name="contactCountryId"
                      options={countryOptions}
                      initialValue={countryOptionEnum.Vietnam}
                      onChange={() => {
                        form.resetFields(['contactProvinceId', 'contactDistrictId', 'contactCommuneId'])
                      }}
                      rule={rules.required}
                    />
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <FormSelect
                      label={L('COMPANY_CONTACT_PROVINCE')}
                      name="contactProvinceId"
                      rule={rules.contactProvinceId}
                      onChange={() => {
                        form.resetFields(['contactDistrictId', 'contactCommuneId'])
                      }}
                      options={provinceOptions.filter((p) => p.countryId === formcontactCountryId)}
                    />
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <FormSelect
                      label={L('COMPANY_CONTACT_DISTRICT')}
                      name="contactDistrictId"
                      rule={rules.contactDistrictId}
                      onChange={() => {
                        form.resetFields(['contactCommuneId'])
                      }}
                      options={districtOptions.filter((d) => d.provinceId === formcontactProvinceId)}
                    />
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <FormSelect
                      label={L('COMPANY_CONTACT_COMMUNE')}
                      name="contactCommuneId"
                      rule={rules.contactCommuneId}
                      options={communeOptions.filter((c) => c.districtId === formcontactDistrictId)}
                    />
                  </Col>
                </Row>

                {/* ── Thông tin cá nhân / ĐDPL ── */}

                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 24 }}>
                    <Typography.Text strong>
                      {isPersonal ? L('COMPANY_SECTION_PERSONAL') : L('COMPANY_SECTION_REPRESENTATIVE')}
                    </Typography.Text>
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <FormInput name="firstName" label={L('COMPANY_FIRST_NAME')} rule={rules.maxText35} />
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <FormInput name="lastName" label={L('COMPANY_LAST_NAME')} rule={rules.maxText35} />
                  </Col>
                  {isPersonal && (
                    <>
                      <Col sm={{ span: 6 }}>
                        <FormInput name="personalTaxId" label={L('COMPANY_PERSONAL_TAX')} />
                      </Col>
                      <Col sm={{ span: 6 }}>
                        <FormInput name="position" label={L('COMPANY_POSITION')} />
                      </Col>
                      <Col sm={{ span: 6 }}>
                        <FormInput name="businessUnit" label={L('COMPANY_BUSINESS_UNIT')} />
                      </Col>

                      <Col sm={{ span: 6 }}>
                        <FormInput name="nativePlace" label={L('COMPANY_NATIVE_PLACE')} />
                      </Col>
                      <Col sm={{ span: 6 }}>
                        <FormDatePicker name="birthDate" label={L('COMPANY_BIRTH_DATE')} rule={rules.required} />
                      </Col>
                      <Col sm={{ span: 6 }}>
                        <FormDatePicker name="issueDate" label={L('COMPANY_ISSUE_DATE')} rule={rules.required} />
                      </Col>
                      <Col sm={{ span: 6 }}>
                        <FormInput name="issuePlace" label={L('COMPANY_ISSUE_PLACE')} rule={rules.textRequired} />
                      </Col>
                    </>
                  )}

                  <Col sm={{ span: 6 }}>
                    <FormInput
                      name="permanentAddress"
                      label={L('COMPANY_PERMANENT_ADDRESS')}
                      rule={[...rules.maxText200, ...(isPersonal ? rules.required : [])]}
                    />
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <FormSelect
                      label={L('COMPANY_PERMANENT_COUNTRY')}
                      name="permanentCountryId"
                      options={countryOptions}
                      initialValue={countryOptionEnum.Vietnam}
                      rule={isPersonal ? rules.required : []}
                      onChange={() => {
                        form.resetFields(['permanentProvinceId', 'permanentDistrictId', 'permanentCommuneId'])
                      }}
                    />
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <FormSelect
                      label={L('COMPANY_PERMANENT_PROVINCE')}
                      name="permanentProvinceId"
                      rule={isPersonal ? rules.required : []}
                      onChange={() => {
                        form.resetFields(['permanentDistrictId', 'permanentCommuneId'])
                      }}
                      options={provinceOptions.filter((p) => p.countryId === formpermanentCountryId)}
                    />
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <FormSelect
                      label={L('COMPANY_PERMANENT_DISTRICT')}
                      name="permanentDistrictId"
                      rule={isPersonal ? rules.required : []}
                      onChange={() => {
                        form.resetFields(['permanentCommuneId'])
                      }}
                      options={districtOptions.filter((d) => d.provinceId === formpermanentProvinceId)}
                    />
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <FormSelect
                      label={L('COMPANY_PERMANENT_COMMUNE')}
                      name="permanentCommuneId"
                      rule={isPersonal ? rules.required : []}
                      options={communeOptions.filter((c) => c.districtId === formpermanentDistrictId)}
                    />
                  </Col>
                </Row>

                {/* ── Thông tin doanh nghiệp ── */}
                {isOrg && (
                  <Row gutter={[16, 0]}>
                    <Col sm={{ span: 24 }}>
                      <Typography.Text strong>{L('COMPANY_SECTION_ORGANIZATION')}</Typography.Text>
                    </Col>
                    <Col sm={{ span: 6 }}>
                      <FormInput
                        name="businessLicense"
                        label={L('COMPANY_BUSINESS_LICENSE')}
                        rule={rules.textRequired}
                      />
                    </Col>
                    <Col sm={{ span: 6 }}>
                      <FormDatePicker
                        name="licenseIssueDate"
                        label={L('COMPANY_LICENSE_ISSUE_DATE')}
                        rule={rules.required}
                      />
                    </Col>
                    <Col sm={{ span: 6 }}>
                      <FormInput
                        name="licenseIssuePlace"
                        label={L('COMPANY_LICENSE_ISSUE_PLACE')}
                        rule={rules.textRequired}
                      />
                    </Col>
                    <Col sm={{ span: 6 }}>
                      <FormDatePicker name="licenseReissueDate" label={L('COMPANY_LICENSE_REISSUE_DATE')} />
                    </Col>

                    <Col sm={{ span: 6 }}>
                      <FormDatePicker name="registrationDate" label={L('COMPANY_REGISTRATION_DATE')} />
                    </Col>
                    <Col sm={{ span: 6 }}>
                      <FormInput name="companyPhone" label={L('COMPANY_COMPANY_PHONE')} rule={rules.phoneNumber} />
                    </Col>
                    <Col sm={{ span: 6 }}>
                      <FormInput name="companyFax" label={L('COMPANY_FAX')} rule={rules.textRequired} />
                    </Col>

                    <Col sm={{ span: 6 }}>
                      <FormNumber name="memberCount" label={L('COMPANY_MEMBER_COUNT')} />
                    </Col>
                  </Row>
                )}

                {/* ── Người liên hệ ── */}
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 24 }}>
                    <Typography.Text strong>{L('COMPANY_SECTION_CONTACT')}</Typography.Text>
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <FormInput
                      name="contactName"
                      label={L('TRANSPORT_USER_CONTACT')}
                      rule={[...rules.maxText200, ...rules.required]}
                    />
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <FormInput
                      name="contactPosition"
                      label={L('TRANSPORT_POSITION')}
                      rule={[...rules.maxText200, ...rules.required]}
                    />
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <FormInput
                      name="contactEmail"
                      label={L('TRANSPORT_EMAIL')}
                      rule={[...rules.emailAddress, ...rules.required]}
                    />
                  </Col>
                  <Col sm={{ span: 6 }}>
                    <FormInput name="contactPhone" label={L('TRANSPORT_PHONE')} rule={rules.phoneNumber} />
                  </Col>
                </Row>

                {/* ── Phone bổ sung ── */}
                {isPersonal && (
                  <Row gutter={[16, 0]}>
                    <Col sm={{ span: 6 }}>
                      <FormInput name="homePhone" label={L('COMPANY_HOME_PHONE')} rule={rules.phoneNumber2} />
                    </Col>
                    <Col sm={{ span: 6 }}>
                      <FormInput name="workPhone" label={L('COMPANY_WORK_PHONE')} rule={rules.phoneNumber2} />
                    </Col>
                    <Col sm={{ span: 6 }}>
                      <FormInput name="emergencyPhone" label={L('COMPANY_EMERGENCY_PHONE')} rule={rules.phoneNumber2} />
                    </Col>
                  </Row>
                )}

                {/* ── Mô tả + File ── */}
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 24 }}>
                    <Form.Item label={L('BUILDING_DESCRIPTION')} name="description" rules={rules.description}>
                      <Input.TextArea rows={2} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 24 }}>
                    <FileUploadWrapV2
                      multiple
                      parentId={idDocument}
                      fileStore={fileStore}
                      onRemoveFile={onRemoveFile}
                      beforeUploadFile={beforeUploadFile}
                      acceptedFileTypes={fileTypeGroup.documentAndImage}
                      totalSize={50}
                      maxSize={25}
                    />
                  </Col>
                </Row>
              </Form>
            </Tabs.TabPane>

            {isGranted(appPermissions.company.detail) && companyStore.editCompany?.id && (
              <Tabs.TabPane tab={L('COMPANY_TAB_SYNC_HISTORY')} key={tabKeys.tabSyncHistory}>
                <Table
                  rowKey="id"
                  size="small"
                  dataSource={companyStore.syncHistory}
                  columns={syncHistoryColumns}
                  pagination={false}
                />
              </Tabs.TabPane>
            )}
          </Tabs>
        </Card>

        <Modal
          open={!!syncHistoryModalData}
          title={L('COMPANY_SYNC_PAYLOAD')}
          onCancel={() => setSyncHistoryModalData(null)}
          footer={null}
          width={700}>
          <Typography.Text strong>{L('COMPANY_SYNC_REQUEST')}</Typography.Text>
          <pre style={{ maxHeight: 300, overflow: 'auto', background: '#f5f5f5', padding: 8 }}>
            {syncHistoryModalData
              ? JSON.stringify(JSON.parse(syncHistoryModalData.requestPayload || '{}'), null, 2)
              : ''}
          </pre>
          <Typography.Text strong>{L('COMPANY_SYNC_RESPONSE')}</Typography.Text>
          <pre style={{ maxHeight: 200, overflow: 'auto', background: '#f5f5f5', padding: 8 }}>
            {syncHistoryModalData?.responsePayload}
          </pre>
        </Modal>
      </WrapPageScroll>
    )
  })
)

export default withRouter(CompanyDetail)
