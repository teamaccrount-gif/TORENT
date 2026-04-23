import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../Redux/Store';
import * as tableActions from '../Redux/Slices/tablesSlice';

export const useDynamicData = (view: string) => {
  const dispatch = useAppDispatch();
  
  const actionName = `fetch${view.charAt(0).toUpperCase()}${view.slice(1)}`;
  const action = (tableActions as any)[actionName];

  const dataResponse = useAppSelector((state) => (state.tablesSlice.data as any)[actionName]);
  const loadingState = useAppSelector((state) => (state.tablesSlice.loading as any)[actionName]);
  
  const loading = loadingState === 'pending';
  const data = dataResponse?.success ? dataResponse.data : [];

  useEffect(() => {
    if (action) {
      dispatch(action());
    }
  }, [action, dispatch, view]);

  return { data, loading, hasAction: !!action };
};
