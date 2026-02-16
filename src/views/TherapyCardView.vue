<template>
  <div class="min-h-screen bg-slate-900 px-4 py-10">
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row">
      <aside class="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-5 text-slate-100 shadow-2xl lg:w-80">
        <h2 class="text-lg font-semibold uppercase tracking-wide">Buscar citas</h2>
        <p class="mt-1 text-xs text-slate-400">
          Selecciona el rango de fechas, ingresa la prefactura y presiona <span class="font-semibold">Buscar</span>.
        </p>

        <form class="mt-4 space-y-4" @submit.prevent="handleSearch">
          <div>
            <label class="text-xs font-semibold uppercase tracking-wide">Fecha inicial</label>
            <input
              v-model="filters.date1"
              type="date"
              class="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wide">Fecha final</label>
            <input
              v-model="filters.date2"
              type="date"
              class="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wide">Prefactura</label>
            <input
              v-model="filters.prefactura"
              type="text"
              class="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm uppercase outline-none focus:border-emerald-400"
              placeholder="4740040"
            />
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wide">Filtrar por especialidad (opcional)</label>
            <select
              v-model="selectedSpecialty"
              class="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            >
              <option value="">Todos</option>
              <option v-for="specialty in specialtyOptions" :key="specialty" :value="specialty">
                {{ specialty }}
              </option>
            </select>
          </div>

          <button
            type="submit"
            class="w-full rounded-md bg-emerald-500 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-400"
            :disabled="isSearching"
          >
            {{ isSearching ? 'Buscando...' : 'Buscar' }}
          </button>
        </form>

        <p v-if="errorMessage" class="mt-4 text-sm font-semibold text-rose-300">
          {{ errorMessage }}
        </p>
      </aside>

      <div class="mx-auto w-full max-w-4xl border-2 border-black bg-white p-6 text-[12px] text-slate-900 shadow-2xl">
        <header class="flex flex-col gap-4 border-b-2 border-black pb-4 text-center uppercase md:flex-row md:items-center md:justify-between">
          <div class="flex items-center justify-center md:justify-start">
            <img src="../assets/imgs/sign.png" alt="Logo" width="96">
          </div>

          <div class="text-sm font-semibold">
            <p>CLINICA</p>
            <p class="text-lg font-bold">San Juan de Dios</p>
            <p class="text-xs tracking-widest">PERU</p>
          </div>
          <div class="w-full">
            <h1 class="text-2xl font-bold tracking-widest">Tarjeta de Control de Terapia</h1>
          </div>
        </header>

        <section class="mt-4 border border-black">
          <div class="border-b border-black bg-slate-200 text-center text-[11px] font-semibold tracking-widest">
            DATOS DE IDENTIFICACION
          </div>
          <table class="w-full border-collapse text-[12px]">
            <tbody>
              <tr v-for="(row, rowIndex) in identificationRows" :key="rowIndex">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="border border-black p-2 align-top">
                  <div v-if="cell" class="flex flex-col gap-1">
                    <span class="text-[10px] font-semibold uppercase tracking-wide">{{ cell.label }}</span>
                    <span class="text-sm font-semibold">{{ cardInfo[cell.key] || '---' }}</span>
                  </div>
                  <div v-else class="h-6">&nbsp;</div>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="sessions-table mt-6">
          <table class="w-full border-collapse text-[12px]">
            <thead>
              <tr class="bg-slate-200 text-center font-semibold">
                <th class="w-[15%] border border-black p-2">PREFACTURA</th>
                <th class="w-[20%] border border-black p-2">PACIENTE</th>
                <th class="w-[20%] border border-black p-2">CITA PROGRAMADA</th>
                <th class="w-[15%] border border-black p-2">HORA</th>
                <th class="w-[20%] border border-black p-2">TERAPISTA</th>
                <th class="w-[10%] border border-black p-2">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredSessions.length === 0">
                <td colspan="6" class="border border-black p-4 text-center text-xs italic text-slate-500">
                  No hay sesiones para mostrar. Utiliza la búsqueda para cargar información.
                </td>
              </tr>
              <tr v-for="session in filteredSessions" :key="session.id" class="text-center">
            
                <td class="border border-black p-2">{{ session.PREFACTURA }}</td>
                <td class="border border-black p-2 text-left">{{ session.PACIENTE }}</td>
                <td class="border border-black p-2">{{ session.CITA_PROGRAMADA }}</td>
                <td class="border border-black p-2">{{ session.HORA_ATENCION }}</td>
                <td class="border border-black p-2 text-left">{{ session.TERAPISTA || 'Profesional no asignado' }}</td>
                <td class="border border-black p-2">
                  <label class="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide">
                    <input
                      v-model="session.completed"
                      type="checkbox"
                      class="h-4 w-4 accent-emerald-600"
                    />
                    {{ session.completed ? 'Realizado' : 'Pendiente' }}
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <footer class="mt-24 flex items-end justify-between gap-6">
          <div class="w-44 border-t border-black pt-2 text-center font-semibold">HUELLA DIGITAL</div>
          <div class="w-48 border-t border-black pt-2 text-center font-semibold">FIRMA</div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { useSessionsStore } from '@/stores/sessionsStore'
import type { AppointmentRecord } from '@/stores/sessionsStore'
import type { CardField } from '@/stores/cardStore'
import { useServicesStore } from '@/stores/servicesStore'

type IdentificationCell = { label: string; key: CardField }

const identificationRows: Array<Array<IdentificationCell | null>> = [
  [
    { label: 'ASEGURADORA', key: 'ASEGURADORA' },
    { label: 'DNI', key: 'DNI' },
    { label: 'PREFACTURA', key: 'PREFACTURA' },
  ],
  [
    { label: 'PACIENTE', key: 'PACIENTE' },
    { label: 'GENERO', key: 'SEXO' },
    { label: 'EDAD', key: 'EDAD' },
  ],
  [
    // { label: 'HISTORIA CLINICA', key: 'HC' },
    { label: 'DIAGNOSTICO', key: 'DIAGNOSTICO' },
    { label: 'TERAPIA', key: 'SERVICIO' },
  ],
  [
    // { label: 'CODIGO', key: 'CODIGO' },
    // { label: 'ITEM', key: 'ITEM' },
    { label: 'ESPECIALIDAD', key: 'ESPECIALIDAD' },
  ],
  // [
  //   { label: 'CITA PROGRAMADA', key: 'CITA_PROGRAMADA' },
  //   { label: 'HORA ATENCION', key: 'HORA_ATENCION' },
  //   { label: 'TERAPISTA', key: 'TERAPISTA' },
  // ],
  // [
  //   { label: 'ESTADO PAGO', key: 'ESTADO_PAGO' },
  //   { label: 'ESTADO', key: 'ESTADO' },
  //   null,
  // ],
]

const cardStore = useCardStore()
const sessionsStore = useSessionsStore()
const servicesStore = useServicesStore()

const cardInfo = computed(() => cardStore.cardInfo)
const specialtyOptions = computed(() => servicesStore.availableServices)
const selectedSpecialty = computed({
  get: () => servicesStore.selectedService,
  set: (value: string) => servicesStore.select(value),
})
const filteredSessions = computed(() => {
  const selected = servicesStore.selectedService
  const sessions = sessionsStore.sessions

  if (!selected) {
    return sessions
  }

  return sessions.filter((session) => session.ESPECIALIDAD === selected)
})

const filters = reactive({
  date1: '2026-01-01',
  date2: '2026-01-09',
  prefactura: '4740040',
})

const isSearching = ref(false)
const errorMessage = ref('')
// const apiUrl = 'http://localhost:3000/api/citas'
const apiUrl = 'http://172.16.0.9:8081/api/citas'

const buildQueryString = () => {
  const params = new URLSearchParams({
    date1: filters.date1,
    date2: filters.date2,
    prefactura: filters.prefactura.trim(),
  })

  return params.toString()
}

const handleSearch = async () => {
  if (!filters.date1 || !filters.date2 || !filters.prefactura.trim()) {
    errorMessage.value = 'Completa las fechas y la prefactura para realizar la búsqueda.'
    return
  }

  isSearching.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(`${apiUrl}?${buildQueryString()}`)

    if (!response.ok) {
      throw new Error('No se pudo obtener la información de las citas.')
    }

    const payload = await response.json()
    const records = Array.isArray(payload) ? (payload as AppointmentRecord[]) : []

    cardStore.resetCard()
    sessionsStore.resetSessions()
    servicesStore.reset()

    if (!records.length) {
      errorMessage.value = 'No se encontraron citas con los filtros seleccionados.'
      return
    }

    const [first, ...rest] = records
    cardStore.setFromAppointment(first)
    sessionsStore.setFromAppointments(rest)
    servicesStore.setOptionsFromRecords(rest)
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Ocurrió un error inesperado al consultar las citas.'
  } finally {
    isSearching.value = false
  }
}
</script>
