import { Product } from '../types/product'

export const cheapestProducts = new Map<string, Product>()

export function updateCheapest(model: string, product: Product) {

    const existing = cheapestProducts.get(model)

    if (!existing || product.price < existing.price) {
        cheapestProducts.set(model, product)
    }
}