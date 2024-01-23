import { utils } from '@/utils'

interface ParamField {
  type: string
  value: any
}

interface TransformOptions {
  emptyAsNull: boolean
}

const isNumType = (type: string): boolean => {
  return utils.paramConversion.num.some((el) => type.indexOf(el) >= 0)
}

const transformParams = (
  paramFields: ParamField[],
  inputParams: any[], // Define the type more specifically if possible
  opts: TransformOptions = { emptyAsNull: true },
): any[] => {
  // Define the return type more specifically if possible
  const paramVal = inputParams.map((inputParam) => {
    if (
      typeof inputParam === 'object' &&
      inputParam !== null &&
      typeof inputParam.value === 'string'
    ) {
      return inputParam.value.trim()
    } else if (typeof inputParam === 'string') {
      return inputParam.trim()
    }
    return inputParam
  })

  return paramFields.map((field, ind) => {
    const value = paramVal[ind]
    if (value == null || value === '') {
      return opts.emptyAsNull ? null : undefined
    }

    // Deal with vectors
    if (field.type.includes('Vec<')) {
      const splitValues = value.split(',').map((e: string) => e.trim())
      return splitValues.map((single: string) =>
        isNumType(field.type)
          ? single.includes('.')
            ? parseFloat(single)
            : parseInt(single, 10)
          : single,
      )
    }

    // Deal with single values
    if (isNumType(field.type)) {
      return value.includes('.') ? parseFloat(value) : parseInt(value, 10)
    }

    return value
  })
}

export { isNumType, transformParams }
