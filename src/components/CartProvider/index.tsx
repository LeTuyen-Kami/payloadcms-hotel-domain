'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Product } from '@/payload-types'

type CartItem = {
  product: Product
  quantity: number
  price?: number
  validity?: {
    checkIn: string
    checkOut: string
    duration?: number
    type?: string
  }
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  total: number
  hasItems: boolean
}

const CartContext = createContext<CartContextType | null>(null)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('payload-cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error('Failed to parse cart from local storage', e)
      }
    }
    setIsInitialized(true)
  }, [])

  // Save cart to local storage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('payload-cart', JSON.stringify(items))
    }
  }, [items, isInitialized])

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      // For this hotel use case, we might want to replace the item if it's the same room type
      // or simply add to list. For simplicity, let's allow multiple items but assume logic is handled by caller
      // or we can just append.
      // Basic check to see if item exists
      const existingItemIndex = prevItems.findIndex((i) => i.product.id === newItem.product.id)

      if (existingItemIndex > -1) {
        // Update existing item
        const newItems = [...prevItems]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + newItem.quantity,
          validity: newItem.validity // Update dates if new ones provided
        }
        return newItems
      }

      return [...prevItems, newItem]
    })
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((acc, item) => {
    // Adapter for price: check price override first, then priceInVND, if not then 0. 
    // In a real app we might handle currency selection.
    const price = item.price !== undefined ? item.price : (item.product.priceInVND || 0)
    return acc + (price * item.quantity)
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        total,
        hasItems: items.length > 0,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
