import { UIOrder } from 'modules/types';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { isTransactionConfirmed } from 'modules/contracts/actions/contractCalls';
import {
  convertDisplayAmountToOnChainAmount,
  convertDisplayPriceToOnChainPrice,
} from '@augurproject/sdk';
import { createBigNumber } from 'utils/create-big-number';
import { TransactionMetadataParams } from '@augurproject/contract-dependencies-ethers';
import { generateTxParameterId } from 'utils/generate-tx-parameter-id';
import { AppState } from 'appStore';
import { PendingOrders } from 'modules/app/store/pending-orders';
import { AppStatus } from 'modules/app/store/app-status';

export const ADD_PENDING_ORDER = 'ADD_PENDING_ORDER';
export const REMOVE_PENDING_ORDER = 'REMOVE_PENDING_ORDER';
export const UPDATE_PENDING_ORDER = 'UPDATE_PENDING_ORDER';

export const addPendingOrder = (pendingOrder: UIOrder, marketId: string) =>
  addPendingOrderWithBlockNumber(pendingOrder, marketId);

export const removePendingOrder = (id: string, marketId: string) => {
  PendingOrders.actions.removePendingOrder(marketId, id);
  return ({
    type: REMOVE_PENDING_ORDER,
    data: { id, marketId },
  });
}
export const updatePendingOrderStatus = (
  id: string,
  marketId: string,
  status: string,
  hash: string
) => updatePendingOrderStatusWithBlockNumber(id, marketId, status, hash);

export const addPendingOrderWithBlockNumber = (
  pendingOrder: UIOrder,
  marketId: string
) => (dispatch: ThunkDispatch<void, any, Action>, getState: () => AppState) => {
  const {
    blockchain: { currentBlockNumber },
  } = AppStatus.get();
  pendingOrder.blockNumber = currentBlockNumber;
  PendingOrders.actions.updatePendingOrder(marketId, pendingOrder);
  dispatch({
    type: ADD_PENDING_ORDER,
    data: {
      pendingOrder,
      marketId,
    },
  });
};

const updatePendingOrderStatusWithBlockNumber = (
  id: string,
  marketId: string,
  status: string,
  hash: string
) => (dispatch: ThunkDispatch<void, any, Action>, getState: () => AppState) => {
  const {
    blockchain: { currentBlockNumber },
  } = AppStatus.get();
  const blockNumber = currentBlockNumber;
  PendingOrders.actions.updatePendingOrder(marketId, {
    id,
    status,
    hash,
    blockNumber,
  });
  dispatch({
    type: UPDATE_PENDING_ORDER,
    data: { id, marketId, status, hash, blockNumber },
  });
};

export const loadPendingOrdersTransactions = (pendingOrders: UIOrder[]) => (
  dispatch: ThunkDispatch<void, any, Action>
) => {
  if (!pendingOrders || Object.keys(pendingOrders).length === 0) return;
  Object.keys(pendingOrders).map(async marketId => {
    const orders = pendingOrders[marketId];
    if (!orders || orders.length === 0) return;
    orders.map(async (o: UIOrder) => {
      if (!o.hash) return;
      const confirmed = await isTransactionConfirmed(o.hash);
      confirmed
        ? dispatch(removePendingOrder(o.id, marketId))
        : dispatch(addPendingOrder(o, marketId));
    });
  });
};

export const constructPendingOrderid = (
  onChainAmount: string,
  onChainPrice: string,
  onchainOutcome: string,
  market: string
) => {
  const params: TransactionMetadataParams = {
    amount: createBigNumber(onChainAmount).toString(),
    price: createBigNumber(onChainPrice).toString(16),
    outcome: onchainOutcome,
    market,
  };

  return generateTxParameterId(params);
};

export const generatePendingOrderId = (
  amount: string,
  price: string,
  outcome: string,
  marketId: string,
  tickSize: string,
  minPrice: string
) => {
  const bnTickSize = createBigNumber(tickSize);
  const bnMinPrice = createBigNumber(minPrice);
  const bnAmount = createBigNumber(amount);
  const bnPrice = createBigNumber(price);
  const onChainAmount = convertDisplayAmountToOnChainAmount(
    bnAmount,
    bnTickSize
  );
  const onChainPrice = convertDisplayPriceToOnChainPrice(
    bnPrice,
    bnMinPrice,
    bnTickSize
  );
  const hexOutcome = `0x0${outcome}`;

  const params: TransactionMetadataParams = {
    amount: onChainAmount.toString(),
    price: onChainPrice.toString(16),
    outcome: hexOutcome,
    market: marketId,
  };

  return generateTxParameterId(params);
};
