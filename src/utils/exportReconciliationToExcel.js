import * as XLSX from "xlsx";


export const exportReconciliationToExcel = (
  results,
  balance,
  bankCode,
  bankAccount,
  period
) => {
  const workbook = XLSX.utils.book_new()

  /*
   * Hoja Resumen
   */
  const summaryData = [
    {
      Concepto: 'Banco',
      Valor: bankCode ?? '',
    },
    {
      Concepto: 'Cuenta bancaria',
      Valor: bankAccount ?? '',
    },
    {
      Concepto: 'Período',
      Valor: period ?? '',
    },
    {
      Concepto: 'Grupos conciliados',
      Valor: results?.matchedGroups?.length ?? 0,
    },
    {
      Concepto: 'Movimientos solo banco',
      Valor: results?.bankOnly?.length ?? 0,
    },
    {
      Concepto: 'Movimientos solo sistema',
      Valor: results?.systemOnly?.length ?? 0,
    },
  ]

  Object.entries(balance ?? {}).forEach(([key, value]) => {
    summaryData.push({
      Concepto: formatPropertyName(key),
      Valor: normalizeValue(value),
    })
  })

  const summarySheet = XLSX.utils.json_to_sheet(summaryData)

  summarySheet['!cols'] = [{ wch: 35 }, { wch: 25 }]

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen')

  /*
   * Hoja Conciliados
   *
   * La estructura real de cada grupo es:
   * {
   *   reconciliationId,
   *   bank,
   *   system: [],
   *   bankAmount,
   *   systemAmount,
   *   difference,
   *   isGroup
   * }
   */
  const matchedRows =
    results?.matchedGroups?.flatMap((group, index) => {
      const groupNumber = index + 1

      const bankMovements = group?.bank ? [group.bank] : []

      const systemMovements = Array.isArray(group?.system)
        ? group.system
        : group?.system
          ? [group.system]
          : []

      const bankRows = bankMovements.map((movement) =>
        mapMatchedMovementRow(movement, 'Banco', groupNumber, group)
      )

      const systemRows = systemMovements.map((movement) =>
        mapMatchedMovementRow(movement, 'Sistema', groupNumber, group)
      )

      return [...bankRows, ...systemRows]
    }) ?? []

  const matchedSheet = XLSX.utils.json_to_sheet(matchedRows, {
    header: [
      'Grupo',
      'ID conciliación',
      'Origen',
      'Fecha',
      'Concepto',
      'Descripción',
      'Empresa',
      'Cliente / Proveedor',
      'Documento',
      'Número',
      'Moneda',
      'Importe',
      'Importe banco',
      'Importe sistema',
      'Diferencia',
      'Es agrupación',
      'Estado',
    ],
  })

  matchedSheet['!cols'] = [
    { wch: 10 },
    { wch: 38 },
    { wch: 12 },
    { wch: 15 },
    { wch: 28 },
    { wch: 60 },
    { wch: 22 },
    { wch: 30 },
    { wch: 20 },
    { wch: 18 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
  ]

  XLSX.utils.book_append_sheet(workbook, matchedSheet, 'Conciliados')

  /*
   * Hoja Solo banco
   */
  const bankOnlyRows = (results?.bankOnly ?? []).map((movement) =>
    mapSimpleMovementRow(movement, 'Banco')
  )

  const bankOnlySheet = XLSX.utils.json_to_sheet(bankOnlyRows, {
    header: [
      'Origen',
      'Fecha',
      'Concepto',
      'Descripción',
      'Empresa',
      'Cliente / Proveedor',
      'Documento',
      'Número',
      'Moneda',
      'Importe',
      'Estado',
    ],
  })

  bankOnlySheet['!cols'] = getSimpleMovementColumnWidths()

  XLSX.utils.book_append_sheet(workbook, bankOnlySheet, 'Solo banco')

  /*
   * Hoja Solo sistema
   */
  const systemOnlyRows = (results?.systemOnly ?? []).map((movement) =>
    mapSimpleMovementRow(movement, 'Sistema')
  )

  const systemOnlySheet = XLSX.utils.json_to_sheet(systemOnlyRows, {
    header: [
      'Origen',
      'Fecha',
      'Concepto',
      'Descripción',
      'Empresa',
      'Cliente / Proveedor',
      'Documento',
      'Número',
      'Moneda',
      'Importe',
      'Estado',
    ],
  })

  systemOnlySheet['!cols'] = getSimpleMovementColumnWidths()

  XLSX.utils.book_append_sheet(workbook, systemOnlySheet, 'Solo sistema')

  /*
   * Nombre del archivo
   */
  const safeBankCode = sanitizeFileName(bankCode)
  const safeBankAccount = sanitizeFileName(bankAccount)
  const safePeriod = sanitizeFileName(period)

  const fileName = [
    'conciliacion',
    safeBankCode,
    safeBankAccount,
    safePeriod,
  ]
    .filter(Boolean)
    .join('-')

  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

const mapMatchedMovementRow = (
  movement,
  source,
  groupNumber,
  group
) => ({
  Grupo: groupNumber,
  'ID conciliación': group?.reconciliationId ?? '',
  Origen: source,
  Fecha: formatDate(movement?.date),
  Concepto: movement?.concept ?? '',
  Descripción: movement?.description ?? '',
  Empresa: movement?.company ?? '',
  'Cliente / Proveedor':
    movement?.clientOrProvider ??
    movement?.providerOrClient ??
    movement?.supplierOrCustomer ??
    '',
  Documento:
    movement?.document ??
    movement?.documentType ??
    '',
  Número:
    movement?.number ??
    movement?.documentNumber ??
    '',
  Moneda: movement?.currency ?? '',
  Importe: getMovementAmount(movement),
  'Importe banco': toNumber(group?.bankAmount),
  'Importe sistema': toNumber(group?.systemAmount),
  Diferencia: toNumber(group?.difference),
  'Es agrupación': group?.isGroup ? 'Sí' : 'No',
  Estado: movement?.status ?? 'Conciliado',
})

const mapSimpleMovementRow = (movement, source) => ({
  Origen: source,
  Fecha: formatDate(movement?.date),
  Concepto: movement?.concept ?? '',
  Descripción: movement?.description ?? '',
  Empresa: movement?.company ?? '',
  'Cliente / Proveedor':
    movement?.clientOrProvider ??
    movement?.providerOrClient ??
    movement?.supplierOrCustomer ??
    '',
  Documento:
    movement?.document ??
    movement?.documentType ??
    '',
  Número:
    movement?.number ??
    movement?.documentNumber ??
    '',
  Moneda: movement?.currency ?? '',
  Importe: getMovementAmount(movement),
  Estado: movement?.status ?? '',
})

const getMovementAmount = (movement) => {
  const amount =
    movement?.amount ??
    movement?.total ??
    movement?.localCurrencyTotal ??
    movement?.totalLocalCurrency ??
    0

  return toNumber(amount)
}

const formatDate = (value) => {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('es-AR')
}

const toNumber = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === 'string') {
    const normalizedValue = value
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.')

    const parsedValue = Number(normalizedValue)

    return Number.isFinite(parsedValue) ? parsedValue : 0
  }

  const parsedValue = Number(value ?? 0)

  return Number.isFinite(parsedValue) ? parsedValue : 0
}

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return ''
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }

  if (value instanceof Date) {
    return formatDate(value)
  }

  return JSON.stringify(value)
}

const formatPropertyName = (value) => {
  const withSpaces = value.replace(/([a-z])([A-Z])/g, '$1 $2')

  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
}

const sanitizeFileName = (value) =>
  String(value ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, '-')

const getSimpleMovementColumnWidths = () => [
  { wch: 12 },
  { wch: 15 },
  { wch: 28 },
  { wch: 60 },
  { wch: 22 },
  { wch: 30 },
  { wch: 20 },
  { wch: 18 },
  { wch: 12 },
  { wch: 18 },
  { wch: 16 },
]