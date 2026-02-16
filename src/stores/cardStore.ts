import { defineStore } from 'pinia'

export const cardFields = [
  'ASEGURADORA',
  'PACIENTE',
  'DNI',
  'SEXO',
  'EDAD',
  'HC',
  'DIAGNOSTICO',
  'PREFACTURA',
  'CITA_PROGRAMADA',
  'HORA_ATENCION',
  'SERVICIO',
  'CODIGO',
  'ITEM',
  'ESPECIALIDAD',
  'TERAPISTA',
  'ESTADO_PAGO',
  'ESTADO',
] as const

export type CardField = (typeof cardFields)[number]

export type AppointmentPayload = Partial<Record<CardField, unknown>> | undefined

export type CardInfo = Record<CardField, string>

const defaultCardInfo: CardInfo = cardFields.reduce((acc, field) => {
  acc[field] = ''
  return acc
}, {} as CardInfo)

const readString = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  return ''
}

export const useCardStore = defineStore('card', {
  state: () => ({
    info: { ...defaultCardInfo },
    appointment: undefined as AppointmentPayload,
  }),
  getters: {
    cardInfo: (state) => state.info,
    rawAppointment: (state) => state.appointment,
  },
  actions: {
    resetCard() {
      this.info = { ...defaultCardInfo }
      this.appointment = undefined
    },
    setFromAppointment(payload: AppointmentPayload) {
      if (!payload) {
        this.resetCard()
        return
      }

      this.appointment = payload

      const nextInfo: CardInfo = { ...defaultCardInfo }
      for (const field of cardFields) {
        nextInfo[field] = readString(payload[field])
      }

      this.info = nextInfo
    },
  },
})
