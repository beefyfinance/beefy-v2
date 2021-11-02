export interface SimpleDropdownProps {
    list: Record<string, any>;
    selected: any;
    handler: any;
    renderValue?: any;
    chainLogos: boolean;
    noBorder: boolean;
}