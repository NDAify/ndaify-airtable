import React from 'react';
import styled from 'styled-components';
import { FormattedDate } from 'react-intl';

import * as Airtable from '@airtable/blocks/ui';
import {
  useViewport,
  useBase,
  useWatchable,
  useRecords,
  useLoadable,
} from '@airtable/blocks/ui';

import { cursor } from '@airtable/blocks';
import { FieldType, ViewType } from '@airtable/blocks/models';

import SettingsButton from '../SettingsButton/SettingButton';
import Avatar from '../Avatar/Avatar';
import UserActionsDropdown from '../UserActionsDropdown/UserActionsDropdown';

import ButtonAnchor from '../Clickable/ButtonAnchor';
import NdaActionsDropdown from './NdaActionsDropdown';

const getFullNameFromUser = (user) => `${user.metadata.linkedInProfile.firstName} ${user.metadata.linkedInProfile.lastName}`;
const getRecipientEmail = (nda) => (
  nda.recipient
    ? nda.recipient.metadata.linkedInProfile.emailAddress
    : nda.recipientEmail
);

const CalendarIcon = () => (
  <svg
    width="19"
    height="20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M1.39 18.39V7.27h15.29v11.12H1.39zM5.56 5.185a.343.343 0 0 1-.348.348h-.695a.343.343 0 0 1-.347-.348V2.058c0-.196.152-.348.347-.348h.695c.196 0 .348.152.348.348v3.127zm8.34 0a.343.343 0 0 1-.348.348h-.695a.343.343 0 0 1-.347-.348V2.058c0-.196.152-.348.347-.348h.695c.196 0 .348.152.348.348v3.127zm4.17-.695a1.4 1.4 0 0 0-1.39-1.39h-1.39V2.058c0-.956-.782-1.738-1.738-1.738h-.695c-.955 0-1.737.782-1.737 1.738V3.1H6.95V2.058C6.95 1.102 6.168.32 5.212.32h-.695c-.955 0-1.737.782-1.737 1.738V3.1H1.39A1.4 1.4 0 0 0 0 4.49v13.9c0 .76.63 1.39 1.39 1.39h15.29a1.4 1.4 0 0 0 1.39-1.39V4.49z" fill="currentColor" />
  </svg>
);

const Container = styled.div`
  width: 100%;
  height: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
  flex-direction: column;
  box-sizing: border-box;
`;

const PageContainer = styled.div`
  padding: 0;
  padding-top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 768px;
  width: 100%;
  flex: 1;
  flex-direction: column;
  box-sizing: border-box;
`;

const DashboardActionRow = styled.div`
  padding-bottom: 1pc;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1pc;
`;

const LinksContainer = styled.div``;

const DropdownContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledLink = styled.a`
  font-size: 20px;
  color: var(--ndaify-fg);
  font-weight: 200;
  margin-right: 2pc;
  padding-bottom: 6px;
  border-bottom: ${({ active }) => active && '4px solid var(--ndaify-accents-9)'};
  cursor: pointer;
  text-decoration: none;

  :visited {
    color: var(--ndaify-fg);
  }

  @media screen and (min-width: 992px) {
    font-size: 24px;
  }
`;

const HistoryList = styled.div`
  width: 100%;
`;

const ItemCardContainer = styled.div`
  display: flex;
  border: 1px solid #4E5263;
  border-radius: var(--ndaify-accents-radius-1);
  margin-bottom: 1pc;
  text-decoration: none;

  ${(props) => (props.pending ? 'border-color: var(--ndaify-accents-9);' : '')}
`;

const HistoryItemContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: 1pc;
`;

const HistoryTimeRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 1pc;
`;

const CalendarIconWrapper = styled.div`
  margin-right: 1pc;
  
  svg {
    width: 24px;
    color: var(--ndaify-accents-6);
  }
`;

const EmptyHistoryList = styled.span`
  font-size: 20px;
  color: var(--ndaify-fg);
  font-weight: 700;

  @media screen and (min-width: 992px) {
    font-size: 24px;
  }
`;

const HistoryTimeText = styled.span`
  font-size: 20px;
  color: var(--ndaify-fg);
  font-weight: 200;

  @media screen and (min-width: 992px) {
    font-size: 24px;
  }
`;

const RecipientRow = styled.div`
  margin-bottom: 1pc;
`;

const HistoryItemTitle = styled.div`
  font-size: 16px;
  color: var(--ndaify-accents-6);
  width: 100%;
  line-height: 32px;
`;

const RecipientInfoText = styled.div`
  display: block;
  font-size: 20px;
  color: var(--ndaify-fg);
  font-weight: 200;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  @media screen and (min-width: 992px) {
    font-size: 24px;
  }
`;

const TypeAndStatusRow = styled.div`
  display: flex;
  flex-direction: column;

  @media screen and (min-width: 576px) {
    flex-direction: row;
  }
`;

const TypeContainer = styled.div`
  margin-right: 3pc;
`;

const StatusContainer = styled.div`

`;

const StatusText = styled(RecipientInfoText)`
  color: var(--ndaify-accents-9);
`;

const HistoryItemWrapper = styled.div`
  position: relative;
`;

const HistoryItemActions = styled.div`
  position: absolute;
  right: 1pc;
  top: 1pc;
`;

const NDA_STATUS_LABEL = {
  pending: 'Unsigned',
  signed: 'Signed',
  revoked: 'Revoked',
  declined: 'Declined',
};

const FilterDesc = styled.div`
  font-size: 16px;
  color: var(--ndaify-fg);
  font-weight: 200;
  width: 100%;
  padding-bottom: 1pc;

  @media screen and (min-width: 992px) {
    font-size: 18px;
  }
`;

const FilterItem = styled.span`
  font-weight: 400;

  :not(:first-child):before {
    content: ", ";
  }
`;

const HistoryItem = ({ dashboardType, ndaType, nda }) => (
  <HistoryItemWrapper>
    <HistoryItemActions>
      <NdaActionsDropdown nda={nda} />
    </HistoryItemActions>
    <ItemCardContainer pending={nda.metadata.status === 'pending'}>
      <HistoryItemContainer>
        <HistoryTimeRow>
          <CalendarIconWrapper>
            <CalendarIcon />
          </CalendarIconWrapper>
          <HistoryTimeText>
            <FormattedDate
              year="numeric"
              month="long"
              day="numeric"
              value={nda.createdAt}
            />
          </HistoryTimeText>
        </HistoryTimeRow>

        {
          dashboardType === 'incoming' ? (
            <RecipientRow>
              <HistoryItemTitle>Sender</HistoryItemTitle>
              <RecipientInfoText>{`${getFullNameFromUser(nda.owner)} <${nda.owner.metadata.linkedInProfile.emailAddress}>`}</RecipientInfoText>
            </RecipientRow>
          ) : (
            <RecipientRow>
              <HistoryItemTitle>Recipient</HistoryItemTitle>
              <RecipientInfoText>{`${nda.metadata.recipientFullName} <${nda.recipientEmail === 'void' ? nda.recipient.metadata.linkedInProfile.emailAddress : nda.recipientEmail}>`}</RecipientInfoText>
            </RecipientRow>
          )
        }
        <TypeAndStatusRow>
          <TypeContainer>
            <HistoryItemTitle>Type</HistoryItemTitle>
            <RecipientInfoText>
              {ndaType}
            </RecipientInfoText>
          </TypeContainer>
          <StatusContainer>
            <HistoryItemTitle>Status</HistoryItemTitle>
            <StatusText>{NDA_STATUS_LABEL[nda.metadata.status]}</StatusText>
          </StatusContainer>
        </TypeAndStatusRow>
      </HistoryItemContainer>
    </ItemCardContainer>
  </HistoryItemWrapper>
);

const DashboardView = ({
  user,
  ndas,
  activeTable,
  ndaTemplateOptions,
}) => {
  const isGridView = cursor.activeViewId && activeTable.getViewById(
    cursor.activeViewId,
  ).type === ViewType.GRID;

  const emailFields = activeTable.fields.filter(
    (field) => field.type === FieldType.EMAIL,
  );
  const allRecords = useRecords(activeTable.selectRecords());
  const selectedRecords = allRecords.filter(
    (record) => cursor.selectedRecordIds.includes(record.id),
  );
  const selectedEmails = selectedRecords.flatMap(
    (selectedRecord) => emailFields.map((ef) => selectedRecord.getCellValue(ef)),
  ).filter(Boolean);

  const byOugoing = (nda) => nda.ownerId === user.userId;
  const bySelectedEmails = (nda) => selectedEmails.includes(getRecipientEmail(nda));

  const filteredNdas = ndas.filter(byOugoing).filter(
    isGridView && selectedEmails.length ? bySelectedEmails : Boolean,
  );

  const dashboardType = 'outgoing';

  return (
    <Container>
      <PageContainer>

        <DashboardActionRow>
          <LinksContainer>
            <StyledLink active>Sent</StyledLink>
          </LinksContainer>

          <DropdownContainer>
            <ButtonAnchor
              href="https://ndaify.com/dashboard/incoming"
              target="_blank"
              rel="noreferrer noopener"
              outline
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            >
              <Avatar user={user} />

              <span>
                Inbox
              </span>
            </ButtonAnchor>

            <UserActionsDropdown user={user} />
          </DropdownContainer>
        </DashboardActionRow>

        {
          (selectedEmails.length > 0 && filteredNdas.length > 0) ? (
            <FilterDesc>
              Showing NDAs for
              {' '}
              {selectedEmails.map((email, ii) => (
                // eslint-disable-next-line react/no-array-index-key
                <FilterItem key={`${email}-${ii}`}>
                  {`${email}`}
                </FilterItem>
              ))}
            </FilterDesc>
          ) : null
        }

        {
          (selectedEmails.length > 0 && filteredNdas.length === 0) ? (
            <FilterDesc>
              No NDAs found for
              {' '}
              {selectedEmails.map((email, ii) => (
                // eslint-disable-next-line react/no-array-index-key
                <FilterItem key={`${email}-${ii}`}>
                  {`${email}`}
                </FilterItem>
              ))}
            </FilterDesc>
          ) : null
        }

        {
          (selectedEmails.length === 0 && filteredNdas.length === 0) ? (
            <EmptyHistoryList>
              You have not sent NDAs
            </EmptyHistoryList>
          ) : null
        }

        {
          filteredNdas.length > 0 ? (
            <HistoryList>
              {
                filteredNdas.map((nda) => (
                  <HistoryItem
                    key={nda.ndaId}
                    nda={nda}
                    dashboardType={dashboardType}
                    ndaType={
                      ndaTemplateOptions.find(
                        (option) => option.ndaTemplateId === nda.metadata.ndaTemplateId,
                      ).data.title
                    }
                  />
                ))
              }
            </HistoryList>
          ) : null
        }

      </PageContainer>
    </Container>
  );
};

const Home = ({ user, ndas, ndaTemplateOptions }) => {
  const viewport = useViewport();

  useLoadable(cursor);
  useWatchable(cursor, ['activeTableId', 'activeViewId', 'selectedRecordIds']);

  const base = useBase();
  const activeTable = base.getTableByIdIfExists(cursor.activeTableId);

  // activeTable is briefly null when switching to a newly created table.
  if (!activeTable) {
    // TODO display a spinner here?
    return null;
  }

  return (
    <>
      <SettingsButton show />

      {/* <Airtable.Dialog onClose={() => {}} maxWidth={400}>
        <Airtable.Dialog.CloseButton />
        <Airtable.Heading size="small">Can&apos;t preview URL</Airtable.Heading>
        <Airtable.Text variant="paragraph" marginBottom={0}>
          {activeTable.name}
        </Airtable.Text>
      </Airtable.Dialog> */}

      <Airtable.Box
        position={viewport.isFullscreen ? 'absolute' : 'unset'}
        top={0}
        left={0}
        right={0}
        bottom={0}
      >
        <Airtable.Box display="flex" height="100vh" flexDirection="column">
          <Airtable.Box display="flex" flexDirection="column" flex="1">
            <Airtable.Box padding="1pc" margin="0">
              <DashboardView
                user={user}
                ndas={ndas}
                activeTable={activeTable}
                ndaTemplateOptions={ndaTemplateOptions}
              />
            </Airtable.Box>
          </Airtable.Box>
        </Airtable.Box>
      </Airtable.Box>
    </>
  );
};

export default Home;
