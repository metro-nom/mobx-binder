(window.webpackJsonp=window.webpackJsonp||[]).push([[17],{Oj9M:function(e,n,t){"use strict";t.r(n),t.d(n,"_frontmatter",(function(){return r})),t.d(n,"default",(function(){return c}));var a=t("cxan"),i=t("+wNj"),o=(t("ERkP"),t("ZVZ0")),l=t("9Rvw"),r=(t("l1C2"),{});void 0!==r&&r&&r===Object(r)&&Object.isExtensible(r)&&!r.hasOwnProperty("__filemeta")&&Object.defineProperty(r,"__filemeta",{configurable:!0,value:{name:"_frontmatter",filename:"src/docz/usage/validation.mdx"}});var s={_frontmatter:r},d=l.a;function c(e){var n=e.components,t=Object(i.a)(e,["components"]);return Object(o.b)(d,Object(a.a)({},s,t,{components:n,mdxType:"MDXLayout"}),Object(o.b)("h1",{id:"validation"},"Validation"),Object(o.b)("h2",{id:"synchronous-validation"},"Synchronous validation"),Object(o.b)("p",null,"For every field, we can specify validations to be done:"),Object(o.b)("pre",null,Object(o.b)("code",Object(a.a)({parentName:"pre"},{className:"language-typescript"}),"// for SimpleBinder\nconst minLength = (min: number) => (value?: string) =>\n    !!value && value.length < min ? `Please enter at least ${min} characters` : undefined\n\n// or for DefaultBinder\nconst minLength = (min: number) => (value?: string) =>\n    !!value && value.length < min ? { messageKey: `validation.minLength', args: { value, min } } : {}\n\nbinder.forField(fullName).isRequired().withValidator(minLength(5)).bind()\n")),Object(o.b)("p",null,"Validations are processed in order of method calls - so in this example, it is first checked if the ",Object(o.b)("inlineCode",{parentName:"p"},"required")," validation fails, and if it does, no further validation will happen."),Object(o.b)("p",null,"To see the list of already supported validations, take a look into the ",Object(o.b)("inlineCode",{parentName:"p"},"mobx-binder/src/validation/")," folder. You can also easily define your own custom validator, as long as it implements the ",Object(o.b)("inlineCode",{parentName:"p"},"Validator")," type."),Object(o.b)("p",null,"The ",Object(o.b)("inlineCode",{parentName:"p"},"isRequired()")," validation has the special side effect that the ",Object(o.b)("inlineCode",{parentName:"p"},"required")," property is set on the field, so that the rendering component can highlight it. Also, the ",Object(o.b)("inlineCode",{parentName:"p"},"isRequired()")," validation can be active or inactive based on a condition that can be passed as an optional argument."),Object(o.b)("p",null,"Only valid field values are written to an object via ",Object(o.b)("inlineCode",{parentName:"p"},"binder.store()"),"."),Object(o.b)("h2",{id:"asynchronous-validation"},"Asynchronous validation"),Object(o.b)("p",null,"If validation incurs expensive calculations or a backend request, it’s possible to do it asynchronously:"),Object(o.b)("pre",null,Object(o.b)("code",Object(a.a)({parentName:"pre"},{className:"language-typescript"}),"// for SimpleBinder\nconst uniqueTaxNumber = (value?: string) => request.get(`/check/taxnumber/${value}`)\n    .then(response => response.body.conflict ? 'Your company is aready registered' : undefined)\n\n// or for DefaultBinder\nconst uniqueTaxNumber = (value?: string) => request.get(`/check/taxnumber/${value}`)\n    .then(response => response.body.conflict ? { messageKey: `validation.taxNumber.conflict', args: { value } } : {})\n\nbinder\n    .forStringField(taxNumber)\n    .withAsyncValidator(uniqueTaxNumber)\n    .bind()\n")),Object(o.b)("p",null,"In contrast to synchronous validation, the async validation expects to get back a ",Object(o.b)("inlineCode",{parentName:"p"},"Promise")," of the validation result. As this is a more expensive validation, it does not happen on every change of the field value, but only on submission. If you want an additional check on blur, you can configure this like so:"),Object(o.b)("pre",null,Object(o.b)("code",Object(a.a)({parentName:"pre"},{className:"language-typescript"}),".withAsyncValidator(uniqueTaxNumber, { onBlur: true })\n")),Object(o.b)("p",null,"Only field values where asynchronous validation has been successfully finished are written to an object via ",Object(o.b)("inlineCode",{parentName:"p"},"binder.store()"),"."),Object(o.b)("h2",{id:"conditional-validation"},"Conditional validation"),Object(o.b)("p",null,"Sometimes, the validation of one field depends on the value of another field. Given the data used to evaluate the condition is observable, there is not much to do:"),Object(o.b)("pre",null,Object(o.b)("code",Object(a.a)({parentName:"pre"},{className:"language-typescript"}),"public salutation = new TextField('salutation')\npublic fullName = new TextField('fullName')\n\nbinder\n    .forStringField(salutation)\n    .bind()\n    .forField(fullName)\n        .withValidator(someValidatorDependingOnValueOf(salutation))\n    .bind()\n")),Object(o.b)("p",null,"In this example, changes to the value of the ",Object(o.b)("inlineCode",{parentName:"p"},"salutation")," field will automatically trigger a re-evaluation of the validity of the ",Object(o.b)("inlineCode",{parentName:"p"},"fullName"),"."),Object(o.b)("h2",{id:"conditional-required-validation"},'Conditional "required" validation'),Object(o.b)("p",null,"The ",Object(o.b)("em",{parentName:"p"},"required")," validation is a special case, as it also affects the ",Object(o.b)("inlineCode",{parentName:"p"},"required")," property at field level, which you most probably want to use to mark fields as optional or required in their labels. For this case, the ",Object(o.b)("inlineCode",{parentName:"p"},"isRequired()")," method supports an additional callback:"),Object(o.b)("pre",null,Object(o.b)("code",Object(a.a)({parentName:"pre"},{className:"language-typescript"}),"public salutation = new TextField('salutation')\npublic fullName = new TextField('fullName')\n\nbinder\n    .forStringField(salutation)\n    .bind()\n    .forField(fullName)\n    .isRequired(undefined /* use default i18n error key */, () => !salutation.value)\n    .bind()\n")))}void 0!==c&&c&&c===Object(c)&&Object.isExtensible(c)&&!c.hasOwnProperty("__filemeta")&&Object.defineProperty(c,"__filemeta",{configurable:!0,value:{name:"MDXContent",filename:"src/docz/usage/validation.mdx"}}),c.isMDXComponent=!0}}]);
//# sourceMappingURL=component---src-docz-usage-validation-mdx-3409c88f38bb674fbdcf.js.map