import * as React from 'react'
import { Container } from 'reactstrap'

export class Root extends React.Component<any, any> {
    public renderDevTool() {
        if (process.env.NODE_ENV !== 'production') {
            const DevTools = require('mobx-react-devtools').default
            return <DevTools/>
        }
    }

    public render() {
        return (
            <Container>
                { this.props.children }
                { this.renderDevTool() }
            </Container>
        )
    }
}
