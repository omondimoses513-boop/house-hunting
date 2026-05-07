'use client'

import { ReactNode } from 'react'
import { LayoutWrapper } from '@/components/layout-wrapper'

interface RootLayoutClientProps {
  children: ReactNode
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  return <LayoutWrapper>{children}</LayoutWrapper>
}
