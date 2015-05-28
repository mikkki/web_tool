angular-humanize
================

Formatting filters for AngularJS

> _Note: **This project is in active development**. While I do use it in a production environment at my company, it may or may not contain bugs or inconsistencies with your own project. Please make tickets in GitHub if you have any issues, suggestions, or feedback to provide. Thanks!_

To Do
====
- [ ] Add to do list


Available Filters
====

percent
----

Takes a number and displays it as a percentage. By default, the number is expected to be a float that can be multiplied by 100 to get the percent value.

### Arguments

| Param         | Type    | Description                                     |
| ------------- | ------- | ----------------------------------------------- |
| precision     | number  | number of decimal places to display             |
| isWholeNumber | boolean | if number passed is already a whole number      |

### Usage

#### HTML Binding

```
{{ number | percent }}          /* outputs ".8613" as "86%"     */
{{ number | percent:2 }}        /* outputs ".8613" as "86.13%"  */
{{ number | percent:0:true }}   /* outputs "86.13" as "86%"     */
```

#### JavaScript

``` js
$filter("percent")(number, precision, isWholeNumber)
```

apnumber
----

Displays a number according to Associated Press numbering style. Numbers below ten are displayed as a word

### Arguments

No arguments

### Usage

#### HTML Binding

```
{{ number | apnumber }}          /* outputs "1" as "one"     */
{{ number | apnumber }}          /* outputs ".1" as ".1"     */
{{ number | apnumber }}          /* outputs "10" as "10"     */
```

#### JavaScript

``` js
$filter("apnumber")(number)
```

ordinal
----

Adds ordinal suffix to number

### Arguments

| Param      | Type    | Description                  |
| ---------- | ------- | ---------------------------- |
| suffixOnly | boolean | true returns only the suffix |

### Usage

#### HTML Binding

```
{{ number | ordinal }}           /* outputs "1" as "1st"     */
{{ number | ordinal:true }}      /* outputs "1" as "st"      */
```

#### JavaScript

``` js
$filter("ordinal")(number, suffixOnly)
```

currency
----

Displays number as currency value in either short form or long form

### Arguments

| Param        | Type    | Description                         |
| ------------ | ------- | ----------------------------------- |
| precision    | number  | number of decimal places to display |
| suffixFormat | string  | can be "short" or "long"            |
| suffixOnly   | boolean | true to return only the suffix      |

### Usage

#### HTML Binding

```
{{ number | currency }}               /* outputs "123456789.10" as "$123.5 million"     */
{{ number | currency:"short" }}       /* outputs "123456789.10" as "$123.5 m"           */
{{ number | currency:"long":true }}   /* outputs "123456789.10" as "million"            */

```

#### JavaScript

``` js
$filter("currency")(number, precision, suffixFormat, suffixOnly)
```
