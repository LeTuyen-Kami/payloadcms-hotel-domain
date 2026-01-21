'use client'

import { useFormFields, useForm, useField } from '@payloadcms/ui'
import { useEffect, useRef } from 'react'

const RoomPriceSync = () => {

  const { value, setValue } = useField({ path: 'priceInVND' })

  console.log('value', value);


  return null // This is a headless component
}

export default RoomPriceSync
