import React, { FC, ForwardedRef, forwardRef } from 'react';

import styled, { css } from 'styled-components';

import browser from 'src/common/utils/browser';
import { animation, colors, px, typography } from 'src/styles';

export const RIGHT_PADDING = 8;

export interface InputFieldBaseProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | JSX.Element;
  helperText?: string;
  error?: boolean | string; // TODO: remove `boolean` when migration to v0.9 is complete
  disabled?: boolean;
}
type InputFieldShellProps = React.PropsWithChildren<InputFieldBaseProps>;

export interface InputFieldProps
  extends InputFieldBaseProps,
    React.InputHTMLAttributes<HTMLInputElement> {
  type?: 'email' | 'password' | 'text' | 'date' | 'number';
  endExtra?: { component: JSX.Element; extraWidth: number };
  lighten?: boolean;
}

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${px(8)};
`;

export const InputWrapper = styled.div<Pick<InputFieldProps, 'endExtra'>>`
  max-height: ${px(56)};
`;

export const ExtraWrapper = styled.div<Pick<InputFieldProps, 'endExtra'>>`
  > svg {
    position: relative;
    bottom: ${browser.isSafari ? px(43) : px(41)};
    left: ${({ endExtra }) => `calc(100% - ${px((endExtra?.extraWidth || 0) + RIGHT_PADDING)})`};
  }
`;

const getDefaultBackgroundColor = ({ error, lighten }: InputFieldProps) => {
  if (error) {
    return colors.updStatusError10;
  }

  return lighten ? colors.updSurface : colors.updBackground;
};

export const StyledTextField = styled.input<InputFieldProps>`
  ${typography.bodyMediumRegular};
  color: ${({ error }) => (error ? colors.updStatusErrorText : colors.updTextPrimary)};
  box-sizing: border-box;
  height: ${px(56)};
  width: 100%;
  margin: 0;
  padding: ${px(16)};
  background-color: ${getDefaultBackgroundColor};
  border: ${px(1)} solid ${getDefaultBackgroundColor};
  border-radius: ${px(4)};
  transition: border 300ms ${animation.defaultTiming};
  caret-color: ${({ error }) => (error ? colors.updStatusErrorText : colors.updTextPrimaryBlue)};

  &:hover:enabled {
    border-color: ${({ error }) => (error ? 'transparent' : colors.updPrimaryHovered)};
  }

  &:active:enabled,
  &:focus-visible {
    outline: none;
    border-color: ${({ error }) => (error ? 'transparent' : colors.updPrimary)};
  }

  &:disabled {
    color: ${colors.updDisabled};
    border-color: ${colors.updDisabled20};
    background-color: ${colors.updDisabled20};
  }

  &::placeholder {
    color: ${colors.updTextSecondaryGray};
  }

  &:disabled::placeholder {
    color: ${colors.updDisabled};
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    ${({ error, disabled, theme }) => css`
      border: ${px(1)} solid
        ${(disabled && theme.colors.updDisabled20) ||
        (error ? theme.colors.updStatusError10 : theme.colors.updPrimary)};
      transition: background-color 5000s ease-in-out 0s;
      -webkit-text-fill-color: ${disabled
        ? theme.colors.updTextDisabled
        : theme.colors.updTextDisabled};
    `};
  }

  &:-webkit-autofill:focus {
    border-color: ${({ error }) => (error ? 'transparent' : colors.updPrimary)};
  }
`;

interface BlockStatus {
  disabled?: boolean;
  error?: boolean;
}

export const Label = styled.div<BlockStatus>`
  ${typography.bodyMediumSemibold};
  color: ${({ error }) => (error ? colors.updStatusErrorText : colors.updTextPrimary)};
  height: ${px(18)};
`;

export const InputDescription = styled.div<BlockStatus>`
  ${typography.bodySmallRegular};
  color: ${({ error }) => (error ? colors.updStatusErrorText : colors.updTextPrimary)};
  gap: ${px(8)};
  height: ${px(18)};
`;

export const InputErrorText = styled.div<{ withOffset?: boolean }>`
  ${typography.bodySmallRegular};
  color: ${colors.updStatusErrorText};
  padding-left: ${({ withOffset }) => withOffset && px(16)};
  height: ${px(17)};
`;

export const InputFieldShell: FC<InputFieldShellProps> = ({
  label,
  helperText,
  error,
  className,
  disabled,
  children,
}) => (
  <InputContainer className={className}>
    {helperText && (
      <Label error={!!error} disabled={disabled}>
        {label}
      </Label>
    )}
    <InputDescription error={!!error} disabled={disabled}>
      {helperText || label || <>&nbsp;</>}
    </InputDescription>
    <InputWrapper>{children}</InputWrapper>
    <InputErrorText withOffset={!helperText}>
      {typeof error === 'string' ? error : <>&nbsp;</>}
    </InputErrorText>
  </InputContainer>
);

const InputField = forwardRef(
  (
    {
      type,
      helperText,
      error,
      label,
      endExtra,
      disabled,
      className,
      ...restProps
    }: InputFieldProps,
    ref: ForwardedRef<HTMLInputElement>
  ): JSX.Element => (
    <InputFieldShell
      label={label}
      helperText={helperText}
      error={error}
      className={className}
      disabled={disabled}
    >
      <StyledTextField
        ref={ref}
        error={error}
        type={type}
        disabled={disabled}
        endExtra={endExtra}
        {...restProps}
      />
      <ExtraWrapper endExtra={endExtra}>{endExtra?.component}</ExtraWrapper>
    </InputFieldShell>
  )
);

export default InputField;