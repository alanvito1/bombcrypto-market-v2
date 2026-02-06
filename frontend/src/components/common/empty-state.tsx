import React from "react";
import styled from "styled-components";

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, icon }) => {
  return (
    <Container role="status">
      {icon && <IconWrapper aria-hidden="true">{icon}</IconWrapper>}
      <Message>{message}</Message>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  width: 100%;
  min-height: 300px;
`;

const IconWrapper = styled.div`
  margin-bottom: 1rem;
  svg {
    width: 4rem;
    height: 4rem;
    fill: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.7;
  }
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 1.5rem;
  margin: 0;
`;

export default EmptyState;
