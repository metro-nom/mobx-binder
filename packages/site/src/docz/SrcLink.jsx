import React from "react"
import {useConfig} from 'docz'
import {Link} from 'gatsby'

export default ({to, children}) => {
    const {repository} = useConfig()

    return (
        <Link to={`${repository}/tree/master/packages/${to}`}>{children}</Link>
    )
}
