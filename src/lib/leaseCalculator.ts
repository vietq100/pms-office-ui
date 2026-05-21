import AppConsts from './appconst'
import { calculateDuration } from './helper'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

export { calculateDuration }

/**
 * Đơn giá 1 tháng của detail.
 * Nếu isYearly = true thì amount là đơn giá 1 năm → chia 12.
 */
export const getMonthlyRate = (detail: any, isYearly = false): number => (isYearly ? detail.amount / 12 : detail.amount)

/**
 * Tính months/days cho đoạn [start, end] inclusive.
 * Dùng end+1day để diff (giống helper.calculateDuration).
 * days = exclusive count (0 = tháng tròn)
 */
const calcMonthsDays = (start: dayjs.Dayjs, end: dayjs.Dayjs): { months: number; days: number } => {
  const endExcl = end.add(1, 'day')
  const months = endExcl.diff(start, 'month')
  const afterMonths = start.add(months, 'month')
  const days = endExcl.diff(afterMonths, 'day')
  return { months, days }
}

/**
 * Tính totalAmount và totalAmountIncludeVat cho 1 detail row.
 * paymentDate + paymentTerm: xác định ngày kết thúc kỳ đầu để tính phần lệch đầu (daily)
 */
export const calcDetailAmounts = (
  startDate: dayjs.Dayjs | string,
  endDate: dayjs.Dayjs | string,
  amount: number,
  vatPercent: number,
  isYearly: boolean,
  paymentDate?: dayjs.Dayjs | string,
  paymentTerm?: number
): {
  months: number
  days: number
  vatAmount: number
  amountIncludeVat: number
  totalAmount: number
  totalAmountIncludeVat: number
} => {
  const start = dayjs(startDate).startOf('day')
  const end = dayjs(endDate).startOf('day')
  const { months, days } = calcMonthsDays(start, end)

  const monthlyExcl = isYearly ? amount / 12 : amount
  const monthlyIncl = monthlyExcl * (1 + vatPercent / 100)

  let totalExcl = 0
  let totalIncl = 0
  let cursor = start.clone()

  if (paymentDate && paymentTerm !== undefined) {
    const pDate = dayjs(paymentDate).startOf('day')
    const { QUARTER, YEAR } = AppConsts.contractOfficeTimeEnum
    const termMonths = paymentTerm === QUARTER ? 3 : paymentTerm === YEAR ? 12 : 1

    if (start.isBefore(pDate)) {
      // Kỳ đầu đặc biệt: start → pDate (daily)
      const segEnd = pDate.isSameOrBefore(end) ? pDate : end
      let cur = start.clone()
      while (cur.isSameOrBefore(segEnd)) {
        const daysInMonth = cur.daysInMonth()
        const endOfMonth = cur.endOf('month').startOf('day')
        const segEndInMonth = segEnd.isBefore(endOfMonth) ? segEnd : endOfMonth
        totalExcl += (monthlyExcl / daysInMonth) * (segEndInMonth.diff(cur, 'day') + 1)
        totalIncl += (monthlyIncl / daysInMonth) * (segEndInMonth.diff(cur, 'day') + 1)
        cur = endOfMonth.add(1, 'day')
      }
      cursor = pDate.add(1, 'day')
    } else {
      // Tìm periodStart = pDate+1 + N*termMonths <= start
      const periodBase = pDate.add(1, 'day')
      let n = 0
      while (periodBase.add((n + 1) * termMonths, 'month').isSameOrBefore(start)) n++
      const periodStart = periodBase.add(n * termMonths, 'month')

      if (start.isAfter(periodStart)) {
        // start lệch so với đầu kỳ → tính daily từ start đến cuối kỳ đó
        const periodEnd = periodStart.add(termMonths, 'month').subtract(1, 'day')
        const segEnd = periodEnd.isSameOrBefore(end) ? periodEnd : end
        let cur = start.clone()
        while (cur.isSameOrBefore(segEnd)) {
          const daysInMonth = cur.daysInMonth()
          const endOfMonth = cur.endOf('month').startOf('day')
          const segEndInMonth = segEnd.isBefore(endOfMonth) ? segEnd : endOfMonth
          totalExcl += (monthlyExcl / daysInMonth) * (segEndInMonth.diff(cur, 'day') + 1)
          totalIncl += (monthlyIncl / daysInMonth) * (segEndInMonth.diff(cur, 'day') + 1)
          cur = endOfMonth.add(1, 'day')
        }
        cursor = periodEnd.add(1, 'day')
      }
      // nếu start == periodStart: không lệch, cursor giữ nguyên = start
    }
  }

  // Tính các tháng từ cursor
  if (cursor.isSameOrBefore(end)) {
    const { months: m, days: d } = calcMonthsDays(cursor, end)
    totalExcl += m * monthlyExcl
    totalIncl += m * monthlyIncl

    if (d > 0) {
      const remainStart = cursor.add(m, 'month')
      const remainEndExcl = remainStart.add(d, 'day')
      let cur = remainStart.clone()
      while (cur.isBefore(remainEndExcl)) {
        const daysInMonth = cur.daysInMonth()
        const endOfMonth = cur.endOf('month').startOf('day')
        const segEndExcl = remainEndExcl.isBefore(endOfMonth.add(1, 'day')) ? remainEndExcl : endOfMonth.add(1, 'day')
        totalExcl += (monthlyExcl / daysInMonth) * segEndExcl.diff(cur, 'day')
        totalIncl += (monthlyIncl / daysInMonth) * segEndExcl.diff(cur, 'day')
        cur = endOfMonth.add(1, 'day')
      }
    }
  }

  return {
    months,
    days,
    vatAmount: Math.round(amount * (vatPercent / 100)),
    amountIncludeVat: Math.round(monthlyIncl),
    totalAmount: Math.round(totalExcl),
    totalAmountIncludeVat: Math.round(totalIncl)
  }
}

/**
 * Lấy tất cả details cover ngày date
 */
export const getDetailsForDate = (details: any[], date: dayjs.Dayjs): any[] =>
  details.filter((d: any) => {
    const ds = dayjs(d.startDate).startOf('day')
    const de = dayjs(d.endDate).startOf('day')
    return date.isSameOrAfter(ds) && date.isSameOrBefore(de)
  })

/**
 * Tính amount cho đoạn [segStart, segEnd] inclusive theo daily rate,
 * chia nhỏ theo boundary của từng detail và từng tháng.
 */
export const calcDailySegment = (
  details: any[],
  segStart: dayjs.Dayjs,
  segEnd: dayjs.Dayjs,
  isYearly = false
): number => {
  const boundaries = new Set<string>()
  boundaries.add(segStart.format('YYYY-MM-DD'))
  boundaries.add(segEnd.add(1, 'day').format('YYYY-MM-DD'))

  details.forEach((d) => {
    const ds = dayjs(d.startDate).startOf('day')
    const de = dayjs(d.endDate).startOf('day').add(1, 'day')
    if (ds.isAfter(segStart) && ds.isSameOrBefore(segEnd)) boundaries.add(ds.format('YYYY-MM-DD'))
    if (de.isAfter(segStart) && de.isSameOrBefore(segEnd.add(1, 'day'))) boundaries.add(de.format('YYYY-MM-DD'))
  })

  let m = segStart.startOf('month').add(1, 'month')
  while (m.isSameOrBefore(segEnd)) {
    boundaries.add(m.format('YYYY-MM-DD'))
    m = m.add(1, 'month')
  }

  const sortedPoints = Array.from(boundaries)
    .map((s) => dayjs(s))
    .sort((a, b) => a.diff(b))

  let amount = 0
  for (let i = 0; i < sortedPoints.length - 1; i++) {
    const from = sortedPoints[i]
    const to = sortedPoints[i + 1].subtract(1, 'day')
    if (from.isAfter(segEnd)) break
    const daysInSegment = to.diff(from, 'day') + 1
    const daysInMonth = from.daysInMonth()
    getDetailsForDate(details, from).forEach((d) => {
      amount += (getMonthlyRate(d, isYearly) / daysInMonth) * daysInSegment
    })
  }
  return amount
}

/**
 * Tính tổng amount cho kỳ [start, end] inclusive.
 */
export const calcScheduleAmount = (start: dayjs.Dayjs, end: dayjs.Dayjs, details: any[], isYearly = false): number => {
  const { months, days } = calcMonthsDays(start, end)
  let amount = 0

  for (let i = 0; i < months; i++) {
    const monthStart = start.add(i, 'month')
    const monthEnd = start.add(i + 1, 'month').subtract(1, 'day')
    const detailsAtStart = getDetailsForDate(details, monthStart)

    const allCoverFull = detailsAtStart.every((d) => dayjs(d.endDate).startOf('day').isSameOrAfter(monthEnd))
    const hasNewDetailInRange = details.some((d) => {
      const ds = dayjs(d.startDate).startOf('day')
      return ds.isAfter(monthStart) && ds.isSameOrBefore(monthEnd)
    })

    if (allCoverFull && !hasNewDetailInRange && detailsAtStart.length > 0) {
      detailsAtStart.forEach((d) => (amount += getMonthlyRate(d, isYearly)))
    } else {
      amount += calcDailySegment(details, monthStart, monthEnd, isYearly)
    }
  }

  if (days > 0) {
    const remainStart = start.add(months, 'month')
    const remainEnd = remainStart.add(days - 1, 'day')
    amount += calcDailySegment(details, remainStart, remainEnd, isYearly)
  }

  return Math.round(amount)
}

/**
 * Lấy leaseAgreementDetailId cho đoạn [segStart, segEnd]
 */
const getItemIdForDate = (details: any[], segStart: dayjs.Dayjs, segEnd: dayjs.Dayjs): number | undefined => {
  const overlapping = details.filter((d: any) => {
    const ds = dayjs(d.startDate).startOf('day')
    const de = dayjs(d.endDate).startOf('day')
    return segEnd.isSameOrBefore(de) && segStart.isSameOrAfter(ds)
  })
  return overlapping[0]?.id
}

/**
 * Tách đoạn [segStart, segEnd] thành các sub-kỳ theo boundary của details.
 * Nếu 1 kỳ span nhiều detail → tách thành N item đồng cấp.
 */
const splitByDetails = (
  details: any[],
  segStart: dayjs.Dayjs,
  segEnd: dayjs.Dayjs,
  isYearly = false,
  unitId?: number
): Array<{
  startDate: string
  endDate: string
  month: number
  day: number
  amount: number
  feeTypeId: number
  unitId: number | undefined
  leaseAgreementDetailId: number | undefined
  feeTypeDetailId: number | undefined
}> => {
  const boundaries = new Set<string>()
  boundaries.add(segStart.format('YYYY-MM-DD'))
  boundaries.add(segEnd.add(1, 'day').format('YYYY-MM-DD'))

  details.forEach((d) => {
    const ds = dayjs(d.startDate).startOf('day')
    const de = dayjs(d.endDate).startOf('day').add(1, 'day')
    if (ds.isAfter(segStart) && ds.isSameOrBefore(segEnd)) boundaries.add(ds.format('YYYY-MM-DD'))
    if (de.isAfter(segStart) && de.isSameOrBefore(segEnd.add(1, 'day'))) boundaries.add(de.format('YYYY-MM-DD'))
  })

  const sortedPoints = Array.from(boundaries)
    .map((s) => dayjs(s))
    .sort((a, b) => a.diff(b))

  return sortedPoints.slice(0, -1).map((from, i) => {
    const to = sortedPoints[i + 1].subtract(1, 'day')
    const { months, days } = calcMonthsDays(from, to)
    return {
      startDate: from.toISOString(),
      endDate: to.toISOString(),
      month: months,
      day: days,
      amount: calcScheduleAmount(from, to, details, isYearly),
      feeTypeId: details[0].feeTypeId,
      unitId,
      leaseAgreementDetailId: getItemIdForDate(details, from, to),
      feeTypeDetailId: getDetailsForDate(details, from)[0]?.feeTypeDetailId
    }
  })
}

/**
 * Generate payment schedule cho 1 feeType
 */
export const generateSchedule = (
  details: any[],
  commencementDate: string,
  expiryDate: string,
  paymentTerm: number,
  paymentDate?: string,
  unitId?: number,
  startPeriodIndex = 1
): any[] => {
  if (!details.length) return []

  const { QUARTER, YEAR } = AppConsts.contractOfficeTimeEnum
  const termMonths = paymentTerm === QUARTER ? 3 : paymentTerm === YEAR ? 12 : 1

  const start = dayjs(commencementDate).startOf('day')
  const end = dayjs(expiryDate).startOf('day')
  const pDate = paymentDate ? dayjs(paymentDate).startOf('day') : null

  const result: any[] = []
  let cursor = start.clone()
  let periodIndex = startPeriodIndex

  const pushItems = (items: any[]) => {
    if (items.length === 1) {
      result.push({ ...items[0], name: `PERIOD_${periodIndex}` })
    } else {
      items.forEach((item, i) => {
        result.push({ ...item, name: `PERIOD_${periodIndex}_PATH_${i + 1}` })
      })
    }
    periodIndex++
  }

  const isYearly = paymentTerm === YEAR

  // Kỳ đầu đặc biệt: commencementDate → paymentDate
  if (pDate && pDate.isAfter(start)) {
    const segEnd = pDate.isSameOrBefore(end) ? pDate : end
    pushItems(splitByDetails(details, cursor, segEnd, isYearly, unitId))
    cursor = pDate.add(1, 'day')
  }

  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    const termEnd = cursor.add(termMonths, 'month').subtract(1, 'day')

    if (termEnd.isBefore(end) || termEnd.isSame(end, 'day')) {
      pushItems(splitByDetails(details, cursor, termEnd, isYearly, unitId))
      cursor = termEnd.add(1, 'day')
    } else {
      pushItems(splitByDetails(details, cursor, end, isYearly, unitId))
      break
    }
  }

  return result
}
