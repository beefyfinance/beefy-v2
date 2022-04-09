export interface MediaCardProps {
  id: string;
  background: 'light' | 'dark';
  versions: Version[];
}

interface Version {
  type: string;
  fileName: string;
}
