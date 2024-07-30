import { Source } from './types';

export type BuildResult<TType extends string, TDetails extends {}> = {
  type: TType;
  source: Source;
  details: TDetails;
};
