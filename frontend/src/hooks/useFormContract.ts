import { useContract } from '@starknet-react/core'
import { Abi } from 'starknet'

import FormAbi from '../abi/formAbi.json'

export function useFormContract() {
  return useContract({
    abi: FormAbi as Abi,
    address: '0x01fbec1f8c7c7cf6b859dea3c07224a65d896a0caa05fbf5a06c06d1a187dd00',
  })
}