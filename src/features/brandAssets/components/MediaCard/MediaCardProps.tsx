export interface MediaCardProps {
  id?: string;
  background?: string;
  versions: Version[];
}

interface Version {
  type?: string;
  fileName?: string;
}
