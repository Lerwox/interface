import React, { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'
import { WeiAmount } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'

const StyledEtherInput = styled(RowCenter)`
  padding: 12px;
  background: ${({ theme }) => theme.bg5};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 4px;
  box-sizing: border-box;
  width: 100%;
  gap: 12px;

  :focus-within {
    outline: ${({ theme }) => theme.primary1} solid 2px;
    outline-offset: -1px;
  }

  & * {
    font-weight: 400;
  }

  & > div:first-child {
    flex-shrink: 0;
  }
`

const Input = styled.input`
  background: transparent;
  border: none;
  font-size: 26px;
  outline: none;
  width: 100%;
  text-align: right;

  &::placeholder {
    color: ${({ theme }) => theme.text2};
  }

  :-webkit-autofill,
  :-webkit-autofill:focus {
    transition: background-color 600000s 0s, color 600000s 0s;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  -moz-appearance: textfield;
`

interface EtherInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string // avoid string[] | number value
  onUserInput: (value: string) => void
}

export default function EtherInput({ onUserInput, ...props }: EtherInputProps) {
  const [ethereumValue, setEthereumValue] = useState(props.value)
  const handleInput = useCallback(
    (event) => {
      const value = event?.target?.value?.replace(',', '.')
      if (value === '' || /^([0-9]{1,10}\.[0-9]{0,18}|[0-9]{1,10}\.?)$/.test(value)) onUserInput(value)
    },
    [onUserInput]
  )

  // focus
  const inputRef = useRef<HTMLInputElement>(null)
  const setInputFocus = useCallback(() => inputRef.current?.focus(), [inputRef])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  return (
    <StyledEtherInput onClick={setInputFocus}>
      <TYPE.large color="text2">
        <Trans>{weiAmountToEURValue(WeiAmount.fromEtherAmount(props?.value?.length ? props.value : 0))} EUR</Trans>
      </TYPE.large>
      <Input onChange={handleInput} ref={inputRef} {...props} />
      <TYPE.large>ETH</TYPE.large>
    </StyledEtherInput>
  )
}
