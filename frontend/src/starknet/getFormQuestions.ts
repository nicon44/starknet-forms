import IQuestion from "../model/question";
import IpfsUtils from "../utils/IpfsUtils";
import responseToString from "../utils/responseToString";

export async function getFormQuestions(formResult: any[]): Promise<IQuestion[]> {
  const ipfsUtils = new IpfsUtils();

  const getFromIpfs = async (item: any) => {
    const response = await ipfsUtils.download(
      responseToString(item.high) + responseToString(item.low)
    );
    return response;
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
        }
        form.push(question);
      }
    }
    return form;
  }
  return [];
}
