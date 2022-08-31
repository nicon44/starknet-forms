import { useContract } from '@starknet-react/core'
import { Abi } from 'starknet'

import FormAbi from '../abi/formAbi.json'

export function useFormContract() {
  return useContract({
    abi: FormAbi as Abi,
    address: '0x03a01559ee384a063904225b0eca1a667880f7dbb58e9be5f358614036270a65',
  })
}