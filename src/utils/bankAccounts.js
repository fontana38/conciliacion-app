// Catálogo de bancos/cuentas disponibles para conciliar.
// Pensado para crecer: cuando haya más bancos, se agregan acá.
export const BANK_ACCOUNTS = [
  { bankCode: 'SUPERVIELLE', bankAccount: 'BYT', label: 'Supervielle — BYT' },
]

export function getBankAccountLabel(bankCode, bankAccount) {
  const match = BANK_ACCOUNTS.find(
    (b) => b.bankCode === bankCode && b.bankAccount === bankAccount
  )
  return match?.label ?? `${bankCode} — ${bankAccount}`
}
