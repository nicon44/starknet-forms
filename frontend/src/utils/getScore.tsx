const getScore = (correct: number, incorrect: number):number => {
  return Math.round(((correct / (correct + incorrect)) * 100))
}

export default getScore