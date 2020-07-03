import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Formik, Form, Field as FormikField } from 'formik';
import { queryCaches } from 'react-query';

import * as Airtable from '@airtable/blocks/ui';
import {
  useViewport,
  useGlobalConfig,
} from '@airtable/blocks/ui';

import ErrorMessage from '../ErrorMessage/ErrorMessage';
import FieldErrorMessage from '../ErrorMessage/FieldErrorMessage';
import SettingsButton from '../SettingsButton/SettingButton';
import Pager from '../Pager/Pager';
import Input from '../Input/Input';

import useStateRouter from '../../lib/useStateRouter';

import NdaifyService from '../../services/NdaifyService';

const NDAifyHeading = styled.div`
  margin: 0; 
  padding: 0; 
  color: var(--ndaify-fg); 
  font-size: 32px;
  font-weight: 200;
`;

const Paragraph = styled.div`
  color: var(--ndaify-accents-6);
  margin: 0;
  padding: 0;
  font-size: 20px;
  font-weight: 400;
  line-height: 28px;
`;

const WizardStepNum = styled.div`
    margin: 0; 
    padding: 0 24px 0 8px;
    color: var(--ndaify-fg); 
    font-size: 36px;
    font-weight: 400; 
    line-height: 28px;
`;

const StepTitle = styled.div`
    margin: 0;
    padding: 0;
    color: var(--ndaify-fg); 
    font-size: 20px; 
    font-weight: 400; 
    line-height: 28px;
    padding-bottom: 4px;
`;

const StepDesc = styled.div`
    margin: 0;
    padding: 0;
    color: var(--ndaify-fg); 
    font-size: 16px; 
    font-weight: 200; 
    line-height: 28px;

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

const FieldLabel = styled.div`
  width: 100%;
  padding-bottom: 8px;

  font-size: 16px;
  color: var(--ndaify-accents-6);
  font-weight: 200;

  @media screen and (min-width: 992px) {
    font-size: 20px;
  }
`;

const FieldDesc = styled.div`
  width: 100%;
  padding-top: 1pc;

  font-size: 16px;
  color: var(--ndaify-accents-9);
  font-weight: 200;

  @media screen and (min-width: 992px) {
    font-size: 20px;
  }
`;

const Wizard = () => {
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

      // clear the caches so we don't show stale data for a different key
      queryCaches.forEach((cache) => cache.clear());

      viewport.exitFullscreen();
      setBlockState({
        route: 'home',
      });
    } catch (error) {
      await globalConfig.setAsync('NDAIFY_API_KEY', null);

      // eslint-disable-next-line no-console
      console.error(error);
      setStatus({ errorMessage: error.message });
    }
  };
  const onSubmit = useCallback(handleSubmit, [globalConfig, setBlockState, viewport]);

  const initialValues = {
    apiKey: '',
  };

  return (
    <>
      <SettingsButton show={false} />
      <Airtable.Box height="calc(100vh - 80px)" overflow="scroll" display="flex" flexDirection="column" marginBottom="80px">
        <Formik
          initialValues={initialValues}
          validateOnChange={false}
          validateOnBlur={Object.keys(initialValues).length > 1}
          validate={onFormValidate}
          onSubmit={onSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form style={{ height: '100%', marginBottom: '1pc' }}>

              <Airtable.Box display="flex" height="100%" width="100%" flexDirection="column">
                <Airtable.Box display="flex" flexDirection="column" flex="1">
                  <Airtable.Box padding="2pc 2pc 4pc 2pc" margin="0">
                    <NDAifyHeading style={{ paddingBottom: '8px' }}>
                      Set up your NDAify account
                    </NDAifyHeading>
                    <Paragraph style={{ paddingBottom: '2pc' }}>
                      To use this block, you need to sign up for NDAify.
                    </Paragraph>

                    <Airtable.Box display="flex" flexDirection="row" paddingBottom="2pc">
                      <Airtable.Box display="flex" flexDirection="row">
                        <WizardStepNum>
                          1
                        </WizardStepNum>
                      </Airtable.Box>
                      <Airtable.Box display="flex" flexDirection="column">
                        <StepTitle>
                          Sign up or log in to NDAify
                        </StepTitle>
                        <StepDesc style={{ paddingBottom: '4px' }}>
                          <a href="https://ndaify.com/login" target="_blank" rel="noopener noreferrer">Sign up</a>
                          {' '}
                          for a NDAify account or log in to your existing account.
                        </StepDesc>
                      </Airtable.Box>
                    </Airtable.Box>

                    <Airtable.Box display="flex" flexDirection="row">
                      <Airtable.Box display="flex" flexDirection="row">
                        <WizardStepNum>
                          2
                        </WizardStepNum>
                      </Airtable.Box>
                      <Airtable.Box display="flex" flexDirection="column" width="100%">
                        <StepTitle>
                          Save your NDAify API credentials
                        </StepTitle>
                        <StepDesc>
                          Go to the
                          {' '}
                          <a href="https://ndaify.com/dev/keys" target="_blank" rel="noopener noreferrer">API Keys</a>
                          {' '}
                          and click &quot;Create API Key&quot;.
                        </StepDesc>

                        {
                          status ? (
                            <ErrorMessage style={{ marginTop: '2pc', marginBottom: '0pc' }}>
                              {status.errorMessage}
                            </ErrorMessage>
                          ) : null
                        }

                        <InputContainer>
                          <FieldLabel>
                            Paste your NDAify API key below:
                          </FieldLabel>
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
                          <FieldDesc>
                            Note: the API credentials will be visible to all collaborators.
                          </FieldDesc>
                        </InputContainer>

                      </Airtable.Box>
                    </Airtable.Box>

                  </Airtable.Box>
                </Airtable.Box>

                <Airtable.Box backgroundColor="rgb(var(--ndaify-bg))" position="fixed" bottom="0" left="0" width="100%" padding="0 2pc" display="flex" justifyContent="flex-end" alignItems="center" height="80px" borderTop="thick">
                  <Pager numPages={2} activeIndex={1} />
                  <Airtable.Button
                    type="submit"
                    variant="default"
                    size="large"
                    disabled={!isEnabled || isSubmitting}
                    style={{ backgroundColor: 'var(--ndaify-accents-success)', color: 'var(--ndaify-button-fg)' }}
                  >
                    Save
                  </Airtable.Button>
                </Airtable.Box>
              </Airtable.Box>

            </Form>
          )}
        </Formik>

      </Airtable.Box>
    </>
  );
};

export default Wizard;
