export type PointStructureBannerConfig = {
  /** Name displayed in the "Points by {by}" header */
  by: string;
  /** Full heading override. Defaults to `Points by ${by}` */
  title?: string;
  /** Markdown body */
  description: string;
  /** URL for the "Learn more" button. Renders the button only when set. */
  learn?: string;
  /** Chain id (src/images/networks/{chainIcon}.svg). Defaults to the flame icon */
  chainIcon?: string;
};

type PointEntryConfig = {
  id: string;
  name: string;
};

type PointsEligibilityConfig = {
  type: string;
  [key: string]: unknown;
};

type PointsAccountingConfig = {
  id: string;
  role: string;
  type?: string;
  url?: string;
};

export type PointStructureConfig = {
  id: string;
  docs: string;
  points: PointEntryConfig[];
  eligibility: PointsEligibilityConfig[];
  accounting?: PointsAccountingConfig[];
  /** When set, a banner is displayed on eligible vault detail pages */
  banner?: PointStructureBannerConfig;
};
