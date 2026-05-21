import { L } from './abpUtility'
import { ExcelIcon, ImageIcon, OtherFileIcon, PdfIcon, WordIcon, PowerPointIcon } from '@components/Icon'
import { OptionModel } from '@models/global'
import dayjs from 'dayjs'

export const AppConfiguration = {
  appBaseUrl: '',
  remoteServiceBaseUrl: '',
  googleMapKey: '',
  appLayoutConfig: {} as any,
  powerBIUrl: ''
}
export const tableScrollConfig = {
  x: 1024,
  scrollToFirstRowOnChange: true,
  y: window.innerHeight - 280
}
export const validateStatus = {
  validating: 'validating',
  success: 'success',
  error: 'error',
  warning: 'warning'
}

export const firebaseConfig = {
  apiKey: 'AIzaSyC1O_SvxxAwKajBn86tzT_sKHEH0b9q_FE',
  authDomain: 'pms-highgate-841f7.firebaseapp.com',
  projectId: 'pms-highgate-841f7',
  storageBucket: 'pms-highgate-841f7.appspot.com',
  messagingSenderId: '626596819779',
  appId: '1:626596819779:web:6ef9f9860d0bee34d6f5f6',
  measurementId: 'G-JRJZDFV56L'
}
export const keySyncfusion =
  'Mgo+DSMBaFt+QHJqVk1hXk5Hd0BLVGpAblJ3T2ZQdVt5ZDU7a15RRnVfRFxgSXtRdEBrUHdXcw==;Mgo+DSMBPh8sVXJ1S0R+X1pFdEBBXHxAd1p/VWJYdVt5flBPcDwsT3RfQF5jT39QdkBhW3pXcHRQRQ==;ORg4AjUWIQA/Gnt2VFhiQlJPd11dXmJWd1p/THNYflR1fV9DaUwxOX1dQl9gSXhSdUVmW31beXRXRWM=;MjQwMTE3MUAzMjMxMmUzMDJlMzBWcml5T3JFdkRac1o1cnRPYnRHQ3ozaEZvZlEzOFlxSFpyVGhBLzBQQ3pJPQ==;MjQwMTE3MkAzMjMxMmUzMDJlMzBUckg5NjlJaXpaeG1LQm52MFN5SzFra3hvOFVueVlFWUsraDNKTE5pd1hJPQ==;NRAiBiAaIQQuGjN/V0d+Xk9HfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hSn5Vd0ZjXH1cdX1UR2Nf;MjQwMTE3NEAzMjMxMmUzMDJlMzBjR3NEUGdBbnpEaUt3NXJTQVpBMHZqWnJ4U0lDUVBCdlVhUS9Vb1J3UTMwPQ==;MjQwMTE3NUAzMjMxMmUzMDJlMzBqNTRTVDdWQVhOeCt0eEdNendTYUFSSXE2M3EyQktwZkRGZ21oL2RLY0tzPQ==;Mgo+DSMBMAY9C3t2VFhiQlJPd11dXmJWd1p/THNYflR1fV9DaUwxOX1dQl9gSXhSdUVmW31beXZVQWM=;MjQwMTE3N0AzMjMxMmUzMDJlMzBhVGlYV1ZGcGs2Z09kTkNNV3ZlUEYzODYvOEdkWFFpc21FcnVTQ2NiVG5ZPQ==;MjQwMTE3OEAzMjMxMmUzMDJlMzBpNnpqYVpiTUFiQ2F2MWZyUit5dGcwSVdLZC9DcXhLbHlIbUNYSmFPV0k4PQ==;MjQwMTE3OUAzMjMxMmUzMDJlMzBjR3NEUGdBbnpEaUt3NXJTQVpBMHZqWnJ4U0lDUVBCdlVhUS9Vb1J3UTMwPQ=='

const AppConsts = {
  title: 'CPMS',
  align: {
    right: 'right' as const,
    left: 'left' as const,
    center: 'center' as const
  },
  dataType: {
    string: 'string' as const,
    number: 'number' as const,
    boolean: 'boolean' as const,
    method: 'method' as const,
    regexp: 'regexp' as const,
    integer: 'integer' as const,
    float: 'float' as const,
    object: 'object' as const,
    enum: 'enum' as const,
    date: 'date' as const,
    url: 'url' as const,
    hex: 'hex' as const,
    email: 'email' as const
  },
  formVerticalLayout: {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 24 },
      md: { span: 24 },
      lg: { span: 24 },
      xl: { span: 24 },
      xxl: { span: 24 }
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 24 },
      md: { span: 24 },
      lg: { span: 24 },
      xl: { span: 24 },
      xxl: { span: 24 }
    }
  },
  formHorizontalLayout: {
    labelCol: {
      xs: { span: 12 },
      sm: { span: 12 },
      md: { span: 12 },
      lg: { span: 6 },
      xl: { span: 6 },
      xxl: { span: 4 }
    },
    wrapperCol: {
      xs: { span: 12 },
      sm: { span: 12 },
      md: { span: 12 },
      lg: { span: 18 },
      xl: { span: 18 },
      xxl: { span: 20 }
    }
  },
  projectCategoryTarget: {
    unitType: 'UNITTYPE',
    unitStatus: 'UNITSTATUS',
    memberRole: 'MEMBERROLE',
    memberType: 'MEMBERTYPE'
  },
  typeMerderReading: {
    electric: 1,
    water: 2
  },

  bankCode: {
    operationBankAccount: 'OBA',
    depositBankAccount: 'DBA'
  },

  lableTemplate: {
    master: 'MASTER',
    currentProject: 'CURRENT_PROJECT'
  },
  currencyType: {
    vietName: 'VIET_NAM_DONG'
  },
  statusVehicle: {
    cannel: true,
    notCannel: false
  },

  selectItem: {
    all: -1
  },

  inspectionChecklistHandover: {
    GOOD: 3,
    FAIR: 2,
    POOR: 1
  },

  inspectionRating: [
    {
      name: 'Good',
      value: 3,
      get label() {
        return L('GOOD')
      }
    },
    {
      name: 'Fair',
      value: 2,
      get label() {
        return L('FAIR')
      }
    },
    {
      name: 'Poor',
      value: 1,
      get label() {
        return L('POOR')
      }
    }
  ],

  feeAvailableStatus: [
    {
      name: 'All',
      value: ' ',
      get label() {
        return L('ALL')
      }
    },
    {
      name: 'Active',
      value: 'true',
      get label() {
        return L('SUCCESSFUL_FEE_GENERATION')
      }
    },
    {
      name: 'Generate failure fee',
      value: 'false',
      get label() {
        return L('GENRATE_FAILURE_FEE')
      }
    }
  ],
  airConditionerStatus: [
    {
      name: 'All',
      value: ' ',
      get label() {
        return L('ALL')
      }
    },
    {
      name: 'Used',
      value: 'true',
      get label() {
        return L('USED_AIR_CONDITIONER')
      }
    },
    {
      name: 'Unused',
      value: 'false',
      get label() {
        return L('NO_USED_AIR_CONDITIONER')
      }
    }
  ],
  activeStatus: [
    {
      name: 'All',
      value: ' ',
      get label() {
        return L('ALL')
      }
    },
    {
      name: 'Active',
      value: 'true',
      get label() {
        return L('ACTIVE')
      }
    },
    {
      name: 'Inactive',
      value: 'false',
      get label() {
        return L('INACTIVE')
      }
    }
  ],
  activeStatusNotAll: [
    {
      name: 'Active',
      value: 'true',
      get label() {
        return L('ACTIVE')
      }
    },
    {
      name: 'Inactive',
      value: 'false',
      get label() {
        return L('INACTIVE')
      }
    }
  ],
  listStatusActive: [
    {
      name: 'Active',
      value: true,
      get label() {
        return L('ACTIVE')
      }
    },
    {
      name: 'Inactive',
      value: false,
      get label() {
        return L('INACTIVE')
      }
    }
  ],
  isGenStatus: [
    {
      name: 'All',
      value: ' ',
      get label() {
        return L('ALL')
      }
    },
    {
      name: 'Yes',
      value: 'true',
      get label() {
        return L('YES')
      }
    },
    {
      name: 'No',
      value: 'false',
      get label() {
        return L('NO')
      }
    }
  ],
  targetSource: [
    {
      name: 'All',
      value: ' ',
      get label() {
        return L('ALL')
      }
    },
    {
      name: 'Import',
      value: 1,
      get label() {
        return L('IMPORT')
      }
    },
    {
      name: 'Generate',
      value: 2,
      get label() {
        return L('GENERATE')
      }
    }
  ],
  ignoreMinAmount: [
    {
      name: '1000',
      value: 1000
    },
    {
      name: '5000',
      value: 5000
    },
    {
      name: '10000',
      value: 10000
    },
    {
      name: '15000',
      value: 15000
    }
  ],
  targetSourceKeys: {
    import: 1,
    generate: 2
  },
  statusGenFeeKeys: {
    Ddraft: 1,
    inProgress: 2,
    confirmed: 3,
    inProgressToConfirmed: 4,
    cancelled: 5,
    failed: 6,
    notFound: 7,
    readyForConfirm: 8
  },

  textConfirmPopup: {
    confirm: 'confirm',
    delete: 'delete'
  },
  statusGenerateFee: [
    {
      name: 'All',
      value: ' ',
      color: '',
      backgroundColor: '',
      get label() {
        return L('ALL')
      }
    },
    {
      name: 'Draft',
      value: 1,
      color: '#999999',
      backgroundColor: '#E5E5E5',
      get label() {
        return L('DRAFT')
      }
    },
    {
      name: 'InProgress',
      value: 2,
      color: '#FFA500',
      backgroundColor: '#f2eacb',
      get label() {
        return L('INPROGRESS')
      }
    },
    {
      name: 'Confirmed',
      value: 3,
      color: '#008000',
      backgroundColor: '#d6f0d6',
      get label() {
        return L('CONFIRMED')
      }
    },
    {
      name: 'inProgressToConfirmed',
      value: 4,
      color: '#4682B4',
      backgroundColor: '#99CCFF',
      get label() {
        return L('INPROGRESS_TO_CONFIRMED')
      }
    },
    {
      name: 'Cancelled',
      value: 5,
      color: '#B22222',
      backgroundColor: '#FF9999',
      get label() {
        return L('CANCELLED')
      }
    },
    {
      name: 'Failed',
      value: 6,
      color: '#800000',
      backgroundColor: '#CC9999',
      get label() {
        return L('FAILED')
      }
    },
    {
      name: 'Not Found',
      color: '#404040',
      backgroundColor: ' #C0C0C0',
      value: 7,
      get label() {
        return L('NOT_FOUND')
      }
    },
    {
      name: 'Ready For Confirm',
      color: '#9f7b2df7',
      backgroundColor: ' #f2f4c0',
      value: 8,
      get label() {
        return L('READY_FOR_CONFIRM')
      }
    }
  ],
  statusFeeNoticeKey: {
    inProgress: 1,
    readyToSend: 2,
    sending: 3,
    sent: 4,
    failed: 5,
    pdfGenerating: 6
  },
  statusFeeNotice: [
    {
      name: 'InProgress',
      value: 1,
      color: '#FFA500',
      backgroundColor: '#f2eacb',
      get label() {
        return L('INPROGRESS')
      }
    },
    {
      name: 'ReadyToSend',
      value: 2,
      color: '#141c14',
      backgroundColor: '#def2be',
      get label() {
        return L('READY_TO_SEND')
      }
    },
    {
      name: 'Sending',
      value: 3,
      color: '#387638',
      backgroundColor: '#bee891',
      get label() {
        return L('SENDING')
      }
    },
    {
      name: 'Sent',
      value: 4,
      color: '#0a5095',
      backgroundColor: '#dfe2ff',
      get label() {
        return L('SENT')
      }
    },
    {
      name: 'Failed',
      value: 5,
      color: '#5f0808',
      backgroundColor: '#faa2a2',
      get label() {
        return L('FAILED')
      }
    },
    {
      name: 'PdfGenerating',
      value: 6,
      color: '#db9e1a',
      backgroundColor: '#edd49d',
      get label() {
        return L('PDF_GENERATING')
      }
    }
  ],
  statusFeeNoticeDetailKey: {
    successfully: 1,
    failed: 2,
    dontHaveFee: 3,
    MarkNotReceiveFee: 4,
    readyToSend: 5
  },
  statusFeeNoticeDetail: [
    {
      name: 'successfully',
      value: 1,
      color: '#228B22',
      backgroundColor: '#90EE90',
      get label() {
        return L('SEND_SUCCESSFULLY')
      }
    },
    {
      name: 'failed',
      value: 2,
      color: '#FF0000',
      backgroundColor: '#FFA07A',
      get label() {
        return L('SEND_FAILED')
      }
    },
    {
      name: 'dontHaveFee',
      value: 3,
      color: '#1E90FF',
      backgroundColor: '#ADD8E6',
      get label() {
        return L('DONT_HAVE_FEE')
      }
    },
    {
      name: 'MarkNotReceiveFee',
      value: 4,
      color: '#808080',
      backgroundColor: '#D3D3D3',
      get label() {
        return L('MARK_NOT_RECEIVE_FEE')
      }
    },
    {
      name: 'readyToSend',
      value: 5,
      color: '#FF8C00',
      backgroundColor: '#F0E68C',
      get label() {
        return L('SEND_READY_TO_SEND')
      }
    }
  ],
  includeExpired: [
    {
      name: 'Expired',
      value: 'true',
      get label() {
        return L('EXPIRED')
      }
    },
    {
      name: 'Unexpired',
      value: 'false',
      get label() {
        return L('UNEXPIRED')
      }
    }
  ],
  LoginStatus: [
    {
      name: 'All',
      value: ' ',
      get label() {
        return L('ALL')
      }
    },
    {
      name: 'Login',
      value: 'true',
      get label() {
        return L('LOGIN')
      }
    },
    {
      name: 'NotLogin',
      value: 'false',
      get label() {
        return L('NOT_LOGIN')
      }
    }
  ],
  privateStatus: [
    {
      name: 'All',
      value: ' ',
      get label() {
        return L('ALL')
      }
    },
    {
      name: 'Public',
      value: 'true',
      get label() {
        return L('PUBLIC')
      }
    },
    {
      name: 'Private',
      value: 'false',
      get label() {
        return L('PRIVATE')
      }
    }
  ],

  yesNoValue: [
    {
      name: 'Yes',
      value: true,
      get label() {
        return L('YES')
      }
    },
    {
      name: 'No',
      value: false,
      get label() {
        return L('NO')
      }
    }
  ],
  activeRefundable: [
    {
      name: 'Yes',
      value: 'true',
      get label() {
        return L('REFUND_YES')
      }
    },
    {
      name: 'No',
      value: 'false',
      get label() {
        return L('REFUND_NO')
      }
    }
  ],

  expiredOptions: [
    {
      name: 'Include Expired',
      value: 'true',
      get label() {
        return L('INCLUDE_EXPIRED')
      }
    },
    {
      name: 'Exclude Expired',
      value: 'false',
      get label() {
        return L('EXCLUDE_EXPIRED')
      }
    }
  ],
  genders: [
    { name: 'GENDER_MALE', value: true },
    { name: 'GENDER_FEMALE', value: false },
    { name: 'GENDER_OTHER', value: null }
  ],

  gendersVehicle: [
    {
      value: 'GENDER_MALE',
      get name() {
        return L('GENDER_MALE')
      }
    },
    {
      value: 'GENDER_FEMALE',
      get name() {
        return L('GENDER_FEMALE')
      }
    },
    {
      value: 'GENDER_OTHER',
      get name() {
        return L('GENDER_OTHER')
      }
    }
  ],

  genderFilterResident: [
    { name: 'GENDER_ALL', value: -1 },
    { name: 'GENDER_MALE', value: 1 },
    { name: 'GENDER_FEMALE', value: 0 },
    { name: 'GENDER_NONE', value: null }
  ],

  tenantType: [
    { id: 0, value: 0, label: L('MALE') },
    { id: 1, value: 1, label: L('FEMALE') },
    { id: 2, value: 2, label: L('CBQL') }
  ],

  listCardType: [
    {
      id: 1,
      value: 1,
      get name() {
        return L('MAIN_CARD')
      }
    },
    {
      id: 2,
      value: 2,
      get name() {
        return L('SUB_CARD')
      }
    }
  ],

  vehicleRegistrationType: [
    { id: 0, value: 0, label: L('VEHICLEINFOMATION') },
    { id: 1, value: 1, label: L('REGISTER_NEW_VEHICEL') },
    { id: 2, value: 2, label: L('CANCEL_VEHICLE') }
  ],
  vehicleRegistrationStatus: [
    { id: 0, value: 0, label: L('DRAFF') },
    { id: 1, value: 1, label: L('SEND') },
    { id: 2, value: 2, label: L('APPROVAL') },
    { id: 3, value: 3, label: L('CANCEL') },
    { id: 99, value: 99, label: L('REJECT') }
  ],
  vehicleRegistrationStatusEnum: {
    DRAFF: 0,
    SEND: 1,
    APPROVAL: 2,
    CANCEL: 3,
    REJECT: 99
  },

  bookingTimes: [
    {
      get name() {
        return L('DAY')
      },
      value: 'DAY'
    },
    {
      get name() {
        return L('WEEK')
      },
      value: 'WEEK'
    },
    {
      get name() {
        return L('MONTH')
      },
      value: 'MONTH'
    }
  ],
  contractOfficeTimeEnum: {
    MONTH: 0,
    QUARTER: 1,
    YEAR: 2
  },
  contractOfficeTime: [
    {
      id: 0,
      value: 0,
      get label() {
        return L('MONTH')
      }
    },
    {
      id: 1,
      value: 1,
      get label() {
        return L('QUARTER')
      }
    },
    {
      id: 2,
      value: 2,
      get label() {
        return L('YEAR')
      }
    }
  ],

  bookingFutureTypes: [
    {
      value: 'CURRENT',
      get label() {
        return L('CURRENT')
      }
    },
    {
      value: 'CURRENT_AND_NEXT',
      get label() {
        return L('CURRENT_AND_NEXT')
      }
    },
    {
      value: 'NEXT',
      get label() {
        return L('NEXT')
      }
    }
  ],
  bookingDates: [
    {
      numNextValidDate: 'ALL_DAY',
      value: 'ALL_DAY',
      get label() {
        return L('ALL_DAY')
      },
      isAnyTime: true,
      daySelected: true,
      order: 0
    },
    {
      numNextValidDate: 'MONDAY',
      value: 'MONDAY',
      get label() {
        return L('MONDAY')
      },
      isAnyTime: true,
      daySelected: true,
      order: 1
    },
    {
      numNextValidDate: 'TUESDAY',
      value: 'TUESDAY',
      get label() {
        return L('TUESDAY')
      },
      isAnyTime: true,
      daySelected: true,
      order: 2
    },
    {
      numNextValidDate: 'WEDNESDAY',
      value: 'WEDNESDAY',
      get label() {
        return L('WEDNESDAY')
      },
      isAnyTime: true,
      daySelected: true,
      order: 3
    },
    {
      numNextValidDate: 'THURSDAY',
      value: 'THURSDAY',
      get label() {
        return L('THURSDAY')
      },
      isAnyTime: true,
      daySelected: true,
      order: 4
    },
    {
      numNextValidDate: 'FRIDAY',
      value: 'FRIDAY',
      get label() {
        return L('FRIDAY')
      },
      isAnyTime: true,
      daySelected: true,
      order: 5
    },
    {
      numNextValidDate: 'SATURDAY',
      value: 'SATURDAY',
      get label() {
        return L('SATURDAY')
      },
      isAnyTime: true,
      daySelected: true,
      order: 6
    },
    {
      numNextValidDate: 'SUNDAY',
      value: 'SUNDAY',
      get label() {
        return L('SUNDAY')
      },
      isAnyTime: true,
      daySelected: true,
      order: 7
    }
  ],
  reservationStatus: {
    requested: 'REQUESTED',
    approved: 'APPROVED'
  },
  amenityStatus: {
    requested: 'REQUESTED',
    approved: 'APPROVED'
  },
  userManagement: {
    defaultAdminUserName: 'admin'
  },
  localization: {
    defaultLocalizationSourceName: 'WebLabel',
    sourceWebNotification: 'WebNotification',
    sourceWebError: 'WebError',
    sourceWebMainMenu: 'WebMainMenu',
    sourceWebCategory: 'WebCategory'
  },
  authorization: {
    encrptedAuthTokenName: 'enc_auth_token',
    projectId: 'projectId',
    project: 'project',
    projectPictureUrl: 'projectPictureUrl',
    userType: '2',
    unitDisplayName: ''
  },
  validate: {
    maxNumber: 999999999999
  },
  masterDataTargets: {
    WORK_ORDER_TYPE: 'WorkOrderType',
    UNIT_TYPE: 'UnitType',
    UNIT_STATUS: 'UnitStatus',
    RESIDENT_TYPE: 'ResidentType',
    RESIDENT_ROLE: 'ResidentRole'
  },
  notificationTypes: {
    all: 0,
    sms: 1,
    email: 2,
    inApp: 3
  },
  typeAccount: {
    Resident: 'USER',
    Develop: 'DEVELOP'
  },
  feeNoticeTypes: [
    {
      id: 2,
      value: 2,
      get label() {
        return L('EMAIL')
      }
    },
    {
      id: 3,
      value: 3,
      get label() {
        return L('INAPP')
      }
    }
  ],

  purposeUsing: {
    residential: 1,
    commercial: 2,
    orther: 0
  },
  actionString: {
    add: 'add',
    remove: 'remove',
    changeValue: 'changeValue'
  },
  genType: [
    {
      get label() {
        return L('FEE_MANAGEMENT')
      },
      id: 10,
      value: 10
    },
    {
      get label() {
        return L('FEE_TYPE_CONFIG_MANAGEMENT')
      },
      id: 1,
      value: 1
    },
    {
      get label() {
        return L('FEE_TYPE_CONFIG_ELECTRIC')
      },
      id: 2,
      value: 2
    },
    // {
    //   get label() {
    //     return L('FEE_TYPE_CONFIG_WATER')
    //   },

    //   id: 3,
    //   value: 3
    // },
    // {
    //   get label() {
    //     return L('FEE_TYPE_CONFIG_PARKING')
    //   },
    //   id: 4,
    //   value: 4
    // },
    {
      get label() {
        return L('MOTOBIKE_PARKING_12_HOURS')
      },
      id: 5,
      value: 5
    },
    {
      get label() {
        return L('MOTOBIKE_PARKING_24_HOURS')
      },
      id: 6,
      value: 6
    },
    {
      get label() {
        return L('CAR_PARKING_12_HOURS')
      },
      id: 7,
      value: 7
    },
    {
      get label() {
        return L('CAR_PARKING_24_HOURS')
      },
      id: 8,
      value: 8
    },
    {
      get label() {
        return L('OVERTIME_ELECTRICITY')
      },
      id: 9,
      value: 9
    }
  ],
  indexNumber: [
    {
      // get label() {
      //   return L('INDEX_1')
      // },
      name: 'INDEX_1',
      id: 1,
      value: 1
    },
    {
      // get label() {
      //   return L('INDEX_2')
      // },
      name: 'INDEX_2',
      id: 2,
      value: 2
    },
    {
      // get label() {
      //   return L('INDEX_3')
      // },
      name: 'INDEX_3',
      id: 3,
      value: 3
    },
    {
      // get label() {
      //   return L('INDEX_4')
      // },
      name: 'INDEX_4',
      id: 4,
      value: 4
    },
    {
      // get label() {
      //   return L('INDEX_5')
      // },
      name: 'INDEX_5',
      id: 5,
      value: 5
    }
  ],
  typeMeterReading: [
    { name: 'OTHER', id: 0, value: 0 },
    { name: 'RESIDENTIAL', id: 1, value: 1 },
    { name: 'COMERCIAL', id: 2, value: 2 }
  ],
  memberNumber: [
    { label: '1', id: 1, value: 1 },
    { label: '2', id: 2, value: 2 },
    { label: '3', id: 3, value: 3 },
    { label: '4', id: 4, value: 4 },
    { label: '5', id: 5, value: 5 },
    { label: '6', id: 6, value: 6 },
    { label: '7', id: 7, value: 7 },
    { label: '8', id: 8, value: 8 }
  ],
  pageSize: {
    pageSize_5: 5,
    pageSize_10: 10,
    pageSize_20: 20,
    pageSize_30: 30,
    parking_50: 50
  },

  generateType: {
    management: 1,
    electric: 2,
    water: 3,
    parking: 4,
    MotobikeParking12Hours: 5,
    MotobikeParking24Hours: 6,
    CarParking12Hours: 7,
    CarParking24Hours: 8,
    OvertimeElectricity: 9,
    rent: 10
  },

  listVehicleParkingType: [
    {
      id: 1,
      value: 1,

      get name() {
        return L('MOTO_BIKE_PARKING_12H')
      }
    },
    {
      id: 2,
      value: 2,
      get name() {
        return L('MOTO_BIKE_PARKING_24H')
      }
    },
    {
      id: 3,
      value: 3,
      get name() {
        return L('CAR_PARKING_12H')
      }
    },
    {
      id: 4,
      value: 4,
      get name() {
        return L('CAR_PARKING_24H')
      }
    }
  ],

  mobileApplicationTypeById: {
    1: 'ALL',
    2: 'APP_CLIENT',
    3: 'APP_PARTNER'
  },
  announcementTypesLabel: [
    {
      id: 0,
      value: 0,
      get label() {
        return L('EMAIL_INAPP')
      }
    },
    {
      id: 1,
      value: 1,
      get label() {
        return L('EMAIL')
      }
    },
    {
      id: 2,
      value: 2,
      get label() {
        return L('INAPP')
      }
    }
  ],

  announcementTypes: {
    email_inApp: 0,
    email: 1,
    inApp: 2
    // sms: 3
  },
  announcementTypeKeys: {
    0: 'EMAIL_INAPP',
    1: 'EMAIL', //(allow HTML)
    2: 'INAPP',
    3: 'SMS'
  },
  announcementTypeCodes: {
    updateApp: 'UpdateApp',
    picture: 'Picture',
    video: 'Video'
  },
  announcementStatus: {
    readyForPublish: 1,
    sending: 2,
    completed: 3,
    failed: 4
  },

  statusSendMailCode: {
    processing: 0,
    successfully: 1,
    failed: 2,
    alreadySent: 3
  },

  announcementTypeIcon: {
    1: 'assets/icons/announcement-horn.svg',
    2: 'assets/icons/announcement-image.svg',
    3: 'assets/icons/announcement-video.svg'
  },
  announcementStatusKeys: {
    0: 'ANNOUNCEMENT_STATUS_PROCESSING',
    1: 'ANNOUNCEMENT_STATUS_READY_FOR_PUBLISH',
    2: 'ANNOUNCEMENT_STATUS_SENDING',
    3: 'ANNOUNCEMENT_STATUS_COMPLETED',
    4: 'ANNOUNCEMENT_STATUS_FAILED'
  },
  FeeNoticeStatusKeys: {
    1: 'FEE_NOTICE_STATUS_IN_PROGRESS',
    2: 'FEE_NOTICE_STATUS_READY_TO_SEND',
    3: 'FEE_NOTICE_STATUS_SENDING',
    4: 'FEE_NOTICE_STATUS_SENT',
    5: 'FEE_NOTICE_STATUS_FAILED',
    6: 'PDF_GENERATING'
  },
  FeeNoticeMethodKeys: {
    2: 'FEE_NOTICE_EMAIL',
    3: 'FEE_NOTICE_INAPP'
  },
  indexNameKeys: {
    1: 'INDEX_1',
    2: 'INDEX_2',
    3: 'INDEX_3',
    4: 'INDEX_4',
    5: 'INDEX_5'
  },
  announcementTypeIds: {
    updateApp: 1,
    picture: 2,
    video: 3
  },

  bannerTypeIds: {
    picture: 2,
    banner: 4
  },
  mobileApplicationTypes: [
    new OptionModel(1, 'ALL'),
    new OptionModel(2, 'APP_CLIENT'),
    new OptionModel(3, 'APP_PARTNER')
  ],
  monthNamesShort: [
    { name: 'JAN', value: 1 },
    { name: 'FEB', value: 2 },
    { name: 'MAR', value: 3 },
    { name: 'APR', value: 4 },
    { name: 'MAY', value: 5 },
    { name: 'JUN', value: 6 },
    { name: 'JUL', value: 7 },
    { name: 'AUG', value: 8 },
    { name: 'SEP', value: 9 },
    { name: 'OCT', value: 10 },
    { name: 'NOV', value: 11 },
    { name: 'DEC', value: 12 }
  ],
  timeUnits: {
    hours: 'HOURS',
    days: 'DAYS',
    minutes: 'MINUTES'
  },

  feeGroupType: {
    feeManagement: 1,
    feeReservationDeposit: 2
  },

  feeSourceGroup: {
    feeManagement: 'FeeStatement',
    //feeReservation: 'FeeReservation' // For both Service & Deposit
    // feeReservationService: 'FeeReservationService',
    feeReservationDeposit: 'FeeReservationDeposit',
    feeDeposit: 'FeeDeposit'
  },
  moduleName: {
    contractor: 'Contractor'
  },

  feePaymentStatus: {
    unPaid: 1,
    paid: 2,
    refund: 3,
    partial: 4
  },

  feeTypes: {
    bookingDeposit: 14
  },

  positionTypeEnum: {
    Tenant: 0,
    Operator: 1,
    Developer: 2
  },

  listEnumFormInOut: [
    {
      value: 0,
      label: 'TRANSPORT_IN',
      color: '#C8660E',
      backgroundColor: '#FEF4EC'
    },
    {
      value: 1,
      label: 'TRANSPORT_OUT',
      color: '#C8660E',
      backgroundColor: '#FEF4EC'
    }
  ],

  formInOutType: {
    In: 0,
    Out: 1
  },

  ticketRequestStatusEnum: {
    Draft: 0,
    Watting: 1,
    Approval: 2,
    Rejected: 3,
    Cancel: 99
  },

  listTicketRequestStatus: [
    { value: 0, label: 'TICKET_REQUEST_DRAFT', color: '#F2994A' },
    { value: 1, label: 'TICKET_REQUEST_WATTING', color: '#F2994A' },
    { value: 2, label: 'TICKET_REQUEST_APPROVAL', color: '#27AE60' },
    { value: 3, label: 'TICKET_REQUEST_REJECT', color: '#EB5757' }
    // { value: 99, label: 'TICKET_REQUEST_CANCEL', color: '#EB5757' }
  ],

  listPositionType: [
    {
      value: 0,
      label: 'TENANT',
      color: '#C8660E',
      backgroundColor: '#FEF4EC'
    },
    {
      value: 1,
      label: 'OPERATOR',
      color: '#681FAD',
      backgroundColor: '#F5EEFC'
    },
    {
      value: 2,
      label: 'DEVELOP',
      color: '#961212',
      backgroundColor: '#FCE4E4'
    }
  ],

  ticketRequestTypeEnum: {
    IN_OUT: 1,
    RENOVATION: 2,
    OVERTIME: 3,
    EVENT_PLANNING: 4,
    VEHICLE_REGISTRATION: 5,
    CONTRUCTION_LIST: 6,
    ELECTRIC: 7,
    MANAGEMENT_FEE: 8,
    WATER_AND_ELECTRIC_FEE: 9,
    OVERTIME_PARKING: 10
  },

  listRequestType: [
    {
      value: 1,
      label: L('IN_OUT')
    },
    {
      value: 2,
      label: L('RENOVATION')
    },
    {
      value: 3,
      label: L('OVERTIME')
    },
    {
      value: 4,
      label: L('EVENT_PLANNING')
    },
    {
      value: 5,
      label: L('VEHICLE_REGISTRATION')
    },
    {
      value: 6,
      label: L('CONTRUCTION_LIST')
    }
  ],

  dayOfWeek: [
    {
      value: 0,
      //  name: 'Sunday'
      get name() {
        return L('SUNDAY')
      }
    },
    {
      value: 1,
      //  name: 'Monday',
      get name() {
        return L('MONDAY')
      }
    },
    {
      value: 2,
      // name: 'Tuesday',
      get name() {
        return L('TUESDAY')
      }
    },
    {
      value: 3,
      //name: 'Wednesday',
      get name() {
        return L('WEDNESDAY')
      }
    },
    {
      value: 4,
      // name: 'Thursday',
      get name() {
        return L('THURSDAY')
      }
    },
    {
      value: 5,
      // name: 'Friday',
      get name() {
        return L('FRIDAY')
      }
    },
    {
      value: 6,
      //name: 'Saturday',
      get name() {
        return L('SATURDAY')
      }
    }
  ],
  cashAdvanceTransactionOptions: [
    {
      value: ' ',
      name: 'All',
      get label() {
        return L('ALL')
      }
    },
    {
      value: 1,
      name: 'RECEIPT',
      get label() {
        return L('RECEIPT')
      }
    },
    {
      value: 2,
      name: 'EXPENSE',
      get label() {
        return L('EXPENSE')
      }
    }
  ],
  cashChanelOptions: [
    {
      value: ' ',
      name: 'All',
      get label() {
        return L('ALL')
      }
    },
    {
      value: 1,
      name: 'CASH',
      get label() {
        return L('CASH')
      }
    },
    {
      value: 2,
      name: 'BANK',
      get label() {
        return L('BANK')
      }
    },
    {
      value: 3,
      name: 'PAYMENT_ONLINE',
      get label() {
        return L('PAYMENT_ONLINE')
      }
    }
  ],
  // PMS - OFFICE

  companyType: {
    tenant: 1 as const,
    service: 2 as const
  },

  cardsStatusEnum: {
    Empty: 0,
    Active: 1
  },

  cardRequestTypeEnum: { IsUpdate: 1, IsCreate: 2, IsCancel: 3 },
  listCardRequestType: [
    {
      value: 1,
      name: 'CARD_IS_UPDATE',
      get label() {
        return L('CARD_IS_UPDATE')
      }
    },
    {
      value: 2,
      name: 'CARD_IS_CREATE',
      get label() {
        return L('CARD_IS_CREATE')
      }
    },
    {
      value: 3,
      name: 'CARD_IS_CANCEL',
      get label() {
        return L('CARD_IS_CANCEL')
      }
    }
  ],
  cardRequestStatusEnum: {
    IsNew: 1,
    IsProcessing: 2,
    IsCancelled: 3,
    IsDone: 4
  },
  listCardRequestStatus: [
    {
      value: 1,
      id: 1,
      name: 'CARD_STATUS_IS_NEW',
      color: '#27AE60',
      backgroundColors: '#E6F9EE',
      get label() {
        return L('CARD_STATUS_IS_NEW')
      }
    },
    {
      value: 2,
      id: 2,
      name: 'CARD_STATUS_IS_PROCESSING',
      color: '#1178F5',
      backgroundColors: '#E2EEFE',
      get label() {
        return L('CARD_STATUS_IS_PROCESSING')
      }
    },
    {
      value: 3,
      id: 3,
      name: 'CARD_STATUS_IS_CANCEL',
      color: '#EB5757',
      backgroundColors: '#FCE4E4',
      get label() {
        return L('CARD_STATUS_IS_CANCEL')
      }
    },
    {
      value: 4,
      id: 4,
      name: 'CARD_STATUS_IS_DONE',
      color: '#5c5f61',
      backgroundColors: '#ced5d9',
      get label() {
        return L('CARD_STATUS_IS_DONE')
      }
    },
    {
      value: 100,
      id: 100,
      name: 'CARD_STATUS_IS_DRAFT',
      color: '#096DD9',
      backgroundColors: '#E6F7FF',
      get label() {
        return L('CARD_STATUS_IS_DRAFT')
      }
    }
  ],

  listCardsStatus: [
    {
      value: 0,
      id: 0,
      get name() {
        return L('CARD_EMPTY')
      }
    },
    {
      value: 1,
      id: 1,
      get name() {
        return L('CARD_ACTIVE')
      }
    }
  ],

  listTenantTypeUseVehicle: [
    {
      value: 0,
      id: 0,
      get name() {
        return L('TENANT_MAN')
      }
    },
    {
      value: 1,
      id: 1,
      get name() {
        return L('TENANT_WOMAN')
      }
    },
    {
      value: 2,
      id: 2,
      get name() {
        return L('TENANT_MANAGER')
      }
    }
  ]
}

export const loginSteps = {
  login: 1,
  projectSelect: 2,
  securityCodeConfirm: 3
}

export const loginMethods = {
  systemAccount: 1,
  socialAccount: 2,
  phoneNumber: 3
}

export const phoneStatus = {
  undefined: 0,
  available: 1,
  inActive: 2,
  notFound: 3
}

export const userType = {
  staff: '1',
  tenant: '2'
}

export const typeFlowOperator2Object = {
  Operator2Tenant: 0,
  Operator2Develop: 1
}

export const feePaymentStatusObject = {
  '1': 'FEE_UNPAID',
  '2': 'FEE_PAID',
  '3': 'FEE_REFUND'
}

export const listFeePaymentStatus = [
  {
    get label() {
      return L('ALL')
    },
    value: ''
  },
  {
    get label() {
      return L('FEE_UNPAID')
    },
    value: AppConsts.feePaymentStatus.unPaid
  },
  {
    get label() {
      return L('FEE_PAID')
    },
    value: AppConsts.feePaymentStatus.paid
  },
  {
    get label() {
      return L('FEE_REFUND')
    },
    value: AppConsts.feePaymentStatus.refund
  },
  {
    get label() {
      return L('FEE_PARTIAL')
    },
    value: AppConsts.feePaymentStatus.partial
  }
]

export const showToResidents = [
  {
    get label() {
      return L('ALL')
    },
    value: ''
  },
  {
    get label() {
      return L('YES')
    },
    value: 'true'
  },
  {
    get label() {
      return L('NO')
    },
    value: 'false'
  }
]
export function dateDifference(start, end) {
  let startDate = dayjs(start)
  const endDate = dayjs(end).add(1, 'day')

  const years = endDate.diff(startDate, 'years')
  startDate = startDate.add(years, 'years') // ✅ gán lại

  const months = endDate.diff(startDate, 'months')
  startDate = startDate.add(months, 'months') // ✅ gán lại

  const days = endDate.diff(startDate, 'days')

  return { years, months, days }
}
export const workflowEvent = {
  init: 'InitWorkflow'
}
export const documentTypes = {
  image: 'IMAGE',
  document: 'DOCUMENT',
  documentAndImage: 'DOCUMENT_AND_IMAGE'
}
export const cookieKeys = {
  encToken: 'enc_auth_token'
}
export const defaultAvatar = '/assets/images/logo.png'
export const dateFormat = 'DD/MM/YYYY'
export const monthFormat = 'MM/YYYY'
export const monthDateFormat = 'DD/MM'
export const dateTimeFormat = 'DD/MM/YYYY HH:mm'
export const timeDateFormat = 'HH:mm DD/MM/YYYY'
export const yearFormat = 'YYYY'
export const timeFormat = 'HH:mm'
export const phoneRegex = /^[+]?\(?([0-9]{0,3})?\)?[-. ]?([0-9]{1,3})?[-. ]?([0-9]{1,3})[-. ]?([0-9]{1,5})$/
export const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export const modules = [
  // {  get name() { return LCategory('MODULE_DEFAULT')},  id: 0 },
  // {  get name() { return LCategory('MODULE_OTHERS')},  id: 1 },
  // {  get name() { return LCategory('MODULE_NOTIFICATION_SYSTEM')},  id: 2 },
  // {  get name() { return LCategory('MODULE_USERS')},  id: 3 },
  // {  get name() { return LCategory('MODULE_STAFF')},  id: 4 },
  // {  get name() { return LCategory('MODULE_RESIDENT')},  id: 5 },
  // {  get name() { return LCategory('MODULE_TENANCY')},  id: 6 },
  // {  get name() { return LCategory('MODULE_PROVIDERS')},  id: 7 },
  // {  get name() { return LCategory('MODULE_PROJECT')},  id: 8 },
  // {  get name() { return LCategory('MODULE_BUILDING')},  id: 9 },
  // {  get name() { return LCategory('MODULE_FLOOR')},  id: 10 },
  // {  get name() { return LCategory('MODULE_UNIT')},  id: 11 },
  // {  get name() { return LCategory('MODULE_WORKFLOW')},  id: 12 },
  {
    get name() {
      return 'MODULE_WORKORDER' //LCategory('MODULE_WORKORDER')
    },
    id: 13
  },
  // {  get name() { return LCategory('MODULE_WORKORDERTASK')},  id: 14 },
  // {  get name() { return LCategory('MODULE_PLANMAINTENANCE')},  id: 15 },
  // {  get name() { return LCategory('MODULE_PLANMAINTENANCETASK')},  id: 16 },
  // {  get name() { return LCategory('MODULE_BOOKINGS')},  id: 17 },
  // {  get name() { return LCategory('MODULE_EVENTS')},  id: 18 },
  // {  get name() { return LCategory('MODULE_LIBRARIES')},  id: 19 },
  {
    get name() {
      return 'MODULE_FEEDBACK' //LCategory('MODULE_FEEDBACK')
    },
    id: 20
  }
  // {  get name() { return LCategory('MODULE_COMMUNICATION')},  id: 21 },
  // {  get name() { return LCategory('MODULE_SURVEY')},  id: 22 },
  // {  get name() { return LCategory('MODULE_ONLINEFORM')},  id: 23 },
  // {  get name() { return LCategory('MODULE_DELIVERIES')},  id: 24 },
  // {  get name() { return LCategory('MODULE_INSTRUCTIONS')},  id: 25 },
  // {  get name() { return LCategory('MODULE_INBOX')},  id: 26 },
  // {  get name() { return LCategory('MODULE_INQUIRY')},  id: 27 },
  // {  get name() { return LCategory('MODULE_VISITOR')},  id: 28 },
  // {  get name() { return LCategory('MODULE_AMENITY')},  id: 29 },
  // {  get name() { return LCategory('MODULE_AMENITYBLACKLIST')},  id: 30 },
  // {  get name() { return LCategory('MODULE_AMENITYGROUP')},  id: 31 },
  // {  get name() { return LCategory('MODULE_AMENITYMAINTENANCE')},  id: 32 },
  // {  get name() { return LCategory('MODULE_CARD')},  id: 33 },
  // {  get name() { return LCategory('MODULE_CARDPHYSICAL')},  id: 34 },
  // {  get name() { return LCategory('MODULE_CONTACT')},  id: 35 },
  // {  get name() { return LCategory('MODULE_CONTRACT')},  id: 36 },
  // {  get name() { return LCategory('MODULE_EMPLOYEE')},  id: 37 },
  // {  get name() { return LCategory('MODULE_NOTIFICATIONSETTING')},  id: 38 },
  // {  get name() { return LCategory('MODULE_INVENTORY')},  id: 39 },
  // {  get name() { return LCategory('MODULE_TEAM')},  id: 40 },
  // {  get name() { return LCategory('MODULE_INSPECTION')},  id: 41 },
  // {  get name() { return LCategory('MODULE_INSPECTIONTASK')},  id: 42 },
  // {  get name() { return LCategory('MODULE_ASSET')},  id: 43 },
  // {  get name() { return LCategory('MODULE_LEASECONTRACT')},  id: 44 }
]
export const moduleIds = {
  workOrder: 13,
  feedback: 20,
  unit: 1,
  unitEdit: 1001,
  comment: 1002,
  reservation: 17,
  visitor: 1003,
  planMaintenance: 18,
  inventory: 34,
  order: 47,
  inspection: 41,
  enquiry: 49,
  eform: 23,
  handover: 49,
  resident: 2000,
  staff: 5352,
  onlineForm: 23,
  handoverReservation: 51,
  SanitationAndBonsai: 303,
  // Noti
  ModuleIn: 109,
  ModuleOut: 110,
  Renovation: 111,
  OverTime: 112,
  EventPlanning: 113,
  ConstructionList: 114,
  OvertimeParkingForm: 115,
  ChatbotHistory: 5
}

export const servicePlanEnum = {
  SANITTION: 0,
  GARDENING: 1
}

export const modulePrefix = {
  13: 'WORK_ORDER_WF_',
  20: 'FEEDBACK_WF_'
}
export const announcementTypeOptions = [
  {
    get label() {
      return L('EMAIL')
    },
    value: 2
  },
  {
    get label() {
      return L('INAPP')
    },
    value: 3
  }
]

export const moduleFile = {
  banner: 'announcement',
  library: 'Library',
  project: 'Project',
  workOrder: 'WorkOrder',
  workOrderAfters: 'WorkOrderAfters',
  feedback: 'Feedback',
  feedbackAfters: 'FeedbackAfters',
  news: 'News',
  event: 'Event',
  reservation: 'Reservation',
  chatMessage: 'ChatMessages',
  amenity: 'Amenities',
  visitor: 'Visitor',
  company: 'Company',
  companies: 'Companies',
  contract: 'Contract',
  contracts: 'Contracts',
  contractOffice: 'LeaseAgreementDocument',
  contractCategory: 'ContractCategory',
  buildingDirectory: 'BuildingDirectory',
  planMaintenance: 'PlanMaintenance',
  asset: 'AssetManagement',
  shopOwner: 'ShopOwner',
  product: 'Product',
  inventory: 'Inventory',
  inventoryStockIn: 'InventoryStock',
  inventoryStockOut: 'InventoryAllocate',
  delivery: 'Delivery',
  deliverySignature: 'DeliverySignature',
  vehicles: 'Vehicles',
  InFormDocument: 'InFormDocument',
  OutFormDocument: 'OutFormDocument',
  renovationFormDocument: 'RenovationFormDocument',
  eventPlanningFormDocument: 'EventPlanningFormDocument',
  constructionListFormDocument: 'ConstructionListFormDocument',
  overTime: 'OverTimeFormDocument',
  parkingOvertime: 'OverTimeFormDocument',
  electricFormReading: 'ElectricFormDocument',
  overtimeParking: 'OverTimeParkingFormDocument',
  requestCard: 'RequestCard'
}
export const notificationMethod = {
  1: 'SMS',
  2: 'EMAIL', //(allow HTML)
  3: 'INAPP'
}

export const contentType = {
  planText: 1,
  html: 2,
  sfdt: 3
}

export const getEscalationModuleByModuleId = (moduleId) => {
  switch (moduleId) {
    case moduleIds.inspection: {
      return 4
    }
    case moduleIds.planMaintenance: {
      return 3
    }
    case moduleIds.feedback: {
      return 2
    }
    case moduleIds.workOrder:
    default: {
      return 1
    }
  }
}
export const backgroundColors = [
  '#FAC51D',
  '#66BD6D',
  '#FAA026',
  '#29BB9C',
  '#E96B56',
  '#55ACD2',
  '#B7332F',
  '#2C83C9',
  '#9166B8',
  '#92E7E8'
]
export const getBackgroundColorByIndex = (arrayIndex) => {
  const index = arrayIndex % backgroundColors.length
  return backgroundColors[index]
}

export const moduleAvatar = {
  myProfile: 'myProfile',
  staff: 'Staff',
  resident: 'Resident',
  shopOwner: 'ShopOwner',
  project: 'Project',
  colorByLetter: (letter) => {
    if (!backgroundColors || !letter) return '#fff'

    const charCode = letter.charCodeAt(0)
    return getBackgroundColorByIndex(charCode)
  }
}
export const wfFieldTypes = {
  text: 0,
  number: 1,
  money: 2,
  dateTime: 3,
  list: 4
}
export const appStatusColors = {
  success: '#689F38',
  error: '#EB7077',
  valid: '#689F38',
  expired: '#CCCCCC'
}
export const ckeditorToolbar = {
  toolbarGroups: [
    { name: 'document', groups: ['mode', 'doctools', 'document', 'source'] },
    { name: 'clipboard', groups: ['clipboard', 'undo'] },
    {
      name: 'editing',
      groups: ['find', 'selection', 'spellchecker', 'editing']
    },
    { name: 'styles', groups: ['styles', 'font-family'] },
    { name: 'forms', groups: ['forms'] },
    { name: 'colors', groups: ['colors'] },
    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
    {
      name: 'paragraph',
      groups: ['align', 'list', 'indent', 'blocks', 'bidi', 'paragraph']
    },

    { name: 'links', groups: ['links'] },
    { name: 'insert', groups: ['insert'] },
    { name: 'tools', groups: ['tools'] },
    { name: 'others', groups: ['others'] },
    { name: 'about', groups: ['about'] }
  ],
  removeButtons:
    'Save,Templates,Cut,NewPage,Preview,Copy,Paste,PasteText,PasteFromWord,Find,Replace,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,ShowBlocks,About,Flash,PageBreak,HorizontalRule,Language,BidiRtl,BidiLtr,Blockquote,CreateDiv,Smiley,Iframe'
}

export const mimeType = {
  'application/pdf': PdfIcon,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ExcelIcon,
  'application/vnd.ms-excel': ExcelIcon,
  'application/msword': WordIcon,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': WordIcon,
  'application/vnd.ms-powerpoint': PowerPointIcon,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': PowerPointIcon,
  'image/jpeg': ImageIcon,
  'image/png': ImageIcon,
  other: OtherFileIcon
}
export const typeFile = {
  MSOffice: [
    'application/msword',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel'
  ],
  pdf: ['application/pdf'],
  image: ['image/jpeg', 'image/png', 'image/jpg']
}
export const appPermissions = {
  appSetting: {
    page: 'PagesAdministration.Host.Settings'
  },
  communication: {
    page: 'PagesAdministration.Communication',
    read: 'PagesAdministration.Communication.Read',
    create: 'PagesAdministration.Communication.Create'
  },
  projectSettings: {
    settings: 'PagesAdministration.Project.Settings'
  },
  adminLanguage: {
    page: 'PagesAdministration.Languages',
    create: 'PagesAdministration.Languages.Create',
    read: 'PagesAdministration.Languages.Read',
    update: 'PagesAdministration.Languages.Update',
    delete: 'PagesAdministration.Languages.Delete',
    changeText: 'PagesAdministration.Languages.ChangeTexts'
  },
  adminRole: {
    page: 'PagesAdministration.Roles',
    create: 'PagesAdministration.Roles.Create',
    read: 'PagesAdministration.Roles.Read',
    update: 'PagesAdministration.Roles.Update',
    detail: 'PagesAdministration.Roles.Create',
    delete: 'PagesAdministration.Roles.Delete'
  },
  adminUser: {
    page: 'PagesAdministration.Users',
    create: 'PagesAdministration.Users.Create',
    read: 'PagesAdministration.Users.Read',
    update: 'PagesAdministration.Users.Update',
    delete: 'PagesAdministration.Users.Delete'
  },
  adminTenant: {
    page: 'PagesAdministration.Roles',
    create: 'PagesAdministration.Roles.Create',
    read: 'PagesAdministration.Roles.Read',
    update: 'PagesAdministration.Roles.Update',
    delete: 'PagesAdministration.Roles.Delete'
  },
  adminMasterData: {
    page: 'PagesAdministration.MasterData',
    create: 'PagesAdministration.MasterData.Create',
    read: 'PagesAdministration.MasterData.Read',
    update: 'PagesAdministration.MasterData.Update',
    delete: 'PagesAdministration.MasterData.Delete',
    detail: 'PagesAdministration.MasterData.Detail'
  },
  workflow: {
    page: 'PagesAdministration.Workflow',
    create: 'PagesAdministration.Workflow.Create',
    read: 'PagesAdministration.Workflow.Read',
    update: 'PagesAdministration.Workflow.Update',
    delete: 'PagesAdministration.Workflow.Delete',
    detail: 'PagesAdministration.Workflow.Detail'
  },
  notificationTemplate: {
    page: 'PagesAdministration.NotificationTemplate',
    create: 'PagesAdministration.NotificationTemplate.Create',
    read: 'PagesAdministration.NotificationTemplate.Read',
    update: 'PagesAdministration.NotificationTemplate.Update',
    delete: 'PagesAdministration.NotificationTemplate.Delete',
    detail: 'PagesAdministration.NotificationTemplate.Detail'
  },
  dashboard: {
    page: 'PagesAdministration.Dashboard',
    fee: 'PagesAdministration.Dashboard.FeeStatement',
    workOrder: 'PagesAdministration.Dashboard.WorkOrder',
    report: 'PagesAdministration.Dashboard.Report',
    overview: 'PagesAdministration.Dashboard.Overview'
  },
  settingEmail: {
    page: 'PagesAdministration.SettingEmail'
  },
  staff: {
    page: 'PagesAdministration.Staff',
    create: 'PagesAdministration.Staff.Create',
    read: 'PagesAdministration.Staff.Read',
    update: 'PagesAdministration.Staff.Update',
    delete: 'PagesAdministration.Staff.Delete',
    detail: 'PagesAdministration.Staff.Detail'
  },
  resident: {
    page: 'PagesAdministration.Resident',
    create: 'PagesAdministration.Resident.Create',
    read: 'PagesAdministration.Resident.Read',
    update: 'PagesAdministration.Resident.Update',
    delete: 'PagesAdministration.Resident.Delete',
    detail: 'PagesAdministration.Resident.Detail',
    fullDetail: 'PagesAdministration.Resident.FullDetail',
    export: 'PagesAdministration.Resident.Export',
    import: 'PagesAdministration.Resident.Import'
  },
  shopOwner: {
    page: 'PagesAdministration.ShopOwner',
    create: 'PagesAdministration.ShopOwner.Create',
    read: 'PagesAdministration.ShopOwner.Read',
    update: 'PagesAdministration.ShopOwner.Update',
    delete: 'PagesAdministration.ShopOwner.Delete',
    detail: 'PagesAdministration.ShopOwner.Detail',
    updateShopOwner: 'PagesAdministration.ShopOwner.UpdateShopOwner'
  },
  company: {
    page: 'PagesAdministration.Company',
    create: 'PagesAdministration.Company.Create',
    read: 'PagesAdministration.Company.Read',
    update: 'PagesAdministration.Company.Update',
    delete: 'PagesAdministration.Company.Delete',
    detail: 'PagesAdministration.Company.Detail',
    syncSap: 'PagesAdministration.Company.SyncSap'
  },
  LeaseAgreement: {
    page: 'PagesAdministration.LeaseAgreement',
    create: 'PagesAdministration.LeaseAgreement.Create',
    read: 'PagesAdministration.LeaseAgreement.Read',
    update: 'PagesAdministration.LeaseAgreement.Update',
    delete: 'PagesAdministration.LeaseAgreement.Delete',
    SAP: 'PagesAdministration.LeaseAgreement.SAP',
    detail: 'PagesAdministration.LeaseAgreement.Detail'
  },
  companyContract: {
    page: 'PagesAdministration.Contract',
    create: 'PagesAdministration.Contract.Create',
    read: 'PagesAdministration.Contract.Read',
    update: 'PagesAdministration.Contract.Update',
    delete: 'PagesAdministration.Contract.Delete',
    detail: 'PagesAdministration.Contract.Detail'
  },
  contractCategory: {
    page: 'PagesAdministration.ContractCategory',
    create: 'PagesAdministration.ContractCategory.Create',
    read: 'PagesAdministration.ContractCategory.Read',
    update: 'PagesAdministration.ContractCategory.Update',
    delete: 'PagesAdministration.ContractCategory.Delete',
    detail: 'PagesAdministration.ContractCategory.Detail'
  },
  project: {
    page: 'PagesAdministration.Project',
    create: 'PagesAdministration.Project.Create',
    read: 'PagesAdministration.Project.Read',
    update: 'PagesAdministration.Project.Update',
    delete: 'PagesAdministration.Project.Delete',
    detail: 'PagesAdministration.Project.Detail'
  },
  building: {
    page: 'PagesAdministration.Building',
    create: 'PagesAdministration.Building.Create',
    read: 'PagesAdministration.Building.Read',
    update: 'PagesAdministration.Building.Update',
    delete: 'PagesAdministration.Building.Delete',
    detail: 'PagesAdministration.Building.Detail'
  },
  floor: {
    page: 'PagesAdministration.Floor',
    create: 'PagesAdministration.Floor.Create',
    read: 'PagesAdministration.Floor.Read',
    update: 'PagesAdministration.Floor.Update',
    delete: 'PagesAdministration.Floor.Delete',
    detail: 'PagesAdministration.Floor.Detail'
  },
  unit: {
    page: 'PagesAdministration.Unit',
    create: 'PagesAdministration.Unit.Create',
    read: 'PagesAdministration.Unit.Read',
    update: 'PagesAdministration.Unit.Update',
    delete: 'PagesAdministration.Unit.Delete',
    detail: 'PagesAdministration.Unit.Detail',
    export: 'PagesAdministration.Unit.Export',
    import: 'PagesAdministration.Unit.Import',
    moveIn: 'PagesAdministration.Unit.MoveIn',
    moveOut: 'PagesAdministration.Unit.MoveOut',
    exportUnitUser: 'PagesAdministration.Unit.ResidentExport'
  },
  library: {
    page: 'PagesAdministration.Library',
    create: 'PagesAdministration.Library.Create',
    read: 'PagesAdministration.Library.Read',
    update: 'PagesAdministration.Library.Update',
    delete: 'PagesAdministration.Library.Delete',
    detail: 'PagesAdministration.Library.Detail'
  },
  workOrder: {
    page: 'PagesAdministration.Workorder',
    create: 'PagesAdministration.Workorder.Create',
    read: 'PagesAdministration.Workorder.Read',
    update: 'PagesAdministration.Workorder.Update',
    delete: 'PagesAdministration.Workorder.Delete',
    detail: 'PagesAdministration.Workorder.Detail',
    myWorkOrder: 'PagesAdministration.Workorder.MyWorkorder',
    config: 'PagesAdministration.WorkorderConfiguration',
    export: 'PagesAdministration.Workorder.Export'
  },
  workorderConfiguration: {
    page: 'PagesAdministration.WorkorderConfiguration',
    create: 'PagesAdministration.WorkorderConfiguration.Create',
    read: 'PagesAdministration.WorkorderConfiguration.Read',
    update: 'PagesAdministration.WorkorderConfiguration.Update',
    delete: 'PagesAdministration.WorkorderConfiguration.Delete',
    detail: 'PagesAdministration.WorkorderConfiguration.Detail'
  },
  feedback: {
    page: 'PagesAdministration.Feedback',
    create: 'PagesAdministration.Feedback.Create',
    read: 'PagesAdministration.Feedback.Read',
    update: 'PagesAdministration.Feedback.Update',
    delete: 'PagesAdministration.Feedback.Delete',
    detail: 'PagesAdministration.Feedback.Detail',
    myWorkOrder: 'PagesAdministration.Feedback.MyWorkorder',
    config: 'PagesAdministration.FeedbackConfiguration',
    export: 'PagesAdministration.Feedback.Export'
  },
  feedbackConfiguration: {
    page: 'PagesAdministration.FeedbackConfiguration',
    create: 'PagesAdministration.FeedbackConfiguration.Create',
    read: 'PagesAdministration.FeedbackConfiguration.Read',
    update: 'PagesAdministration.FeedbackConfiguration.Update',
    delete: 'PagesAdministration.FeedbackConfiguration.Delete',
    detail: 'PagesAdministration.FeedbackConfiguration.Detail'
  },
  visitor: {
    page: 'PagesAdministration.Visitor',
    create: 'PagesAdministration.Visitor.Create',
    read: 'PagesAdministration.Visitor.Read',
    update: 'PagesAdministration.Visitor.Update',
    delete: 'PagesAdministration.Visitor.Delete',
    detail: 'PagesAdministration.Visitor.Detail',
    export: 'PagesAdministration.Visitor.Export',
    import: 'PagesAdministration.Visitor.Import'
  },
  buildingDirectory: {
    page: 'PagesAdministration.BuildingDirectory',
    create: 'PagesAdministration.BuildingDirectory.Create',
    read: 'PagesAdministration.BuildingDirectory.Read',
    update: 'PagesAdministration.BuildingDirectory.Update',
    delete: 'PagesAdministration.BuildingDirectory.Delete',
    detail: 'PagesAdministration.BuildingDirectory.Detail',
    export: 'PagesAdministration.BuildingDirectory.Export'
  },
  asset: {
    page: 'PagesAdministration.Asset',
    create: 'PagesAdministration.Asset.Create',
    read: 'PagesAdministration.Asset.Read',
    update: 'PagesAdministration.Asset.Update',
    delete: 'PagesAdministration.Asset.Delete',
    detail: 'PagesAdministration.Asset.Detail',
    import: 'PagesAdministration.Asset.Import',
    export: 'PagesAdministration.Asset.Export'
  },
  planMaintenance: {
    page: 'PagesAdministration.PlanMaintenance',
    create: 'PagesAdministration.PlanMaintenance.Create',
    read: 'PagesAdministration.PlanMaintenance.Read',
    update: 'PagesAdministration.PlanMaintenance.Update',
    delete: 'PagesAdministration.PlanMaintenance.Delete',
    detail: 'PagesAdministration.PlanMaintenance.Detail',
    import: 'PagesAdministration.PlanMaintenance.Import',
    export: 'PagesAdministration.PlanMaintenance.Export'
  },
  cardBuilding: {
    page: 'PagesAdministration.Card',
    create: 'PagesAdministration.Card.Create',
    read: 'PagesAdministration.Card.Read',
    update: 'PagesAdministration.Card.Update',
    delete: 'PagesAdministration.Card.Delete',
    detail: 'PagesAdministration.Card.Detail',
    import: 'PagesAdministration.Cart.Import',
    Request: 'PagesAdministration.Card.Request'
  },
  planMaintenanceRecurring: {
    page: 'PagesAdministration.PlanMaintenanceRecurring',
    create: 'PagesAdministration.PlanMaintenanceRecurring.Create',
    read: 'PagesAdministration.PlanMaintenanceRecurring.Read',
    update: 'PagesAdministration.PlanMaintenanceRecurring.Update',
    delete: 'PagesAdministration.PlanMaintenanceRecurring.Delete',
    detail: 'PagesAdministration.PlanMaintenanceRecurring.Detail'
  },
  inventory: {
    page: 'PagesAdministration.Inventory',
    create: 'PagesAdministration.Inventory.Create',
    read: 'PagesAdministration.Inventory.Read',
    update: 'PagesAdministration.Inventory.Update',
    delete: 'PagesAdministration.Inventory.Delete',
    detail: 'PagesAdministration.Inventory.Detail',
    export: 'PagesAdministration.Inventory.Export'
  },
  news: {
    page: 'PagesAdministration.Event',
    create: 'PagesAdministration.Event.Create',
    read: 'PagesAdministration.Event.Read',
    update: 'PagesAdministration.Event.Update',
    delete: 'PagesAdministration.Event.Delete',
    detail: 'PagesAdministration.Event.Detail'
  },
  event: {
    page: 'PagesAdministration.Event',
    create: 'PagesAdministration.Event.Create',
    read: 'PagesAdministration.Event.Read',
    update: 'PagesAdministration.Event.Update',
    delete: 'PagesAdministration.Event.Delete',
    detail: 'PagesAdministration.Event.Detail'
  },
  feePackage: {
    page: 'PagesAdministration.FeePackage',
    create: 'PagesAdministration.FeePackage.Create',
    read: 'PagesAdministration.FeePackage.Read',
    update: 'PagesAdministration.FeePackage.Update',
    delete: 'PagesAdministration.FeePackage.Delete'
  },
  exchangeRate: {
    page: 'PagesAdministration.ExchangeRate',
    create: 'PagesAdministration.ExchangeRate.Create',
    read: 'PagesAdministration.ExchangeRate.Read',
    update: 'PagesAdministration.ExchangeRate.Update',
    delete: 'PagesAdministration.ExchangeRate.Delete'
  },
  servicePlan: {
    page: 'PagesAdministration.ServicePlan',
    create: 'PagesAdministration.ServicePlan.Create',
    read: 'PagesAdministration.ServicePlan.Read',
    update: 'PagesAdministration.ServicePlan.Update',
    detail: 'PagesAdministration.ServicePlan.Detail',
    export: 'PagesAdministration.ServicePlan.Export'
  },
  feeStatement: {
    page: 'PagesAdministration.FeeStatement',
    create: 'PagesAdministration.FeeStatement.Create',
    read: 'PagesAdministration.FeeStatement.Read',
    update: 'PagesAdministration.FeeStatement.Update',
    delete: 'PagesAdministration.FeeStatement.Delete',
    auditLog: 'PagesAdministration.FeeStatement.AuditLog',
    export: 'PagesAdministration.FeeStatement.Export'
  },
  feeReceipt: {
    page: 'PagesAdministration.FeeReceipt',
    create: 'PagesAdministration.FeeReceipt.Create',
    detail: 'PagesAdministration.FeeReceipt.Detail',
    read: 'PagesAdministration.FeeReceipt.Read',
    update: 'PagesAdministration.FeeReceipt.Update',
    delete: 'PagesAdministration.FeeReceipt.Delete',
    export: 'PagesAdministration.FeeReceipt.Export',
    refund: 'PagesAdministration.FeeReceipt.Refund'
  },
  feeVoucher: {
    page: 'PagesAdministration.FeeReceipt',
    create: 'PagesAdministration.FeeReceipt.Create',
    read: 'PagesAdministration.FeeReceipt.Read',
    update: 'PagesAdministration.FeeReceipt.Update',
    delete: 'PagesAdministration.FeeReceipt.Delete',
    detail: 'PagesAdministration.FeeReceipt.Detail',
    export: 'PagesAdministration.FeeReceipt.Export'
  },
  feeType: {
    page: 'PagesAdministration.FeeType',
    create: 'PagesAdministration.FeeType.Create',
    read: 'PagesAdministration.FeeType.Read',
    update: 'PagesAdministration.FeeType.Update',
    delete: 'PagesAdministration.FeeType.Delete',
    detail: 'PagesAdministration.FeeType.Detail'
  },
  amenity: {
    page: 'PagesAdministration.Amenity',
    create: 'PagesAdministration.Amenity.Create',
    read: 'PagesAdministration.Amenity.Read',
    update: 'PagesAdministration.Amenity.Update',
    delete: 'PagesAdministration.Amenity.Delete',
    detail: 'PagesAdministration.Amenity.Detail'
  },
  amenityMonthlyPackage: {
    page: 'PagesAdministration.MonthlyPackage',
    create: 'PagesAdministration.MonthlyPackage.Create',
    read: 'PagesAdministration.MonthlyPackage.Read',
    update: 'PagesAdministration.MonthlyPackage.Update',
    delete: 'PagesAdministration.MonthlyPackage.Delete',
    detail: 'PagesAdministration.MonthlyPackage.Detail'
  },
  amenityBlacklist: {
    page: 'PagesAdministration.AmenityBlackList',
    create: 'PagesAdministration.AmenityBlackList.Create',
    read: 'PagesAdministration.AmenityBlackList.Read',
    update: 'PagesAdministration.AmenityBlackList.Update',
    delete: 'PagesAdministration.AmenityBlackList.Delete',
    detail: 'PagesAdministration.AmenityBlackList.Detail'
  },
  amenityGroup: {
    page: 'PagesAdministration.AmenityGroup',
    create: 'PagesAdministration.AmenityGroup.Create',
    read: 'PagesAdministration.AmenityGroup.Read',
    update: 'PagesAdministration.AmenityGroup.Update',
    delete: 'PagesAdministration.AmenityGroup.Delete',
    detail: 'PagesAdministration.AmenityGroup.Detail'
  },
  amentylimited: {
    page: 'PagesAdministration.Workorder',
    create: 'PagesAdministration.Workorder.Create',
    read: 'PagesAdministration.Workorder.Read',
    update: 'PagesAdministration.Workorder.Update',
    delete: 'PagesAdministration.Workorder.Delete',
    detail: 'PagesAdministration.Workorder.Detail'
  },
  reservation: {
    page: 'PagesAdministration.Reservation',
    create: 'PagesAdministration.Reservation.Create',
    read: 'PagesAdministration.Reservation.Read',
    update: 'PagesAdministration.Reservation.Update',
    delete: 'PagesAdministration.Reservation.Delete',
    detail: 'PagesAdministration.Reservation.Detail',
    export: 'PagesAdministration.Reservation.Detail',
    import: 'PagesAdministration.Reservation.Detail',
    fullDetail: 'PagesAdministration.Reservation.FullDetail'
  },
  announcement: {
    page: 'PagesAdministration.Announcement',
    create: 'PagesAdministration.Announcement.Create',
    read: 'PagesAdministration.Announcement.Read',
    update: 'PagesAdministration.Announcement.Update',
    delete: 'PagesAdministration.Announcement.Delete',
    detail: 'PagesAdministration.Announcement.Detail'
  },
  banner: {
    page: 'PagesAdministration.Banner',
    create: 'PagesAdministration.Banner.Create',
    read: 'PagesAdministration.Banner.Read',
    update: 'PagesAdministration.Banner.Update',
    delete: 'PagesAdministration.Banner.Delete',
    detail: 'PagesAdministration.Banner.Detail'
  },
  paymentSetting: {
    page: 'PagesAdministration.PaymentSetting',
    create: 'PagesAdministration.PaymentSetting.Create',
    read: 'PagesAdministration.PaymentSetting.Read',
    update: 'PagesAdministration.PaymentSetting.Update',
    delete: 'PagesAdministration.PaymentSetting.Delete',
    detail: 'PagesAdministration.PaymentSetting.Detail'
  },
  product: {
    page: 'PagesAdministration.Product',
    create: 'PagesAdministration.Product.Create',
    read: 'PagesAdministration.Product.Read',
    update: 'PagesAdministration.Product.Update',
    delete: 'PagesAdministration.Product.Delete',
    detail: 'PagesAdministration.Product.Detail'
  },
  eOrders: {
    page: 'PagesAdministration.EOrders',
    create: 'PagesAdministration.EOrders.Create',
    read: 'PagesAdministration.EOrders.Read',
    update: 'PagesAdministration.EOrders.Update',
    delete: 'PagesAdministration.EOrders.Delete',
    detail: 'PagesAdministration.EOrders.Detail'
  },
  enquiry: {
    page: 'PagesAdministration.Enquiry',
    create: 'PagesAdministration.Enquiry.Create',
    read: 'PagesAdministration.Enquiry.Read',
    update: 'PagesAdministration.Enquiry.Update',
    delete: 'PagesAdministration.Enquiry.Delete',
    detail: 'PagesAdministration.Enquiry.Detail'
  },
  handoverPlan: {
    page: 'PagesAdministration.HandoverPlan',
    create: 'PagesAdministration.HandoverPlan.Create',
    read: 'PagesAdministration.HandoverPlan.Read',
    update: 'PagesAdministration.HandoverPlan.Update',
    delete: 'PagesAdministration.HandoverPlan.Delete',
    detail: 'PagesAdministration.HandoverPlan.Detail'
  },
  handoverReservation: {
    page: 'PagesAdministration.HandoverReservation',
    create: 'PagesAdministration.HandoverReservation.Create',
    read: 'PagesAdministration.HandoverReservation.Read',
    update: 'PagesAdministration.HandoverReservation.Update',
    delete: 'PagesAdministration.HandoverReservation.Delete',
    detail: 'PagesAdministration.HandoverReservation.Detail',
    export: 'PagesAdministration.HandoverReservation.Export'
  },
  eForm: {
    page: 'PagesAdministration.EForm',
    create: 'PagesAdministration.EForm.Create',
    read: 'PagesAdministration.EForm.Read',
    update: 'PagesAdministration.EForm.Update',
    delete: 'PagesAdministration.EForm.Delete',
    detail: 'PagesAdministration.EForm.Detail'
  },
  eFormAnswer: {
    page: 'PagesAdministration.EFormAnswer',
    create: 'PagesAdministration.EFormAnswer.Create',
    read: 'PagesAdministration.EFormAnswer.Read',
    update: 'PagesAdministration.EFormAnswer.Update',
    delete: 'PagesAdministration.EFormAnswer.Delete',
    detail: 'PagesAdministration.EFormAnswer.Detail'
  },
  delivery: {
    page: 'PagesAdministration.Delivery',
    create: 'PagesAdministration.Delivery.Create',
    read: 'PagesAdministration.Delivery.Read',
    update: 'PagesAdministration.Delivery.Update',
    delete: 'PagesAdministration.Delivery.Delete',
    detail: 'PagesAdministration.Delivery.Detail'
  },

  // bãi xe, quản lý xe
  parking: {
    page: 'PagesAdministration.Parking',
    create: 'PagesAdministration.Parking.Create',
    read: 'PagesAdministration.Parking.Read',
    update: 'PagesAdministration.Parking.Update',
    delete: 'PagesAdministration.Parking.Delete',
    detail: 'PagesAdministration.Parking.Detail',
    import: 'PagesAdministration.Parking.Import',
    export: 'PagesAdministration.Parking.Export'
  },
  // xác nhân số lượng xe
  vehicleRegistration: {
    page: 'PagesAdministration.VehicleRegistration',
    create: 'PagesAdministration.VehicleRegistration.Create',
    detail: 'PagesAdministration.VehicleRegistration.Detail',
    read: 'PagesAdministration.VehicleRegistration.Read',
    update: 'PagesAdministration.VehicleRegistration.Update',
    delete: 'PagesAdministration.VehicleRegistration.Delete'
  },

  updateCardRequest: {
    page: 'PagesAdministration.UpdateCardRequest',
    create: 'PagesAdministration.UpdateCardRequest.Create',
    detail: 'PagesAdministration.UpdateCardRequest.Detail',
    read: 'PagesAdministration.UpdateCardRequest.Read',
    update: 'PagesAdministration.UpdateCardRequest.Update',
    delete: 'PagesAdministration.UpdateCardRequest.Delete'
  },

  contractor: {
    page: 'PagesAdministration.Contractor',
    create: 'PagesAdministration.Contractor.Create',
    read: 'PagesAdministration.Contractor.Read',
    update: 'PagesAdministration.Contractor.Update',
    delete: 'PagesAdministration.Contractor.Delete',
    detail: 'PagesAdministration.Contractor.Detail',
    export: 'PagesAdministration.Contractor.Export',
    import: 'PagesAdministration.Contractor.Import'
  },
  contractorWO: {
    page: 'PagesAdministration.ContractorWO',
    create: 'PagesAdministration.ContractorWO.Create',
    read: 'PagesAdministration.ContractorWO.Read',
    update: 'PagesAdministration.ContractorWO.Update',
    delete: 'PagesAdministration.ContractorWO.Delete',
    detail: 'PagesAdministration.ContractorWO.Detail',
    export: 'PagesAdministration.ContractorWO.Export'
  },
  feeGenerate: {
    page: 'PagesAdministration.FeeGenerate',
    create: 'PagesAdministration.FeeGenerate.Create',
    read: 'PagesAdministration.FeeGenerate.Read',
    update: 'PagesAdministration.FeeGenerate.Update',
    delete: 'PagesAdministration.FeeGenerate.Delete',
    detail: 'PagesAdministration.FeeGenerate.Detail',
    confirm: 'PagesAdministration.FeeGenerate.Confirm',
    export: 'PagesAdministration.FeeGenerate.Export'
  },
  feeNotice: {
    page: 'PagesAdministration.FeeNotice',
    create: 'PagesAdministration.FeeNotice.Create',
    read: 'PagesAdministration.FeeNotice.Read',
    update: 'PagesAdministration.FeeNotice.Update',
    delete: 'PagesAdministration.FeeNotice.Delete',
    detail: 'PagesAdministration.FeeNotice.Detail',
    confirm: 'PagesAdministration.FeeNotice.Confirm',
    export: 'PagesAdministration.FeeNotice.Export'
  },
  MeterWater: {
    page: 'PagesAdministration.MeterWater',
    create: 'PagesAdministration.MeterWater.Create',
    read: 'PagesAdministration.MeterWater.Read',
    update: 'PagesAdministration.MeterWater.Update',
    delete: 'PagesAdministration.MeterWater.Delete',
    detail: 'PagesAdministration.MeterWater.Detail',
    export: 'PagesAdministration.MeterWater.Export',
    import: 'PagesAdministration.MeterWater.Import'
  },
  MeterElectricity: {
    page: 'PagesAdministration.MeterElectricity',
    create: 'PagesAdministration.MeterElectricity.Create',
    read: 'PagesAdministration.MeterElectricity.Read',
    update: 'PagesAdministration.MeterElectricity.Update',
    delete: 'PagesAdministration.MeterElectricity.Delete',
    detail: 'PagesAdministration.MeterElectricity.Detail',
    export: 'PagesAdministration.MeterElectricity.Export',
    import: 'PagesAdministration.MeterElectricity.Import',
    Confirm: 'PagesAdministration.MeterElectricity.Confirm'
  },
  ElectricForm: {
    update: 'PagesAdministration.ElectricForm.Update'
  },
  CashAdvance: {
    page: 'PagesAdministration.CashAdvance',
    create: 'PagesAdministration.CashAdvance.Create',
    read: 'PagesAdministration.CashAdvance.Read',
    update: 'PagesAdministration.CashAdvance.Update',
    delete: 'PagesAdministration.CashAdvance.Delete',
    detail: 'PagesAdministration.CashAdvance.Detail',
    export: 'PagesAdministration.CashAdvance.Export',
    deduct: 'PagesAdministration.CashAdvance.Deduct',
    withDraw: 'PagesAdministration.CashAdvance.WithDraw',
    import: 'PagesAdministration.CashAdvance.Import'
  },
  PaymentRequest: {
    page: 'PagesAdministration.PaymentRequest',
    create: 'PagesAdministration.PaymentRequest.Create',
    read: 'PagesAdministration.PaymentRequest.Read',
    update: 'PagesAdministration.PaymentRequest.Update',
    delete: 'PagesAdministration.PaymentRequest.Delete',
    detail: 'PagesAdministration.PaymentRequest.Detail'
  },
  customerGroup: {
    page: 'PagesAdministration.CustomerGroup',
    create: 'PagesAdministration.CustomerGroup.Create',
    read: 'PagesAdministration.CustomerGroup.Read',
    update: 'PagesAdministration.CustomerGroup.Update',
    delete: 'PagesAdministration.CustomerGroup.Delete'
  },
  salesOrganization: {
    page: 'PagesAdministration.SalesOrganization',
    create: 'PagesAdministration.SalesOrganization.Create',
    read: 'PagesAdministration.SalesOrganization.Read',
    update: 'PagesAdministration.SalesOrganization.Update',
    delete: 'PagesAdministration.SalesOrganization.Delete'
  },
  RequestTicket: {
    RequestTicket: 'PagesAdministration.RequestTicket',
    TransportIn: 'PagesAdministration.RequestTicket.TransportIn',
    TransportOut: 'PagesAdministration.RequestTicket.TransportOut',
    Renovation: 'PagesAdministration.RequestTicket.Renovation',
    Event: 'PagesAdministration.RequestTicket.Event',
    ConstructionList: 'PagesAdministration.RequestTicket.ConstructionList',
    Overtime: 'PagesAdministration.RequestTicket.Overtime',
    SuperUser: 'PagesAdministration.RequestTicket.SuperUser'
  }
}

// Notification
export const notificationTypes = {
  text: 1,
  download: 2,
  gotoDetail: 3
}

// fileType
export const fileTypeGroup = {
  pdf: ['.pdf'],
  office: ['.xlsx', '.doc', '.docx'],
  images: ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'],
  documentNotExcel: ['.pdf', '.doc', '.docx'],
  documents: ['.csv', '.xlsx', '.pdf', '.doc', '.docx'],
  documentAndImage: ['.csv', '.xlsx', '.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.JPG', '.PNG', '.JPEG'],
  video: ['.mp4'],
  videos: ['.mp4', '.3gp', '.mov']
}

// Layout constant
export const themeByEvent = {
  events: {
    default: 'default',
    xmasSanta: 'xmas-santa',
    xmasHouse: 'xmas-house',
    xmasNight: 'xmas-night',
    flowers: 'flowers'
  }
}

export enum CalendarTypes {
  PlanMaintenance = 1
}

export const QUESTION_TYPES = {
  1: { id: 1, name: 'Multiple Choice', hasOptions: true },
  2: { id: 2, name: 'Dropdown', hasOptions: true },
  3: { id: 3, name: 'Textbox' },
  4: { id: 4, name: 'Textarea' },
  5: { id: 5, name: 'Date/Time' },
  6: { id: 6, name: 'Number' },
  7: { id: 7, name: 'Rating' },
  8: { id: 8, name: 'Photo' },
  9: { id: 9, name: 'Label' },
  10: { id: 10, name: 'Inspection' }
}

export const QUESTION_VIEW_MODE = {
  editQuestion: 1,
  viewResponse: 2,
  answerQuestion: 3
}

export const EFORM_PUBLISH_STATUS = {
  PUBLISHED: 'FORMPUBLIC',
  UNPUBLIC: 'FORMUNPUBLIC'
}

export const efromStatusPublic = {
  UNPUBLIC: 1,
  PUBLISHED: 2
}

export const activeStatusRenderTag = {
  active: {
    id: 1,
    name: L('ACTIVE'),
    colorCode: '#64AA4D',
    borderColorCode: '#64AA4D1F'
  },
  inactive: {
    id: 0,
    name: L('INACTIVE'),
    colorCode: '#AAAAAA',
    borderColorCode: '#AAAAAA1F'
  }
}

export const rangePickerPlaceholder: any = () => {
  const label = [
    {
      get label() {
        return L('START_DATE')
      }
    },
    {
      get label() {
        return L('END_DATE')
      }
    }
  ]
  return label.map((i: any) => i.label)
}
export const listStatisticFeeNotice = [
  { id: 1, value: 1, name: 'SENT_FEE_NOTICE' },
  { id: 2, value: 2, name: 'SENT_REMINDER_1' },
  { id: 3, value: 3, name: 'SENT_REMINDER_2' },
  { id: 4, value: 4, name: 'SENT_STOP_SERVICE' },
  { id: 5, value: 5, name: 'DONT_SENT_FEE_NOTICE' },
  { id: 6, value: 6, name: 'DONT_SENT_REMINDER_1' },
  { id: 7, value: 7, name: 'DONT_SENT_REMINDER_2' },
  { id: 8, value: 8, name: 'DONT_SENT_STOP_SERVICE' }
]

export default AppConsts
