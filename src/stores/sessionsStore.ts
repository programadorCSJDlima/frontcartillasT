import { defineStore } from 'pinia'
import { cardFields, type CardField } from './cardStore'

export type AppointmentRecord = Partial<Record<CardField, unknown>>

export type SessionRow = Record<CardField, string> & {
  id: string
  completed: boolean
}

const readString = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  return ''
}

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
const ddmmyyyyPattern = /^\d{2}\/\d{2}\/\d{4}$/

const normalizeDate = (value: string): string => {
  if (!value) {
    return ''
  }

  if (ddmmyyyyPattern.test(value.trim())) {
    return value
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return dateFormatter.format(parsed)
}

const isCompleted = (status: string): boolean => {
  const normalized = status.toLowerCase()
  if (!normalized) {
    return false
  }

  return normalized.includes('realiz') || normalized.includes('complet') || normalized.includes('cerrado')
}

const mapAppointmentToSession = (payload: AppointmentRecord, index: number): SessionRow => {
  const sessionData = cardFields.reduce((acc, field) => {
    const value = readString(payload[field])
    acc[field] = field === 'CITA_PROGRAMADA' ? normalizeDate(value) : value
    return acc
  }, {} as Record<CardField, string>)

  return {
    ...sessionData,
    id: String(payload.ITEM ?? payload.PREFACTURA ?? `session-${index + 1}`),
    completed: isCompleted(sessionData.ESTADO),
  }
}

export const useSessionsStore = defineStore('sessions', {
  state: () => ({
    list: [] as SessionRow[],
  }),
  getters: {
    sessions: (state) => state.list,
  },
  actions: {
    resetSessions() {
      this.list = []
    },
    setFromAppointments(payloads: AppointmentRecord[]) {
      this.list = payloads.map((payload, index) => mapAppointmentToSession(payload, index))
    },
    clearSessions() {
      this.list = []
    },
  },
})
