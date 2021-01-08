import React, { ReactNode } from 'react'
import { Container } from 'reactstrap'
import { stores, StoresProvider } from '../../../stores'

export const Root = ({ children }: { children: ReactNode }) => (
    <StoresProvider value={stores}>
        <Container>{children}</Container>
    </StoresProvider>
)
