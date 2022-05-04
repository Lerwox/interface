import { useCallback, useState } from 'react'
import styled from 'styled-components'
import GoogleLogin from 'react-google-login'

import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import Input from '@/components/Input'
import { TYPE } from '@/styles/theme'
import { PrimaryButton, CustomGoogleLogin } from '@/components/Button'
import { AuthMode } from '@/state/auth/actions'
import {
  useAuthForm,
  useAuthActionHanlders,
  useSetAuthMode,
  useSignInMutation,
  useGoogleAuthMutation,
} from '@/state/auth/hooks'
import { useAuthModalToggle } from '@/state/application/hooks'
import Separator from '@/components/Separator'

import Close from '@/images/close.svg'

const StyledClose = styled(Close)`
  width: 20px;
  height: 20px;
  cursor: pointer;
`

const StyledForm = styled.form`
  width: 100%;
`

const SwitchAuthModeButton = styled(TYPE.subtitle)`
  display: inline;
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
`

const SubmitButton = styled(PrimaryButton)`
  height: 55px;
  margin: 12px 0;
`

interface SignInFormProps {
  onSuccessfulConnexion: (accessToken?: string) => void
}

export default function SignInForm({ onSuccessfulConnexion }: SignInFormProps) {
  // Loading
  const [loading, setLoading] = useState(false)

  // graphql
  const [signInMutation, signInResult] = useSignInMutation()
  const [googleAuthMutation, googleAuthResult] = useGoogleAuthMutation()

  // fields
  const { email, password } = useAuthForm()
  const { onEmailInput, onPasswordInput } = useAuthActionHanlders()

  // modal
  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  // google oauth
  const handleGoogleLogin = useCallback(
    async (googleData) => {
      if (googleData.tokenId) {
        googleAuthMutation({ variables: { token: googleData.tokenId } })
          .then((res: any) => onSuccessfulConnexion(res?.data?.googleAuth?.accessToken))
          .catch((err: Error) => {
            console.error(err)
            setLoading(false)
          })
      }
    },
    [googleAuthMutation, onSuccessfulConnexion, setLoading]
  )

  // errors
  const [error, setError] = useState<{ message?: string; id?: string }>({})

  // signin
  const handleSignIn = useCallback(
    (event) => {
      event.preventDefault()

      setLoading(true)

      signInMutation({ variables: { email, password } })
        .then((res: any) => onSuccessfulConnexion(res?.data?.signIn?.accessToken))
        .catch((signInError: Error) => {
          const error = signInError?.graphQLErrors?.[0]
          if (error) setError({ message: error.message, id: error.extensions?.id })
          else if (!loading) setError({})

          console.error(signInError)
          setLoading(false)
        })
    },
    [email, password, signInMutation, onSuccessfulConnexion, setLoading]
  )

  return (
    <>
      <RowCenter justify="space-between" style={{ padding: '0 8px' }}>
        <TYPE.large>Connection</TYPE.large>
        <StyledClose onClick={toggleAuthModal} />
      </RowCenter>

      <StyledForm key="sign-in-form" onSubmit={handleSignIn} novalidate>
        <Column gap={20}>
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <>
              <GoogleLogin
                render={(renderProps) => <CustomGoogleLogin {...renderProps} />}
                clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
                buttonText="Log in with Google"
                onSuccess={handleGoogleLogin}
                onFailure={handleGoogleLogin}
                cookiePolicy={'single_host_origin'}
              />
              <Separator>or</Separator>
            </>
          )}

          <Column gap={12}>
            <Input
              id="email"
              value={email}
              placeholder="E-mail"
              type="email"
              autoComplete="email"
              onUserInput={onEmailInput}
              error={error?.id !== 'email' || loading}
            />
            <Input
              id="password"
              value={password}
              placeholder="Password"
              type="password"
              autoComplete="password"
              onUserInput={onPasswordInput}
              error={error?.id !== 'password' || loading}
            />
          </Column>

          <Column gap={12}>
            <SubmitButton type="submit" large>
              {loading ? 'Loading ...' : 'Submit'}
            </SubmitButton>
          </Column>
        </Column>
      </StyledForm>

      <Column gap={12} style={{ padding: '0 8px' }}>
        <TYPE.subtitle clickable>Forgot your password?</TYPE.subtitle>
        <TYPE.subtitle>
          No account?&nbsp;
          <SwitchAuthModeButton onClick={() => setAuthMode(AuthMode.SIGN_UP)}>Join Rules</SwitchAuthModeButton>
        </TYPE.subtitle>
      </Column>
    </>
  )
}
