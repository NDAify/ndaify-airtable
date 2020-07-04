import React from 'react';
import styled from 'styled-components';

const CloseImg = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M15.0051 2.48104L2.46301 15.1149C2.26734 15.312 1.98881 15.4095 1.68868 15.3859C1.38854 15.3623 1.0914 15.2196 0.862622 14.9891C0.633841 14.7587 0.492158 14.4594 0.468744 14.157C0.445329 13.8547 0.5421 13.5741 0.737769 13.377L13.2798 0.743166C13.4755 0.546065 13.754 0.448585 14.0542 0.472171C14.3543 0.495757 14.6515 0.638477 14.8802 0.868933C15.109 1.09939 15.2507 1.3987 15.2741 1.70103C15.2975 2.00336 15.2008 2.28394 15.0051 2.48104Z" fill="currentColor" />
    <path d="M13.537 15.2568L0.994916 2.62296C0.799247 2.42586 0.702476 2.14528 0.725891 1.84295C0.749305 1.54062 0.890988 1.24131 1.11977 1.01085C1.34855 0.780394 1.64569 0.637675 1.94582 0.614089C2.24595 0.590503 2.52449 0.687983 2.72016 0.885083L15.2622 13.519C15.4579 13.7161 15.5547 13.9966 15.5313 14.299C15.5078 14.6013 15.3662 14.9006 15.1374 15.1311C14.9086 15.3615 14.6115 15.5042 14.3113 15.5278C14.0112 15.5514 13.7327 15.4539 13.537 15.2568Z" fill="currentColor" />
  </svg>
);

const CloseIcon = styled(CloseImg)`
  color: var(--ndaify-accents-0);
`;

const Container = styled.div`
  background-color: var(--ndaify-fg);
  color: var(--ndaify-accents-0);
  padding: 8px;
  padding-left: 12px;
  border-radius: var(--ndaify-accents-radius-1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 20px 100px -20px rgba(50,50,93,0.25), 0 -18px 60px -10px rgba(0,0,0,0.02);
  min-width: 300px;
  font-size: 16px;

  @media screen and (min-width: 992px) {
    font-size: 20px;
  }
`;

const AlertText = styled.span`
  flex: 1;
`;

const CloseButton = styled.button`
  margin: 0;
  padding: 0;
  margin-left: 6px;
  border: none;
  background-color: transparent;
  cursor: pointer;
`;

const Alert = ({
  message,
  style,
  close,
}) => (
  <Container style={style}>
    <AlertText>{message}</AlertText>
    <CloseButton type="button" onClick={close}>
      <CloseIcon />
    </CloseButton>
  </Container>
);

export default Alert;
