import { useContract } from '@starknet-react/core'
import { Abi } from 'starknet'

import FormAbi from '../abi/formAbi.json'

export function useFormContract() {
  return useContract({
    abi: FormAbi as Abi,
    address: '0x03f81418d4249a81e89f5b85a21ed8eceb327450c8006a03981df5a905ad85ad',
  })
}