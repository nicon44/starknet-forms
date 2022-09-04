export default interface IQuestion {
  id: string;
  description: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  selectedOption: string | undefined;
  correctOption?: number;
}