# mobx-binder

This library provides a convenient way of handling form state in a [React](https://reactjs.org/) + [MobX](https://mobx.js.org/) web app.

The API roughly reflects the great [Binder API of the Vaadin Framework](https://vaadin.com/docs/v10/flow/binding-data/tutorial-flow-components-binder.html), while strongly relying on MobX features.

It is written in [TypeScript](https://www.typescriptlang.org/) and has first class support for TypeScript code, but should also work in *ES 5*+ environments.

- Built for [React](https://reactjs.org)
- Widget framework agnostic
- Example implementation for [reactstrap](https://reactstrap.github.io) in the sample app
- Supports various MobX versions
    - **v1.x:** supports MobX 6
    - **v0.x:** supports MobX 4 and 5
- Chaining Concept for validations and conversions
- Localization support for error messages
- Async field validation and conversion
- Validators and converters for [Moment.js](https://momentjs.com) and [Day.js](https://day.js.org)
- Promise based API

For a comprehensive overview, please check the [documentation](https://mobx-binder.github.com).

## License

[MIT](LICENSE)