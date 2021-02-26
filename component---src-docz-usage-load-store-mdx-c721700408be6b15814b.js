(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{p0Rd:function(e,n,a){"use strict";a.r(n),a.d(n,"_frontmatter",(function(){return r})),a.d(n,"default",(function(){return c}));var t=a("cxan"),l=a("+wNj"),i=(a("ERkP"),a("ZVZ0")),o=a("9Rvw"),r=(a("l1C2"),{});void 0!==r&&r&&r===Object(r)&&Object.isExtensible(r)&&!r.hasOwnProperty("__filemeta")&&Object.defineProperty(r,"__filemeta",{configurable:!0,value:{name:"_frontmatter",filename:"src/docz/usage/load-store.mdx"}});var d={_frontmatter:r},s=o.a;function c(e){var n=e.components,a=Object(l.a)(e,["components"]);return Object(i.b)(s,Object(t.a)({},d,a,{components:n,mdxType:"MDXLayout"}),Object(i.b)("h1",{id:"loading-and-storing-field-values"},"Loading and storing field values"),Object(i.b)("h2",{id:"-using-bind"},"… using bind()"),Object(i.b)("p",null,"The ",Object(i.b)("inlineCode",{parentName:"p"},"bind()")," method binds the value of a form field to a property named like the field name. Only valid values are stored. If the field binding chain contains a conversion, the converted value is stored."),Object(i.b)("pre",null,Object(i.b)("code",Object(t.a)({parentName:"pre"},{className:"language-typescript"}),"public fullName = new TextField('fullName')\n...\nbinder.forField(fullName).bind()\n\n// loading from object\nbinder.load({ fullName: 'Max Mustermann' }) // => fullName.value === 'Max Mustermann'\n\n// storing to object\nconst values = binder.store() // values === { fullName: 'Max Mustermann' }\n\n// storing to existing object\nconst values = { foo: 'bar' }\nbinder.store(values) // =>  values == { foo: 'bar', fullName: 'Max Mustermann' }\n")),Object(i.b)("h2",{id:"-using-bind2"},"… using bind2()"),Object(i.b)("p",null,"The ",Object(i.b)("inlineCode",{parentName:"p"},"bind()")," command is a shorthand for a call to ",Object(i.b)("inlineCode",{parentName:"p"},"bind2"),", which allows to bind field values using more complex read and write callbacks. It's possible to omit the write callback, in which case the field is handled as read-only."),Object(i.b)("pre",null,Object(i.b)("code",Object(t.a)({parentName:"pre"},{className:"language-typescript"}),"public fullName = new TextField('fullName')\n...\nbinder.forField(fullName).bind2(\n    source => source.businessRelation.person.fullName,\n    (target, newValue) => target.businessRelation.person.fullName = newValue)\n)\n\nconst account = {\n    businessRelation: {\n        person: { fullName: 'Max Mustermann' }\n    }\n}\n\n// loading account data into fields\nbinder.load(account) // => fullName.value === 'Max Mustermann'\n\n// updating account data\nbinder.store(account) // =>  account.businessRelation.person.fullName === 'Max Mustermann'\n")),Object(i.b)("h2",{id:"handling-changes"},"Handling changes"),Object(i.b)("p",null,'When you load() data, all the field values get a new value, which is internally stored as "unchanged". Only if the field value is changing via an ',Object(i.b)("inlineCode",{parentName:"p"},"updateValue()")," operation, the ",Object(i.b)("inlineCode",{parentName:"p"},"changed")," property on field level gets true."),Object(i.b)("p",null,"You can get a backend object only filled with data that has been changed via the ",Object(i.b)("inlineCode",{parentName:"p"},"Binder.changedData")," getter."),Object(i.b)("p",null,"In combination with the Binders ",Object(i.b)("inlineCode",{parentName:"p"},"apply()")," method it’s possible to find changes between two sets of data:"),Object(i.b)("pre",null,Object(i.b)("code",Object(t.a)({parentName:"pre"},{className:"language-typescript"}),"public fullName = new TextField('fullName')\npublic email = new TextField('email')\n...\nbinder\n    .forStringField(fullName).bind()\n    .forStringField(email).bind()\n\n// loading from object\nbinder.load({\n    fullName: 'Max Mustermann',\n    email: 'max.mustermann@codecentric.de'\n})\n\n// applying new set of data as field changes\nbinder.apply({\n    fullName: 'Max Mustermann-Musterfrau',\n    email: 'max.mustermann@codecentric.de'\n})\n\n// binder.changedData returns { fullName: 'Max Mustermann-Musterfrau' }\n")))}void 0!==c&&c&&c===Object(c)&&Object.isExtensible(c)&&!c.hasOwnProperty("__filemeta")&&Object.defineProperty(c,"__filemeta",{configurable:!0,value:{name:"MDXContent",filename:"src/docz/usage/load-store.mdx"}}),c.isMDXComponent=!0}}]);
//# sourceMappingURL=component---src-docz-usage-load-store-mdx-c721700408be6b15814b.js.map