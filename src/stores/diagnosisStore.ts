import { defineStore } from 'pinia'



// local
// const diagnosisApiUrl = 'http://localhost:3000/api/diagnosticos'

//produccion
const diagnosisApiUrl = 'http://172.16.0.9:8081/api/diagnosticos'

type DiagnosisApiItem = Record<string, unknown> | string

const isDiagnosisLikeRecord = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const obj = value as Record<string, unknown>
  return (
    typeof obj.DIADES === 'string' ||
    typeof obj.diades === 'string' ||
    typeof obj.DIACOD === 'string' ||
    typeof obj.diacod === 'string' ||
    typeof obj.DIAGNOSTICO === 'string' ||
    typeof obj.diagnostico === 'string'
  )
}

const isDiagnosisObject = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const obj = value as Record<string, unknown>
  return (
    typeof obj.DIADES === 'string' ||
    typeof obj.diades === 'string' ||
    typeof obj.DIAGNOSTICO === 'string' ||
    typeof obj.diagnostico === 'string'
  )
}

const extractDiagnosisList = (payload: unknown): unknown[] | null => {
  if (Array.isArray(payload)) {
    return payload.some((item) => isDiagnosisLikeRecord(item) || typeof item === 'string') ? payload : null
  }

  if (!payload || typeof payload !== 'object') {
    return null
  }

  const prioritizedKeys = ['data', 'items', 'results', 'resultados', 'rows', 'recordset']
  const visited = new Set<unknown>()
  const queue: unknown[] = [payload]
  const candidateArrays: unknown[][] = []
  let depth = 0

  while (queue.length && depth < 6) {
    const currentLevelSize = queue.length

    for (let i = 0; i < currentLevelSize; i += 1) {
      const node = queue.shift()
      if (!node || typeof node !== 'object' || visited.has(node)) {
        continue
      }

      visited.add(node)
      const obj = node as Record<string, unknown>

      for (const key of prioritizedKeys) {
        const value = obj[key]
        if (Array.isArray(value)) {
          candidateArrays.push(value)
        }
      }

      for (const value of Object.values(obj)) {
        if (Array.isArray(value)) {
          candidateArrays.push(value)
        }

        if (value && typeof value === 'object') {
          queue.push(value)
        }
      }
    }

    depth += 1
  }

  for (const arr of candidateArrays) {
    if (arr.some((item) => isDiagnosisLikeRecord(item) || typeof item === 'string')) {
      return arr
    }
  }

  if (isDiagnosisObject(payload)) {
    return [payload]
  }

  return null
}

const readDiagnosisLabel = (item: DiagnosisApiItem): string => {
  if (typeof item === 'string') {
    return item.trim()
  }

  const candidates = [
    item.DIADES,
    item.diades,
    item.DIAGNOSTICO,
    item.diagnostico,
    item.nombre,
    item.descripcion,
    item.label,
    item.value,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim()
    }
  }

  return ''
}

export const useDiagnosisStore = defineStore('diagnosis', {
  state: () => ({
    diagnosis: [] as string[],
    isLoading: false,
    error: '',
    requestId: 0,
  }),
  getters: {
    diagnosisOptions: (state) => state.diagnosis,
  },
  actions: {
    setOptionsFromPayload(payload: unknown) {
      const rawList = extractDiagnosisList(payload)

      if (!rawList) {
        this.diagnosis = []
        return
      }

      const hasAtLeastOneDiagnosis = rawList.some((item) => isDiagnosisObject(item) || typeof item === 'string')
      if (!hasAtLeastOneDiagnosis) {
        this.diagnosis = []
        return
      }

      const uniqueOptions = Array.from(
        new Set(
          rawList
            .map((item) => readDiagnosisLabel(item as DiagnosisApiItem))
            .filter((value) => value.length > 0),
        ),
      )

      this.diagnosis = uniqueOptions
    },
    clearOptions() {
      this.diagnosis = []
      this.error = ''
    },
    async searchDiagnosticos(query: string, limit = 20) {
      const term = query.trim()
      if (!term) {
        this.clearOptions()
        return
      }

      const currentRequestId = ++this.requestId

      this.isLoading = true
      this.error = ''

      try {
        const params = new URLSearchParams({
          q: term,
          limit: String(limit),
        })

        const response = await fetch(`${diagnosisApiUrl}/search?${params.toString()}`)
        if (!response.ok) {
          throw new Error('No se pudo buscar diagnosticos.')
        }

        const payload = await response.json()
        if (currentRequestId !== this.requestId) {
          return
        }

        this.setOptionsFromPayload(payload)
      } catch (err) {
        if (currentRequestId !== this.requestId) {
          return
        }

        this.diagnosis = []
        this.error = err instanceof Error ? err.message : 'Error al buscar diagnosticos.'
      } finally {
        if (currentRequestId === this.requestId) {
          this.isLoading = false
        }
      }
    },
  },
})
