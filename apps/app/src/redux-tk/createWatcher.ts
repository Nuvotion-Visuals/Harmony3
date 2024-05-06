import { isEqual } from 'lodash'
import { store } from 'redux-tk/store'

type WatcherConfig<T> = {
  selectData: () => T
  onChange: (newData: T, oldData: T | undefined) => void
}

export const createWatcher = <T>({ selectData, onChange }: WatcherConfig<T>) => {
  let oldData: T | undefined

  return store.subscribe(() => {
    const newData = selectData()
    if (oldData === undefined || !isEqual(newData, oldData)) {
      onChange(newData, oldData)
      oldData = newData
    }
  })
}