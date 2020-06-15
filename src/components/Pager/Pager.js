import React from 'react';
import styled from 'styled-components';

const PagerContainer = styled.div`
  display: flex;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

const Circle = styled.div`
  margin: 0 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  ${(props) => (props.active ? 'background-color: var(--ndaify-accents-8);' : 'background-color: var(--ndaify-accents-5);')}
`;

const Pager = ({ numPages, activeIndex }) => (
  <PagerContainer>
    {
      new Array(numPages).fill().map((value, ii) => (
        // eslint-disable-next-line react/no-array-index-key
        <Circle key={ii} active={activeIndex === ii} />
      ))
    }
  </PagerContainer>
);

export default Pager;
