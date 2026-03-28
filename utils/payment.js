const GREEN_POINTS_PER_YUAN = 10;
const CENTS_PER_GREEN_POINT = Math.round(100 / GREEN_POINTS_PER_YUAN);

function getMixedPaymentPreview(amount, greenPoints) {
  const amountInCents = Math.max(0, Math.round(Number(amount || 0) * 100));
  const points = Math.max(0, Math.floor(Number(greenPoints || 0)));
  const maxDeductiblePoints = Math.floor(amountInCents / CENTS_PER_GREEN_POINT);
  const usedPoints = Math.min(points, maxDeductiblePoints);
  const balanceInCents = amountInCents - usedPoints * CENTS_PER_GREEN_POINT;

  return {
    points: usedPoints,
    balance: balanceInCents / 100
  };
}

module.exports = {
  GREEN_POINTS_PER_YUAN,
  getMixedPaymentPreview
};
