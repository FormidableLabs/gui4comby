import {atom} from "recoil";

export type EventLog = {
  time: number,
  message: string,
  id: number,
}

export const eventLogState = atom<EventLog[]>({
  key: 'eventLog',
  default: []
})
