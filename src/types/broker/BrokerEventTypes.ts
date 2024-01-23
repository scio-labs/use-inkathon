export interface SaleInfoType {
  saleStart: number
  leadinLength: number
  price: number
  regionBegin: number
  regionEnd: number
  idealCoresSold: number
  coresOffered: number
  firstCore: number
  selloutPrice: number | null
  coresSold: number
}

export interface ConfigurationType {
  advanceNotice: number
  interludeLength: number
  leadinLength: number
  regionLength: number
  idealBulkProportion: number
  limitCoresOffered: number | null
  renewalBump: number
  contributionTimeout: number
}

export interface StatusType {
  coreCount: number
  privatePoolSize: number
  systemPoolSize: number
  lastCommittedTimeslice: number
  lastTimeslice: number
}

export interface LeaseType {
  until: number
  task: number
}

export type LeasesType = LeaseType[]

// For Reservations
export interface ReservationType {
  mask: string
  assignment: { task?: number; pool?: null }
}

export type ReservationsType = ReservationType[][]

// For Pallet Version
export type PalletVersionType = number

// For Insta Pool Io
export interface InstaPoolIoType {
  private: number
  system: number
}
