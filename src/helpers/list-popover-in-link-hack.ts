import { CSSProperties } from '@material-ui/core/styles/withStyles';

/**
 * This file contains a hack to allow popovers to work properly in the vault list
 * The issue it that on mobile, (?) popovers have to be clicked
 * But this click will trigger the vault item link and redirect the user
 * to the vault page. This hack prevents this behavior to allow mobile
 * users to see the popover content.
 *
 * If anyone knows a better way, feel free to fix it.
 */

export const popoverInLinkHack__linkStyle: CSSProperties = {
  cursor: 'pointer',
};
export const popoverInLinkHack__linkContentStyle: CSSProperties = {
  // disabling pointer events saves CPU when scrolling super fast
  //pointerEvents: 'none',
};

export const popoverInLinkHack__linkHandler = e => {
  // somehow, setting stopPropagation and preventDefault
  // was not properly preventing the click event to bubble
  // so I hacked around this limitation by setting a hack
  // property on the event. So underlying events can "request"
  // our link component NOT to handle the click event
  // Idk why but stopPropagation should work and should
  // prevent the event from bubbling but just doing
  // e.stopPropagation didn't prevent anything so I had to
  // hack this
  if (e.__disable_link) {
    e.stopPropagation();
    // this line will trigger the error
    // "Unable to preventDefault inside passive event listener invocation."
    // but without it, the link event is triggered so I let it there
    e.preventDefault();
    e.__disable_link = false;
  }
};

export const popoverInLinkHack__popoverContainerStyle: CSSProperties = {
  // pointer events have been disabled on the list item
  // for performance, we need to re-enable them here
  // to display the tooltip
  //pointerEvents: 'initial',
};

// this is needed on mobile because popovers need to be "clicked"
// but the popover is inside a link, so we don't want the link
// to know it has been clicked
export const popoverInLinkHack__popoverContainerHandler = e => {
  // here, we kindly request our container link
  // component NOT to handle this click as a link click
  // see link component for more info
  e.__disable_link = true;
};
