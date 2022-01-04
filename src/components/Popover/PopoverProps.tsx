import { PopperPlacementType } from '@material-ui/core/Popper';

export interface PopoverProps {
  title: string;
  content: string;
  size?: string;
  placement?: PopperPlacementType;
}
