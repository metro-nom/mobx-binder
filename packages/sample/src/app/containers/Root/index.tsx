import React from 'react'
import { Container } from 'reactstrap'
import { stores, StoresProvider } from '../../../stores'

export class Root extends React.Component<any, any> {
    public render() {
        return (
            <StoresProvider value={stores}>
                <Container>{this.props.children}</Container>
            </StoresProvider>
        )
    }
}
