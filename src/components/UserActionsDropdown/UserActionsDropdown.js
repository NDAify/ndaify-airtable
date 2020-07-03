import React from 'react';
import styled from 'styled-components';

import {
  Menu as ReachMenu,
  MenuList as ReachMenuList,
  MenuButton as ReachMenuButton,
  MenuLink as ReachMenuLink,
} from '@reach/menu-button';

const ChevronDown = () => (
  <svg
    width="17"
    height="11"
    viewBox="0 0 17 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M7.92741 10.5938L0.198242 2.86458C0.0662975 2.73264 0.000326157 2.57639 0.000326157 2.39583C0.000326157 2.21528 0.0662975 2.05903 0.198242 1.92708L1.92741 0.197917C2.05935 0.0659716 2.2156 0 2.39616 0C2.57672 0 2.73296 0.0659716 2.86491 0.197917L8.39616 5.72917L13.9274 0.197917C14.0594 0.0659716 14.2156 0 14.3962 0C14.5767 0 14.733 0.0659716 14.8649 0.197917L16.5941 1.92708C16.726 2.05903 16.792 2.21528 16.792 2.39583C16.792 2.57639 16.726 2.73264 16.5941 2.86458L8.86491 10.5938C8.73296 10.7257 8.57672 10.7917 8.39616 10.7917C8.2156 10.7917 8.05935 10.7257 7.92741 10.5938Z" fill="currentColor" />
  </svg>
);

const ChevronDownIcon = styled(ChevronDown)`
  color: var(--ndaify-fg);
`;

const NavigationListItemButton = styled(ReachMenuButton)`
  display: block;
  margin: 0;
  padding: 0;
  padding-left: 10px;
  padding-right: 10px;
  font-family: inherit;
  border: 1px solid var(--ndaify-fg);
  border-left: 0px;
  text-decoration: none;
  background-color: transparent;
  color: var(--ndaify-fg);
  cursor: pointer;
  transition: none;
  font-size: 20px;
  border-top-right-radius: var(--ndaify-button-radius);
  border-bottom-right-radius: var(--ndaify-button-radius);
  height: 40px;
          
  :focus {
    background: rgba(255, 255, 255, 0.1);
    outline: -webkit-focus-ring-color auto 0px;
    outline-offset: 0px;
  }

  :visited {
    color: var(--ndaify-fg);
  }

  :disabled {
    cursor: not-allowed;
  }
`;

const MoreOptionsButton = styled(NavigationListItemButton)`
  display: flex;
  flex-direction: row;
  align-items: center;

  svg {}
`;

const MoreOptionsMenuList = styled(ReachMenuList)`
  // FIXME(jmurzy) reach-ui does not provide a way to set className on the data-reach-menu element.
  // We should probably report this as a bug rather than polluting the global scope with magic
  body:not(&) {
    [data-reach-menu],
    [data-reach-menu-popover] {
      display: block;
      position: absolute;
      z-index: 1;
    }

    [data-reach-menu][hidden],
    [data-reach-menu-popover][hidden] {
      display: none;
    }
  }

  display: block;
  white-space: nowrap;
  outline: none;
  padding: 12px 0;

  min-width: 200px;

  margin: 0;
  padding: 0;

  margin-top: 8px;
  border-radius: var(--ndaify-button-radius);
  overflow: hidden;

  background-color: #FFFFFF;
  border: 1px solid #EAEAEA;
  box-shadow: 0 10px 20px 0 rgba(255,255,255,0.15);
  z-index: 10000;

  [data-reach-menu-item] {
    display: block;
    user-select: none;
  }
  
  [data-reach-menu-item] {
    cursor: pointer;

    display: block;

    color: inherit;
    font-size: 16px;
    line-height: 24px;
    text-decoration: initial;
    padding: 6px 12px;
    text-align: center;
  }

  [data-reach-menu-item][data-selected] {
    background-color: #FAFAFA;
    color: #000000;
    outline: none;
  }
`;

const UserActionsDropdown = () => (
  <ReachMenu>
    {(/* { isExpanded } */) => (
      <>
        <MoreOptionsButton id="header-more-options">
          <ChevronDownIcon aria-hidden />
        </MoreOptionsButton>
        <MoreOptionsMenuList>
          <ReachMenuLink href="https://ndaify.com" target="_blank" rel="noreferrer noopener">
            Send
          </ReachMenuLink>
        </MoreOptionsMenuList>
      </>
    )}
  </ReachMenu>
);

export default UserActionsDropdown;
