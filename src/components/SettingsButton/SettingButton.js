import { useEffect } from 'react';
import { useWatchable, useSettingsButton } from '@airtable/blocks/ui';
import { settingsButton } from '@airtable/blocks';

import useStateRouter from '../../lib/useStateRouter';

const SettingsButton = ({ show }) => {
  const [, setBlockState] = useStateRouter();

  useEffect(() => {
    // A count of calls to `show()` and `hide()` is maintained internally. The button will
    // stay visible if there are more calls to `show()` than `hide()` - so here, we check
    // `isVisible` so we only we only call them when necessary.
    // The button is not visible by default.
    if (show && !settingsButton.isVisible) {
      settingsButton.show();
    } else if (!show && settingsButton.isVisible) {
      settingsButton.hide();
    }
  }, [show]);

  useWatchable(settingsButton, 'click', () => {
    // For better UX, imperatively hide the settings button before navigating to
    // `settings` since `getInitialProps` of `settings` screen might might take
    // a while to render <SettingsButton />
    settingsButton.hide();

    setBlockState({
      route: 'settings',
    });
  });

  return null;
};

export default SettingsButton;
