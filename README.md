# Libro de Conciliación — Frontend

Frontend React (Vite) para cargar los extractos del banco y del sistema, correr
la conciliación contra el backend existente, y revisar los resultados.

## Cómo correrlo

```bash
npm install
cp .env.example .env      # y completá la URL real del backend
npm run dev
```

## Configuración de la API

Todos los endpoints viven en un solo lugar: **`src/api/config.js`**.
Si el backend cambia de ruta, alcanza con editar ahí, no hay URLs sueltas
en otros componentes.

```js
export const ENDPOINTS = {
  importBank: '/imports/bank',
  importSystem: '/imports/system',
  runReconciliation: '/reconciliation/run',
  results: '/reconciliation/results',
  balance: '/reconciliation/balance',
  history: '/reconciliation/history',        // ⚠️ placeholder, confirmar con backend
  historyDetail: (id) => `/reconciliation/${id}`,  // ⚠️ placeholder
}
```

> **Pendiente de confirmar con el backend:** todavía no hay un endpoint definido
> para listar el historial de conciliaciones pasadas. Se dejó `GET /reconciliation/history`
> como nombre tentativo en `HistoryPage`. Cuando se confirme la ruta real, alcanza
> con cambiar `ENDPOINTS.history` en `config.js` — el resto del código no se toca.

La URL base (`http://localhost:3000` por defecto) se configura con la variable
de entorno `VITE_API_BASE_URL`.

## Autenticación

El cliente (`src/api/client.js`) ya manda el header `Authorization: Bearer <token>`
si encuentra un token guardado en `localStorage` bajo la clave `conciliacion_token`.
No se armó pantalla de login todavía porque no se definió cómo es el mecanismo de
auth contra el backend real — si usan JWT simple, alcanza con guardar el token ahí
después del login. Si es otra cosa (cookies de sesión, OAuth), avisame y lo adapto.

## Estructura

```
src/
  api/            # config de endpoints + cliente HTTP + funciones de conciliación
  components/     # piezas de UI reutilizables (tablas, dropzone, sello de estado, etc.)
  hooks/          # lógica de estado: subida de archivos, resultados, historial
  pages/          # las 3 pantallas: Cargar, Resultados, Historial
  utils/          # formato de moneda/fecha y clasificación de diferencias
```

## Lógica de clasificación de diferencias

En `src/utils/format.js` hay una tolerancia (`ROUNDING_TOLERANCE`, $100 por defecto)
para distinguir:

- **Conciliado**: diferencia exactamente $0
- **Redondeo**: diferencia chica, dentro de tolerancia
- **Revisar**: diferencia grande — esto es una alerta visual en la tabla de resultados,
  pensada a partir de los casos reales de matching incorrecto que se identificaron
  al auditar el backend (cruces de movimientos con diferencias de miles/millones de pesos).

Esto es solo una ayuda visual en el frontend; la corrección real del algoritmo de
matching tiene que hacerse en el backend (`ConciliateMovementsUseCase` o equivalente).

## Páginas

1. **Nueva conciliación** (`/`) — subir los dos Excel, correr el proceso.
2. **Resultados** (`/resultados`) — resumen, balance, y tres pestañas:
   conciliados (con detalle expandible para grupos), solo banco, solo sistema.
3. **Historial** (`/historial`) — listado de conciliaciones pasadas (pendiente de
   confirmar el endpoint real, ver arriba).
