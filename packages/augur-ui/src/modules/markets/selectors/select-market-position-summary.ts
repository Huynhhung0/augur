import { formatDai, formatPercent } from 'utils/format-number';
import { ZERO } from 'modules/common/constants';
import { createBigNumber } from 'utils/create-big-number';
import { AppStatus } from 'modules/app/store/app-status';

export const selectMarketPositionsSummary = marketId => {
  const { accountPositions } = AppStatus.get();
  const marketAccountPositions = accountPositions[marketId];
  if (
    !marketAccountPositions ||
    !marketAccountPositions.tradingPositionsPerMarket
  ) {
    return {
      currentValue: formatDai(0),
      totalPercent: formatPercent(0),
      totalReturns: formatDai(0),
      valueChange: formatPercent(0),
      valueChange24Hr: formatPercent(0),
    };
  }
  const marketPositions = marketAccountPositions.tradingPositionsPerMarket;

  const currentValue = formatDai(marketPositions.currentValue || ZERO);
  const totalReturns = formatDai(marketPositions.total || ZERO);
  const totalPercent = formatPercent(
    createBigNumber(marketPositions.totalPercent || ZERO).times(100),
    { decimalsRounded: 2 }
  );
  const valueChange = formatPercent(
    createBigNumber(marketPositions.unrealizedPercent || ZERO).times(100),
    { decimalsRounded: 2 }
  );

  const valueChange24Hr = formatPercent(
    createBigNumber(marketPositions.unrealized24HrPercent || ZERO).times(100),
    { decimalsRounded: 2 }
  );

  return {
    currentValue,
    totalPercent,
    totalReturns,
    valueChange,
    valueChange24Hr,
  };
};
