export interface PaymentSetting {
  projectId: number | undefined
  iosSchemaId: string
  partnerCode: string
  partnerName: string
  accessKey: string
  secretKey: string
  publicKey: string
  apiEndpoint: string
  apiEndpointQuery: string
  apiEndpointRefund: string
  isActive: boolean
  orderGroupId: number | undefined
}
