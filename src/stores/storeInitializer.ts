import RoleStore from './administrator/roleStore'
import TenantStore from './administrator/tenantStore'
import UserStore from './administrator/userStore'
import SessionStore from './sessionStore'
import AuthenticationStore from './authenticationStore'
import AccountStore from './accountStore'
import LanguageStore from './administrator/languageStore'
import MasterDataStore from './administrator/masterDataStore'
import ProjectStore from './project/projectStore'
import BuildingStore from './project/buildingStore'
import FloorStore from './project/floorStore'
import UnitStore from './project/unitStore'
import StaffStore from './member/staff/staffStore'
import ResidentStore from './member/resident/residentStore'
import ShopOwnerStore from './member/shopOwner/shopOwnerStore'
import ShopProductStore from './member/shopProduct/shopProductList'
import ShopOrderStore from './member/shopOrderStore/shopOrderList'
import NewsStore from './communication/newsStore'
import EventStore from './communication/eventStore'
import LibraryStore from './communication/libraryStore'
import FeedbackStore from './communication/feedbackStore'
import NewsCategoryStore from './communication/newsCategoryStore'
import EventCategoryStore from './communication/eventCategoryStore'
import WfStatusStore from './workflow/wfStatusStore'
import WfRoleStore from './workflow/wfRoleStore'
import WfPriorityStore from './workflow/wfPriorityStore'
import WfCustomFieldStore from './workflow/wfCustomFieldStore'
import FeeStore from './fee/feeStore'
import ReceiptStore from './fee/receiptStore'
import PackageFeeStore from './fee/packageFeeStore'
import WfConfigurationStore from './workflow/wfConfigurationStore'
import FileStore from './common/fileStore'
import WorkOrderStore from './communication/workOrderStore'
import WorkflowStore from './workflow/workflowStore'
import WfTrackerStore from './workflow/wfTrackerStore'
import AuditLogStore from './common/auditLogStore'
import CommentStore from './common/commentStore'
import FeeTypeStore from './fee/feeTypeStore'
import FeeGroupStore from './fee/feeGroupStore'
import AssetStore from './facility/assetStore'
import AssetTypeStore from './facility/assetTypeStore'
import NotificationTemplateStore from './notificationTemplate/notificationTemplateStore'
import AmenityStore from './booking/amenityStore'
import AmenityGroupStore from './booking/amenityGroupStore'
import ReservationStore from './booking/reservationStore'
import AnnouncementStore from './announcement/announcementStore'
import VisitorStore from './communication/visitorStore'
import InventoryBrandStore from './inventory/inventoryBrandStore'
import InventoryLocationStore from './inventory/inventoryLocationStore'
import InventoryCategoryStore from './inventory/inventoryCategoryStore'
import InventoryStockInOutStore from './inventory/inventoryStockInOutStore'
import InventoryItemsStore from './inventory/inventoryItemsStore'
import InventoryWarehouseStore from './inventory/inventoryWarehouseStore'
import BuildingDirectoryStore from '@stores/communication/buildingDirectoryStore'
import CompanyStore from '@stores/project/companyStore'
import SalesOrganizationStore from '@stores/project/salesOrganizationStore'
import CustomerGroupStore from '@stores/project/customerGroupStore'
import ContractStore from '@stores/project/contractStore'
import ContractCategoryStore from '@stores/project/contractCategoryStore'
import TeamStore from '@stores/team/teamStore'
import PlanMaintenanceStore from '@stores/planMaintenance/planMaintenanceStore'
import PlanMaintenanceTaskStore from '@stores/planMaintenance/planMaintenanceTaskStore'
import PlanMaintenanceCalendarStore from '@stores/planMaintenance/planMaintenanceCalendarStore'
import PlanMaintenancePipelineStore from '@stores/planMaintenance/planMaintenancePipelineStore'
import ReminderStore from '@stores/common/reminderStore'
import VoucherStore from '@stores/fee/voucherStore'
import SaleAndLeaseStore from './saleAndLease/saleAndLeaseStore'
import HandoverStore from './handover/handoverStore'
import DashboardStore from './dashboardStore'
import EFormStore from '@stores/eForm/eFormStore'
import TermConditionStore from './administrator/termConditionStore'
import DeliveryStore from './delivery/deliveryStore'
import CashAdvanceStore from './finance/cashAdvanceStore'
import ContractorStore from './contractor/contractorStore'
import ParkingStore from './parking/parkingStore'
import BannerStore from './communication/bannerStore'
import FeeGenerateStore from '@stores/fee/feeGenerateStore'
import FeeNoticeStore from './fee/feeNoticeStore'
import MeterReadingStore from './meterReading/meterReadingStore'
import PositionApprovalStore from './approvalWorkflow/positionApproval/positionApprovalStore'
import DevelopStore from './member/develop/developStore'
import TicketRequestStore from './ticketRequestStore/ticketRequestStore'
import RenovationStore from './ticketRequestStore/renovationStore'
import TicketEventStore from './ticketRequestStore/ticketEventStore'
import ConstructionTicketStore from './ticketRequestStore/constructionTicketStore'
import OvertimeTicketStore from './ticketRequestStore/overtimeTicketStore'
import ZoneStore from './project/zoneStore'
import ContractOfficeStore from './project/contractOfficeStore'
import FlowApprovalOfficeStore from './approvalWorkflow/flowApprovalOffice/flowApprovalOfficeStore'
import ElectricFormStore from './meterReading/electricFormStore'
import ServicePlanStore from './planSanitation/planSanitationStore'
import ExchangeRateStore from './exchangeRate/exchangeRateStore'
import CardbuidingStore from './cardBuilding/cardbuidingStore'
import TotalElectricMeterStore from './paymentRequest/totalElectricMeterStore'
import TotalWaterMeterStore from './paymentRequest/totalWaterMeterStore'
import ManagementFeeStore from './paymentRequest/managementFeeStore'
import ElectricAndWaterFeeStore from './paymentRequest/electricAndWaterFeeStore'
import RequestCardbuidingStore from './cardBuilding/requestCardBuildingStore'
import VehicleRegistrationFormStore from './parking/VehicleRegistrationFormStore'
import ParkingOvertimeTicketStore from './ticketRequestStore/parkingOvertimeTicketStore'
import ChatbotStore from './chatbotHistory/chatbotStore'

export default function initializeStores() {
  return {
    authenticationStore: new AuthenticationStore(),
    roleStore: new RoleStore(),
    tenantStore: new TenantStore(),
    userStore: new UserStore(),
    sessionStore: new SessionStore(),
    accountStore: new AccountStore(),
    languageStore: new LanguageStore(),
    projectStore: new ProjectStore(),
    masterDataStore: new MasterDataStore(),
    buildingStore: new BuildingStore(),
    floorStore: new FloorStore(),
    unitStore: new UnitStore(),
    companyStore: new CompanyStore(),
    salesOrganizationStore: new SalesOrganizationStore(),
    customerGroupStore: new CustomerGroupStore(),
    contractStore: new ContractStore(),
    contractCategoryStore: new ContractCategoryStore(),
    staffStore: new StaffStore(),
    residentStore: new ResidentStore(),
    shopOwnerStore: new ShopOwnerStore(),
    shopProductStore: new ShopProductStore(),
    shopOrderStore: new ShopOrderStore(),
    newsStore: new NewsStore(),
    newsCategoryStore: new NewsCategoryStore(),
    eventStore: new EventStore(),
    eventCategoryStore: new EventCategoryStore(),
    libraryStore: new LibraryStore(),
    feedbackStore: new FeedbackStore(),
    feeStore: new FeeStore(),
    packageFeeStore: new PackageFeeStore(),
    feeTypeStore: new FeeTypeStore(),
    feeGroupStore: new FeeGroupStore(),
    receiptStore: new ReceiptStore(),
    voucherStore: new VoucherStore(),
    wfStatusStore: new WfStatusStore(),
    wfRoleStore: new WfRoleStore(),
    wfPriorityStore: new WfPriorityStore(),
    wfTrackerStore: new WfTrackerStore(),
    wfCustomFieldStore: new WfCustomFieldStore(),
    fileStore: new FileStore(),
    wfConfigurationStore: new WfConfigurationStore(),
    workflowStore: new WorkflowStore(),
    workOrderStore: new WorkOrderStore(),
    assetStore: new AssetStore(),
    assetTypeStore: new AssetTypeStore(),
    auditLogStore: new AuditLogStore(),
    commentStore: new CommentStore(),
    notificationTemplateStore: new NotificationTemplateStore(),
    amenityStore: new AmenityStore(),
    amenityGroupStore: new AmenityGroupStore(),
    reservationStore: new ReservationStore(),
    announcementStore: new AnnouncementStore(),
    visitorStore: new VisitorStore(),
    inventoryBrandStore: new InventoryBrandStore(),
    inventoryLocationStore: new InventoryLocationStore(),
    inventoryCategoryStore: new InventoryCategoryStore(),
    inventoryStockInOutStore: new InventoryStockInOutStore(),
    inventoryItemsStore: new InventoryItemsStore(),
    inventoryWarehouseStore: new InventoryWarehouseStore(),
    buildingDirectoryStore: new BuildingDirectoryStore(),
    teamStore: new TeamStore(),
    planMaintenanceStore: new PlanMaintenanceStore(),
    planMaintenanceTaskStore: new PlanMaintenanceTaskStore(),
    planMaintenanceCalendarStore: new PlanMaintenanceCalendarStore(),
    planMaintenancePipelineStore: new PlanMaintenancePipelineStore(),
    reminderStore: new ReminderStore(),
    saleAndLeaseStore: new SaleAndLeaseStore(),
    handoverStore: new HandoverStore(),
    dashboardStore: new DashboardStore(),
    eFormStore: new EFormStore(),
    termConditionStore: new TermConditionStore(),
    deliveryStore: new DeliveryStore(),
    cashAdvanceStore: new CashAdvanceStore(),
    contractorStore: new ContractorStore(),
    parkingStore: new ParkingStore(),
    bannerStore: new BannerStore(),
    feeGenerateStore: new FeeGenerateStore(),
    feeNoticeStore: new FeeNoticeStore(),
    meterReadingStore: new MeterReadingStore(),
    positionApprovalStore: new PositionApprovalStore(),
    developStore: new DevelopStore(),
    flowApprovalOfficeStore: new FlowApprovalOfficeStore(),
    ticketRequestStore: new TicketRequestStore(),
    renovationStore: new RenovationStore(),
    ticketEventStore: new TicketEventStore(),
    constructionTicketStore: new ConstructionTicketStore(),
    overtimeTicketStore: new OvertimeTicketStore(),
    parkingOvertimeTicketStore: new ParkingOvertimeTicketStore(),
    zoneStore: new ZoneStore(),
    contractOfficeStore: new ContractOfficeStore(),
    electricFormStore: new ElectricFormStore(),
    servicePlanStore: new ServicePlanStore(),
    exchangeRateStore: new ExchangeRateStore(),
    cardbuidingStore: new CardbuidingStore(),

    // Payment request
    totalElectricMeterStore: new TotalElectricMeterStore(),
    totalWaterMeterStore: new TotalWaterMeterStore(),
    managementFeeStore: new ManagementFeeStore(),
    electricAndWaterFeeStore: new ElectricAndWaterFeeStore(),

    //Request Cardbuiding
    requestCardbuidingStore: new RequestCardbuidingStore(),

    // confirm quality vehicle
    vehicleRegistrationFormStore: new VehicleRegistrationFormStore(),

    // confirm quality vehicle
    chatbotStore: new ChatbotStore()
  }
}
