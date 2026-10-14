import { useState, useEffect, useRef } from 'react'

/**
 * Универсалдуу fetch хук.
 * fetchFn — модул деңгээлинде же useCallback менен аныкталышы керек,
 * антпесе ар рендерде жаңы ref болуп, чексиз цикл пайда болот.
 */
export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // fetchFn'ди ref'ке сактайбыз — dep array'га кошпоо үчүн
  const fnRef = useRef(fetchFn)
  fnRef.current = fetchFn

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.resolve(fnRef.current())
      .then(result => {
        if (!cancelled) {
          setData(result)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || 'Ошибка загрузки')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
