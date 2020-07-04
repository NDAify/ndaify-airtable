import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { useAlert } from 'react-alert';
import { queryCache } from 'react-query';

import {
  Menu as ReachMenu,
  MenuList as ReachMenuList,
  MenuButton as ReachMenuButton,
  MenuLink as ReachMenuLink,
  MenuItem as ReachMenuItem,
} from '@reach/menu-button';

import NdaifyService from '../../services/NdaifyService';

const More = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const MoreIcon = styled(More)`
  color: var(--ndaify-fg);
`;

const NavigationListItemButton = styled(ReachMenuButton)`
  display: block;
  margin: 0;
  padding: 0;
  padding-left: 10px;
  padding-right: 10px;
  font-family: inherit;
  text-decoration: none;
  background-color: transparent;
  color: var(--ndaify-fg);
  cursor: pointer;
  transition: none;
  font-size: 20px;
  border: 0;
          
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

  svg {
    width: 24px;
  }
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

const MenuItemDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #FAFAFA;
`;

const MenuLink = React.forwardRef(({
  children, href, ...props
}, ref) => (
  <a
    ref={ref}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  >
    {children}
  </a>
));

const NdaActionsDropdown = ({ nda }) => {
  const toast = useAlert();

  const [isResending, setResending] = useState(false);

  const [isRevoking, setRevoking] = useState(false);

  const handleResendNda = async () => {
    if (isResending) {
      return;
    }

    setResending(true);

    try {
      const ndaifyService = new NdaifyService();
      await ndaifyService.resendNda(nda.ndaId);

      await queryCache.invalidateQueries(['ndas']);

      toast.show('Successfully resent NDA');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      toast.show('Failed to resend NDA');
    } finally {
      setResending(false);
    }
  };
  const onResendNda = useCallback(handleResendNda, [nda.ndaId, toast, isResending]);

  const handleRevokeNda = async () => {
    if (isRevoking) {
      return;
    }

    setRevoking(true);

    try {
      const ndaifyService = new NdaifyService();
      await ndaifyService.revokeNda(nda.ndaId);

      await queryCache.invalidateQueries(['ndas']);

      toast.show('Successfully revoked NDA');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      toast.show('Failed to revoke NDA');
    } finally {
      setRevoking(false);
    }
  };
  const onRevokeNda = useCallback(handleRevokeNda, [nda.ndaId, toast, isRevoking]);

  return (
    <ReachMenu>
      {(/* { isExpanded } */) => (
        <>
          <MoreOptionsButton id="api-key-more-options">
            <MoreIcon aria-hidden />
          </MoreOptionsButton>
          <MoreOptionsMenuList>
            <ReachMenuLink as={MenuLink} href={`https://ndaify.com/nda/${nda.ndaId}`} target="_blank">
              <FormattedMessage
                id="nda-actions-dropdown-view-nda"
                defaultMessage="View"
              />
            </ReachMenuLink>
            {
              nda.metadata.status === 'pending' ? (
                <>
                  <MenuItemDivider />
                  <ReachMenuItem onSelect={onResendNda}>
                    <FormattedMessage
                      id="nda-actions-dropdown-resend-nda"
                      defaultMessage="Resend"
                    />
                  </ReachMenuItem>
                  <ReachMenuItem onSelect={onRevokeNda}>
                    <FormattedMessage
                      id="nda-actions-dropdown-revoke-nda"
                      defaultMessage="Revoke"
                    />
                  </ReachMenuItem>
                </>
              ) : null
            }
          </MoreOptionsMenuList>
        </>
      )}
    </ReachMenu>
  );
};

export default NdaActionsDropdown;
