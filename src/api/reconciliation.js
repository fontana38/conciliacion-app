import { api } from './client'
import { ENDPOINTS } from './config'

export const reconciliationApi = {
  uploadBankFile: (file, { bankCode, bankAccount, period }) =>
    api.postFile(ENDPOINTS.importBank, file, { params: { bankCode, bankAccount, period } }),
  uploadSystemFile: (file, { bankCode, bankAccount, period }) =>
    api.postFile(ENDPOINTS.importSystem, file, { params: { bankCode, bankAccount, period } }),
  run: ({ bankCode, bankAccount, period }) =>
    api.post(ENDPOINTS.runReconciliation, undefined, { bankCode, bankAccount, period }).then(r => r?.data ?? r),
  getResults: ({ bankCode, bankAccount, period }) =>
    api.get(ENDPOINTS.results, { bankCode, bankAccount, period }).then(r => r?.data ?? r),
  getBalance: ({ bankCode, bankAccount, period }) =>
    api.get(ENDPOINTS.balance, { bankCode, bankAccount, period }).then(r => r?.data ?? r),
  getHistory: () => api.get(ENDPOINTS.history),
  getHistoryDetail: (id) => api.get(ENDPOINTS.historyDetail(id)),
}
