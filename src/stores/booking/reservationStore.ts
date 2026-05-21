import { action, observable, makeObservable } from 'mobx'

import type { PagedResultDto } from '../../services/dto/pagedResultDto'
import reservationService from '../../services/booking/reservationService'
import amenityService from '@services/booking/amenityService'
import { AmenityDetailModel } from '@models/Booking/amenityModel'
import { BookingSlotModel } from '@models/Booking/reservationModel'

class ReservationStore {
  @observable isLoading!: boolean
  @observable pagedData!: PagedResultDto<any>
  @observable timeSlots!: any
  @observable listStatus!: any
  @observable listPaymentStatus!: any
  @observable editReservation!: any
  @observable editReservationAdditionalFee!: any
  @observable amenityForReservation!: AmenityDetailModel
  @observable reservationOverview: any[] = []

  constructor() {
    makeObservable(this)
    this.pagedData = { items: [], totalCount: 0 }
    this.listStatus = []
    this.listPaymentStatus = []
    this.editReservation = {}
    this.editReservationAdditionalFee = {}
  }
  @action async getOverview(params) {
    this.isLoading = true
    this.reservationOverview = await reservationService.getOverview(params).finally(() => (this.isLoading = false))
  }
  @action
  async create(body: any) {
    this.isLoading = true
    await reservationService.create(body).finally(async () => {
      this.isLoading = false
    })

    this.editReservation = {}
  }

  @action
  async update(updateReservationInput: any) {
    this.isLoading = true
    await reservationService.update(updateReservationInput).finally(async () => {
      this.isLoading = false
    })
    this.editReservation = {}
  }

  @action
  async createAdditionalFee(updateReservationInput: any) {
    this.isLoading = true
    await reservationService.createAdditionalFee(updateReservationInput).finally(async () => {
      this.isLoading = false
    })
  }

  @action
  async delete(id: number) {
    await reservationService.delete(id)
    this.pagedData.items = this.pagedData.items.filter((x) => x.id !== id)
  }

  @action
  async activateOrDeactivate(id: number, isActive) {
    await reservationService.activateOrDeactivate(id, isActive)
  }

  @action
  async get(id: number, isShowPhoneEmail?: boolean) {
    const result = await reservationService.get(id, isShowPhoneEmail)
    this.editReservation = result
  }

  @action
  async createReservation(amenityId?, bookingSlot?: BookingSlotModel, isAutoApprove?) {
    this.editReservation = {
      amenityId,
      bookingSlot,
      status: isAutoApprove ? 'APPROVED' : 'REQUESTED',
      depositAmount: this.amenityForReservation?.depositAmount,

      /// reset form value
      unitUserId: undefined,
      unitId: undefined,
      userId: undefined,
      fullUnitCode: undefined,
      displayName: undefined,
      emailAddress: undefined,
      phoneNumber: undefined
    }
  }

  @action
  async setSelectedAmenityForReservation(amenity?) {
    this.amenityForReservation = amenity
  }

  @action
  async getBookingTimeSlots(params: any) {
    this.isLoading = true
    this.timeSlots = await amenityService.getBookingTimeSlot(params).finally(() => (this.isLoading = false))
    return this.timeSlots
  }

  @action
  async getAll(params: any) {
    this.isLoading = true
    const result = await reservationService.getAll(params).finally(() => (this.isLoading = false))
    this.pagedData = result
  }

  @action
  async getAllMyReservation(params: any) {
    this.isLoading = true
    const result = await reservationService.getAllMyReservation(params).finally(() => (this.isLoading = false))
    this.pagedData = result
  }

  @action
  async exportReservations(params: any) {
    this.isLoading = true
    return await reservationService.exportReservation(params).finally(() => (this.isLoading = false))
  }

  @action
  async getReservationStatus() {
    if (this.listStatus && this.listStatus.length) {
      return
    }
    this.isLoading = true
    this.listStatus = await reservationService.getReservationStatus({}).finally(() => (this.isLoading = false))
  }

  @action
  async getReservationPaymentStatus() {
    if (this.listPaymentStatus && this.listPaymentStatus.length) {
      return
    }
    this.isLoading = true
    this.listPaymentStatus = await reservationService
      .getReservationPaymentStatus({})
      .finally(() => (this.isLoading = false))
  }
}

export default ReservationStore
