function toHex (char = '') {
  return char.charCodeAt(0).toString(16)
}

function encode (str = '') {
  return str.split('').map(toHex).join('')
}

export default function stringToHex(str: string) {
  return '0x' + encode(str);
}