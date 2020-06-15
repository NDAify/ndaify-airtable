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
import Pager from '../Pager/Pager';
import Input from '../Input/Input';

import useStateRouter from '../../lib/useStateRouter';

import { timeout } from '../../util';
import NdaifyService from '../../services/NDAifyService';

  const NDAifyHeading = styled.div`
  margin: 0; 
  padding: 0; 
  color: #FFFFFF; 
  font-size: 32px;
  font-weight: 200;
`;

const Paragraph = styled.div`
  color: #AAAAAA;
  margin: 0;
  padding: 0;
  font-size: 20px;
  font-weight: 400;
  line-height: 28px;
`;

const WizardStepNum = styled.div`
    margin: 0; 
    padding: 0 24px 0 8px;
    color: #FFFFFF; 
    font-size: 36px;
    font-weight: 400; 
    line-height: 28px;
`;

const StepTitle = styled.div`
    margin: 0;
    padding: 0;
    color: #FFFFFF;
    font-size: 20px; 
    font-weight: 400; 
    line-height: 28px;
    padding-bottom: 4px;
`;

const StepDesc = styled.div`
    margin: 0;
    padding: 0;
    color: #FFFFFF;
    font-size: 16px; 
    font-weight: 200; 
    line-height: 28px;

    a {
        text-decoration: underline;
        color: #FFFFFF;
      }
    
      a:visited {
        color: #FFFFFF;
      }
`;

const InputContainer = styled.div`
  margin-top: 2pc;
  margin-bottom: 2pc;
`;

const Wizard = () => {
    const [blockState, setBlockState] = useStateRouter();

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
            await globalConfig.setAsync('NDAIFY_API_KEY', null);

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
        <Box minHeight="100vh">
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
                        <Box display="flex" flexDirection="column" flex="1" textColor="#FFFFFF">
                            <Box padding="2pc 2pc 4pc 2pc" margin="0">
                                <NDAifyHeading style={{ paddingBottom: '8px', }}>
                                    Set up your NDAify account
                                </NDAifyHeading>
                                <Paragraph style={{ paddingBottom: '2pc', }}>
                                    To use this block, you need to sign up for NDAify.
                                </Paragraph>

                                <Box display="flex" flexDirection="row" paddingBottom="2pc">
                                    <Box display="flex" flexDirection="row">
                                        <WizardStepNum>
                                            1
                                        </WizardStepNum>
                                    </Box>
                                    <Box display="flex" flexDirection="column">
                                        <StepTitle>
                                            Sign up or log in to NDAify
                                        </StepTitle>
                                        <StepDesc style={{ paddingBottom: '4px', }}>
                                            <a href="https://ndaify.com/login" target="_blank" rel="noopener noreferrer">Sign up</a>
                                            {' '}
                                            for a NDAify account or log in to your existing account.
                                        </StepDesc>
                                    </Box>
                                </Box>

                                <Box display="flex" flexDirection="row">
                                    <Box display="flex" flexDirection="row">
                                        <WizardStepNum>
                                            2
                                        </WizardStepNum>
                                    </Box>
                                    <Box display="flex" flexDirection="column" width="100%">
                                        <StepTitle>
                                            Save your NDAify API credentials
                                        </StepTitle>
                                        <StepDesc>
                                            Go to the 
                                            {' '}
                                            <a href="https://ndaify.com/dev/keys" target="_blank" rel="noopener noreferrer">API Keys</a>
                                            {' '}
                                            and click "Create API Key".
                                        </StepDesc>

                                        {
                                            status ? (
                                                <ErrorMessage style={{  marginTop: '2pc', marginBottom: '0pc' }}>
                                                    {status.errorMessage}
                                                </ErrorMessage>
                                            ) : null
                                        }

                                        <InputContainer>
                                            <FormikField
                                                as={Input}
                                                name="apiKey"
                                                placeholder={'NDAify API Key'}

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

                        <Box padding="0 2pc" display="flex" justifyContent="flex-end" alignItems="center" height="80px" borderTop="thick" textColor="#FFFFFF">
                            <Pager numPages={2} activeIndex={1} />
                            <Button
                                type="submit"
                                variant="default"
                                size="large"
                                backgroundColor="#4AC09A"
                                disabled={!isEnabled || isSubmitting}
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
}

export default Wizard;
