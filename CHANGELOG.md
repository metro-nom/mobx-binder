# Changelog (breaking changes)

## [0.6.0] - 2020-12-22

* Condition "required" status and validation using `isRequired(key, condition)`.
* Some more docs incl. corrections about conditional validation.

## [0.5.0] - 2020-12-19

* Remove the deprecated and non-validating `Binding.validate()` - the computed property `validaty` now gives synchronous access to the validation status and result
* New module `mobx-binder-dayjs` with validation and conversion support comparable to that of `mobx-binder-moment`.
* Various updates to the sample implementation code

## [0.4.0] - 2019-10-11

* Removing automatism of converting empty strings to `undefined`. Instead, one can use `binder.forField().withStringOrUndefined()` or simply `binder.forStringField()` to configure the same behaviour explicitly. 

## [0.3.0] - 2019-09-20

* Stricter type checking - you are now required to specify nullable types explicitly, like in Field types and in Converters
* Migration to eslint rule set and prettier code style

## [0.2.0] - 2019-05-13

* New `TrimConverter` for trimming string based field contents
* On blur events, changes made by converters are applied back to fields - like for trimming.
* `binding.validate()` is now deprecated as validity is now always up-to-date
* `ValidationError` used to emit validation errors in conversions now has it's result in `validationResult` property instead of `result`
* Internal refactoring to improve maintainability
