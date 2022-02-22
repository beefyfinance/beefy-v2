interface Cow {
  attributes: [];
  description: string;
  external_url: string;
  image: string;
  image_data: string;
  name: string;
}

export interface CowCardProps {
  cow: Cow;
}
