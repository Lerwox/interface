import { useCallback, useMemo, useState, useEffect } from 'react'
import { useLazyQuery, gql } from '@apollo/client'
import algoliasearch, { SearchIndex } from 'algoliasearch'

import { useAppSelector, useAppDispatch } from 'src/state/hooks'
import {
  updateMarketplaceScarcityFilter,
  updateMarketplaceSeasonsFilter,
  updateMarketplaceLowSerialsFilter,
  updateCardsScarcityFilter,
  updateCardsSeasonsFilter,
} from './actions'

export const ASSETS_PAGE_SIZE = 25

const ALL_STARKNET_TRANSACTION_FOR_USER_QUERY = gql`
  query ($address: String, $userId: String!, $after: String) {
    allStarknetTransactionsForAddressOrUserId(address: $address, userId: $userId, after: $after) {
      nodes {
        hash
        status
        fromAddress
        blockNumber
        blockTimestamp
        actualFee
        code
        events {
          key
          data
        }
        l2ToL1Messages {
          fromAddress
          toAddress
          payload
        }
        offchainData {
          action
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`

const ALL_CURRENT_USER_NOTIFICATIONS_QUERY = gql`
  query CurrentUserNotifications($after: String) {
    currentUser {
      notifications(after: $after) {
        nodes {
          __typename
          ... on EtherRetrieveNotification {
            createdAt
            amount
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`

// Marketplace

export function useMarketplaceFilters() {
  return useAppSelector((state) => state.search.marketplaceFilters)
}

export function useCardsFilters() {
  return useAppSelector((state) => state.search.cardsFilters)
}

export function useMarketplaceFiltersHandlers(): {
  toggleScarcityFilter: (scarcity: number) => void
  toggleSeasonFilter: (season: number) => void
  toggleLowSerialsFilter: () => void
} {
  const dispatch = useAppDispatch()

  const toggleScarcityFilter = useCallback(
    (scarcity: number) => {
      dispatch(updateMarketplaceScarcityFilter({ scarcity }))
    },
    [dispatch]
  )

  const toggleSeasonFilter = useCallback(
    (season: number) => {
      dispatch(updateMarketplaceSeasonsFilter({ season }))
    },
    [dispatch]
  )

  const toggleLowSerialsFilter = useCallback(() => {
    dispatch(updateMarketplaceLowSerialsFilter())
  }, [dispatch])

  return {
    toggleScarcityFilter,
    toggleSeasonFilter,
    toggleLowSerialsFilter,
  }
}

export function useCardsFiltersHandlers(): {
  toggleScarcityFilter: (scarcity: number) => void
  toggleSeasonFilter: (season: number) => void
} {
  const dispatch = useAppDispatch()

  const toggleScarcityFilter = useCallback(
    (scarcity: number) => {
      dispatch(updateCardsScarcityFilter({ scarcity }))
    },
    [dispatch]
  )

  const toggleSeasonFilter = useCallback(
    (season: number) => {
      dispatch(updateCardsSeasonsFilter({ season }))
    },
    [dispatch]
  )

  return { toggleScarcityFilter, toggleSeasonFilter }
}

// algolia

const client = algoliasearch(process.env.REACT_APP_ALGOLIA_ID ?? '', process.env.REACT_APP_ALGOLIA_KEY ?? '')
const algoliaIndexes = {
  users: {
    certified: client.initIndex('users'),
  },
}

export interface PageFetchedCallbackData {
  pageNumber: number
  totalHitsCount: number
}

export type PageFetchedCallback = (hits: any[], data: PageFetchedCallbackData) => void

export type UsersSortingKey = keyof typeof algoliaIndexes.users

interface AlgoliaSearch {
  nextPage: () => void
  hasNext: boolean
  hits?: any[]
  nbHits?: number
  loading: boolean
  error: string | null
}

interface ApolloSearch {
  nextPage?: () => void
  data: any[]
  loading: boolean
  error: any
}

type FacetFilters = Record<string, string | string[] | undefined>

function useFacetFilters(facets: FacetFilters) {
  return useMemo(
    () =>
      Object.keys(facets).reduce<(string | string[])[]>((acc, facetKey) => {
        const facet = facets[facetKey]

        if (!facet) {
          return acc
        } else if (Array.isArray(facet)) {
          const arr: string[] = []

          // push dashed facets in the root array and the rest in a child array
          for (const value of facet) {
            ;(value.indexOf('-') === 0 ? acc : arr).push(`${facetKey}:${value}`)
          }

          if (arr.length) acc.push(arr)
        } else {
          acc.push(`${facetKey}:${facet}`)
        }

        return acc
      }, []),
    [JSON.stringify(facets)]
  )
}

// ALGOLIA SEARCHES

const ALGOLIA_FIRST_PAGE = 0

interface AlgoliaSearchProps {
  search?: string
  facets: FacetFilters
  numericFilters?: string[]
  algoliaIndex: SearchIndex
  hitsPerPage: number
  onPageFetched?: PageFetchedCallback
  pageNumber?: number
}

function useAlgoliaSearch({
  search = '',
  facets = {},
  algoliaIndex,
  hitsPerPage,
  onPageFetched,
  pageNumber = ALGOLIA_FIRST_PAGE,
}: AlgoliaSearchProps): AlgoliaSearch {
  const [searchResult, setSearchResult] = useState<Omit<AlgoliaSearch, 'hasNext' | 'nextPage'>>({
    loading: false,
    error: null,
  })
  const [pageOffset, setPageOffset] = useState<number | null>(0)

  const facetFilters = useFacetFilters({ ...facets })

  // search callback
  const runSearch = useCallback(
    (pageNumber: number) => {
      setSearchResult((searchResult) => ({ ...searchResult, loading: true, error: null }))

      algoliaIndex
        .search(search, { facetFilters, page: pageNumber, hitsPerPage })
        .then((res: any) => {
          setSearchResult((searchResult) => ({
            hits: onPageFetched ? [] : (searchResult.hits ?? []).concat(res.hits),
            nbHits: res.nbHits,
            loading: false,
            error: null,
          }))

          // increase page offset if possible
          setPageOffset((pageOffset) => (res.page + 1 < res.nbPages ? (pageOffset ?? 0) + 1 : null))

          if (onPageFetched) onPageFetched(res.hits, { pageNumber: res.page, totalHitsCount: res.nbHits })
        })
        .catch((err: string) => {
          setSearchResult({ loading: false, error: err })
          console.error(err)
        })
    },
    [algoliaIndex, facetFilters, hitsPerPage, search, onPageFetched]
  )

  // next page callback
  const nextPage = useCallback(() => {
    if (pageOffset !== null) runSearch(pageNumber + pageOffset)
  }, [runSearch, pageNumber, pageOffset])

  // refresh
  useEffect(() => {
    setPageOffset(0)
    runSearch(pageNumber)
  }, [runSearch])

  return {
    nextPage: () => (pageOffset === null ? undefined : nextPage()),
    hasNext: !!pageOffset,
    ...searchResult,
  }
}

// USERS

interface SearchUsersProps {
  search?: string
  onPageFetched?: PageFetchedCallback
  facets?: {
    username?: string
    userId?: string
  }
}

export function useSearchUsers({ search = '', facets = {}, onPageFetched }: SearchUsersProps) {
  return useAlgoliaSearch({
    facets: { ...facets, userId: undefined, objectID: facets.userId },
    search,
    algoliaIndex: algoliaIndexes.users['certified'],
    hitsPerPage: 10,
    onPageFetched,
  })
}

// Non algolia search

export function useStarknetTransactionsForAddress(userId?: string, address?: string): ApolloSearch {
  // pagination cursor and page
  const [endCursor, setEndCursor] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [starknetTransactions, setStarknetTransactions] = useState<any[]>([])

  // on query completed
  const onQueryCompleted = useCallback(
    (data: any) => {
      if (!data) return

      setEndCursor(data.allStarknetTransactionsForAddressOrUserId.pageInfo.endCursor)
      setHasNextPage(data.allStarknetTransactionsForAddressOrUserId.pageInfo.hasNextPage)

      setStarknetTransactions(starknetTransactions.concat(data.allStarknetTransactionsForAddressOrUserId.nodes))
    },
    [starknetTransactions.length]
  )

  // get callable query
  const [getAllStarknetTransactionsForAddressOrUserId, { loading, error }] = useLazyQuery(
    ALL_STARKNET_TRANSACTION_FOR_USER_QUERY,
    { onCompleted: onQueryCompleted }
  )

  // nextPage
  const nextPage = useCallback(() => {
    const options: any = { variables: { userId, after: endCursor } }

    if (address) options.variables.address = address

    getAllStarknetTransactionsForAddressOrUserId(options)
  }, [getAllStarknetTransactionsForAddressOrUserId, address, endCursor])

  useEffect(() => {
    if (userId) nextPage()
  }, [userId])

  return {
    nextPage: hasNextPage ? nextPage : undefined,
    data: starknetTransactions,
    loading,
    error,
  }
}

export function useCurrentUserNotifications(): ApolloSearch {
  // pagination cursor and page
  const [endCursor, setEndCursor] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  // on query completed
  const onQueryCompleted = useCallback(
    (data: any) => {
      setEndCursor(data?.currentUser?.notifications?.pageInfo?.endCursor ?? null)
      setHasNextPage(data?.currentUser?.notifications?.pageInfo?.hasNextPage ?? false)

      setNotifications(notifications.concat(data?.currentUser?.notifications?.nodes ?? []))
    },
    [notifications.length]
  )

  // get callable query
  const [getAllCurrentUserNotifications, { loading, error }] = useLazyQuery(ALL_CURRENT_USER_NOTIFICATIONS_QUERY, {
    onCompleted: onQueryCompleted,
  })

  // nextPage
  const nextPage = useCallback(() => {
    const options: any = { variables: { after: endCursor } }

    getAllCurrentUserNotifications(options)
  }, [getAllCurrentUserNotifications, endCursor])

  useEffect(() => {
    nextPage()
  }, [])

  return {
    nextPage: hasNextPage ? nextPage : undefined,
    data: notifications,
    loading,
    error,
  }
}
