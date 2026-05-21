import { useEffect, useMemo, useRef, useState } from 'react'

type TableKey = 'rent' | 'management' | 'addendumRent' | 'addendumMgmt'

import { CheckCircleFilled, CloseCircleFilled, DeleteOutlined, EditFilled, SyncOutlined } from '@ant-design/icons'
import NoRole from '@components/ComponentNoRole'
import FileUploadWrapV2 from '@components/FileUploadV2'
import withRouter from '@components/Layout/Router/withRouter'
import { calculateDurationToText, notifyError, notifySuccess, formatNumber, renderDate } from '@lib/helper'
import { calcDetailAmounts, calcScheduleAmount } from '@lib/leaseCalculator'
import companyService from '@services/project/companyService'
import unitService from '@services/project/unitService'
import FeeTypeStore from '@stores/fee/feeTypeStore'
import ContractOfficeStore from '@stores/project/contractOfficeStore'
import { Button, Card, Col, Form, message, Modal, Row, Tabs, Tag } from 'antd'
import dayjs from 'dayjs'
import { inject, observer } from 'mobx-react'
import { v4 as uuid } from 'uuid'
import { portalLayouts } from '@components/Layout/Router/router.config'
import WrapPageScroll from '@components/WrapPageScroll'
import { L, LNotification } from '@lib/abpUtility'
import AppConsts, { appPermissions, appStatusColors, dateDifference, fileTypeGroup } from '@lib/appconst'
import FileStore from '@stores/common/fileStore'
import SessionStore from '@stores/sessionStore'
import Stores from '@stores/storeIdentifier'
import columRentFee from './columRentFee'
import PaymentSchedule from './paymentSchedule'
import { FeeTypeEnum, leaseAgreementStageEnum, MaterialSAPEnum, paymentScheduleStatusEnum } from '@lib/enum'
import ContractFormSection from './components/ContractFormSection'
import FeeTableSection from './components/FeeTableSection'
import AddendumModal from './components/AddendumModal'

const { align } = AppConsts
const { confirm } = Modal

const tabKeys = {
  tabInfo: 'CONTRACT_TAB_INFO',
  tabPaymentSchedule: 'CONTRACT_TAB_PAYMENT_SCHEDULE',
  tabUpload: 'CONTRACT_TAB_UPLOAD'
}

export interface IContractFormProps {
  navigate: any
  params: any
  contractOfficeStore: ContractOfficeStore
  fileStore: FileStore
  sessionStore: SessionStore
  feeTypeStore: FeeTypeStore
}

const isGranted = (permission: string) => abp.auth.isGranted(permission)

// ─── Custom hook: quản lý state cho 1 table ───────────────────────────────────
const useTableState = (initial: any[] = []) => {
  const [items, setItems] = useState<any[]>(initial)
  const [uniqueId, setUniqueId] = useState('')
  const [previousData, setPreviousData] = useState<any>(undefined)
  const [visibleAction, setVisibleAction] = useState(false)
  return { items, setItems, uniqueId, setUniqueId, previousData, setPreviousData, visibleAction, setVisibleAction }
}

// ─── Component ────────────────────────────────────────────────────────────────
const ContractOfficeDetail = (props: IContractFormProps) => {
  const { contractOfficeStore, fileStore, sessionStore, feeTypeStore, navigate, params } = props

  const [tabActiveKey, setTabActiveKey] = useState(tabKeys.tabInfo)
  const [files, setFiles] = useState<any[]>([])
  const [idDocument, setIdDocument] = useState<any>(undefined)
  const [listCompany, setListCompany] = useState<any[]>([])
  const [listUnit, setListUnit] = useState<any[]>([])
  const [paymentTerm, setPaymentTerm] = useState<number>(0)
  const [addendumPaymentTerm, setAddendumPaymentTerm] = useState<number>(0)
  const [addendumModalVisible, setAddendumModalVisible] = useState(false)
  const [paidConflictWarnings, setPaidConflictWarnings] = useState<any[]>([])

  const rentTable = useTableState()
  const mgmtTable = useTableState()
  const addendumRentTable = useTableState()
  const addendumMgmtTable = useTableState()

  const pendingAddendumRef = useRef<{ generatedByUnit: Map<number, { rent: any[]; management: any[] }> } | null>(null)
  const previousUnitIdsRef = useRef<any[]>([])

  const [formRef] = Form.useForm()
  const [formRentFee] = Form.useForm()
  const [formManagementFee] = Form.useForm()
  const [formAddendumRent] = Form.useForm()
  const [formAddendumMgmt] = Form.useForm()
  const [formAddendum] = Form.useForm()

  const currentPaymentTerm = Form.useWatch('paymentTerm', formRef)
  const selectedUnitIds: number[] = Form.useWatch('leaseAgreementUnit', formRef) ?? []
  const watchedStartFeeDate = Form.useWatch('startFeeDate', formRef)
  const watchedStartManagementDate = Form.useWatch('startManagementDate', formRef)
  const watchedExpiryDate = Form.useWatch('expiryDate', formRef)
  const watchedAddendumExpiryDate = Form.useWatch('expiryDate', formAddendum)

  // ─── tableConfig ─────────────────────────────────────────────────────────────
  const tableConfig = useMemo(
    () => ({
      rent: {
        ...rentTable,
        form: formRentFee,
        feeTypeId: FeeTypeEnum.rentFee,
        startDateField: 'startFeeDate' as const
      },
      management: {
        ...mgmtTable,
        form: formManagementFee,
        feeTypeId: FeeTypeEnum.managerFee,
        startDateField: 'startManagementDate' as const
      },
      addendumRent: {
        ...addendumRentTable,
        form: formAddendumRent,
        feeTypeId: FeeTypeEnum.rentFee,
        startDateField: 'startFeeDate' as const
      },
      addendumMgmt: {
        ...addendumMgmtTable,
        form: formAddendumMgmt,
        feeTypeId: FeeTypeEnum.managerFee,
        startDateField: 'startManagementDate' as const
      }
    }),
    [rentTable, mgmtTable, addendumRentTable, addendumMgmtTable]
  )

  // ─── Init ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      await companyService.getListCompany().then(setListCompany)
      if (isGranted(appPermissions.companyContract.detail)) {
        await Promise.all([
          unitService.getListUnit().then(setListUnit),
          getDetail(params?.id),
          contractOfficeStore.getListLAStatus(''),
          feeTypeStore.getLists({}),
          feeTypeStore.getListDetail()
        ])
      }
    }
    init()
  }, [])

  const getDetail = async (id?) => {
    if (!id) {
      setFiles([])
      await contractOfficeStore.createContract(sessionStore.projectId)
    } else {
      await contractOfficeStore.get(id)
      setIdDocument(contractOfficeStore.editContract?.uniqueId)
      rentTable.setItems(
        contractOfficeStore.editContract?.leaseAgreementDetails?.filter((i) => i.feeTypeId === FeeTypeEnum.rentFee) ??
          []
      )
      mgmtTable.setItems(
        contractOfficeStore.editContract?.leaseAgreementDetails?.filter(
          (i) => i.feeTypeId === FeeTypeEnum.managerFee
        ) ?? []
      )
    }
    formRef.setFieldsValue({
      ...contractOfficeStore.editContract,
      leaseAgreementUnit: contractOfficeStore.editContract?.leaseAgreementUnit?.map((i) => i.unitId) ?? []
    })
    previousUnitIdsRef.current = contractOfficeStore.editContract?.leaseAgreementUnit?.map((i) => i.unitId) ?? []
    setPaymentTerm(contractOfficeStore.editContract?.paymentTerm ?? 0)
  }

  const onMapDataCompany = (id) => {
    const company = listCompany.find((item) => item?.id === id)
    formRef.setFieldsValue(
      company
        ? { ...company, permanentAddress: company?.primaryAddress }
        : {
            companyCode: null,
            representative: null,
            primaryAddress: null,
            contactName: null,
            position: null,
            contactPhone: null,
            contactEmail: null
          }
    )
  }

  // ─── Payment term / date recalc ───────────────────────────────────────────────
  const recalcItems = (items: any[], term: number, paymentDateValue: any) =>
    items.map((item) => {
      if (!item.startDate || !item.endDate || !item.amount) return item
      return {
        ...item,
        ...calcDetailAmounts(
          item.startDate,
          item.endDate,
          item.amount,
          item.vatPercent,
          term === AppConsts.contractOfficeTimeEnum.YEAR,
          paymentDateValue,
          term
        )
      }
    })

  const onPaymentTermChange = (newTerm: any, isAddendum = false) => {
    if (isAddendum) {
      setAddendumPaymentTerm(newTerm)
      addendumRentTable.setItems((prev) => recalcItems(prev, newTerm, formRef.getFieldValue('paymentDate')))
      addendumMgmtTable.setItems((prev) => recalcItems(prev, newTerm, formRef.getFieldValue('startManagementDate')))
    } else {
      setPaymentTerm(newTerm)
      rentTable.setItems((prev) => recalcItems(prev, newTerm, formRef.getFieldValue('paymentDate')))
      mgmtTable.setItems((prev) => recalcItems(prev, newTerm, formRef.getFieldValue('startManagementDate')))
    }
  }

  const onPaymentDateChange = () => {
    rentTable.setItems((prev) =>
      recalcItems(prev, formRef.getFieldValue('paymentTerm'), formRef.getFieldValue('paymentDate'))
    )
  }

  const onStartManagementDateChange = () => {
    mgmtTable.setItems((prev) =>
      recalcItems(prev, formRef.getFieldValue('paymentTerm'), formRef.getFieldValue('startManagementDate'))
    )
  }

  // ─── Contract amount ──────────────────────────────────────────────────────────
  useEffect(() => {
    calcAmount()
  }, [rentTable.items, mgmtTable.items])

  const calcAmount = () => {
    const all = [...rentTable.items, ...mgmtTable.items]
    formRef.setFieldsValue({
      contractAmount: Math.round(all.reduce((s, i) => s + (i.totalAmount || 0), 0)),
      contractAmountIncludeVat: Math.round(all.reduce((s, i) => s + (i.totalAmountIncludeVat || 0), 0))
    })
  }

  // ─── Lease time ───────────────────────────────────────────────────────────────
  const calculatorDateLeaseTime = async () => {
    const startDate = formRef.getFieldValue('commencementDate')
    const endDate = formRef.getFieldValue('expiryDate')
    formRef.setFieldValue('leaseTerm', startDate && endDate ? await calculateDurationToText(startDate, endDate) : null)

    const startFee = formRef.getFieldValue('startFeeDate')
    const startMgmt = formRef.getFieldValue('startManagementDate')
    if (!startFee || dayjs(startFee).isBefore(dayjs(startDate))) formRef.setFieldValue('startFeeDate', startDate)
    if (!startMgmt || dayjs(startMgmt).isBefore(dayjs(startDate)))
      formRef.setFieldValue('startManagementDate', startDate)
  }

  // ─── Unit selection ───────────────────────────────────────────────────────────
  const clearEditState = (...keys: TableKey[]) => {
    keys.forEach((key) => {
      const c = tableConfig[key]
      c.setVisibleAction(false)
      c.setUniqueId('')
      c.setPreviousData(undefined)
      c.form.resetFields()
    })
  }

  const onLeaseAgreementUnitChange = (newIds: any) => {
    const oldIds: number[] = previousUnitIdsRef.current
    const removedIds = oldIds.filter((id) => !newIds.includes(id))
    const addedIds = newIds.filter((id: number) => !oldIds.includes(id))

    const doRemove = (ids: number[]) => {
      if (!ids.length) return
      rentTable.setItems((prev) => prev.filter((r) => !ids.includes(r.unitId)))
      mgmtTable.setItems((prev) => prev.filter((r) => !ids.includes(r.unitId)))
      clearEditState('rent', 'management')
    }

    const doAddInitRows = (ids: number[]) => {
      if (!ids.length) return
      clearEditState('rent', 'management')
      const startFeeDate = formRef.getFieldValue('startFeeDate')
      const startManagementDate = formRef.getFieldValue('startManagementDate')
      const commencementDate = formRef.getFieldValue('commencementDate')
      const expiryDate = formRef.getFieldValue('expiryDate')
      rentTable.setItems((prev) => [
        ...prev,
        ...ids.map((unitId) => ({
          id: uuid(),
          feeTypeId: FeeTypeEnum.rentFee,
          unitId,
          name: `${L('RENT_FEE')} - ${listUnit.find((u) => u.id === unitId)?.name ?? unitId}`,
          _isNew: false,
          startDate: startFeeDate ?? commencementDate ?? null,
          endDate: expiryDate ?? null
        }))
      ])
      mgmtTable.setItems((prev) => [
        ...prev,
        ...ids.map((unitId) => ({
          id: uuid(),
          feeTypeId: FeeTypeEnum.managerFee,
          unitId,
          name: `${L('FEE_TYPE_CONFIG_MANAGEMENT')} - ${listUnit.find((u) => u.id === unitId)?.name ?? unitId}`,
          _isNew: false,
          startDate: startManagementDate ?? commencementDate ?? null,
          endDate: expiryDate ?? null
        }))
      ])
    }

    if (!removedIds.length) {
      doAddInitRows(addedIds)
      previousUnitIdsRef.current = newIds
      return
    }

    const hasData = [...rentTable.items, ...mgmtTable.items].some((item) => removedIds.includes(item.unitId))
    if (hasData) {
      confirm({
        title: LNotification('ARE_YOU_SURE_REMOVE_UNIT'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          doRemove(removedIds)
          doAddInitRows(addedIds)
          previousUnitIdsRef.current = newIds
        },
        onCancel: () => formRef.setFieldValue('leaseAgreementUnit', oldIds)
      })
    } else {
      doRemove(removedIds)
      doAddInitRows(addedIds)
      previousUnitIdsRef.current = newIds
    }
  }

  // ─── Row handlers ─────────────────────────────────────────────────────────────
  const saveRow = async (tableKey: TableKey, id: any) => {
    const config = tableConfig[tableKey]
    const values = await config.form.validateFields()
    const foundItem = config.items.find((item) => item.id === config.uniqueId)

    if (values.startDate && values.endDate) {
      const effectiveTerm = tableKey.startsWith('addendum') ? addendumPaymentTerm : currentPaymentTerm
      const paymentDateValue =
        tableKey === 'rent' || tableKey === 'addendumRent'
          ? formRef.getFieldValue('paymentDate')
          : formRef.getFieldValue('startManagementDate')
      Object.assign(
        values,
        calcDetailAmounts(
          values.startDate,
          values.endDate,
          values.amount,
          values.vatPercent,
          effectiveTerm === AppConsts.contractOfficeTimeEnum.YEAR,
          paymentDateValue,
          effectiveTerm
        )
      )
    }

    if (typeof id === 'number') values.id = id
    if (foundItem) {
      const originalItem = !foundItem._isNew
        ? (contractOfficeStore.editContract?.leaseAgreementDetails ?? []).find((d: any) => d.id === foundItem.id)
        : undefined
      const priceChanged =
        !!originalItem &&
        (originalItem.amount !== values.amount ||
          originalItem.vatPercent !== values.vatPercent ||
          !dayjs(originalItem.startDate).isSame(dayjs(values.startDate), 'day') ||
          !dayjs(originalItem.endDate).isSame(dayjs(values.endDate), 'day'))
      Object.assign(foundItem, values, { _priceChanged: priceChanged, _isNew: false, _savedAsNew: foundItem._isNew })
    }

    config.setItems((prev) => [...prev])
    config.setVisibleAction(false)
    config.setUniqueId('')
    config.setPreviousData(undefined)
    if (tableKey === 'rent' || tableKey === 'management') calcAmount()
  }

  const handleCancelRow = (tableKey: TableKey, id: any) => {
    const config = tableConfig[tableKey]
    const foundItem = config.items.find((item) => item.id === id)
    if (foundItem?._isNew || config.previousData === undefined)
      config.setItems((prev) => prev.filter((item) => item.id !== id))
    config.setVisibleAction(false)
    config.setUniqueId('')
    config.setPreviousData(undefined)
  }

  const handleDeleteRow = (tableKey: TableKey, id: any) => {
    const config = tableConfig[tableKey]
    config.setItems((prev) => prev.filter((item) => item.id !== id))
    if (tableKey === 'rent' || tableKey === 'management') calcAmount()
  }

  const handleAddRow = async (tableKey: TableKey, unitId?: number) => {
    const config = tableConfig[tableKey]
    config.setVisibleAction(true)
    config.form.resetFields()

    const formValue = formRef.getFieldsValue()
    const lowerBound = dayjs(formRef.getFieldValue(config.startDateField))
    let startD = lowerBound.isValid() ? lowerBound : dayjs(formValue?.commencementDate)
    const itemsForUnit = unitId != null ? config.items.filter((i) => i.unitId === unitId) : config.items
    if (itemsForUnit.length > 0) {
      const lastEnd = dayjs(itemsForUnit[itemsForUnit.length - 1]?.endDate).add(1, 'days')
      startD = lastEnd.isAfter(lowerBound) ? lastEnd : lowerBound
    }
    if (dayjs(startD).isAfter(dayjs(watchedAddendumExpiryDate ?? watchedExpiryDate))) {
      message.warning(L('CONTRACT_START_DATE_ERROR'))
      config.setVisibleAction(false)
      return
    }

    const unitName = listUnit.find((u) => u.id === unitId)?.name ?? unitId
    const feeLabel = config.feeTypeId === FeeTypeEnum.rentFee ? L('RENT_FEE') : L('FEE_TYPE_CONFIG_MANAGEMENT')
    config.form.setFieldsValue({
      name: `${feeLabel} - ${unitName}`,
      startDate: dayjs(startD),
      endDate: dayjs(watchedAddendumExpiryDate ?? formValue?.expiryDate)
    })

    const newRow = { id: uuid(), feeTypeId: config.feeTypeId, _isNew: tableKey.startsWith('addendum'), unitId }
    config.setItems((prev) => [...prev, newRow])
    config.setUniqueId(newRow.id)
  }

  // ─── Save contract ────────────────────────────────────────────────────────────
  const resolveFeeTypeDetailId = (feeTypeId: number, term: number): number | undefined => {
    const { MONTH, QUARTER } = AppConsts.contractOfficeTimeEnum
    const isRent = feeTypeId === FeeTypeEnum.rentFee
    const materialSAP =
      term === MONTH
        ? isRent
          ? MaterialSAPEnum.MON_Lease
          : MaterialSAPEnum.MON_ManagerFee
        : term === QUARTER
        ? isRent
          ? MaterialSAPEnum.QR_Lease
          : MaterialSAPEnum.QR_ManagerFee
        : isRent
        ? MaterialSAPEnum.YR_Lease
        : MaterialSAPEnum.YR_ManagerFee
    return (feeTypeStore.listFeeTypeDetail ?? []).find((d: any) => d.materialSAP === materialSAP)?.id
  }

  const buildPayload = (values: any, details: any[], isAddendum = false, effectiveTerm = paymentTerm) => {
    const listUnitSelected = listUnit
      .filter((i) => values.leaseAgreementUnit?.includes(i.id))
      .map((i) => ({ unitId: i.id, projectId: i.projectId }))
    const leaseTerm = dateDifference(values.commencementDate, values.expiryDate)
    return {
      ...values,
      leaseTermYear: leaseTerm.years,
      leaseTermMonth: leaseTerm.months,
      leaseTermDay: leaseTerm.days,
      leaseAgreementUnit: listUnitSelected,
      leaseAgreementDetails: details.map((item, index) => ({
        ...item,
        id: isAddendum ? undefined : typeof item.id !== 'number' ? 0 : item.id,
        parentId: !isAddendum ? undefined : typeof item.id !== 'number' ? 0 : item.id,
        originalItemNo: isAddendum ? item.itemNo : undefined,
        feeTypeDetailId: resolveFeeTypeDetailId(item.feeTypeId, effectiveTerm),
        itemNo: (index + 1) * 10
      })),
      id: isAddendum ? undefined : contractOfficeStore.editContract?.id,
      parentId: isAddendum ? contractOfficeStore.editContract?.id : contractOfficeStore.editContract?.parentId
    }
  }

  const onSave = (notify = true) =>
    formRef.validateFields().then(async (values) => {
      if (!isGranted(appPermissions.companyContract.update)) return
      await contractOfficeStore.createOrUpdate(
        buildPayload(values, [...rentTable.items, ...mgmtTable.items]),
        files,
        notify
      )
      params?.id ? getDetail(params?.id) : navigate(portalLayouts.officeContract.path)
    })

  // ─── Addendum ─────────────────────────────────────────────────────────────────
  const onCreateAddendum = async () => {
    addendumRentTable.setItems(rentTable.items.map((i) => ({ ...i })))
    addendumMgmtTable.setItems(mgmtTable.items.map((i) => ({ ...i })))
    addendumRentTable.setUniqueId('')
    addendumMgmtTable.setUniqueId('')
    addendumRentTable.setVisibleAction(false)
    addendumMgmtTable.setVisibleAction(false)
    const currentTerm = formRef.getFieldValue('paymentTerm')
    setAddendumPaymentTerm(currentTerm)
    formAddendum.setFieldsValue({
      signContractDate: formRef.getFieldValue('signContractDate'),
      expiryDate: formRef.getFieldValue('expiryDate'),
      paymentTerm: currentTerm,
      referenceNumber: formRef.getFieldValue('referenceNumber'),
      waterFeeAmount: formRef.getFieldValue('waterFeeAmount'),
      electricFeeAmount: formRef.getFieldValue('electricFeeAmount')
    })
    if (contractOfficeStore.editContract?.id)
      await contractOfficeStore.getPaymentSchedule({ leaseAgreementId: contractOfficeStore.editContract.id })
    setAddendumModalVisible(true)
  }

  const checkPaidConflicts = (allDetails: any[]): any[] => {
    const isYearly = addendumPaymentTerm === AppConsts.contractOfficeTimeEnum.YEAR
    return contractOfficeStore.listPaymentSchedule
      .filter((p) => p.statusId === paymentScheduleStatusEnum.paid)
      .reduce<any[]>((acc, paid) => {
        const paidStart = dayjs(paid.startDate).startOf('day')
        const paidEnd = dayjs(paid.endDate).startOf('day')
        const covering = allDetails.filter((d) => {
          if (d.unitId !== paid.unitId || d.feeTypeId !== paid.feeTypeId) return false
          return (
            paidStart.isSameOrAfter(dayjs(d.startDate).startOf('day')) &&
            paidEnd.isSameOrBefore(dayjs(d.endDate).startOf('day'))
          )
        })
        if (!covering.length) return acc
        const newAmount = Math.round(calcScheduleAmount(paidStart, paidEnd, covering, isYearly))
        if (newAmount !== paid.amount) acc.push({ paid, newAmount })
        return acc
      }, [])
  }

  const onAddendumOk = (generatedByUnit: Map<number, { rent: any[]; management: any[] }>) => {
    Promise.all([formRef.validateFields(), formAddendum.validateFields()]).then(
      async ([formValues, addendumValues]) => {
        const conflicts = checkPaidConflicts(
          [...addendumRentTable.items, ...addendumMgmtTable.items].filter((d) => !d._isNew)
        )
        if (conflicts.length > 0) {
          pendingAddendumRef.current = { generatedByUnit }
          setPaidConflictWarnings(conflicts)
          return
        }
        Modal.confirm({
          title: LNotification('ARE_YOU_SURE_CREATE_ADDENDUM'),
          okText: L('BTN_CONFIRM'),
          cancelText: L('_NO'),
          onOk: async () => doSaveAddendum(generatedByUnit, formValues, addendumValues)
        })
      }
    )
  }

  const doSaveAddendum = async (
    generatedByUnit: Map<number, { rent: any[]; management: any[] }>,
    formValues: any,
    addendumValues: any
  ) => {
    if (!isGranted(appPermissions.companyContract.update)) return
    const values = { ...formValues, ...addendumValues }
    const details = [...addendumRentTable.items, ...addendumMgmtTable.items].map((item, index) => ({
      ...item,
      id: undefined,
      parentId: item._isNew ? undefined : item._priceChanged ? item.id : undefined,
      originalItemNo: item._isNew ? undefined : item.itemNo,
      _isNew: undefined,
      uniqueId: uuid(),
      _priceChanged: undefined,
      feeTypeDetailId: resolveFeeTypeDetailId(item.feeTypeId, addendumPaymentTerm),
      itemNo: (index + 1) * 10,
      lastModifierUser: undefined,
      feeType: undefined
    }))

    const created = await contractOfficeStore.createOrUpdate(
      {
        ...buildPayload(values, details, true, addendumPaymentTerm),
        id: undefined,
        parentId: contractOfficeStore.editContract?.id
      },
      files
    )

    const newId = created?.id
    if (newId && generatedByUnit.size > 0) {
      const newContract: any = await contractOfficeStore.get(newId)
      const newDetails: any[] = newContract?.leaseAgreementDetails ?? []
      const scheduleItems: any[] = []
      generatedByUnit.forEach((unitData) => {
        ;[...unitData.rent, ...unitData.management].forEach((d) => {
          const matchedDetail = newDetails.find(
            (nd) =>
              nd.unitId === d.unitId &&
              nd.feeTypeId === d.feeTypeId &&
              dayjs(nd.startDate).isSameOrBefore(dayjs(d.startDate), 'day') &&
              dayjs(nd.endDate).isSameOrAfter(dayjs(d.endDate), 'day')
          )

          scheduleItems.push({
            leaseAgreementId: newId,
            leaseAgreementDetailId: matchedDetail?.id,
            feeTypeId: d.feeTypeId,
            feeTypeDetailId: matchedDetail?.feeTypeDetailId,
            unitId: d.unitId,
            startDate: dayjs(d.startDate).endOf('day').toISOString(),
            endDate: dayjs(d.endDate).endOf('day').toISOString(),
            amount: d.amount,
            name: d.name,
            statusId: d.statusId ?? paymentScheduleStatusEnum.unpaid
          })
        })
      })
      if (scheduleItems.length > 0) await contractOfficeStore.createPaymentSchedule(scheduleItems)
    }
    setAddendumModalVisible(false)
    navigate(portalLayouts.officeContract.path)
  }

  // ─── SAP sync ─────────────────────────────────────────────────────────────────
  const onSyncToSap = async () => {
    const stageId = formRef.getFieldValue('stageId')
    if (stageId !== leaseAgreementStageEnum.Confirmed) {
      message.warning(L('STAGE_MUST_BE_CONFIRM_TO_SYNC_SAP'))
      return
    }

    await onSave(false)

    const leaseAgreementId = contractOfficeStore.editContract?.id
    const isSynced = contractOfficeStore.editContract?.maSAP

    const doSync = async () => {
      const result = await (isSynced
        ? contractOfficeStore.reSyncToSap(leaseAgreementId)
        : contractOfficeStore.syncToSap(leaseAgreementId))
      if (result?.success) {
        notifySuccess(LNotification('SUCCESS'), result.sapPartnerNumber || '')
        await getDetail(leaseAgreementId)
      } else notifyError(L('ERROR'), result?.errorMessage || L('SYNC_FAILED'))
    }

    if (isSynced) {
      Modal.confirm({
        title: LNotification('CONFIRM_SYNC_SAP'),
        okText: L('BTN_CONFIRM'),
        cancelText: L('_NO'),
        onOk: doSync
      })
      return
    }
    await contractOfficeStore.getPaymentSchedule({ leaseAgreementId }).then((val) => {
      if (val.length > 0)
        Modal.confirm({
          title: LNotification('CONFIRM_SYNC_SAP'),
          okText: L('BTN_CONFIRM'),
          cancelText: L('_NO'),
          onOk: doSync
        })
      else message.warning(L('PLEASE_GENERATE_BILLINGPLAN_BEFORE_SYNC_SAP'))
    })
  }

  // ─── Validate rows ────────────────────────────────────────────────────────────
  const validateUnitRows = (items: any[], unitId: number, tableKey: TableKey): string[] => {
    const config = tableConfig[tableKey]
    const lowerBound = dayjs(
      config.startDateField === 'startFeeDate' ? watchedStartFeeDate : watchedStartManagementDate
    )
    const expiryDate = dayjs(watchedExpiryDate)

    return items
      .filter((r) => r.unitId === unitId && r.startDate && r.endDate)
      .sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf())
      .reduce((acc: string[], row, index, arr) => {
        const warnings: string[] = []
        const start = dayjs(row.startDate)
        const end = dayjs(row.endDate)
        if (lowerBound.isValid() && start.isBefore(lowerBound, 'day'))
          warnings.push(
            L(`CONTRACT_ITEM_LOWERBOUND_ERROR_{0}_{1}_{2}`, index + 1, L('START_DATE'), lowerBound.format('DD/MM/YYYY'))
          )
        if (expiryDate.isValid() && end.isAfter(expiryDate, 'day'))
          warnings.push(
            L(`CONTRACT_ITEM_EXPIRIED_ERROR_{0}_{1}_{2}`, index + 1, L('END_DATE'), expiryDate.format('DD/MM/YYYY'))
          )
        if (index < arr.length - 1) {
          const nextStart = dayjs(arr[index + 1].startDate)
          if (nextStart.isSameOrBefore(end, 'day'))
            warnings.push(
              L(
                `CONTRACT_ITEM_IS_OVERLAP_{0}_{1}_{2}_{3}`,
                index + 1,
                index + 2,
                nextStart.format('DD/MM/YYYY'),
                end.format('DD/MM/YYYY')
              )
            )
        }
        return [...acc, ...warnings]
      }, [])
  }

  // ─── Column builder ───────────────────────────────────────────────────────────
  const buildColumns = (tableKey: TableKey) => {
    const config = tableConfig[tableKey]
    const isSyncSap = (tableKey === 'rent' || tableKey === 'management') && !!contractOfficeStore.editContract?.maSAP
    const isEditing = (record: any) => config.uniqueId === record.id

    const render = (action: any, row: any) =>
      isEditing(row) ? (
        <div className="d-flex justify-content-center w-100">
          <Button
            type="text"
            icon={<CheckCircleFilled style={{ color: appStatusColors.success }} />}
            onClick={() => saveRow(tableKey, row.id)}
          />
          <Button
            type="text"
            icon={<CloseCircleFilled style={{ color: appStatusColors.error }} />}
            onClick={() => handleCancelRow(tableKey, row.id)}
          />
        </div>
      ) : (
        <div className="d-flex justify-content-center w-100">
          <Button
            disabled={config.visibleAction && config.uniqueId !== row.id}
            size="small"
            shape="circle"
            className="mr-1"
            icon={<EditFilled />}
            onClick={() => {
              config.form.setFieldsValue({
                ...row,
                startDate: row.startDate ? dayjs(row.startDate) : null,
                endDate: row.endDate ? dayjs(row.endDate) : null
              })
              config.setUniqueId(row?.id)
              config.setVisibleAction(true)
              config.setPreviousData({ ...row })
            }}
          />
          {!isSyncSap && (
            <Button
              disabled={config.visibleAction && config.uniqueId !== row.id}
              size="small"
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteRow(tableKey, row.id)}
            />
          )}
        </div>
      )

    return columRentFee(
      {
        title: L('FILE_DOCUMENT_ACTION'),
        dataIndex: 'action',
        key: 'action',
        fixed: align.right,
        align: align.center,
        width: 50,
        render
      },
      isEditing,
      formRef.getFieldsValue(),
      formAddendum.getFieldsValue(),
      tableKey.startsWith('addendum') ? addendumPaymentTerm : paymentTerm,
      tableKey === 'rent' || tableKey === 'addendumRent' ? 'rent' : 'management',
      tableKey.startsWith('addendum') ? contractOfficeStore.editContract?.leaseAgreementDetails : [],
      isSyncSap
    )
  }

  // ─── File handlers ────────────────────────────────────────────────────────────
  const beforeUploadFile = (file: any) => {
    setFiles((prev) => [...prev, file])
    return false
  }
  const onRemoveFile = (file: any) => {
    setFiles((prev) => {
      const list = [...prev]
      list.splice(list.indexOf(file), 1)
      return list
    })
  }
  const onCancel = () =>
    confirm({
      title: LNotification('ARE_YOU_SURE'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: () => navigate(portalLayouts.officeContract.path)
    })

  // ─── Render ───────────────────────────────────────────────────────────────────
  const { isLoading, editContract, laStage, leaseAgreementStatus } = contractOfficeStore

  const renderSapStatus = () => {
    if (!editContract?.id) return null
    return (
      <Row gutter={[16, 8]} style={{ marginBottom: 8 }}>
        <Col>
          {editContract?.maSAP ? (
            <Tag color="success">
              {L('COMPANY_SAP_SYNCED')} — {editContract?.maSAP}
            </Tag>
          ) : (
            <Tag color="default">{L('COMPANY_SAP_NOT_SYNCED')}</Tag>
          )}
        </Col>
        {isGranted(appPermissions.LeaseAgreement.SAP) && (
          <Col>
            <Button
              icon={<SyncOutlined />}
              size="small"
              loading={contractOfficeStore?.isSyncing}
              onClick={onSyncToSap}
              shape="round">
              {editContract?.maSAP ? L('COMPANY_BTN_RE_SYNC_SAP') : L('COMPANY_BTN_SYNC_SAP')}
            </Button>
          </Col>
        )}
        {editContract?.parentId && (
          <Col>
            <Tag
              color="blue"
              style={{ cursor: 'pointer' }}
              onClick={() =>
                window.open(
                  portalLayouts.officeCompanyContractDetail.path.replace(':id', editContract.parentId),
                  '_blank'
                )
              }>
              {L('REF_FROM')}: {editContract?.parent?.referenceNumber ?? editContract.parentId}
            </Tag>
          </Col>
        )}
      </Row>
    )
  }

  const renderActions = (isLoadingParam?) =>
    tabActiveKey === tabKeys.tabInfo && (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          {!!editContract?.maSAP && (
            <Button className="mr-1" type="primary" onClick={onCreateAddendum} loading={isLoadingParam} shape="round">
              {L('BTN_CREATE_ADDENDUM')}
            </Button>
          )}
          <Button className="mr-1" onClick={onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          <Button
            disabled={rentTable.visibleAction || mgmtTable.visibleAction}
            type="primary"
            onClick={() => onSave()}
            loading={isLoadingParam}
            shape="round">
            {L('BTN_SAVE')}
          </Button>
        </Col>
      </Row>
    )

  return isGranted(appPermissions.LeaseAgreement.detail) ? (
    <WrapPageScroll renderActions={() => renderActions(isLoading)}>
      <Tabs activeKey={tabActiveKey} onTabClick={setTabActiveKey} type="card">
        <Tabs.TabPane tab={L(tabKeys.tabInfo)} key={tabKeys.tabInfo}>
          <Card bordered={false}>
            {renderSapStatus()}
            <ContractFormSection
              formRef={formRef}
              listCompany={listCompany}
              listUnit={listUnit}
              leaseAgreementStatus={leaseAgreementStatus}
              laStage={laStage}
              onMapDataCompany={onMapDataCompany}
              calculatorDateLeaseTime={calculatorDateLeaseTime}
              onStartManagementDateChange={onStartManagementDateChange}
              onPaymentDateChange={onPaymentDateChange}
              onPaymentTermChange={(v) => onPaymentTermChange(v)}
              onLeaseAgreementUnitChange={onLeaseAgreementUnitChange}
              isSyncSap={!!editContract?.maSAP}
            />
            {selectedUnitIds.length === 0 ? (
              <p className="text-muted">{L('SELECT_UNIT_FIRST')}</p>
            ) : (
              selectedUnitIds.map((unitId) => {
                const unit = listUnit.find((u) => u.id === unitId)
                return (
                  <FeeTableSection
                    key={unitId}
                    unitId={unitId}
                    unitName={unit?.name ?? String(unitId)}
                    itemRents={rentTable.items}
                    columnsRentFee={buildColumns('rent')}
                    formRentFee={formRentFee}
                    visibleActionRent={rentTable.visibleAction}
                    rentWarnings={validateUnitRows(rentTable.items, unitId, 'rent')}
                    onAddRentRow={() => handleAddRow('rent', unitId)}
                    itemManagements={mgmtTable.items}
                    columnsManagementFee={buildColumns('management')}
                    formManagementFee={formManagementFee}
                    visibleActionMgmt={mgmtTable.visibleAction}
                    mgmtWarnings={validateUnitRows(mgmtTable.items, unitId, 'management')}
                    onAddMgmtRow={() => handleAddRow('management', unitId)}
                    isSyncSap={!!editContract?.maSAP}
                  />
                )
              })
            )}
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane disabled={!params.id} tab={L(tabKeys.tabPaymentSchedule)} key={tabKeys.tabPaymentSchedule}>
          <Col sm={{ span: 24, offset: 0 }}>
            <PaymentSchedule
              detailData={editContract}
              tabActive={tabActiveKey}
              tabKey={tabKeys.tabPaymentSchedule}
              isSync={!!editContract?.maSAP}
            />
          </Col>
        </Tabs.TabPane>

        <Tabs.TabPane disabled={!params.id} tab={L(tabKeys.tabUpload)} key={tabKeys.tabUpload}>
          <Col sm={{ span: 24, offset: 0 }}>
            <FileUploadWrapV2
              multiple
              parentId={idDocument}
              fileStore={fileStore}
              onRemoveFile={onRemoveFile}
              beforeUploadFile={beforeUploadFile}
              acceptedFileTypes={fileTypeGroup.documentAndImage}
              maxSize={25}
              totalSize={50}
            />
          </Col>
        </Tabs.TabPane>
      </Tabs>

      <style scoped>{`.ant-table-wrapper { margin-bottom: 0px }`}</style>

      <AddendumModal
        visible={addendumModalVisible}
        isLoading={contractOfficeStore.isLoading}
        onOk={onAddendumOk}
        onCancel={() => setAddendumModalVisible(false)}
        formRef={formRef}
        formAddendum={formAddendum}
        selectedUnitIds={selectedUnitIds}
        listUnit={listUnit}
        addendumRents={addendumRentTable.items}
        columnsAddendumRent={buildColumns('addendumRent')}
        formAddendumRent={formAddendumRent}
        visibleActionAddendumRent={addendumRentTable.visibleAction}
        onAddAddendumRentRow={(unitId) => handleAddRow('addendumRent', unitId)}
        addendumManagements={addendumMgmtTable.items}
        columnsAddendumMgmt={buildColumns('addendumMgmt')}
        formAddendumMgmt={formAddendumMgmt}
        visibleActionAddendumMgmt={addendumMgmtTable.visibleAction}
        onAddAddendumMgmtRow={(unitId) => handleAddRow('addendumMgmt', unitId)}
        existingPayments={contractOfficeStore.listPaymentSchedule}
        onPaymentTermChange={(v) => onPaymentTermChange(v, true)}
        addendumPaymentTerm={addendumPaymentTerm}
      />

      <Modal
        open={paidConflictWarnings.length > 0}
        title={<span style={{ color: '#faad14' }}>⚠️ {L('ADDENDUM_PAID_CONFLICT_WARNING')}</span>}
        okButtonProps={{ style: { display: 'none' } }}
        onCancel={() => {
          setPaidConflictWarnings([])
          pendingAddendumRef.current = null
        }}
        cancelText={L('BTN_CLOSE')}
        width={700}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              {[
                L('CONTRACT_UNIT'),
                L('FEE_TYPE'),
                L('START_DATE'),
                L('END_DATE'),
                L('ADDENDUM_PAID_AMOUNT'),
                L('ADDENDUM_NEW_AMOUNT')
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #f0f0f0',
                    textAlign: h.includes('AMOUNT') ? 'right' : undefined
                  }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paidConflictWarnings.map((c, i) => {
              const unit = listUnit.find((u) => u.id === c.paid.unitId)
              const feeLabel =
                c.paid.feeTypeId === FeeTypeEnum.rentFee ? L('RENT_FEE') : L('FEE_TYPE_CONFIG_MANAGEMENT')
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '6px 8px', border: '1px solid #f0f0f0' }}>{unit?.name ?? c.paid.unitId}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #f0f0f0' }}>{feeLabel}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #f0f0f0' }}>{renderDate(c.paid.startDate)}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #f0f0f0' }}>{renderDate(c.paid.endDate)}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #f0f0f0', textAlign: 'right', color: '#389e0d' }}>
                    {formatNumber(c.paid.amount)}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #f0f0f0', textAlign: 'right', color: '#cf1322' }}>
                    {formatNumber(c.newAmount)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Modal>
    </WrapPageScroll>
  ) : (
    <NoRole />
  )
}

export default withRouter(
  inject(
    Stores.ContractOfficeStore,
    Stores.FileStore,
    Stores.SessionStore,
    Stores.FeeTypeStore
  )(observer(ContractOfficeDetail))
)
