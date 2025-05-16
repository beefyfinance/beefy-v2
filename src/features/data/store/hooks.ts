import { useDispatch, useSelector } from 'react-redux';
import type { BeefyDispatchFn, BeefyState } from './types.ts';

export const useAppDispatch = useDispatch.withTypes<BeefyDispatchFn>();
export const useAppSelector = useSelector.withTypes<BeefyState>();
