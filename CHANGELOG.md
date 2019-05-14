# Changelog

## [0.2.0] - 2019-05-13

* New `TrimConverter` for trimming string based field contents
* On blur events, changes made by converters are applied back to fields - like for trimming.
* `binding.validate()` is now deprecated as validity is now always up-to-date
* `ValidationError` used to emit validation errors in conversions now has it's result in `validationResult` property instead of `result`
* Internal refactoring to improve maintainability
