import Medusa from "@medusajs/medusa-js"
import { QueryClient } from "@tanstack/react-query"

const MEDUSA_BACKEND_URL = "http://localhost:9000"


const queryClient = new QueryClient()

const medusaClient = new Medusa({ baseUrl: MEDUSA_BACKEND_URL, maxRetries: 3})

export { MEDUSA_BACKEND_URL, queryClient, medusaClient }