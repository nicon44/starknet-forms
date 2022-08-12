import { BigNumberish } from "starknet/utils/number";

function decode (hex = '') {
  const result = []
  for (let i = 0; i < hex.length; i += 2) {
    result.push(String.fromCharCode(parseInt(hex.substr(i, 2), 16)))
  }
  return result.join('')
}

export default function responseToString(number: BigNumberish) {
  return decode(number.toString(16));
}