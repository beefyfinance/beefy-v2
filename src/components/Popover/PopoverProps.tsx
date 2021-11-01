import { PopperPlacementType } from "@material-ui/core";

export interface PopoverProps {
    title: string;
    content: string;
    size: string,
    placement: PopperPlacementType;
}