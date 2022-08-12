export default function convertCorrectOption(option: number) {
  switch (option) {
    case 0:
      return 'A';
    case 1:
      return 'B';
    case 2:
      return 'C';
    case 3:
      return 'D';
    default:
      return '?'
  }
}