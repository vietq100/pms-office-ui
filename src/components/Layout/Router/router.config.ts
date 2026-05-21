import LoadableComponent from '../../Loadable'
import {
  ExceptionOutlined,
  FieldNumberOutlined,
  FieldStringOutlined,
  FormatPainterOutlined,
  LogoutOutlined,
  ProfileOutlined,
  RadarChartOutlined,
  CarOutlined,
  MoreOutlined,
  TagOutlined,
  UserOutlined,
  ScheduleOutlined,
  FundViewOutlined,
  ControlOutlined,
  CodepenOutlined,
  ClusterOutlined,
  FileTextOutlined,
  ReadOutlined,
  SoundOutlined,
  DropboxOutlined,
  SelectOutlined,
  ContactsOutlined,
  BarcodeOutlined,
  SplitCellsOutlined,
  SolutionOutlined,
  TranslationOutlined,
  BoxPlotOutlined,
  LayoutOutlined,
  PicLeftOutlined,
  NotificationOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  ClearOutlined,
  CreditCardOutlined,
  CommentOutlined
} from '@ant-design/icons'
import { DollarOutlined, FileProtectOutlined, PieChartOutlined } from '@ant-design/icons/lib'
import { appPermissions } from '@lib/appconst'

export const layouts: any = {
  userLayout: 'userLayout',
  portalLayout: 'appLayout',
  publicLayout: 'publicLayout'
}

export const layoutRouter: any = {
  userLayout: LoadableComponent(() => import('../UserLayout')),
  appLayout: LoadableComponent(() => import('../AppLayout')),
  publicLayout: LoadableComponent(() => import('../PublicLayout')),
  submitLayout: LoadableComponent(() => import('../SubmitLayout'))
}

export const submitLayout: any = {
  submitInquiry: {
    path: '/inquiry',
    title: 'LogIn',
    layout: layouts.userLayout,
    component: LoadableComponent(() => import('../../../scenes/accounts/submitInquiry'))
  },
  deleteAccount: {
    path: '/delete-account',
    title: 'LogIn',
    layout: layouts.userLayout,
    component: LoadableComponent(() => import('../../../scenes/accounts/deleteAccount'))
  }
}

export const publicLayout: any = {
  publicNews: {
    path: '/public/news/:id',
    title: 'NEWS',
    layout: layouts.publicLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/news/detail/public-news'))
  },
  termAndCondition: {
    path: '/public/terms-and-conditions',
    title: 'TERM_CONDITIONS',
    layout: layouts.publicLayout,
    component: LoadableComponent(() => import('../../../scenes/term-condition/term-condition'))
  },
  publicHandoverBooking: {
    path: '/public/handover-booking',
    title: 'HANDOVER_BOOKING',
    layout: layouts.publicLayout,
    component: LoadableComponent(() => import('../../../scenes/handover/handoverBooking'))
  },
  publicHandoverBookingConfirmed: {
    path: '/public/handover-booking-confirmed/:id',
    title: 'HANDOVER_BOOKING_CONFIRMED',
    layout: layouts.publicLayout,
    component: LoadableComponent(() => import('../../../scenes/handover/handoverBooking/HandoverBookingConfirmed'))
  },
  printReceipt: {
    path: '/public/print-receipt/:id',
    title: 'Receipt',
    layout: layouts.publicLayout,
    component: LoadableComponent(() => import('../../../scenes/feeStatement/receipt/components/ReceiptToPrint'))
  },
  printReport: {
    path: '/public/print-report',
    title: 'Print Report',
    layout: layouts.publicLayout,
    component: LoadableComponent(() => import('../../../scenes/common/Report/ReportToPrint'))
  },
  publicVNPay: {
    path: '/public/VNPayResult',
    title: 'VNPay Result',
    layout: layouts.publicLayout,
    component: LoadableComponent(() => import('../../../scenes/vnpay/VnPayResultPage'))
  }
}

export const userLayout: any = {
  accountLogin: {
    path: '/login',
    title: 'LogIn',
    layout: layouts.userLayout,
    component: LoadableComponent(() => import('../../../scenes/accounts/Login'))
  },
  registerPhoneForSocial: {
    path: '/register-phone-for-social',
    title: 'REGISTER_PHONE',
    layout: layouts.userLayout,
    component: LoadableComponent(() => import('../../../scenes/accounts/Register/RegisterPhoneForSocial'))
  },
  forgotPassword: {
    path: '/forgot-password',
    title: 'FORGOT_PASSWORD',
    layout: layouts.userLayout,
    component: LoadableComponent(() => import('../../../scenes/accounts/ForgotPassword'))
  },
  resetPassword: {
    path: '/reset-password',
    title: 'RESET_PASSWORD',
    layout: layouts.userLayout,
    component: LoadableComponent(() => import('../../../scenes/accounts/ForgotPassword'))
  }
}

export const portalLayouts: any = {
  welcomePage: {
    path: '/',
    title: 'Welcome Page',
    name: 'WELCOME_PAGE',
    layout: layouts.portalLayout,
    icon: LogoutOutlined,
    component: LoadableComponent(() => import('../../../scenes/Welcome'))
  },
  // Portal
  appSetting: {
    path: '/app-setting',
    permission: appPermissions.appSetting.page,
    title: 'App Setting',
    name: 'APP_SETTING',
    layout: layouts.portalLayout,
    icon: LogoutOutlined,
    component: LoadableComponent(() => import('../../../scenes/appSetting/AppSetting'))
  },
  accountLogout: {
    path: '/logout',
    permission: '',
    title: 'Logout',
    name: 'LOGOUT',
    layout: layouts.portalLayout,
    icon: LogoutOutlined,
    component: LoadableComponent(() => import('../../Logout'))
  },
  exception: {
    path: '/exception',
    permission: '',
    title: 'exception',
    name: 'EXCEPTION',
    layout: layouts.portalLayout,
    icon: ExceptionOutlined,
    component: LoadableComponent(() => import('../../../scenes/common/Exception'))
  },
  dashboard: {
    path: '/dashboard',
    name: 'DASHBOARD',
    permission: appPermissions.dashboard.page,
    title: 'Dashboard',
    layout: layouts.portalLayout,
    icon: PieChartOutlined,
    component: LoadableComponent(() => import('../../../scenes/common/Dashboard'))
  },
  report: {
    path: '/report',
    name: 'REPORT',
    permission: appPermissions.dashboard.report,
    title: 'Report',
    layout: layouts.portalLayout,
    icon: FundViewOutlined,
    component: LoadableComponent(() => import('../../../scenes/common/Report'))
  },
  dashboardBI: {
    path: '/dashboard-bi',
    name: 'DASHBOARD_BI',
    permission: appPermissions.dashboard.overview,
    title: 'Dashboard',
    layout: layouts.portalLayout,
    icon: PieChartOutlined,
    component: LoadableComponent(() => import('../../../scenes/common/DashboardBI'))
  },
  dashboardOverView: {
    path: '/dashboard-overview',
    name: 'DASHBOARD_OVERVIEW',
    permission: appPermissions.dashboard.overview,
    title: 'Dashboard',
    layout: layouts.portalLayout,
    icon: PieChartOutlined,
    component: LoadableComponent(() => import('../../../scenes/common/DashboardBI/DashBoardWithChartJS'))
  },
  adminMasterData: {
    path: '/master-data',
    name: 'MASTER_DATA',
    permission: appPermissions.adminMasterData.page,
    title: 'Master Data',
    layout: layouts.portalLayout,
    icon: BoxPlotOutlined,
    component: LoadableComponent(() => import('../../../scenes/administrator/MasterData'))
  },
  adminMasterDataCreate: {
    path: '/master-data-create',
    permission: appPermissions.adminMasterData.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/administrator/MasterData/MasterDataDetail'))
  },
  adminMasterDataDetail: {
    path: '/master-data-detail/:id',
    permission: appPermissions.adminMasterData.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/administrator/MasterData/MasterDataDetail'))
  },
  notification: {
    path: '/user-notification',
    name: 'USER_NOTIFICATION',
    permission: '',
    title: 'User Notification',
    layout: layouts.portalLayout,
    icon: RadarChartOutlined,
    component: LoadableComponent(() => import('../../../scenes/common/Notification'))
  },
  // Staff
  staffManagement: {
    path: '/staffs',
    name: 'STAFF_MANAGEMENT',
    permission: appPermissions.staff.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/member/staff'))
  },
  staffCreate: {
    path: '/staff-create',
    name: 'STAFF_MANAGEMENT_CREATE',
    permission: appPermissions.staff.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/member/staff/StaffCreate'))
  },
  staffDetail: {
    path: '/staff-detail/:id',
    name: 'STAFF_MANAGEMENT_DETAIL',
    permission: appPermissions.staff.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/member/staff/StaffDetail'))
  },
  // Resident
  residentManagement: {
    path: '/residents',
    name: 'RESIDENT_MANAGEMENT',
    permission: appPermissions.resident.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/member/residents'))
  },
  residentCreate: {
    path: '/resident-create',
    name: 'RESIDENT_MANAGEMENT_CREATE',
    permission: appPermissions.resident.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/member/residents/ResidentCreate'))
  },
  residentDetail: {
    path: '/resident-detail/:id',
    name: 'RESIDENT_MANAGEMENT_DETAIL',
    permission: appPermissions.resident.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/member/residents/ResidentDetail'))
  },
  // Delevop
  developManagement: {
    path: '/develop',
    name: 'DEVELOP_MANAGEMENT',
    permission: appPermissions.resident.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/member/develop'))
  },
  developCreate: {
    path: '/develop-create',
    name: 'DEVELOP_MANAGEMENT_CREATE',
    permission: appPermissions.resident.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/member/develop/developCreate'))
  },
  developDetail: {
    path: '/develop-detail/:id',
    name: 'DEVELOP_MANAGEMENT_DETAIL',
    permission: appPermissions.resident.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/member/develop/developDetail'))
  },
  // Shop Owner
  shopOwnerManagement: {
    path: '/shop-owners',
    name: 'SHOP_OWNER_MANAGEMENT',
    permission: appPermissions.shopOwner.page,
    layout: layouts.portalLayout,
    icon: UserOutlined,
    component: LoadableComponent(() => import('../../../scenes/member/shopOwner'))
  },
  shopOwnerCreate: {
    path: '/shop-owner-create',
    name: 'SHOP_OWNER_MANAGEMENT_CREATE',
    permission: appPermissions.shopOwner.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/member/shopOwner/ShopOwnerDetail'))
  },
  shopOwnerDetail: {
    path: '/shop-owner-detail/:id',
    name: 'SHOP_OWNER_MANAGEMENT_DETAIL',
    permission: appPermissions.shopOwner.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/member/shopOwner/ShopOwnerDetail'))
  },
  shopManagement: {
    path: '/shop-management',
    name: 'SHOP_MANAGEMENT',
    permission: appPermissions.shopOwner.updateShopOwner,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/member/shopManagement'))
  },
  shopProductList: {
    path: '/shop-product-list',
    name: 'SHOP_PRODUCT_LIST',
    permission: appPermissions.product.page,
    layout: layouts.portalLayout,
    icon: CodepenOutlined,
    component: LoadableComponent(() => import('../../../scenes/member/shopProduct/productList/productList'))
  },
  shopProductCreate: {
    path: '/shop-product-create',
    name: 'SHOP_PRODUCT_CREATE',
    permission: appPermissions.product.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/member/shopProduct/productDetail/productDetail'))
  },
  shopProductDetail: {
    path: '/shop-product-detail/:id',
    name: 'SHOP_PRODUCT_DETAIL',
    permission: appPermissions.product.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/member/shopProduct/productDetail/productDetail'))
  },
  shopOrderList: {
    path: '/shop-order-list',
    name: 'SHOP_ORDER_LIST',
    permission: appPermissions.eOrders.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/member/shopOrder/shopOrderList'))
  },
  shopOrderDetail: {
    path: '/shop-order-detail/:id',
    name: 'SHOP_ORDER_DETAIL',
    permission: appPermissions.eOrders.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/member/shopOrder/shopOrderDetail'))
  },
  companies: {
    path: '/companies',
    name: 'COMPANY',
    permission: appPermissions.company.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/Company'))
  },
  companyCreate: {
    path: '/company-create',
    permission: appPermissions.company.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/Company/components/CompanyDetail'))
  },
  companyDetail: {
    path: '/company-detail/:id',
    permission: appPermissions.company.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/Company/components/CompanyDetail'))
  },
  companyContracts: {
    path: '/contracts',
    name: 'COMPANY_CONTRACT_BQL',
    permission: appPermissions.companyContract.page,
    layout: layouts.portalLayout,
    // icon: FileProtectOutlined,
    component: LoadableComponent(() => import('../../../scenes/projects/Contract'))
  },
  companyContractCreate: {
    path: '/contract-create',
    permission: appPermissions.companyContract.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/Contract/components/ContractDetail'))
  },
  companyContractDetail: {
    path: '/contract-detail/:id',
    permission: appPermissions.companyContract.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/Contract/components/ContractDetail'))
  },

  officeContract: {
    path: '/contracts-office',
    name: 'COMPANY_OFFICE',
    permission: appPermissions.companyContract.page,
    layout: layouts.portalLayout,
    // icon: FileProtectOutlined,
    component: LoadableComponent(() => import('../../../scenes/projects/ContractOffice'))
  },

  officeContractCreate: {
    path: '/contract-office-create',
    permission: appPermissions.companyContract.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/ContractOffice/ContractDetail'))
  },
  officeCompanyContractDetail: {
    path: '/contract-office-detail/:id',
    permission: appPermissions.companyContract.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/ContractOffice/ContractDetail'))
  },
  contractCategories: {
    path: '/contract-categories',
    name: 'CONTRACT_CATEGORY',
    permission: appPermissions.contractCategory.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/ContractCategory'))
  },
  contractCategoryCreate: {
    path: '/contract-category-create',
    permission: appPermissions.companyContract.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/projects/ContractCategory/components/ContractCategoryDetail')
    )
  },
  contractCategoryDetail: {
    path: '/contract-category-detail/:id',
    permission: appPermissions.companyContract.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/projects/ContractCategory/components/ContractCategoryDetail')
    )
  },

  // Payment request

  totalElectricMeter: {
    path: '/total-electric-meter',
    name: 'TOTAL_ELECTRIC_METER',
    permission: appPermissions.PaymentRequest.page,
    layout: layouts.portalLayout,
    // icon: FileProtectOutlined,
    component: LoadableComponent(() => import('../../../scenes/paymentRequest/totalElectric'))
  },
  totalElectricMeterDetail: {
    path: '/total-electric-meter/:id',
    name: 'TOTAL_ELECTRIC_METER_DETAIL',
    permission: appPermissions.PaymentRequest.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/paymentRequest/totalElectric/totalElectricDetail'))
  },
  totalElectricMeterCreate: {
    path: '/total-electric-meter-create',
    name: 'TOTAL_ELECTRIC_METER_CREAETED',
    permission: appPermissions.PaymentRequest.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/paymentRequest/totalElectric/totalElectricDetail'))
  },

  totalWaterMeter: {
    path: '/total-water-meter',
    name: 'TOTAL_WATER_METER',
    permission: appPermissions.PaymentRequest.page,
    layout: layouts.portalLayout,
    // icon: FileProtectOutlined,
    component: LoadableComponent(() => import('../../../scenes/paymentRequest/totalWater'))
  },
  totalWaterMeterDetail: {
    path: '/total-water-meter/:id',
    name: 'TOTAL_WATER_METER_DETAIL',
    permission: appPermissions.PaymentRequest.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/paymentRequest/totalWater/totalWaterDetail'))
  },
  totalWaterMeterCreate: {
    path: '/total-water-meter-create',
    name: 'TOTAL_WATER_METER_CREAETED',
    permission: appPermissions.PaymentRequest.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/paymentRequest/totalWater/totalWaterDetail'))
  },
  managementFee: {
    path: '/payment-request-management-fee',
    name: 'MANAGEMENT_FEE_PAYMENT_REQUEST',
    permission: appPermissions.PaymentRequest.page,
    layout: layouts.portalLayout,
    // icon: FileProtectOutlined,
    component: LoadableComponent(() => import('../../../scenes/paymentRequest/managementFees'))
  },
  managementFeeDetail: {
    path: '/payment-request-management-fee/:id',
    name: 'MANAGEMENT_FEE_PAYMENT_REQUEST_DETAIL',
    permission: appPermissions.PaymentRequest.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/paymentRequest/managementFees/managementFeeDetail'))
  },
  managementFeeCreate: {
    path: '/payment-request-management-fee-create',
    name: 'MANAGEMENT_FEE_PAYMENT_REQUEST_CREAETED',
    permission: appPermissions.PaymentRequest.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/paymentRequest/managementFees/managementFeeDetail'))
  },
  electricAndWaterFee: {
    path: '/electric-and-water-fee',
    name: 'ELECTRIC_AND_WATER_PAYMENT_REQUEST',
    permission: appPermissions.PaymentRequest.page,
    layout: layouts.portalLayout,
    // icon: FileProtectOutlined,
    component: LoadableComponent(() => import('../../../scenes/paymentRequest/electricAndWaterFees'))
  },
  electricAndWaterFeeDetail: {
    path: '/electric-and-water-fee/:id',
    name: 'ELECTRIC_AND_WATER_DETAIL',
    permission: appPermissions.PaymentRequest.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/paymentRequest/electricAndWaterFees/electricAndWaterFeeDetail')
    )
  },
  electricAndWaterFeeCreate: {
    path: '/electric-and-water-fee-create',
    name: 'ELECTRIC_AND_WATER_CREAETED',
    permission: appPermissions.PaymentRequest.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/paymentRequest/electricAndWaterFees/electricAndWaterFeeDetail')
    )
  },

  ticketRequestTransportIn: {
    path: '/ticket-request-transport-in',
    name: 'TRANSPORT_IN',
    permission: appPermissions.RequestTicket.TransportIn,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/ticketRegistration/transport'))
  },
  ticketRequestTransportInCreate: {
    path: '/ticket-transport-in-create',
    name: 'TRANSPORT_IN_OUT',
    // permission: appPermissions.RequestTicket.TransportIn,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/ticketRegistration/transport/transportDetail'))
  },

  ticketRequestTransportOut: {
    path: '/ticket-request-transport-out',
    name: 'TRANSPORT_OUT',
    permission: appPermissions.RequestTicket.TransportOut,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/ticketRegistration/transport'))
  },
  ticketRequestTransportOutCreate: {
    path: '/ticket-transport-out-create',
    name: 'TRANSPORT_IN_OUT',
    // permission: appPermissions.company.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/ticketRegistration/transport/transportDetail'))
  },

  transportInOutDetail: {
    path: '/transport-in-out/:id',
    name: 'TRANSPORT_IN_OUT',
    // permission: appPermissions.company.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/ticketRegistration/transport/transportDetail'))
  },

  ticketRequestRenovation: {
    path: '/ticket-request-renovation',
    name: 'TICKET_REQUEST_RENOVATION',
    permission: appPermissions.RequestTicket.Renovation,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/ticketRegistration/renovation'))
  },
  ticketRequestRenovationCreate: {
    path: '/ticket-request-renovation-create',
    name: 'TICKET_RENOVATION',
    permission: appPermissions.RequestTicket.Renovation,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/ticketRegistration/renovation/renovationDetail'))
  },

  ticketRequestRenovationDetail: {
    path: '/ticket-request-renovation/:id',
    name: 'TICKET_RENOVATION',
    permission: appPermissions.RequestTicket.Renovation,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/ticketRegistration/renovation/renovationDetail'))
  },

  // ticket event
  ticketRequestEvent: {
    path: '/ticket-request-event',
    name: 'TICKET_REQUEST_EVENT',
    permission: appPermissions.RequestTicket.Event,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/ticketRegistration/event'))
  },
  ticketRequestEventCreate: {
    path: '/ticket-request-event-create',
    name: 'TICKET_EVENT',
    permission: appPermissions.RequestTicket.Event,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/ticketRegistration/event/TicketEventDetail'))
  },

  ticketRequestEventDetail: {
    path: '/ticket-request-event/:id',
    name: 'TICKET_EVENT',
    permission: appPermissions.RequestTicket.Event,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/ticketRegistration/event/TicketEventDetail'))
  },

  // ticket construction
  ticketRequestConstruction: {
    path: '/ticket-request-construction',
    name: 'TICKET_REQUEST_CONSTRUCTION',
    permission: appPermissions.RequestTicket.ConstructionList,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/ticketRegistration/contrucsitonTicket'))
  },
  ticketRequestConstructionCreate: {
    path: '/ticket-request-construction-create',
    name: 'TICKET_REQUEST_CONSTRUCTION_CREATE',
    permission: appPermissions.RequestTicket.ConstructionList,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/ticketRegistration/contrucsitonTicket/contrucsitonDetail')
    )
  },

  ticketRequestConstructionDetail: {
    path: '/ticket-request-construction/:id',
    name: 'TICKET_REQUEST_CONSTRUCTION_EDIT',
    permission: appPermissions.RequestTicket.ConstructionList,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/ticketRegistration/contrucsitonTicket/contrucsitonDetail')
    )
  },

  // ticket overtime
  ticketRequestOvertime: {
    path: '/ticket-request-overtime',
    name: 'TICKET_REQUEST_OVERTIME',
    permission: appPermissions.RequestTicket.Overtime,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/ticketRegistration/overtimeTicket'))
  },
  ticketRequestOvertimeCreate: {
    path: '/ticket-request-overtime-create',
    name: 'TICKET_REQUEST_OVERTIME_CREATE',
    permission: appPermissions.RequestTicket.Overtime,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/ticketRegistration/overtimeTicket/overTimeTicketDetail'))
  },

  ticketRequestOvertimeDetail: {
    path: '/ticket-request-overtime/:id',
    name: 'TICKET_REQUEST_OVERTIME_EDIT',
    permission: appPermissions.RequestTicket.Overtime,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/ticketRegistration/overtimeTicket/overTimeTicketDetail'))
  },
  // Parking Overtime
  ticketParkingOvertime: {
    path: '/ticket-parking-overtime',
    name: 'TICKET_PARKING_OVERTIME',
    permission: appPermissions.RequestTicket.Overtime,
    layout: layouts.portalLayouts,
    component: LoadableComponent(() => import('../../../scenes/ticketRegistration/parkingOvertimeTicket'))
  },
  ticketParkingOvertimeCreate: {
    path: '/ticket-parking-overtime-detail',
    name: 'TICKET_PARKING_OVERTIME_CREATE',
    permission: appPermissions.RequestTicket.Overtime,
    layout: layouts.portalLayouts,
    component: LoadableComponent(
      () => import('../../../scenes/ticketRegistration/parkingOvertimeTicket/components/ParkingOvertimeTicketDetail')
    )
  },
  ticketParkingOvertimeDetail: {
    path: '/ticket-parking-overtime-detail/:id',
    name: 'TICKET_PARKING_OVERTIME_EDIT',
    permission: appPermissions.RequestTicket.Overtime,
    layout: layouts.portalLayouts,
    component: LoadableComponent(
      () => import('../../../scenes/ticketRegistration/parkingOvertimeTicket/components/ParkingOvertimeTicketDetail')
    )
  },
  // Project
  projectManagement: {
    path: '/projects',
    name: 'PROJECT_MANAGEMENT',
    permission: appPermissions.project.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/project'))
  },
  projectCreate: {
    path: '/project-create',
    name: 'PROJECT_MANAGEMENT_CREATE',
    permission: appPermissions.project.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/project/ProjectDetail'))
  },
  projectDetail: {
    path: '/project-detail/:id',
    name: 'PROJECT_MANAGEMENT_DETAIL',
    permission: appPermissions.project.read,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/project/ProjectDetail'))
  },
  projectBuilding: {
    path: '/buildings',
    name: 'PROJECT_BUILDING',
    permission: appPermissions.building.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/Building'))
  },
  projectFloor: {
    path: '/floors',
    name: 'PROJECT_FLOOR',
    permission: appPermissions.floor.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/Floor'))
  },
  projectUnit: {
    path: '/units',
    name: 'PROJECT_UNIT',
    permission: appPermissions.unit.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/unit'))
  },
  projectZone: {
    path: '/zones',
    name: 'PROJECT_ZONE',
    permission: appPermissions.unit.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/zone'))
  },
  projectStackingPlan: {
    path: '/stacking-plan',
    name: 'PROJECT_STACKING_PLAN',
    permission: appPermissions.unit.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/stackingPlan'))
  },
  projectUnitCreate: {
    path: '/unit-create',
    permission: appPermissions.unit.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/unit/UnitDetail'))
  },
  projectUnitDetail: {
    path: '/unit-detail/:id',
    permission: appPermissions.unit.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/projects/unit/UnitDetail'))
  },

  // Library
  libraryManagement: {
    path: '/library',
    name: 'LIBRARY_MANAGEMENT',
    permission: appPermissions.library.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/library'))
  },
  libraryPrivateManagement: {
    path: '/library-private',
    name: 'LIBRARY_PRIVATE_MANAGEMENT',
    permission: appPermissions.library.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/libraryPrivate'))
  },

  // Communicate
  communicationWorkOrder: {
    path: '/work-order',
    name: 'WORKORDER',
    permission: appPermissions.workOrder.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/workorder'))
  },
  communicationMyWorkOrder: {
    path: '/my-work-order',
    name: 'MY_WORK_ORDER',
    permission: appPermissions.workOrder.myWorkOrder,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/workorder'))
  },
  communicationWorkOrderCreate: {
    path: '/work-order-create',
    name: 'WORK_ORDER_DETAIL',
    permission: appPermissions.workOrder.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/workorder/components/WorkOrderDetail'))
  },
  communicationWorkOrderDetail: {
    path: '/work-order-detail/:id',
    name: 'WORK_ORDER_DETAIL',
    permission: appPermissions.workOrder.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/workorder/components/WorkOrderDetail'))
  },
  communicationWorkOrderConfig: {
    path: '/work-order-config',
    name: 'WORK_ORDER_CONFIG',
    permission: appPermissions.workorderConfiguration.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/workorder/components/WorkOrderConfig'))
  },
  // Communication feedback
  communicationFeedback: {
    path: '/feedback',
    name: 'FEEDBACK',
    permission: appPermissions.feedback.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/feedback'))
  },
  communicationFeedbackCreate: {
    path: '/feedback-create',
    name: 'FEEDBACK_DETAIL',
    permission: appPermissions.feedback.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/feedback/components/FeedbackDetail'))
  },
  communicationFeedbackDetail: {
    path: '/feedback-detail/:id',
    name: 'FEEDBACK_DETAIL',
    permission: appPermissions.feedback.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/feedback/components/FeedbackDetail'))
  },
  communicationFeedbackConfig: {
    path: '/feedback-config',
    name: 'FEEDBACK_CONFIG',
    permission: appPermissions.feedbackConfiguration.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/feedback/components/FeedbackConfig'))
  },
  // Communication visitor
  communicationVisitor: {
    path: '/visitor',
    name: 'VISITOR',
    permission: appPermissions.visitor.page,
    layout: layouts.portalLayout,
    icon: SelectOutlined,
    component: LoadableComponent(() => import('../../../scenes/communication/visitor'))
  },
  communicationVisitorCreate: {
    path: '/visitor-create',
    name: 'VISITOR_DETAIL',
    permission: appPermissions.visitor.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/visitor/components/VisitorDetail'))
  },
  communicationVisitorDetail: {
    path: '/visitor-detail/:id',
    name: 'VISITOR_DETAIL',
    permission: appPermissions.visitor.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/visitor/components/VisitorDetail'))
  },
  // Building Directory
  buildingDirectory: {
    path: '/building-directory',
    name: 'BUILDING_DIRECTORY',
    permission: appPermissions.buildingDirectory.page,
    layout: layouts.portalLayout,
    icon: ContactsOutlined,
    component: LoadableComponent(() => import('../../../scenes/communication/buildingDirectory'))
  },
  buildingDirectoryCreate: {
    path: '/visitor-create',
    name: 'VISITOR_DETAIL',
    permission: appPermissions.visitor.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/visitor/components/VisitorDetail'))
  },
  buildingDirectoryDetail: {
    path: '/visitor-detail/:id',
    name: 'VISITOR_DETAIL',
    permission: appPermissions.visitor.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/visitor/components/VisitorDetail'))
  },
  // News
  newsManagement: {
    path: '/news',
    name: 'NEWS',
    permission: appPermissions.news.page,
    layout: layouts.portalLayout,
    icon: ReadOutlined,
    component: LoadableComponent(() => import('../../../scenes/communication/news'))
  },
  newsDetail: {
    path: '/news-detail/:id',
    name: 'NEWS',
    permission: appPermissions.news.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/news/detail'))
  },
  newsEdit: {
    path: '/news-edit/:id',
    name: 'NEWS',
    permission: appPermissions.news.update,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/news/edit'))
  },
  newsCreate: {
    path: '/news-create',
    name: 'NEWS',
    permission: appPermissions.news.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/news/edit'))
  },
  // Events
  eventManagement: {
    path: '/events',
    name: 'EVENT',
    permission: appPermissions.event.page,
    layout: layouts.portalLayout,
    icon: ScheduleOutlined,
    component: LoadableComponent(() => import('../../../scenes/communication/events'))
  },
  eventDetail: {
    path: '/event-detail/:id',
    name: 'EVENT',
    permission: appPermissions.event.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/events/detail'))
  },
  eventEdit: {
    path: '/event-edit/:id',
    name: 'EVENT',
    permission: appPermissions.event.update,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/events/edit'))
  },
  eventCreate: {
    path: '/event-create',
    name: 'EVENT',
    permission: appPermissions.event.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/communication/events/edit'))
  },
  // Amenity
  amenityManagement: {
    path: '/amenities',
    name: 'AMENITY',
    permission: appPermissions.amenity.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/booking/amenity'))
  },
  amenityDetail: {
    path: '/amenity-detail/:id',
    name: 'AMENITY_DETAIL',
    permission: appPermissions.amenity.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/booking/amenity/components/AmenityDetail'))
  },
  amenityCreate: {
    path: '/amenity-create',
    name: 'AMENITY_CREATE',
    permission: appPermissions.amenity.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/booking/amenity/components/AmenityDetail'))
  },
  amenitySettingManagement: {
    path: '/amenity-setting',
    name: 'AMENITY_SETTING',
    permission: appPermissions.amenityGroup.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/booking/amenitySetting'))
  },
  // Amenity group
  amenityGroupManagement: {
    path: '/amenity-groups',
    name: 'AMENITY_GROUP',
    permission: appPermissions.amenityGroup.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/booking/amenityGroup'))
  },
  amenityGroupDetail: {
    path: '/amenity-group-detail/:id',
    name: 'AMENITY_GROUP_DETAIL',
    permission: appPermissions.amenityGroup.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/booking/amenityGroup/components/AmenityGroupDetail'))
  },
  amenityGroupCreate: {
    path: '/amenity-group-create',
    name: 'AMENITY_GROUP_CREATE',
    permission: appPermissions.amenityGroup.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/booking/amenityGroup/components/AmenityGroupDetail'))
  },
  // Reservation
  reservationManagement: {
    path: '/reservations',
    name: 'RESERVATION',
    permission: appPermissions.reservation.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/booking/reservation'))
  },
  reservationDetail: {
    path: '/reservation-detail/:id',
    name: 'RESERVATION_DETAIL',
    permission: appPermissions.reservation.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/booking/reservation/components/ReservationDetail'))
  },
  reservationCreate: {
    path: '/reservation-create',
    name: 'RESERVATION_CREATE',
    permission: appPermissions.reservation.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/booking/reservation/components/ReservationCalendar'))
  },
  // Amenity Blacklist
  amenityBlacklist: {
    path: '/amenity-black-list',
    name: 'BLACKLIST',
    permission: appPermissions.amenityBlacklist.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/booking/blackList'))
  },
  // Amenity booking overlap slot
  amenityMonthlyPackage: {
    path: '/amenity-monthly-package',
    name: 'MONTHLY_PACKAGE',
    permission: appPermissions.amenityMonthlyPackage.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/booking/monthlyPackage'))
  },

  //approval workflow
  positonApproval: {
    path: '/position-approval',
    name: 'POSITON_APPROVAL',
    permission: appPermissions.feePackage.page,
    layout: layouts.portalLayout,
    icon: SettingOutlined,
    component: LoadableComponent(() => import('../../../scenes/approvalWorkflow/positionApproval'))
  },

  flowOperator2Tenant: {
    path: '/flow-oprator-tenant',
    name: 'FLOW_OPRATOR_2_TENANT',
    permission: appPermissions.feePackage.page,
    layout: layouts.portalLayout,
    icon: SettingOutlined,
    component: LoadableComponent(() => import('../../../scenes/approvalWorkflow/flowApprovalOffice'))
  },

  flowOperator2Develop: {
    path: '/flow-oprator-develop',
    name: 'FLOW_OPRATOR_2_DEVELOP',
    permission: appPermissions.feePackage.page,
    layout: layouts.portalLayout,
    icon: SettingOutlined,
    component: LoadableComponent(() => import('../../../scenes/approvalWorkflow/flowApprovalDevelop'))
  },

  //Fee Setting
  feeSetting: {
    path: '/fee-setting',
    name: 'FEE_SETTING',
    permission: appPermissions.feePackage.page,
    layout: layouts.portalLayout,
    icon: SettingOutlined,
    component: LoadableComponent(() => import('../../../scenes/feeStatementV1/fee-setting'))
  },
  //Fee Setting
  exchangeRate: {
    path: '/exchange-rate',
    name: 'EXCHANGE_RATE',
    permission: appPermissions.exchangeRate.page,
    layout: layouts.portalLayout,
    icon: DollarOutlined,
    component: LoadableComponent(() => import('../../../scenes/exchangeRate'))
  },
  // Fee Statement
  feePackage: {
    path: '/package-fee',
    name: 'FEE_PACKAGE',
    permission: appPermissions.feePackage.page,
    layout: layouts.portalLayout,
    icon: SplitCellsOutlined,
    component: LoadableComponent(() => import('../../../scenes/feeStatementV1/fee-setting/fee-package'))
  },
  // feeStatement: {
  //   path: '/fee-statement/:feeGroup',
  //   name: 'FEE_STATEMENT',
  //   permission: appPermissions.feeStatement.page,
  //   layout: layouts.portalLayout,
  //   component: LoadableComponent(
  //     () => import('../../../scenes/feeStatement/fee')
  //   )
  // },
  // feeStatementManagement: {
  //   path: '/fee-statement/feeManagement',
  //   name: 'FEE_STATEMENT',
  //   permission: appPermissions.feeStatement.page,
  //   layout: layouts.portalLayout,
  //   component: LoadableComponent(
  //     () => import('../../../scenes/feeStatement/fee')
  //   )
  // },
  feeStatementManagementV1: {
    path: '/fee-statement/feeManagement-v1',
    name: 'FEE_STATEMENT_V1',
    permission: appPermissions.feeStatement.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/feeStatementV1/fee'))
  },
  // feeStatementBooking: {
  //   path: '/fee-statement/feeReservation',
  //   name: 'FEE_STATEMENT_BOOKING',
  //   permission: appPermissions.feeStatement.page,
  //   layout: layouts.portalLayout,
  //   component: LoadableComponent(
  //     () => import('../../../scenes/feeStatement/fee')
  //   )
  // },
  feeStatementBookingV1: {
    path: '/fee-statement/feeReservation-v1',
    name: 'FEE_STATEMENT_BOOKING_V1',
    permission: appPermissions.feeStatement.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/feeStatementV1/fee'))
  },
  ReceiptAndVoucher: {
    path: '/receipt-voucher',
    name: 'RECEIPT_AND_VOUCHER',
    permission: appPermissions.feeReceipt.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/feeStatementV1/receiptAndVoucher'))
  },

  feeCreateReceiptV2: {
    path: '/receipt-create',
    name: 'FEE_RECEIPT',
    permission: appPermissions.feeReceipt.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/feeStatementV1/receipt/components/CreatingReceiptV1'))
  },
  // feeReceipt: {
  //   path: '/receipt',
  //   name: 'FEE_RECEIPT',
  //   permission: appPermissions.feeReceipt.page,
  //   layout: layouts.portalLayout,
  //   component: LoadableComponent(
  //     () => import('../../../scenes/feeStatement/receipt')
  //   )
  // },
  feeReceiptV1: {
    path: '/receipt',
    name: 'FEE_RECEIPT_V1',
    permission: appPermissions.feeReceipt.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/feeStatementV1/receipt'))
  },
  // feeReceiptDetail: {
  //   path: '/receipt-details/:id',
  //   name: 'FEE_RECEIPT_DETAIL',
  //   permission: appPermissions.feeReceipt.read,
  //   layout: layouts.portalLayout,
  //   component: LoadableComponent(
  //     () =>
  //       import('../../../scenes/feeStatement/receipt/components/ReceiptDetails')
  //   )
  // },
  feeReceiptDetailV1: {
    path: '/receipt-details-v1/:id',
    name: 'FEE_RECEIPT_DETAIL',
    permission: appPermissions.feeReceipt.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/feeStatementV1/receipt/components/ReceiptDetails'))
  },
  // feeVoucher: {
  //   path: '/voucher',
  //   name: 'FEE_VOUCHER',
  //   permission: appPermissions.feeVoucher.page,
  //   layout: layouts.portalLayout,
  //   component: LoadableComponent(
  //     () => import('../../../scenes/feeStatement/voucher')
  //   )
  // },
  feeVoucherV1: {
    path: '/voucher-v1',
    name: 'FEE_VOUCHER_V1',
    permission: appPermissions.feeVoucher.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/feeStatementV1/voucher'))
  },

  // feeVoucherDetail: {
  //   path: '/voucher-detail',
  //   name: 'FEE_VOUCHER_DETAIL',
  //   permission: appPermissions.feeVoucher.read,
  //   layout: layouts.portalLayout,
  //   component: LoadableComponent(
  //     () => import('../../../scenes/feeStatement/voucher/PaymentPrinting')
  //   )
  // },
  feeVoucherDetailV1: {
    path: '/voucher-detail-v1',
    name: 'FEE_VOUCHER_DETAIL',
    permission: appPermissions.feeVoucher.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/feeStatementV1/voucher/PaymentPrinting'))
  },
  feeAuditLog: {
    path: '/fee/audit-log/:id',
    name: 'FEE_AUDIT_LOG',
    permission: '',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/feeStatement/fee-log'))
  },
  feeTypes: {
    path: '/fee-types',
    name: 'FEE_TYPE',
    permission: appPermissions.feeType.page,
    layout: layouts.portalLayout,
    icon: TagOutlined,
    component: LoadableComponent(() => import('../../../scenes/feeStatement/fee-type'))
  },
  feeTypesV2: {
    path: '/fee-types-v2',
    name: 'FEE_TYPE',
    permission: appPermissions.feeType.page,
    layout: layouts.portalLayout,
    icon: TagOutlined,
    component: LoadableComponent(() => import('../../../scenes/feeStatementV1/fee-setting/fee-typeV2'))
  },
  feeTypesV2Create: {
    path: '/fee-types-v2-create',
    name: 'FEE_TYPE_CREATE',
    permission: appPermissions.feeType.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/feeStatementV1/fee-setting/fee-typeV2/components/feeTypeDetail')
    )
  },
  feeTypesV2Detail: {
    path: '/fee-types-v2-detail/:id',
    name: 'FEE_TYPE_DETAIL',
    permission: appPermissions.feeType.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/feeStatementV1/fee-setting/fee-typeV2/components/feeTypeDetail')
    )
  },
  paymentSetting: {
    path: '/payment-setting',
    name: 'FEE_PAYMENT_SETTING',
    permission: appPermissions.paymentSetting.page,
    layout: layouts.portalLayout,
    icon: DollarOutlined,
    component: LoadableComponent(() => import('../../../scenes/feeStatementV1/payment-setting'))
  },
  // paymentMoMo: {
  //   path: '/payment',
  //   name: 'FEE_PAYMENT_SETTING',
  //   permission: appPermissions.paymentSetting,
  //   layout: layouts.portalLayout,
  //   icon: DollarOutlined,
  //   component: LoadableComponent(() => import('../../../scenes/feeStatementV1/payment-setting/payment-momo'))
  // },
  paymentMethod: {
    path: '/payment-method-management',
    name: 'FEE_PAYMENT_METHOD_MANAGEMENT',
    permission: appPermissions.paymentSetting,
    layout: layouts.portalLayout,
    icon: PicLeftOutlined,
    component: LoadableComponent(() => import('../../../scenes/feeStatementV1/payment-setting/payment-method'))
  },

  // cashAdvance: {
  //   path: '/cash-advance',
  //   name: 'FINANCE_CASH_ADVANCE',
  //   permission: appPermissions.CashAdvance.page,
  //   layout: layouts.portalLayout,
  //   component: LoadableComponent(() => import('../../../scenes/finance/index'))
  // },
  // cashAdvanceDetail: {
  //   path: '/cash-advance-detail/:userId',
  //   name: 'FINANCE_CASH_ADVANCE_DETAIL',
  //   permission: appPermissions.CashAdvance.detail,
  //   layout: layouts.portalLayout,
  //   component: LoadableComponent(() => import('../../../scenes/finance/cash-advance/cashAdvanceDetail'))
  // },
  // cashAdvanceReceipt: {
  //   path: '/cash-advance-receipt/:id',
  //   name: 'FINANCE_CASH_ADVANCE_RECEIPT',
  //   permission: appPermissions.CashAdvance.detail,
  //   layout: layouts.portalLayout,
  //   component:
  // LoadableComponent(() => import('../../../scenes/finance/cash-list-transaction/CashListTransactionPrint'))
  // },
  // Announcement
  announcement: {
    path: '/announcement',
    name: 'ANNOUNCEMENT',
    permission: appPermissions.announcement.page,
    layout: layouts.portalLayout,
    icon: SoundOutlined,
    component: LoadableComponent(() => import('../../../scenes/announcement'))
  },
  announcementCreate: {
    path: '/announcement-create',
    name: 'ANNOUNCEMENT_CREATE',
    permission: appPermissions.announcement.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/announcement/components/AnnouncementDetail'))
  },
  announcementDetail: {
    path: '/announcement-detail/:id',
    name: 'ANNOUNCEMENT_DETAIL',
    permission: appPermissions.announcement.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/announcement/components/AnnouncementDetail'))
  },
  // Inventory
  inventoryBrand: {
    path: '/inventory-brand',
    name: 'INVENTORY_BRAND',
    permission: appPermissions.inventory.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/inventory/brand'))
  },
  inventoryLocation: {
    path: '/inventory-location',
    name: 'INVENTORY_LOCATION',
    permission: appPermissions.inventory.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/inventory/location'))
  },
  inventoryCategory: {
    path: '/inventory-category',
    name: 'INVENTORY_CATEGORY',
    permission: appPermissions.inventory.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/inventory/category'))
  },
  inventoryCategoryDetail: {
    path: '/inventory-category-detail/:id',
    name: 'INVENTORY_CATEGORY_DETAIL',
    permission: appPermissions.inventory.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/inventory/category/CategoryDetail'))
  },

  inventoryManagement: {
    path: '/inventory-management',
    name: 'INVENTORY_MANAGEMENT',
    permission: appPermissions.inventory.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/inventory/inventoryManagement'))
  },
  inventoryItems: {
    path: '/inventory-items',
    name: 'INVENTORY_ITEMS',
    permission: appPermissions.inventory.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/inventory/inventoryItems'))
  },
  inventoryItemsCreate: {
    path: '/inventory-items-create',
    name: 'INVENTORY_ITEMS',
    permission: appPermissions.inventory.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/inventory/inventoryItems/detail'))
  },
  inventoryItemsDetail: {
    path: '/inventory-items-detail/:id',
    name: 'INVENTORY_ITEMS',
    permission: appPermissions.inventory.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/inventory/inventoryItems/detail'))
  },
  inventoryStockInOut: {
    path: '/inventory-stock-in-out',
    name: 'INVENTORY_STOCK_IN_OUT',
    permission: appPermissions.inventory.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/inventory/stockInOut/stockOut'))
  },
  // inventoryWarehouse: {
  //   path: '/inventory-warehouse',
  //   name: 'INVENTORY_WAREHOUSE',
  //   permission: appPermissions.inventory.page,
  //   layout: layouts.portalLayout,
  //   component: LoadableComponent(() => import('../../../scenes/inventory/inventoryItems'))
  // },
  // Notification Template
  notificationTemplate: {
    path: '/notification-template',
    name: 'TEMPLATE_NOTIFICATION',
    permission: appPermissions.notificationTemplate.page,
    layout: layouts.portalLayout,
    icon: LayoutOutlined,
    component: LoadableComponent(() => import('../../../scenes/notificationTemplate'))
  },
  notificationTemplateCreate: {
    path: '/notification-template-create',
    name: 'TEMPLATE_NOTIFICATION_CREATE',
    permission: appPermissions.notificationTemplate.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/notificationTemplate/components/TemplateDetail'))
  },
  notificationTemplateDetail: {
    path: '/notification-template-detail/:id',
    name: 'TEMPLATE_NOTIFICATION_DETAIL',
    permission: appPermissions.notificationTemplate.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/notificationTemplate/components/TemplateDetail'))
  },
  // Workflow
  settingWorkflowConfiguration: {
    path: '/settings/workflow/configuration',
    permission: 'PagesAdministration.Workflow',
    name: 'SETTING_WORKFLOW_CONFIGURATION',
    layout: layouts.portalLayout,
    icon: MoreOutlined,
    component: LoadableComponent(() => import('../../../scenes/workflow/configuration'))
  },
  settingWorkflowStatus: {
    path: '/settings/workflow/status',
    permission: 'PagesAdministration.Workflow',
    name: 'SETTING_WORKFLOW_STATUS',
    layout: layouts.portalLayout,
    icon: FormatPainterOutlined,
    component: LoadableComponent(() => import('../../../scenes/workflow/status'))
  },
  settingWorkflowPriority: {
    path: '/settings/workflow/priority',
    permission: 'PagesAdministration.Workflow',
    name: 'SETTING_WORKFLOW_PRIORITY',
    layout: layouts.portalLayout,
    icon: FieldNumberOutlined,
    component: LoadableComponent(() => import('../../../scenes/workflow/priority'))
  },
  settingWorkflowRole: {
    path: '/settings/workflow/role',
    permission: 'PagesAdministration.Workflow',
    name: 'SETTING_WORKFLOW_ROLE',
    layout: layouts.portalLayout,
    icon: TagOutlined,
    component: LoadableComponent(() => import('../../../scenes/workflow/role'))
  },
  settingWorkflowTracker: {
    path: '/settings/workflow/tracker',
    permission: 'PagesAdministration.Workflow',
    name: 'SETTING_WORKFLOW_TRACKER',
    layout: layouts.portalLayout,
    icon: ProfileOutlined,
    component: LoadableComponent(() => import('../../../scenes/workflow/tracker'))
  },
  settingWorkflowCustomField: {
    path: '/settings/workflow/custom-field',
    permission: 'PagesAdministration.Workflow',
    name: 'SETTING_WORKFLOW_CUSTOM_FIELD',
    layout: layouts.portalLayout,
    icon: FieldStringOutlined,
    component: LoadableComponent(() => import('../../../scenes/workflow/customField'))
  },
  settingWorkflowSLA: {
    path: '/settings/workflow/sla',
    permission: 'PagesAdministration.Workflow',
    name: 'SETTING_WORKFLOW_SLA',
    layout: layouts.portalLayout,
    icon: FieldStringOutlined,
    component: LoadableComponent(() => import('../../../scenes/workflow/sla'))
  },
  // PlanMaintenance
  planMaintenanceStatistic: {
    path: '/plan-maintenance-statistic',
    name: 'PLAN_MAINTENANCE_STATISTIC',
    permission: appPermissions.planMaintenance.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/planMaintenance/calendar'))
  },
  planMaintenance: {
    path: '/plan-maintenance',
    name: 'PLAN_MAINTENANCE',
    permission: appPermissions.planMaintenanceRecurring.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/planMaintenance/plan-maintenance'))
  },
  planMaintenanceEdit: {
    path: '/plan-maintenance-detail/:id',
    name: 'PLAN_MAINTENANCE_DETAIL',
    permission: appPermissions.planMaintenance.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/planMaintenance/plan-maintenance/components/PlanMaintenanceDetail')
    )
  },
  planMaintenanceCreate: {
    path: '/plan-maintenance-create',
    name: 'PLAN_MAINTENANCE_CREATE',
    permission: appPermissions.planMaintenance.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/planMaintenance/plan-maintenance/components/PlanMaintenanceDetail')
    )
  },
  // myPlanMaintenance
  myPlanMaintenance: {
    path: '/my-plan-maintenance',
    name: 'MY_PLAN_MAINTENANCE',
    permission: appPermissions.planMaintenance.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/planMaintenance/my-plan-maintenance'))
  },
  planMaintenancePipelineView: {
    path: '/plan-maintenance-pipeline',
    name: 'PLAN_MAINTENANCE_PIPELINE_VIEW',
    permission: appPermissions.planMaintenance.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/planMaintenance/pipeline-view'))
  },
  // PlanMaintenanceWeekly
  planMaintenanceWeekly: {
    path: '/plan-maintenance-weekly',
    name: 'PLAN_MAINTENANCE_WEEKLY',
    permission: appPermissions.planMaintenance.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/planMaintenance/plant-maintenance-weekly'))
  },
  planMaintenanceWeeklyEdit: {
    path: '/plan-maintenance-weekly-detail/:id',
    name: 'PLAN_MAINTENANCE_WEEKLY_DETAIL',
    permission: appPermissions.planMaintenance.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/planMaintenance/plant-maintenance-weekly/components/index')
    )
  },
  planMaintenanceWeeklyCreate: {
    path: '/plan-maintenance-weekly-create',
    name: 'PLAN_MAINTENANCE_WEEKLY_CREATE',
    permission: appPermissions.planMaintenance.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/planMaintenance/plant-maintenance-weekly/components/index')
    )
  },
  buildingCardManagement: {
    path: '/building-card-management',
    name: 'BUILDING_CARD_MANAGEMENT',
    permission: appPermissions.cardBuilding.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/cardManagement/buildingCardManagement'))
  },
  buildingCardManagementCreate: {
    path: '/building-card-management-create',
    name: 'BUILDING_CARD_CREATE',
    permission: appPermissions.cardBuilding.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/cardManagement/buildingCardManagement/components/BuildingCardDetailPage')
    )
  },

  buildingCardManagementDetail: {
    path: '/building-card-management-detail/:id',
    name: 'BUILDING_CARD_CREATE',
    permission: appPermissions.cardBuilding.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/cardManagement/buildingCardManagement/components/BuildingCardDetailPage')
    )
  },

  RequestBuildingCard: {
    path: '/request-building-card',
    name: 'REQUEST_BUILDING_CARD',
    permission: appPermissions.updateCardRequest.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/cardManagement/RequestCardBuild'))
  },
  RequestBuildingCardCreate: {
    path: '/request-building-card-create',
    name: 'REQUEST_BUILDING_CARD_CREATE',
    permission: appPermissions.updateCardRequest.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/cardManagement/RequestCardBuild/components/RequestCardBuidingDetail')
    )
  },
  RequestBuildingCardDetail: {
    path: '/request-building-card/:id',
    name: 'REQUEST_BUILDING_CARD_DETAIL',
    permission: appPermissions.updateCardRequest.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/cardManagement/RequestCardBuild/components/RequestCardBuidingDetail')
    )
  },

  // plan sanitation
  planSanitation: {
    path: '/plan-sanitation',
    icon: ClearOutlined,
    name: 'PLAN_SANITATION',
    permission: appPermissions.servicePlan.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/planSanitation'))
  },
  planSanitationEdit: {
    path: '/plan-sanitation-detail/:id',
    name: 'PLAN_SANITATION',
    permission: appPermissions.planMaintenance.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/planSanitation/planSanitationDetail'))
  },
  planSanitationCreate: {
    path: '/plan-sanitation-create',
    name: 'PLAN_SANITATION',
    permission: appPermissions.planMaintenance.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/planSanitation/planSanitationDetail'))
  },

  // plan Gardening
  planGardening: {
    path: '/plan-gardening',
    icon: ClearOutlined,
    name: 'PLAN_GARDENING',
    permission: appPermissions.planMaintenance.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/planGardening'))
  },
  planGardeningEdit: {
    path: '/plan-gardening-detail/:id',
    name: 'PLAN_GARDENING',
    permission: appPermissions.planMaintenance.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/planGardening/planGardeningDetail'))
  },
  planGardeningCreate: {
    path: '/plan-gardening-create',
    name: 'PLAN_GARDENING',
    permission: appPermissions.planMaintenance.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/planGardening/planGardeningDetail'))
  },

  // Asset
  assets: {
    path: '/asset-management',
    name: 'ASSET',
    permission: appPermissions.asset.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/facility/assets'))
  },
  assetCreate: {
    path: '/asset-create',
    name: 'ASSET_CREATE',
    permission: appPermissions.asset.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/facility/assetDetail'))
  },
  assetDetail: {
    path: '/asset-detail/:code',
    name: 'ASSET_DETAIL',
    permission: appPermissions.asset.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/facility/assetDetail'))
  },
  // AssetType
  assetTypes: {
    path: '/asset-types',
    name: 'ASSET_TYPES',
    permission: appPermissions.asset.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/facility/assetType'))
  },
  // Admin
  adminUser: {
    path: '/users',
    permission: appPermissions.adminUser.page,
    title: 'Users',
    name: 'ADMINISTRATION_USER',
    layout: layouts.portalLayout,
    icon: UserOutlined,
    component: LoadableComponent(() => import('../../../scenes/administrator/Users'))
  },
  adminRole: {
    path: '/roles',
    permission: appPermissions.adminRole.page,
    title: 'Roles',
    name: 'ADMINISTRATION_ROLE',
    layout: layouts.portalLayout,
    icon: SolutionOutlined,
    component: LoadableComponent(() => import('../../../scenes/administrator/Roles'))
  },
  adminTenants: {
    path: '/tenants',
    permission: appPermissions.adminTenant.page,
    title: 'Tenants',
    name: 'ADMINISTRATION_TENANT',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/administrator/Tenants'))
  },
  adminLanguages: {
    path: '/language',
    permission: appPermissions.adminLanguage.page,
    title: 'Languages',
    name: 'ADMINISTRATION_LANGUAGE',
    layout: layouts.portalLayout,
    icon: TranslationOutlined,
    component: LoadableComponent(() => import('../../../scenes/administrator/Languages'))
  },
  adminLanguageTexts: {
    path: '/language-text/:id',
    permission: appPermissions.adminLanguage.changeText,
    title: 'ADMINISTRATION_LANGUAGE_TEXT',
    name: 'ADMINISTRATION_LANGUAGE_TEXT',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/administrator/Languages/components/languageTexts'))
  },
  // adminBanner: {
  //   path: '/banner',
  //   permission: appPermissions.adminRole.page,
  //   title: 'Banners',
  //   name: 'ADMINISTRATION_BANNER',
  //   layout: layouts.portalLayout,
  //   icon: FileImageOutlined,
  //   component: LoadableComponent(
  // () => import('../../../scenes/administrator/Banners')
  //   )
  // },

  // Sale and Lease
  saleManagement: {
    path: '/sales',
    permission: appPermissions.enquiry.page,
    title: 'Sale',
    name: 'SALE',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/saleAndLease/sale'))
  },
  saleCreate: {
    path: '/create-sales',
    permission: appPermissions.enquiry.detail,
    title: 'Create Sale',
    name: 'CREATE_SALE',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/saleAndLease/sale/SaleDetail'))
  },
  saleDetail: {
    path: '/sales-detail/:id',
    permission: appPermissions.enquiry.detail,
    title: 'Sale Detail',
    name: 'SALE_DETAIL',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/saleAndLease/sale/SaleDetail'))
  },
  leaseManagement: {
    path: '/lease',
    permission: appPermissions.enquiry.page,
    title: 'Lease',
    name: 'LEASE',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/saleAndLease/lease'))
  },
  leaseCreate: {
    path: '/create-lease',
    permission: appPermissions.enquiry.detail,
    title: 'Create Lease',
    name: 'CREATE_LEASE',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/saleAndLease/lease/LeaseDetail'))
  },
  leaseDetail: {
    path: '/lease-detail/:id',
    permission: appPermissions.enquiry.detail,
    title: 'Lease Detail',
    name: 'LEASE_DETAIL',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/saleAndLease/lease/LeaseDetail'))
  },
  // Handover
  handoverPlan: {
    path: '/handover-plan',
    permission: appPermissions.handoverPlan.page,
    title: 'Handover Plan',
    name: 'HANDOVER_PLAN',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/handover/planHandover'))
  },
  handoverPlanCreate: {
    path: '/handover-plan-create',
    permission: appPermissions.handoverPlan.detail,
    title: 'Handover Plan Create',
    name: 'HANDOVER_PLAN_CREATE',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/handover/planHandover/Details'))
  },
  handoverPlanDetail: {
    path: '/handover-plan-detail/:id',
    permission: appPermissions.handoverPlan.detail,
    title: 'Handover Plan Detail',
    name: 'HANDOVER_PLAN_DETAIL',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/handover/planHandover/Details'))
  },
  handoverReservation: {
    path: '/handover-reservation',
    permission: appPermissions.handoverReservation.page,
    title: 'Handover Reservation',
    name: 'HANDOVER_RESERVATION',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/handover/handoverProcess'))
  },
  handoverReservationCreate: {
    path: '/handover-reservation-create',
    permission: appPermissions.handoverReservation.detail,
    title: 'Handover Reservation Create',
    name: 'HANDOVER_RESERVATION_CREATE',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/handover/handoverProcess/Details'))
  },
  handoverReservationDetail: {
    path: '/handover-reservation-detail/:id',
    permission: appPermissions.handoverReservation.detail,
    title: 'Handover Reservation Detail',
    name: 'HANDOVER_RESERVATION_DETAIL',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/handover/handoverProcess/Details'))
  },

  handoverChecklistTemplate: {
    path: '/handover-checklist-template',
    // permission: appPermissions.handoverReservation.detail,
    title: 'Handover CheckList Template',
    name: 'HANDOVER_CHECKLIST_TEMPLATE',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/handover/handoverCheckList'))
  },

  handoverCheckListEdit: {
    path: '/handover-checklist-template/:id',
    name: 'HAND_OVER_CHECKLIST_DETAIL',
    permission: appPermissions.eForm.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/handover/handoverCheckList/components/EFormCreateOrEdit')
    )
  },

  handoverCheckListCreate: {
    path: '/handover-checklist-create',
    // permission: appPermissions.handoverReservation.detail,
    title: 'Handover CheckList Template',
    name: 'HANDOVER_CHECKLIST_TEMPLATE_CREATE',
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/handover/handoverCheckList/components/EFormCreateOrEdit')
    )
  },

  // E-form
  eForms: {
    path: '/e-form',
    permission: appPermissions.eForm.page,
    title: 'EFORM_LIST',
    name: 'EFORM_LIST',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/eform'))
  },
  eFormCreate: {
    path: '/e-form-create',
    name: 'EFORM_CREATE',
    permission: appPermissions.eForm.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/eform/components/EFormCreateOrEdit'))
  },
  eFormEdit: {
    path: '/e-form/:id',
    name: 'EFORM_DETAIL',
    permission: appPermissions.eForm.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes//eform/components/EFormDetail'))
  },
  eFormResponses: {
    path: '/e-form-response',
    permission: appPermissions.eFormAnswer.page,
    title: 'EFORM_RESPONSE_LIST',
    name: 'EFORM_RESPONSE_LIST',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/eform/eFormResponse'))
  },
  eFormResponseDetail: {
    path: '/e-form-response/:id',
    permission: appPermissions.eFormAnswer.detail,
    title: 'EFORM_RESPONSE_LIST',
    name: 'EFORM_RESPONSE_LIST',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/eform/eFormResponse/EFormResponseDetail'))
  },

  // Config Term
  termCondition: {
    path: '/term-condition-form',
    name: 'TERM_CONDITION_SETTING',
    permission: appPermissions.adminMasterData.page,
    title: 'TEM_CONDITION_SETTING',
    layout: layouts.portalLayout,
    icon: RadarChartOutlined,
    component: LoadableComponent(() => import('../../../scenes/administrator/TermConditionForm'))
  },
  //Delivery
  delivery: {
    path: '/delivery',
    name: 'DELIVERY',
    permission: appPermissions.delivery.page,
    layout: layouts.portalLayout,
    icon: DropboxOutlined,
    component: LoadableComponent(() => import('../../../scenes/delivery'))
  },
  deliveryCreate: {
    path: '/delivery-create',
    name: 'DELIVERY_CREATE',
    permission: appPermissions.delivery.create,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/delivery/components/deliveryDetail'))
  },
  deliveryDetail: {
    path: '/delivery-detail/:id',
    name: 'DELIVERY_DETAIL',
    permission: appPermissions.delivery.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/delivery/components/deliveryDetail'))
  },
  //Contractor
  contractorList: {
    path: '/contractor-list',
    name: 'CONTRACTOR_LIST',
    permission: appPermissions.contractor.page,
    title: 'CONTRACTOR_LIST',
    layout: layouts.portalLayout,

    component: LoadableComponent(() => import('../../../scenes/contractors/contractorList'))
  },

  contractorListCreate: {
    path: '/contractor-create',
    name: 'CONTRACTOR_CREATE',
    permission: appPermissions.contractor.detail,
    title: 'CONTRACTOR_CREATE',
    layout: layouts.portalLayout,

    component: LoadableComponent(() => import('../../../scenes/contractors/contractorList/components/ContractorDetail'))
  },

  contractorListDetail: {
    path: '/contractor-list/:id',
    name: 'CONTRACTOR_DETAIL',
    permission: appPermissions.contractor.detail,
    title: 'CONTRACTOR_DETAIL',
    layout: layouts.portalLayout,

    component: LoadableComponent(() => import('../../../scenes/contractors/contractorList/components/ContractorDetail'))
  },
  //Contractor WO
  ContractorWorkOrders: {
    path: '/contractor-work-order',
    name: 'CONTRACTOR_WORK_ORDER',
    permission: appPermissions.contractorWO.page,
    title: 'CONTRACTOR_WORK_ORDER',
    layout: layouts.portalLayout,

    component: LoadableComponent(() => import('../../../scenes/contractors/contractorWorkOrder'))
  },
  ContractorWorkOrderCreate: {
    path: '/contractor-work-order-create',
    name: 'CONTRACTOR_WORK_ORDER_CREATE',
    permission: appPermissions.contractorWO.detail,
    title: 'CONTRACTOR_WORK_ORDER_CREATE',
    layout: layouts.portalLayout,

    component: LoadableComponent(
      () => import('../../../scenes/contractors/contractorWorkOrder/components/ContractorWorkOrderDetail')
    )
  },
  ContractorWorkOrderDetail: {
    path: '/contractor-work-order-detail/:id',
    name: 'CONTRACTOR_WORK_ORDER_DETAIL',
    permission: appPermissions.contractorWO.detail,
    title: 'CONTRACTOR_WORK_ORDER_DETAIL',
    layout: layouts.portalLayout,

    component: LoadableComponent(
      () => import('../../../scenes/contractors/contractorWorkOrder/components/ContractorWorkOrderDetail')
    )
  },
  parkingLotManagement: {
    path: '/parking-lot-management',
    name: 'PARKING_LOT_MANAGEMENT',
    permission: appPermissions.parking.page,
    title: 'PARKING_LOT_MANAGEMENT',
    layout: layouts.portalLayout,
    icon: CarOutlined,
    component: LoadableComponent(() => import('../../../scenes/parking/parkingLot'))
  },

  cardParkingManagement: {
    path: '/card-parking-management',
    name: 'CARD_PARKING_MANAGEMENT',
    permission: appPermissions.parking.page,
    title: 'CARD_PARKING_MANAGEMENT',
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/parking/cardParkingManagement'))
  },

  cardParkingManagementDetail: {
    path: '/card-parking-management/:id',
    name: 'CARD_PARKING_MANAGEMENT_DETAIL',
    permission: appPermissions.parking.page,
    title: 'CARD_PARKING_MANAGEMENT_DETAIL',
    layout: layouts.portalLayout,
    icon: CarOutlined,
    component: LoadableComponent(() => import('../../../scenes/parking/cardParkingManagement/cardParkingDetail'))
  },
  cardParkingManagementCreate: {
    path: '/card-parking-management-create',
    name: 'CARD_PARKING_MANAGEMENT_CREATE',
    permission: appPermissions.parking.page,
    title: 'CARD_PARKING_MANAGEMENT_CREATE',
    layout: layouts.portalLayout,
    icon: CarOutlined,
    component: LoadableComponent(() => import('../../../scenes/parking/cardParkingManagement/cardParkingDetail'))
  },
  confirmQualityVehicle: {
    path: '/confirm-quality-vehicle',
    name: 'CONFIRM_QUALITY_VEHIVLE',
    permission: appPermissions.vehicleRegistration.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/parking/confirmQualityVehicle'))
  },
  confirmQualityVehicleDetail: {
    path: '/confirm-quality-vehicle/:id',
    name: 'CONFIRM_QUALITY_VEHIVLE',
    permission: appPermissions.vehicleRegistration.detail,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/parking/confirmQualityVehicle/confirmVehicleFormDetail'))
  },

  bannerWelcome: {
    path: '/banner-welcome',
    name: 'BANNER_WELCOME',
    permission: appPermissions.banner.page,
    layout: layouts.portalLayout,
    icon: NotificationOutlined,
    component: LoadableComponent(() => import('../../../scenes/communication/banner'))
  },
  generateFees: {
    path: '/generate-fees',
    name: 'GENERATE_FEES',
    permission: appPermissions.feeGenerate.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/feeStatementV1/generateFee'))
  },
  feeNotice: {
    path: '/fee-notice',
    name: 'FEE_NOTICE',
    permission: appPermissions.feeNotice.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/feeStatementV1/fee-notice'))
  },
  feeNoticeProcess: {
    path: '/fee-notice-history/:id',
    name: 'PARKING_DETAIL',
    permission: appPermissions.feeNotice.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/feeStatementV1/fee-notice/components/FeeNoticeProcess'))
  },
  meterReadingWater: {
    path: '/meter-reading-water',
    name: 'METER_READING_WATER',
    permission: appPermissions.MeterWater.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/meterReading/water'))
  },
  meterReadingElectric: {
    path: '/meter-reading-electric',
    name: 'METER_READING_ELECTRIC',
    permission: appPermissions.MeterElectricity.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/meterReading/electric'))
  },
  meterElectricOffice: {
    path: '/meter-electric-office',
    name: 'METER_READING_ELECTRIC',
    permission: appPermissions.MeterElectricity.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/meterReadOffice/electric'))
  },
  meterElectricOfficeDetail: {
    path: '/meter-electric-office/:id',
    name: 'PARKING_DETAIL',
    permission: appPermissions.MeterElectricity.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/meterReadOffice/electric/electricDetail'))
  },
  meterElectricOfficeCreate: {
    path: '/meter-electric-office-create',
    name: 'PARKING_DETAIL',
    permission: appPermissions.MeterElectricity.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/meterReadOffice/electric/electricDetail'))
  },
  confirmMeterElectricOffice: {
    path: '/confirm-meter-electric-office',
    name: 'CONFIRM_METER_READING_ELECTRIC',
    permission: appPermissions.MeterElectricity.Confirm,
    layout: layouts.portalLayout,
    component: LoadableComponent(() => import('../../../scenes/meterReadOffice/confirmElectricForm'))
  },
  confirmMeterElectricOfficeDetail: {
    path: '/confirm-meter-electric-office/:id',
    name: 'PARKING_DETAIL',
    permission: appPermissions.MeterElectricity.page,
    layout: layouts.portalLayout,
    component: LoadableComponent(
      () => import('../../../scenes/meterReadOffice/confirmElectricForm/confirmElectricFormDetail')
    )
  },
  chatbotHistory: {
    path: '/chatbot-history',
    name: 'CHATBOT_HISTORY',
    permission: appPermissions.appSetting.page,
    layout: layouts.portalLayout,
    icon: CommentOutlined,
    component: LoadableComponent(() => import('../../../scenes/chatbotHistory'))
  },
  salesOrganization: {
    path: '/sales-organization',
    name: 'SALES_ORGANIZATION',

    layout: layouts.portalLayout,

    component: LoadableComponent(() => import('../../../scenes/salesOrganization'))
  },
  customerGroup: {
    path: '/customer-group',
    name: 'CUSTOMER_GROUP',

    layout: layouts.portalLayout,

    component: LoadableComponent(() => import('../../../scenes/customerGroup'))
  }
}

export const routers: any = {
  ...userLayout,
  ...portalLayouts
}

export const appMenuGroups: any = [
  {
    name: 'DASHBOARD_GROUP',
    // routers.dashboard, routers.report,
    icon: PieChartOutlined,
    children: [routers.dashboardOverView]
  },
  {
    name: 'PMS_INVESTMENT_GROUP',
    children: [
      {
        name: 'COMPANY_MANAGEMENT',
        icon: FileProtectOutlined,
        children: [routers.companies, routers.officeContract]
      },

      {
        name: 'FEE_STATEMENT_GROUP_V1',
        icon: DollarOutlined,
        children: [
          routers.generateFees,
          routers.feeNotice,
          routers.feeStatementManagementV1,
          routers.feeReceiptV1
          // routers.ReceiptAndVoucher
          // routers.cashAdvance
        ]
      },

      {
        name: 'PAYMENT_REQEST_PQL',
        icon: DollarOutlined,
        children: [
          routers.managementFee,
          routers.electricAndWaterFee,
          routers.totalElectricMeter,
          routers.totalWaterMeter
        ]
      }
    ]
  },
  {
    name: 'PMS_MANAGEMENT_BOARD_GROUP',
    children: [
      {
        name: 'USER_MANAGEMENT_GROUP',
        icon: UserOutlined,
        children: [routers.staffManagement, routers.residentManagement, routers.developManagement]
      },
      {
        name: 'WORKORDER_GROUP',
        icon: FileProtectOutlined,
        children: [
          routers.ticketRequestTransportIn,
          routers.ticketRequestTransportOut,
          routers.ticketRequestRenovation,
          routers.ticketRequestEvent,
          routers.ticketRequestConstruction,
          routers.ticketRequestOvertime,
          routers.ticketParkingOvertime
        ]
      },
      {
        name: 'COMPANY_MANAGEMENT_BQL',
        icon: BarcodeOutlined,
        children: [routers.companyContracts, routers.contractCategories]
      },
      {
        name: 'ASSET_MANAGEMENT_GROUP',
        icon: FileProtectOutlined,
        children: [routers.assets, routers.assetTypes]
      },
      {
        name: 'PLAN_MAINTENANCE_GROUP',
        icon: ScheduleOutlined,
        children: [
          routers.planMaintenanceStatistic,
          routers.planMaintenance,
          routers.myPlanMaintenance,
          routers.planMaintenancePipelineView
          // routers.planMaintenanceWeekly
        ]
      },
      {
        name: 'CARD_MANAGEMENT_GROUP',
        icon: CreditCardOutlined,
        children: [
          routers.buildingCardManagement,
          routers.RequestBuildingCard,
          routers.cardParkingManagement,
          routers.confirmQualityVehicle
        ]
      },
      routers.planSanitation,
      routers.planGardening,
      // {
      //   name: 'METER_READING',
      //   icon: CarOutlined,
      //   children: [routers.meterReadingWater, routers.meterReadingElectric]
      // },
      {
        name: 'METER_READING_OFFICE_ELECTRIC',
        icon: ThunderboltOutlined,
        children: [routers.meterElectricOffice, routers.confirmMeterElectricOffice]
      },

      {
        name: 'INVENTORY_GROUP',
        icon: ControlOutlined,
        children: [routers.inventoryItems, routers.inventoryManagement]
      },
      {
        name: 'E_FORM_GROUP',
        icon: FileTextOutlined,
        children: [routers.eForms, routers.eFormResponses]
      },
      routers.announcement
    ]
  },
  {
    name: 'PMS_CHATBOT',
    children: [routers.chatbotHistory]
  },
  {
    name: 'PMS_SETTING_GROUP',
    icon: SettingOutlined,
    children: [
      {
        name: 'PROJECT_MANAGEMENT_GROUP',
        icon: ClusterOutlined,
        children: [
          routers.projectManagement,
          routers.projectBuilding,
          routers.projectFloor,
          routers.projectUnit,
          routers.projectZone
        ]
      },
      {
        name: 'APPROVAL_WORKFLOW',
        icon: ClusterOutlined,
        children: [routers.flowOperator2Tenant, routers.flowOperator2Develop, routers.positonApproval]
      },

      routers.parkingLotManagement,
      routers.paymentSetting,
      routers.feeSetting,
      routers.exchangeRate,
      routers.notificationTemplate,
      routers.adminUser,
      routers.adminRole,
      routers.adminLanguages,
      routers.adminMasterData,
      routers.appSetting,
      routers.termCondition
    ]
  }
]
