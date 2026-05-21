import appConsts from '@lib/appconst'
const { typeMeterReading } = appConsts

export interface IMeterReadingModel {
  type: number | undefined
  unitId: number | undefined
  code: string
  numOfPopulation: number | undefined
}

export class RowMeterReadingModel implements IMeterReadingModel {
  type: number | undefined
  unitId: number | undefined
  code: string
  numOfPopulation: number | undefined

  constructor() {
    this.type = undefined
    this.unitId = undefined
    this.code = ''
    this.numOfPopulation = undefined
  }
  public static assign(obj) {
    if (!obj) return undefined

    const newObj = Object.assign(new RowMeterReadingModel(), obj)
    newObj.type = obj.data?.currentMeter.type.map((item) => typeMeterReading[item])

    return newObj
  }

  public static assigns(objs) {
    const results: any[] = []
    objs.forEach((item) => results.push(this.assign(item)))
    return results
  }
}

export class MeterReadingModel implements IMeterReadingModel {
  type: number | undefined
  unitId: number | undefined
  code: string
  numOfPopulation: number | undefined

  constructor() {
    this.type = undefined
    this.unitId = undefined
    this.code = ''
    this.numOfPopulation = undefined
  }

  public static assign(obj) {
    if (!obj) return undefined

    return Object.assign(new MeterReadingModel(), obj)
  }
}

export interface IMeterReading {
  type: number
  unitId: number
  code: string
  numOfPopulation: number
}
