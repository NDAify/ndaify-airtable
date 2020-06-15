import React, { useEffect} from 'react';
import { useWatchable } from '@airtable/blocks/ui';
import { settingsButton } from '@airtable/blocks';

const SettingsButton = ({ show }) => {
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
  
  useWatchable(settingsButton, 'click', function() {
      alert('Clicked!');
  });

  return null;
}

export default SettingsButton;