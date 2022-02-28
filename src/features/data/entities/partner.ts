/**
 * Boosts can be done in partnership with
 * a company or project
 */
export interface PartnerEntity {
  id: string;
  logo: string;
  background: string;
  text: string;
  website: string;
  social: {
    telegram?: string | null;
    twitter?: string | null;
    discord?: string | null;
  };
  logoNight?: string | null;
}
