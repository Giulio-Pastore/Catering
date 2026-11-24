import {
  ALLERGY_QUICK_OPTIONS,
  GUEST_MAX,
  GUEST_MIN,
} from '@shared/constants/limits'
import type { PaymentMethod } from '@shared/types'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'convivio_booking_draft'

export interface BookingDraft {
  packageId: string | null
  guestCount: number
  allergyTags: string[]
  allergyNotes: string
  substitutions: Record<string, string>
  paymentMethod: PaymentMethod | null
}

const defaultDraft: BookingDraft = {
  packageId: null,
  guestCount: GUEST_MIN,
  allergyTags: [],
  allergyNotes: '',
  substitutions: {},
  paymentMethod: null,
}

function loadDraft(): BookingDraft {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultDraft
    const parsed = JSON.parse(raw) as BookingDraft
    return {
      ...defaultDraft,
      ...parsed,
      guestCount: Math.min(GUEST_MAX, Math.max(GUEST_MIN, parsed.guestCount ?? GUEST_MIN)),
    }
  } catch {
    return defaultDraft
  }
}

interface BookingDraftContextValue {
  draft: BookingDraft
  allergyOptions: readonly string[]
  setPackageId: (id: string) => void
  setGuestCount: (count: number) => void
  toggleAllergy: (tag: string) => void
  setAllergyNotes: (notes: string) => void
  setSubstitution: (dishId: string, optionId: string) => void
  clearSubstitution: (dishId: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  resetDraft: () => void
}

const BookingDraftContext = createContext<BookingDraftContextValue | null>(null)

export function BookingDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<BookingDraft>(loadDraft)

  const persist = useCallback((next: BookingDraft) => {
    setDraft(next)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const value = useMemo<BookingDraftContextValue>(
    () => ({
      draft,
      allergyOptions: ALLERGY_QUICK_OPTIONS,
      setPackageId: (id) => persist({ ...draft, packageId: id }),
      setGuestCount: (count) =>
        persist({
          ...draft,
          guestCount: Math.min(GUEST_MAX, Math.max(GUEST_MIN, count)),
        }),
      toggleAllergy: (tag) => {
        const tags = draft.allergyTags.includes(tag)
          ? draft.allergyTags.filter((t) => t !== tag)
          : [...draft.allergyTags, tag]
        persist({ ...draft, allergyTags: tags })
      },
      setAllergyNotes: (notes) => persist({ ...draft, allergyNotes: notes }),
      setSubstitution: (dishId, optionId) =>
        persist({
          ...draft,
          substitutions: { ...draft.substitutions, [dishId]: optionId },
        }),
      clearSubstitution: (dishId) => {
        const next = { ...draft.substitutions }
        delete next[dishId]
        persist({ ...draft, substitutions: next })
      },
      setPaymentMethod: (method) => persist({ ...draft, paymentMethod: method }),
      resetDraft: () => {
        sessionStorage.removeItem(STORAGE_KEY)
        setDraft(defaultDraft)
      },
    }),
    [draft, persist],
  )

  return (
    <BookingDraftContext.Provider value={value}>{children}</BookingDraftContext.Provider>
  )
}

export function useBookingDraft() {
  const ctx = useContext(BookingDraftContext)
  if (!ctx) throw new Error('useBookingDraft deve essere usato dentro BookingDraftProvider')
  return ctx
}