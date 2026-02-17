<template>
  <div class="min-h-screen bg-slate-900 px-4 py-10">
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row">
      <aside class="no-print w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-5 text-slate-100 shadow-2xl lg:w-80">
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
              class="date-input mt-1 w-full rounded-md border border-emerald-500/70 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60"
            />
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wide">Fecha final</label>
            <input
              v-model="filters.date2"
              type="date"
              class="date-input mt-1 w-full rounded-md border border-emerald-500/70 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60"
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
            <label class="text-xs font-semibold uppercase tracking-wide">Diagnostico</label>
            <input
              v-model="selectedDiagnosis"
              type="text"
              class="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              placeholder="Escribe para buscar diagnostico"
            />
            <div v-if="showDiagnosisPanel" class="diagnosis-panel-wrapper mt-2">
              <p v-if="diagnosisStore.isLoading" class="text-xs text-slate-300">Buscando diagnosticos...</p>
              <p v-else-if="diagnosisStore.error" class="text-xs text-rose-300">
                {{ diagnosisStore.error }}
              </p>
              <p v-else-if="visibleDiagnosisOptions.length === 0" class="text-xs text-slate-300">
                Sin resultados para "{{ selectedDiagnosis.trim() }}"
              </p>
              <select
                v-else
                v-model="selectedDiagnosisOption"
                size="6"
                class="diagnosis-wide-select rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-sm outline-none focus:border-emerald-400"
                @change="applySelectedDiagnosis"
              >
                <option disabled value="">Selecciona un diagnostico</option>
                <option v-for="diagnosis in visibleDiagnosisOptions" :key="diagnosis" :value="diagnosis">
                  {{ diagnosis }}
                </option>
              </select>
            </div>
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
          <button
            type="button"
            class="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-emerald-500 bg-slate-900 py-2 text-sm font-semibold uppercase tracking-wide text-emerald-300 transition hover:bg-slate-800"
            @click="printCard"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M6 9V3h12v6h1a3 3 0 0 1 3 3v5h-4v4H6v-4H2v-5a3 3 0 0 1 3-3h1zm2-4v4h8V5H8zm8 14v-4H8v4h8zm2-4h2v-3a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v3h2v-2h12v2z" />
            </svg>
            Imprimir tarjeta
          </button>
        </form>

        <p v-if="errorMessage" class="mt-4 text-sm font-semibold text-rose-300">
          {{ errorMessage }}
        </p>
      </aside>

      <div class="print-card mx-auto w-full max-w-4xl border-2 border-black bg-white p-6 text-[12px] text-slate-900 shadow-2xl">
        
        <header class="flex w-full items-center justify-between gap-4 border-b-2 border-black pb-4 text-center uppercase">
          <div class="flex items-center justify-center md:justify-start">
            <img src="../assets/imgs/sign.png" alt="Logo" width="96">
          </div>

          <div class="text-sm font-semibold">
            <p>CLINICA</p>
            <p class="whitespace-nowrap text-lg font-bold">San Juan de Dios</p>
            <p class="text-xs tracking-widest">PERU</p>
          </div>
          <div class="w-full text-right">
            <h1 class="text-2xl font-bold tracking-widest">Tarjeta de Control de Terapia</h1>
          </div>
        </header>

        <section class="mt-4 border border-black">
          <div class="border-b border-black bg-slate-200 text-center text-[11px] font-semibold tracking-widest">
            DATOS DE IDENTIFICACION
          </div>
          <table class="w-full border-collapse text-[12px] ">
            <tbody>
              <tr v-for="(row, rowIndex) in identificationRows" :key="rowIndex">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="border border-black p-2 align-top">
                  <div v-if="cell" class="flex flex-col gap-1">
                    <span class="text-[10px] font-semibold uppercase tracking-wide">{{ cell.label }}</span>
                    <span class="text-[11px] font-semibold">{{ getIdentificationValue(cell) || '---' }}</span>
                  </div>
                  <div v-else class="h-6">&nbsp;</div>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="sessions-table mt-6">
          <table class="w-full border-collapse text-[10px]">
            <thead>
              <tr class="bg-slate-200 text-center font-semibold">
                <th class="w-[6%] border border-black p-2">SESION</th>
                <th class="w-[10%] border border-black p-2">PREFACTURA</th>
                <th class="w-[31%] border border-black p-2">PACIENTE</th>
                <th class="w-[12%] border border-black p-2">FECHA</th>
                <th class="w-[9%] border border-black p-2">HORA</th>
                <th class="w-[22%] border border-black p-2">TERAPISTA</th>
                <th class="w-[10%] border border-black p-2">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="numberedSessions.length === 0">
                <td colspan="7" class="border border-black p-4 text-center text-xs italic text-slate-500">
                  No hay sesiones para mostrar. Utiliza la búsqueda para cargar información.
                </td>
              </tr>
              <tr v-for="item in numberedSessions" :key="item.session.id" class="text-center text-[10px]">
                <td class="border border-black p-2">{{ item.sessionNumber }}</td>
                <td class="border border-black p-2">{{ item.session.PREFACTURA }}</td>
                <td class="border border-black p-2 text-left whitespace-nowrap">{{ item.session.PACIENTE }}</td>
                <td class="border border-black p-2">{{ item.session.CITA_PROGRAMADA }}</td>
                <td class="border border-black p-2">{{ item.session.HORA_ATENCION }}</td>
                <td class="border border-black p-2 text-left whitespace-nowrap">{{ item.session.TERAPISTA || 'Profesional no asignado' }}</td>
                <td class="border border-black p-2">
                  <label class="inline-flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
                    <input
                      v-model="item.session.completed"
                      type="checkbox"
                      class="h-4 w-4 accent-emerald-600"
                    />
                    {{ item.session.completed ? 'Realizado' : 'Pendiente' }}
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
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { useSessionsStore } from '@/stores/sessionsStore'
import type { AppointmentRecord } from '@/stores/sessionsStore'
import type { CardField } from '@/stores/cardStore'
import { useServicesStore } from '@/stores/servicesStore'
import { useDiagnosisStore } from '@/stores/diagnosisStore'

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

    { label: 'DIAGNOSTICO', key: 'DIAGNOSTICO' },
    { label: 'TERAPIA', key: 'SERVICIO' },
  ],

]

const cardStore = useCardStore()
const sessionsStore = useSessionsStore()
const servicesStore = useServicesStore()
const diagnosisStore = useDiagnosisStore()

const cardInfo = computed(() => cardStore.cardInfo)
const diagnosisDisplay = computed(() => {
  const diagnosis = cardInfo.value.DIAGNOSTICO?.trim()
  const code = cardInfo.value.DIACOD?.trim()

  if (diagnosis && code) {
    if (diagnosis.toLowerCase().includes(code.toLowerCase())) {
      return diagnosis
    }

    return `${diagnosis} ${code}`
  }

  return diagnosis || code || ''
})
const diagnosisOptions = computed(() => diagnosisStore.diagnosis)
const selectedDiagnosis = ref('')
const selectedDiagnosisOption = ref('')
const isApplyingDiagnosisSelection = ref(false)
const hasSelectedDiagnosisFromList = ref(false)
const visibleDiagnosisOptions = computed(() => diagnosisOptions.value.slice(0, 20))
const showDiagnosisPanel = computed(() => {
  return selectedDiagnosis.value.trim().length > 0 && !hasSelectedDiagnosisFromList.value
})

const getIdentificationValue = (cell: IdentificationCell): string => {
  if (cell.key === 'DIAGNOSTICO') {
    return diagnosisDisplay.value
  }

  return cardInfo.value[cell.key] ?? ''
}

watch(
  selectedDiagnosis,
  (value) => {
    cardStore.setField('DIAGNOSTICO', value)
  },
  { immediate: true },
)

let diagnosisSearchTimeout: ReturnType<typeof setTimeout> | null = null

watch(selectedDiagnosis, (value) => {
  const term = value.trim()
  selectedDiagnosisOption.value = ''

  if (isApplyingDiagnosisSelection.value) {
    isApplyingDiagnosisSelection.value = false
    return
  }

  hasSelectedDiagnosisFromList.value = false

  if (diagnosisSearchTimeout) {
    clearTimeout(diagnosisSearchTimeout)
  }

  if (!term) {
    diagnosisStore.clearOptions()
    return
  }

  diagnosisSearchTimeout = setTimeout(() => {
    void diagnosisStore.searchDiagnosticos(term, 20)
  }, 300)
})

const applySelectedDiagnosis = () => {
  if (!selectedDiagnosisOption.value) {
    return
  }

  isApplyingDiagnosisSelection.value = true
  hasSelectedDiagnosisFromList.value = true
  selectedDiagnosis.value = selectedDiagnosisOption.value
  diagnosisStore.clearOptions()
}

onUnmounted(() => {
  if (diagnosisSearchTimeout) {
    clearTimeout(diagnosisSearchTimeout)
  }
})
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

const parseSessionDateValue = (session: AppointmentRecord): number => {
  const rawDate = `${session.CITA_PROGRAMADA ?? ''}`.trim()
  const rawHour = `${session.HORA_ATENCION ?? ''}`.trim()
  const combined = `${rawDate} ${rawHour}`.trim()
  const directTime = Date.parse(combined || rawDate)
  if (!Number.isNaN(directTime)) {
    return directTime
  }

  const dateMatch = rawDate.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (!dateMatch) {
    return Number.MAX_SAFE_INTEGER
  }

  const day = Number(dateMatch[1])
  const month = Number(dateMatch[2]) - 1
  const year = Number(dateMatch[3])
  const timeMatch = rawHour.match(/^(\d{1,2}):(\d{2})/)
  const hours = timeMatch ? Number(timeMatch[1]) : 0
  const minutes = timeMatch ? Number(timeMatch[2]) : 0

  return new Date(year, month, day, hours, minutes).getTime()
}

const numberedSessions = computed(() => {
  return [...filteredSessions.value]
    .sort((a, b) => parseSessionDateValue(a) - parseSessionDateValue(b))
    .map((session, index) => ({
      session,
      sessionNumber: index + 1,
    }))
})

const filters = reactive({
  date1: '2026-01-01',
  date2: '2026-01-09',
  prefactura: '4740040',
})

const isSearching = ref(false)
const errorMessage = ref('')

// local
//const apiUrl = 'http://localhost:3000/api/citas'

//produccion
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
    if (selectedDiagnosis.value) {
      cardStore.setField('DIAGNOSTICO', selectedDiagnosis.value)
    }
    sessionsStore.setFromAppointments(rest)
    servicesStore.setOptionsFromRecords(rest)
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Ocurrió un error inesperado al consultar las citas.'
  } finally {
    isSearching.value = false
  }
}

const printCard = () => {
  window.print()
}
</script>

<style scoped>
.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(58%) sepia(73%) saturate(419%) hue-rotate(100deg) brightness(95%) contrast(90%);
}

.diagnosis-panel-wrapper {
  position: relative;
  overflow: visible;
}

.diagnosis-wide-select {
  display: block;
  width: min(760px, 92vw);
  max-width: none;
  margin-left: 0;
  transform: none;
  position: relative;
  z-index: 10;
}

@media print {
  .no-print {
    display: none !important;
  }

  .print-card {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    box-shadow: none !important;
  }

  .print-card header {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 1rem !important;
    text-align: center !important;
  }

  .print-card header > div:last-child {
    width: 100% !important;
  }
}
</style>
