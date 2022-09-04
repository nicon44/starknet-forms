import { hash } from "starknet";
import { BigNumberish, toHex } from "starknet/utils/number";
import IQuestion from "../model/question";
import IpfsUtils from "../utils/IpfsUtils";
import responseToString from "../utils/responseToString";
import stringToHex from "../utils/stringToHex";

export async function getFormQuestions(formResult: any[], secret?: string): Promise<IQuestion[]> {
  const ipfsUtils = new IpfsUtils();

  const getFromIpfs = async (item: any) => {
    const response = await ipfsUtils.download(
      responseToString(item.high) + responseToString(item.low)
    );
    return response;
  };

  const calculateCorrectOption = (question: any) => {
    console.log(question)
    const correctOptionHashed: BigNumberish = toHex(question.option_correct)
    const optionAHash = hash.pedersen([toHex(question.optionA.high), toHex(question.optionA.low)])
    const optionBHash = hash.pedersen([toHex(question.optionB.high), toHex(question.optionB.low)])
    const optionCHash = hash.pedersen([toHex(question.optionC.high), toHex(question.optionC.low)])
    const optionDHash = hash.pedersen([toHex(question.optionD.high), toHex(question.optionD.low)])
    if (
      correctOptionHashed ===
      hash.pedersen([optionAHash, stringToHex(secret!)])
    ) {
      return 0;
    } else if (
      correctOptionHashed ===
      hash.pedersen([optionBHash, stringToHex(secret!)])
    ) {
      return 1;
    } else if (
      correctOptionHashed ===
      hash.pedersen([optionCHash, stringToHex(secret!)])
    ) {
      return 2;
    } else if (
      correctOptionHashed ===
      hash.pedersen([optionDHash, stringToHex(secret!)])
    ) {
      return 3;
    } else {
      return 99;
    }
  };

  if (formResult && formResult.length > 0) {
    let form = [];
    if (formResult[0] instanceof Array) {
      for (let item of formResult[0]) {
        const description = await getFromIpfs(item.description);
        const optionA = await getFromIpfs(item.optionA);
        const optionB = await getFromIpfs(item.optionB);
        const optionC = await getFromIpfs(item.optionC);
        const optionD = await getFromIpfs(item.optionD);
        let question: IQuestion = {
          id: description,
          description: description,
          optionA: optionA,
          optionB: optionB,
          optionC: optionC,
          optionD: optionD,
          selectedOption: undefined,
        };
        if (item.option_correct.toString(10).length === 1) {
          question.correctOption = +item.option_correct.toString(10)
        } else if (secret) {
          question.correctOption = calculateCorrectOption(item)
        }
        form.push(question);
      }
    }
    return form;
  }
  return [];
}
