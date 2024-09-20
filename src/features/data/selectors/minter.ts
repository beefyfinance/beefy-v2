import { createSelector } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';

export const selectMinterFormData = createSelector(
  (state: BeefyState) => state.ui.minter.formData,
  formData => formData
);
