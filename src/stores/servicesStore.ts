import { defineStore } from 'pinia'
import type { AppointmentRecord } from './sessionsStore'

export const useServicesStore = defineStore('services', {
  state: () => ({
    options: [] as string[],
    selected: '',
  }),
  getters: {
    availableServices: (state) => state.options,
    selectedService: (state) => state.selected,
  },
  actions: {
    reset() {
      this.options = []
      this.selected = ''
    },
    setOptionsFromRecords(records: AppointmentRecord[]) {
      const uniqueServices = Array.from(
        new Set(
          records
            .map((record) => (typeof record.ESPECIALIDAD === 'string' ? record.ESPECIALIDAD.trim() : ''))
            .filter((value) => value.length > 0),
        ),
      )

      this.options = uniqueServices
      if (uniqueServices.length && !uniqueServices.includes(this.selected)) {
        this.selected = ''
      }
    },
    select(service: string) {
      this.selected = service
    },
  },
})
