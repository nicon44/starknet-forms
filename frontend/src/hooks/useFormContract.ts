import { useContract } from '@starknet-react/core'
import { Abi } from 'starknet'

import FormAbi from '../abi/formAbi.json'

export function useFormContract() {
  return useContract({
    abi: FormAbi as Abi,
    address: '0x03ce7b874139d61ee7521150857da869eec20c1b03616f8263e9a6c416f52235',
  })
}