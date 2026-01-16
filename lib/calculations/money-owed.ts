interface MoneyOwedInput {
  actualSpeed: number;
  promisedSpeed: number;
  monthlyPrice: number;
}

export function calculateMoneyOwed({
  actualSpeed,
  promisedSpeed,
  monthlyPrice,
}: MoneyOwedInput) {
  const ratio =
    promisedSpeed > 0 ? Math.min(1, actualSpeed / promisedSpeed) : 0;
  const shortfall = 1 - ratio;
  const loss = monthlyPrice * shortfall;
  return Math.max(0, Math.round(loss));
}
