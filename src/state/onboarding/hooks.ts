import { useCallback } from 'react'

import { AppState } from 'src/state'
import { useAppDispatch, useAppSelector } from 'src/state/hooks'
import { setOnboardingPage, OnboardingPage } from './actions'

export function useOnboardingPage(): AppState['onboarding']['onboardingPage'] {
  return useAppSelector((state: AppState) => state.onboarding.onboardingPage)
}

export function useSetOnboardingPage(): (onboardingPage: OnboardingPage) => void {
  const dispatch = useAppDispatch()
  return useCallback((onboardingPage: OnboardingPage) => dispatch(setOnboardingPage({ onboardingPage })), [dispatch])
}
