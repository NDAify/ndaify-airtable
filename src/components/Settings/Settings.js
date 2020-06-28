import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Formik, Form, Field as FormikField } from 'formik';

import {
  Box,
  useViewport,
  useGlobalConfig,
  Button,
} from '@airtable/blocks/ui';

import ErrorMessage from '../ErrorMessage/ErrorMessage';
import FieldErrorMessage from '../ErrorMessage/FieldErrorMessage';
import SettingsButton from '../SettingsButton/SettingButton';
import Input from '../Input/Input';

import useStateRouter from '../../lib/useStateRouter';

import { timeout } from '../../util';
import NdaifyService from '../../services/NDAifyService';

const NDAifyHeading = styled.div`
  margin: 0; 
  padding: 0; 
  color: var(--ndaify-fg); 
  font-size: 24px;
  font-weight: 200;
`;

const Paragraph = styled.div`
  color: var(--ndaify-accents-6);
  margin: 0;
  padding: 0;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;

  a {
    text-decoration: underline;
    color: var(--ndaify-fg); 
  }

  a:visited {
    color: var(--ndaify-fg); 
  }
`;

const InputContainer = styled.div`
  margin-top: 2pc;
  margin-bottom: 2pc;
`;

const Settings = ({ /* user, */activeNDAifyApiKey }) => {
  const [, setBlockState] = useStateRouter();

  const viewport = useViewport();
  const globalConfig = useGlobalConfig();

  const isEnabled = globalConfig.hasPermissionToSet('NDAIFY_API_KEY');

  useEffect(() => {
    viewport.enterFullscreenIfPossible();
  }, [viewport]);

  const handleFormValidate = (values) => {
    const errors = {};
    if (!values.apiKey) {
      errors.apiKey = 'You must enter an API Key';
    }

    return errors;
  };
  const onFormValidate = useCallback(handleFormValidate, []);

  const handleSubmit = async (
    {
      apiKey,
    },
    {
      setStatus,
    },
  ) => {
    // clear all error messages before retrying
    setStatus();

    const ndaifyService = new NdaifyService();

    try {
      await globalConfig.setAsync('NDAIFY_API_KEY', apiKey);

      await ndaifyService.tryGetSession();

      setBlockState({
        route: 'loading',
      });
      await timeout(800);
      viewport.exitFullscreen();
      setBlockState({
        route: 'home',
      });
    } catch (error) {
      // reuse the old key if the new key fails
      await globalConfig.setAsync('NDAIFY_API_KEY', activeNDAifyApiKey);

      // eslint-disable-next-line no-console
      console.error(error);
      setStatus({ errorMessage: error.message });
    }
  };
  const onSubmit = useCallback(handleSubmit, [globalConfig, setBlockState, viewport]);

  const handleCancelClick = async () => {
    viewport.exitFullscreen();
    setBlockState({
      route: 'home',
    });
  };
  const onCancelClick = useCallback(handleCancelClick, []);

  const initialValues = {
    apiKey: activeNDAifyApiKey,
  };

  return (
    <>
      <SettingsButton show={false} />
      <Box height="calc(100vh - 80px)" overflow="scroll" display="flex" flexDirection="column" marginBottom="80px">
        <Formik
          initialValues={initialValues}
          validateOnChange={false}
          validateOnBlur={Object.keys(initialValues).length > 1}
          validate={onFormValidate}
          onSubmit={onSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form style={{ height: '100%', marginBottom: '1pc' }}>

              <Box display="flex" height="100%" width="100%" flexDirection="column">
                <Box display="flex" flexDirection="column" flex="1">
                  <Box padding="2pc 2pc 4pc 2pc" margin="0">
                    <NDAifyHeading style={{ paddingBottom: '8px' }}>
                      Settings
                    </NDAifyHeading>
                    <Paragraph style={{ paddingBottom: '2pc' }}>
                      This block uses the
                      {' '}
                      <a href="https://ndaify.com/dev/docs" target="_blank" rel="noopener noreferrer">
                        NDAify API
                      </a>
                      .
                    </Paragraph>

                    <Box display="flex" flexDirection="row">
                      <Box display="flex" flexDirection="column" width="100%">
                        {
                          status ? (
                            <ErrorMessage style={{ marginTop: '2pc', marginBottom: '0pc' }}>
                              {status.errorMessage}
                            </ErrorMessage>
                          ) : null
                        }

                        <InputContainer>
                          <FormikField
                            as={Input}
                            name="apiKey"
                            placeholder="NDAify API Key"

                            spellCheck={false}
                            autoCapitalize="none"
                            autoComplete="off"
                            autoCorrect="off"
                          />
                          <FieldErrorMessage style={{ marginTop: '1pc' }} name="apiKey" component="div" />
                        </InputContainer>

                      </Box>
                    </Box>

                  </Box>
                </Box>

                <Box backgroundColor="rgb(var(--ndaify-bg))" position="fixed" bottom="0" left="0" width="100%" padding="0 2pc" display="flex" justifyContent="space-between" alignItems="center" height="80px" borderTop="thick">
                  <Button
                    type="button"
                    variant="default"
                    size="large"
                    disabled={isSubmitting}
                    onClick={onCancelClick}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="default"
                    size="large"
                    disabled={!isEnabled || isSubmitting}
                    style={{ backgroundColor: 'var(--ndaify-accents-success)', color: 'var(--ndaify-button-fg)' }}
                  >
                    Save
                  </Button>
                </Box>
              </Box>

            </Form>
          )}
        </Formik>

      </Box>
    </>
  );
};

export default Settings;
