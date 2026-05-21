import { Avatar, Modal, notification, Tooltip, Select, Tag } from 'antd'
import { cookieKeys, notificationTypes, emailRegex, moduleAvatar, themeByEvent } from './appconst'
import { ManOutlined, WomanOutlined } from '@ant-design/icons/lib'
import { L } from '@lib/abpUtility'
import { StatusModel } from '@models/global'
import ItemStatus from '@components/AppComponentBase/ItemStatus'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import DotStatus from '@components/AppComponentBase/dotStatus'

dayjs.extend(utc)
const { colorByLetter } = moduleAvatar
const { Option } = Select

export const convertMonth = (currentFilter, newDatePicker, ActivityDateTime?) => {
  const dateName = ActivityDateTime ? ActivityDateTime : 'ActivityDateTime'
  const date = new Date()
  const offset = date.getTimezoneOffset() / 60
  const dateSelect = newDatePicker
    ? dayjs(newDatePicker)
        .utcOffset(0)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
        .startOf('month')
        .set('hour', 0 + offset)
        .toISOString()
    : undefined

  return { ...currentFilter, [dateName]: dateSelect }
}

export const convertDate = (currentFilter, newDatePicker, ActivityDateTime?) => {
  const dateName = ActivityDateTime ? ActivityDateTime : 'ActivityDateTime'
  const date = new Date()
  const offset = date.getTimezoneOffset() / 60
  const dateSelect = newDatePicker
    ? dayjs(newDatePicker)
        .utcOffset(0)
        .set('hour', 0 + offset)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
        .toISOString()
    : undefined

  return { ...currentFilter, [dateName]: dateSelect }
}

export const converUTCDateRangePicker = (value) => {
  const date = new Date()
  const offset = date.getTimezoneOffset() / 60

  return {
    [0]: value
      ? dayjs(value[0])
          .utcOffset(0)

          .set('hour', 0 + offset)
          .set('minute', 0)
          .set('second', 0)
          .set('millisecond', 0)
          .toISOString()
      : undefined,
    [1]: value
      ? dayjs(value[1])
          .utcOffset(0)

          .set('hour', 24 + offset - 1)
          .set('minute', 59)
          .set('second', 59)
          .set('millisecond', 999)
          .toISOString()
      : undefined
  }
}

export const convertFilterDate = (currentFilter, newDatePicker, fromName?, toName?) => {
  const fName = fromName ? fromName : 'fromDate'
  const tName = toName ? toName : 'toDate'
  const date = new Date()
  const offset = date.getTimezoneOffset() / 60
  const fromDate = newDatePicker
    ? dayjs(newDatePicker[0])
        .utcOffset(0)

        .set('hour', 0 + offset)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
        .toISOString()
    : undefined
  const toDate = newDatePicker
    ? dayjs(newDatePicker[1])
        .utcOffset(0)

        .set('hour', 24 + offset - 1)
        .set('minute', 59)
        .set('second', 59)
        .set('millisecond', 999)
        .toISOString()
    : undefined
  return { ...currentFilter, [fName]: fromDate, [tName]: toDate }
}

export const convertFilterLatModifiDate = (
  currentFilter,
  newDatePicker,
  FromLastModificationDate?,
  ToLastModificationDate?
) => {
  const fName = FromLastModificationDate ? FromLastModificationDate : 'FromLastModificationDate'
  const tName = ToLastModificationDate ? ToLastModificationDate : 'ToLastModificationDate'
  const date = new Date()
  const offset = date.getTimezoneOffset() / 60
  const fromDate = newDatePicker
    ? dayjs(newDatePicker[0])
        .utcOffset(0)
        .set('hour', 0 + offset)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
        .toISOString()
    : undefined
  const toDate = newDatePicker
    ? dayjs(newDatePicker[1])
        .utcOffset(0)
        .set('hour', 24 + offset - 1)
        .set('minute', 59)
        .set('second', 59)
        .set('millisecond', 999)
        .toISOString()
    : undefined
  return { ...currentFilter, [fName]: fromDate, [tName]: toDate }
}

export function getBase64(img, callback) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}
export const removeDuplicateObjectInArray = (array: any[], key: string) => {
  const result = array.filter((v, i, a) => a.findIndex((v2) => v2[key] === v[key]) === i)
  return result
}
export const notifyError = (title: string, content: string) => {
  Modal.error({ title, content })
}

export const notifySuccess = (message: string, description: string) => {
  notification.success({ message, description })
}

export const notifyInfo = (message: string, description: string) => {
  notification.warning({ message, description })
}

export function isNullOrEmpty(text) {
  return !text || (text = text.trim()).length < 1
}

export function isObjectUndefinedOrNull(obj) {
  return obj == undefined || obj == null
}

export function isValidEmail(text) {
  if (!text || isNullOrEmpty(text)) {
    return false
  }
  return emailRegex.test(text)
}

export function filterOptions(input, option) {
  return option?.children?.toLowerCase().indexOf(input?.toLowerCase()) >= 0
}

export function arrayToObject(arr, key, value) {
  return (arr || []).reduce((obj, current) => {
    return { ...obj, [current[key]]: current[value] }
  }, {})
}

export function getFirstLetterAndUpperCase(text) {
  return text && text.length ? text.charAt(0).toUpperCase() : 'G'
}

export function hexToRGB(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null
}

export function getCountDownXmasMessage(loaderMessage) {
  // Find the distance between now and the count down date
  // Get today's date and time
  const countDownDate = new Date(new Date().getFullYear(), 11, 25).getTime()
  const now = new Date().getTime()
  const distance = countDownDate - now

  // Time calculations for days, hours, minutes and seconds
  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  return days === 0 ? 'Merry Christmas!' : (loaderMessage || '').replace('{0}', `${days}`)
}

export function initMultiLanguageField() {
  return (abp.localization.languages || []).map((lang) => {
    return { languageName: lang.name, icon: lang.icon, value: '' }
  })
}

export function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function mapMultiLanguageField(existLangs) {
  return (abp.localization.languages || []).map((lang) => {
    const currentLang = existLangs.find((item) => item.languageName === lang.name) || {}
    return { ...currentLang, languageName: lang.name, icon: lang.icon }
  })
}

export function isBetween(start, end, current) {
  // Format date to remove second
  const startStr = dayjs(start).format('MM/DD/YYYY HH:mm')
  const endStr = dayjs(end).format('MM/DD/YYYY HH:mm')
  const currentStr = dayjs(current).format('MM/DD/YYYY HH:mm')
  const mStart = dayjs(startStr)
  const mEnd = dayjs(endStr)
  const mCurrent = dayjs(currentStr)
  return mStart.isBefore(mCurrent) && mEnd.isAfter(mCurrent)
}

export function isSame(timeA, timeB) {
  const timeAStr = dayjs(timeA).format('MM/DD/YYYY HH:mm')
  const timeBStr = dayjs(timeB).format('MM/DD/YYYY HH:mm')
  const mTimeA = dayjs(timeAStr)
  const mTimeB = dayjs(timeBStr)

  return mTimeA.isSame(mTimeB)
}

export function renderAvatar(value, row?, showUserName?, secondInfo?, showGender?) {
  if (!row) {
    row = {}
  }
  const firstLetter = getFirstLetterAndUpperCase(value || 'G')
  const color = colorByLetter(firstLetter)
  return (
    <>
      <div className="table-cell-profile">
        <div>
          <Avatar src={row.profilePictureUrl} style={{ background: color }}>
            {firstLetter}
          </Avatar>
        </div>
        <div className="info ml-2">
          <div className="full-name text-truncate">
            {showGender ?? ''}
            {/* {showGender && L(row.gender === null ? '' : row.gender === true ? 'GENDER_MR' : 'GENDER_MS')} */}
            {value}
          </div>
          {secondInfo && <div className="phone text-truncate text-muted">{secondInfo}</div>}
          {row.phone && <div className="phone text-truncate text-muted">{row.phone}</div>}
          {row.emailAddress && !showUserName && (
            <div className="email text-truncate text-muted">{row.emailAddress}</div>
          )}
          {row.userName && !!showUserName && <div className="phone text-truncate text-muted">{row.userName}</div>}
        </div>
      </div>
    </>
  )
}

export function renderImage(fileUrl, leter?) {
  const firstLetter = getFirstLetterAndUpperCase(leter || 'G')
  return <Avatar src={fileUrl}>{firstLetter}</Avatar>
}

export function renderGender(value) {
  return <>{value ? <ManOutlined /> : <WomanOutlined />}</>
}
export function renderOptions(options, log?, showTooltip?) {
  if (log) {
    console.log(options)
  }
  if (showTooltip === true) {
    return (options || []).map((option, index) => (
      <Option key={index} value={option.value || option.id}>
        <Tooltip title={option.label || option.name}>{option.label || option.name || option.value}</Tooltip>
      </Option>
    ))
  } else {
    return (options || []).map((option, index) => (
      <Option key={index} value={option.value || option.id} disabled={option.disabled}>
        {option.label || option.displayName || option.name || option.notificationName}
      </Option>
    ))
  }
}

export function renderDate(value) {
  if (value && dayjs(value).isValid()) {
    // TODO using global format
    value = dayjs(value).format('DD/MM/YYYY')
  }

  return value
}

export function renderDateTime(value) {
  if (value && dayjs(value).isValid()) {
    // TODO using global format
    value = dayjs(value).format('DD/MM/YYYY HH:mm')
  }

  return value
}

export function renderTimeDate(value) {
  if (value && dayjs(value).isValid()) {
    // TODO using global format
    value = dayjs(value).format('HH:mm - DD/MM/YYYY')
  }

  return value
}

export function renderTime(value) {
  if (value && dayjs(value).isValid()) {
    // TODO using global format
    value = dayjs(value).format('HH:mm')
  }

  return value
}

export function renderIsActive(value) {
  return (
    <ItemStatus
      status={{
        id: 0,
        name: L(value ? 'ACTIVE' : 'FAILURE'),
        colorCode: value ? '#689F38' : '#EB7077',
        borderColorCode: value ? '#689F38' : '#EB7077'
      }}
    />
  )
}

export function renderIsActiveBlue(value) {
  return (
    <div className="d-flex justify-content-center ">
      <p
        style={{
          color: value ? '#096DD9' : '#EB7077',
          backgroundColor: value ? '#E6F7FF' : '#f7c5c8',
          border: `1px solid ${value ? '#91D5FF' : '#EB7077'}`,
          borderRadius: '4px',
          padding: '4px 8px',
          width: 'fit-content',
          fontWeight: 600,
          textAlign: 'center'
        }}>
        {L(value ? 'ACTIVE' : 'FAILURE')}
      </p>
    </div>
  )
}

function lightenColor(hex, percent) {
  // Convert hex color to RGB
  if (hex) {
    const num = parseInt(hex.slice(1), 16)
    const r = (num >> 16) + ((255 - (num >> 16)) * percent) / 100
    const g = ((num >> 8) & 0x00ff) + ((255 - ((num >> 8) & 0x00ff)) * percent) / 100
    const b = (num & 0x0000ff) + ((255 - (num & 0x0000ff)) * percent) / 100

    // Ensure values are within 0-255 range
    const newR = Math.max(0, Math.min(255, Math.round(r)))
    const newG = Math.max(0, Math.min(255, Math.round(g)))
    const newB = Math.max(0, Math.min(255, Math.round(b)))

    // Convert back to hex
    const newColor = (newR << 16) | (newG << 8) | newB
    return `#${newColor.toString(16).padStart(6, '0')}`
  }
  return hex
}

export function renderStatusEform(name, color) {
  const bgColor = lightenColor(color, 80)

  return (
    <span
      style={{
        fontSize: 12,
        backgroundColor: bgColor ? bgColor : '#E2EEFE',
        color: color ? color : '#1178F5',
        padding: '6px 8px',
        borderRadius: '8px',
        fontWeight: 600
      }}>
      {L(name)}
    </span>
  )
}

export function renderStatusActive(value) {
  return value === true ? (
    <span
      style={{
        fontSize: 12,
        backgroundColor: '#E2EEFE',
        color: '#1178F5',
        padding: '6px 8px',
        borderRadius: '8px',
        fontWeight: 600
      }}>
      {L('ACTIVE')}
    </span>
  ) : (
    <span
      style={{
        fontSize: 12,
        backgroundColor: '#FCE4E4',
        color: '#840B1F',
        padding: '6px 8px',
        borderRadius: '8px',
        fontWeight: 600
      }}>
      {L('INACTIVE')}
    </span>
  )
}

export function renderIsAvailable(value) {
  return (
    <ItemStatus
      status={{
        id: 0,
        name: L(value ? 'SUCCESS' : 'INACTIVE'),
        colorCode: value ? '#689F38' : '#EB7077',
        borderColorCode: value ? '#689F38' : '#EB7077'
      }}
    />
  )
}

export function renderDotActive(value) {
  return (
    <DotStatus
      status={{
        id: 0,
        name: L(value ? 'ACTIVE' : 'INACTIVE'),
        colorCode: value ? '#689F38' : '#EB7077',
        borderColorCode: value ? '#689F38' : '#EB7077'
      }}
    />
  )
}

export function renderStatus(value, colorCode, borderColorCode) {
  return (
    <ItemStatus
      status={{
        id: 0,
        name: L(value),
        colorCode: colorCode,
        borderColorCode: borderColorCode
      }}
    />
  )
}

export function renderLogo(logoUrl, projectName, size = 64) {
  const firstLetter = getFirstLetterAndUpperCase(projectName || 'G')
  const color = colorByLetter(firstLetter)
  return (
    <>
      <div className="table-cell-profile">
        <div>
          <Avatar shape="square" size={size} src={logoUrl} style={{ background: color }}>
            {firstLetter}
          </Avatar>
        </div>
      </div>
    </>
  )
}

export function renderTag(value, color, backgroundColor?) {
  return (
    <Tag className="cell-round mr-0" style={{ backgroundColor, color, border: 'none' }}>
      {value}
    </Tag>
  )
}

export function compressImage(file, maxSize) {
  const image = new Image()
  const canvas = document.createElement('canvas')
  const dataURItoBlob = function (dataURI) {
    const bytes =
      dataURI.split(',')[0].indexOf('base64') >= 0 ? atob(dataURI.split(',')[1]) : unescape(dataURI.split(',')[1])
    const mime = dataURI.split(',')[0].split(':')[1].split(';')[0]
    const max = bytes.length
    const ia = new Uint8Array(max)
    for (let i = 0; i < max; i++) ia[i] = bytes.charCodeAt(i)
    return new Blob([ia], { type: mime })
  }
  const reader = new FileReader()
  const resize = function () {
    let width = image.width
    let height = image.height
    if (width > height) {
      if (width > maxSize) {
        height *= maxSize / width
        width = maxSize
      }
    } else {
      if (height > maxSize) {
        width *= maxSize / height
        height = maxSize
      }
    }
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d')?.drawImage(image, 0, 0, width, height)
    const dataUrl = canvas.toDataURL('image/jpeg')
    return dataURItoBlob(dataUrl)
  }
  return new Promise(function (ok, no) {
    if (!file.type.match(/image.*/)) {
      no(new Error('Not an image'))
      return
    }
    reader.onload = function (readerEvent) {
      image.onload = function () {
        return ok(resize())
      }
      image.src = readerEvent.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

// Link prepare
export function buildFileUrlWithEncToken(fileUrl) {
  return fileUrl && fileUrl.length
    ? `${fileUrl}&encToken=${encodeURIComponent(abp.utils.getCookieValue(cookieKeys.encToken))}`
    : ''
}

export function prepareLinkQueryString(params, url) {
  if (!isObjectUndefinedOrNull(params)) {
    let index = 0
    let query = ''
    Object.keys(params).map((key) => {
      const bullet = index === 0 ? '?' : '&'
      let value = params[key]
      if (Array.isArray(params[key])) {
        value = ''
        params[key].map((item) => {
          value += (value.length ? '&' : '') + `${key}=${item}`
        })
        query = query + bullet + value
      } else {
        query = query + bullet + key + '=' + value
      }
      index++
    })

    return url + query
  }
  return url
}

export function image2Base64(img: File | Blob | undefined) {
  if (!img) {
    return Promise.resolve('')
  }
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result))
    reader.readAsDataURL(img)
  })
}

export function getLocalLocale() {
  // ts trick to avoid type checking
  const _navigator: any = navigator
  return _navigator.userLanguage || 'vi'
}

export function formatCurrency(val: string | number, locale?: string, currency = 'VND') {
  const convertedNum = Number(val)
  if (isNaN(convertedNum)) return val

  const _locale = locale || getLocalLocale()

  return new Intl.NumberFormat(_locale, { style: 'currency', currency }).format(convertedNum)
}

export function formatNumber(val: string | number, locale = 'en') {
  const convertedNum = Number(val)
  if (isNaN(convertedNum)) return ''

  const _locale = locale || getLocalLocale()

  return new Intl.NumberFormat(_locale).format(convertedNum)
}

export function formatInteger(val: string | number, locale = 'en') {
  const convertedNum = Number(val)
  if (isNaN(convertedNum)) return ''

  const _locale = locale || getLocalLocale()

  return new Intl.NumberFormat(_locale, {
    maximumFractionDigits: 0 // Không hiển thị phần thập phân
  }).format(convertedNum)
}
export function formatOneDecimal(val: string | number, locale = 'en') {
  const convertedNum = Number(val)
  if (isNaN(convertedNum)) return ''

  const _locale = locale || getLocalLocale()

  return new Intl.NumberFormat(_locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1 // Làm tròn đến 1 số thập phân
  }).format(convertedNum)
}

export function inputCurrencyFormatter(value, symbol = 'đ') {
  return `${symbol} ${(value + '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

// export function inputCurrencyParse(value, symbol = 'đ') {
//   return value
//     .replace(symbol, '')
//     .replace(' ', '')
//     .replace('.', '')
//     .replace(/\$\s?|(,*)/g, '')
// }

export function inputCurrencyParse(value, symbol = 'đ') {
  return (
    parseFloat(
      value
        .replace(new RegExp(`\\${symbol}`, 'g'), '')
        .replace(/\s/g, '')
        .replace(/,/g, '')
        .replace(/[^\d.]/g, '')
    ) || 0
  )
}

export function inputNumberFormatter(value) {
  return `${(value + '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

export function inputNumberParse(value) {
  return value.replace(/\$\s?|(,*)/g, '')
}

export function compactObject(obj) {
  const keys = Object.keys(obj)
  return keys.reduce((result, key) => {
    if (obj[key]) result[key] = obj[key]
    return result
  }, {})
}

// Notification
export function getNotificationAction(userNotification: any) {
  if (userNotification.notification.notificationName === 'App.DownloadInvalidImported') {
    return notificationTypes.download
  }
  if (userNotification.notification?.data?.properties.Id && userNotification.notification?.data?.properties.Type) {
    return notificationTypes.gotoDetail
  }

  return notificationTypes.text
}

export function changeBackgroundByEvent(event?) {
  //Start the snow default options you can also make it snow in certain elements, etc.
  const { events } = themeByEvent
  switch (event) {
    case events.xmasNight:
    case events.xmasHouse:
    case events.xmasSanta: {
      const fjs = document.getElementsByTagName('script')[0]
      if (document.getElementById('blog-xtraffic-snow-effect')) return
      const js = document.createElement('script')
      js.id = 'blog-xtraffic-snow-effect'
      js.src = 'assets/snow-storm.js'
      fjs.parentNode && fjs.parentNode.insertBefore(js, fjs)
      break
    }
  }
}
export function getPreviewFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

export const mapActiveStatus = (isActive) => {
  return isActive ? new StatusModel('ACTIVE', '#689F38') : new StatusModel('INACTIVE', '#EB7077')
}

export function inputPercentFormatter(value) {
  return `${(value + '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')} %`
}

export function inputPercentParse(value) {
  return value
    .replace('%', '')
    .replace(' ', '')
    .replace(/\$\s?|(,*)/g, '')
}

export const getCursortPositionAfterFormatNumber = (e, num, commaCount, setCommaCount) => {
  const element = e.target
  const totalCommas = (num.match(/,/g) || []).length
  let cursor = e.target.selectionStart
  if (commaCount > totalCommas) {
    //shift cursor to the left (a comma was removed)
    setCommaCount(commaCount - 1)
    cursor--
  } else if (commaCount < totalCommas) {
    // shift cursor to the right (a comma was added)
    setCommaCount(commaCount + 1)
    cursor++
  }

  window.requestAnimationFrame(() => {
    element.selectionStart = cursor
    element.selectionEnd = cursor
  })
}

export const numberExponentToLarge = (numIn) => {
  if (numIn === undefined || numIn === null) {
    return ''
  }
  numIn += '' // To cater to numric entries
  let sign = '' // To remember the number sign
  numIn.charAt(0) == '-' && ((numIn = numIn.substring(1)), (sign = '-')) // remove - sign & remember it
  let str = numIn.split(/[eE]/g) // Split numberic string at e or E
  if (str.length < 2) return sign + numIn // Not an Exponent Number? Exit with orginal Num back
  const power = str[1] // Get Exponent (Power) (could be + or -)

  const deciSp = (1.1).toLocaleString().substring(1, 2) // Get Deciaml Separator
  str = str[0].split(deciSp) // Split the Base Number into LH and RH at the decimal point
  let baseRH = str[1] || '', // RH Base part. Make sure we have a RH fraction else ""
    baseLH = str[0] // LH base part.

  if (power >= 0) {
    // ------- Positive Exponents (Process the RH Base Part)
    if (power > baseRH.length) baseRH += '0'.repeat(power - baseRH.length) // Pad with "0" at RH
    baseRH = baseRH.slice(0, power) + deciSp + baseRH.slice(power) // Insert decSep at the correct place into RH base
    if (baseRH.charAt(baseRH.length - 1) == deciSp) baseRH = baseRH.slice(0, -1) // If decSep at RH end? => remove it
  } else {
    // ------- Negative exponents (Process the LH Base Part)
    const num = Math.abs(power) - baseLH.length // Delta necessary 0's
    if (num > 0) baseLH = '0'.repeat(num) + baseLH // Pad with "0" at LH
    baseLH = baseLH.slice(0, power) + deciSp + baseLH.slice(power) // Insert "." at the correct place into LH base
    if (baseLH.charAt(0) == deciSp) baseLH = '0' + baseLH // If decSep at LH most? => add "0"
  }
  // Rremove leading and trailing 0's and Return the long number (with sign)
  return sign + (baseLH + baseRH).replace(/^0*(\d+|\d+\.\d+?)\.?0*$/, '$1')
}

export const customizeIcon = (fileSystemItem) => {
  if (fileSystemItem.isDirectory) {
    return 'assets/icons/folder.svg'
  }
  const fileExtension = fileSystemItem.getFileExtension()

  switch (fileExtension) {
    case '.doc':
    case '.docx':
      return 'assets/icons/word.svg'
    case '.pdf':
      return 'assets/icons/pdf.svg'
    case '.xlsx':
      return 'assets/icons/excel.svg'
    case '.pptx':
      return '/assets/icons/powerpoint.svg'
    case '.png':
    case '.jpg':
    case '.jpeg':
      return 'assets/icons/imageIcon.svg'
    default:
      return 'assets/icons/image-file.svg'
  }
}

export function lamTronSo(number) {
  const lamTron = Math.round(number * 100) / 100 // Làm tròn đến 3 chữ số thập phân
  if (lamTron % 1 === 0) {
    return Math.round(lamTron)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      .replace(/\./g, ',') // Trả về số nguyên nếu không có dư
  } else {
    return lamTron
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      .replace(/\./g, ',') // Trả về số thập phân nếu có dư
  }
}
export const formatNumberToTy = (value) => {
  if (value >= 100000000000) {
    return lamTronSo(value / 1000000000) + ' B'
  } else {
    return formatCurrency(value)
  }
}

export const getLighterColor = (color, percentage) => {
  // Convert the color to rgba
  const colorConvert = color ?? '#ffffff'
  const rgbaColor = colorConvert
    .replace(/^#/, '')
    .match(/.{2}/g)
    .map((hex) => parseInt(hex, 16))
    .concat(1) // Add alpha 1 for opacity

  // Adjust the alpha (transparency)
  rgbaColor[3] = rgbaColor[3] * (1 - percentage)
  return `rgba(${rgbaColor[0]}, ${rgbaColor[1]}, ${rgbaColor[2]}, ${rgbaColor[3]})`
}

export const calculateDuration = (startDate, endDate) => {
  const start = dayjs(startDate).startOf('day')
  const end = dayjs(endDate).startOf('day').add(1, 'day') // Thêm 1 ngày để tính cả ngày kết thúc

  // Tổng số tháng giữa 2 thời điểm
  const totalMonths = end.diff(start, 'month')
  const afterMonths = start.add(totalMonths, 'month')

  // Số ngày còn lại sau khi trừ đi số tháng
  const days = end.diff(afterMonths, 'day')

  return {
    months: totalMonths,
    days
  }
}

export const calculateDurationToText = (startDate, endDate) => {
  const start = dayjs(startDate)
  const end = dayjs(endDate).add(1, 'days')

  let years = end.diff(start, 'year')
  const nextYear = start.add(years, 'year')

  let months = end.diff(nextYear, 'month')
  const nextMonth = nextYear.add(months, 'month')

  let days = end.diff(nextMonth, 'day')

  // Làm tròn nếu đủ gần 1 năm (ví dụ >= 11 tháng 25 ngày)
  if (years === 0 && months === 12) {
    years = 1
    months = 0
    days = 0
  }

  return `${years} ${L('YEARS')} ${months} ${L('MONTHS')} ${days} ${L('DAYS')}`
}

export const addItemToList = (listItem: any[], itemToList: any) => {
  if (!listItem.find((item) => item?.id === itemToList?.id)) {
    listItem.push(itemToList)
  }
  return listItem
}

export const capitalizeWords = (str: string) =>
  str
    .split(' ')
    .map((word) => {
      if (!word) return ''
      const [first, ...rest] = [...word] // spread handles Unicode correctly
      return first.toLocaleUpperCase('vi') + rest.join('')
    })
    .join(' ')
