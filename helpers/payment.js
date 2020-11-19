const MINUMUM_SESSION_TIME = 15; // 15 minutes minimum

exports.calculateTotalTime = (timeInSeconds) => {
  return Math.ceil(timeInSeconds / 60) < MINUMUM_SESSION_TIME
    ? MINUMUM_SESSION_TIME
    : Math.ceil(timeInSeconds / 60);
};

exports.calculateTotalPayment = (totalTime = 15, expertRate) => {
  return (
    (this.calculateTotalTime(totalTime) * expertRate) /
    MINUMUM_SESSION_TIME
  ).toFixed(2);
};
