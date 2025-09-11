# Glosure
A programming language with lisp-like syntax written in MiniScript for the game Grey Hack.

This language was made to achieve the most features with the least code, as a Grey Hack hacktool.

You do not need to alter the code and it natively support everything for grey hack, so you do not need to code to do anything anymore, or actually you are just switched from greyscript to coding here.

## Usage
This language has 7 datatypes, `string` `number` `list` `map` `null` are the same as GreyScript `string` `number` `list` `map` `null`, `glosure` means GreyScript `function`, `lambda` means a Glosure "anonymous function"

Use `'hi'` to repersent a string `"hi"`

Use `42` to repersent a number `42`, `true` is a predefined variable with a value `1`, `false` is a predefined variable with a value `0`.

`null` is a predefined variable with a value `null`.

Use `(list 1 2 'a')` to repersent a list `[1, 2, "a"]`

Use `(map 'a' 1 'b' 2)` to repersent a map `{"a": 1, "b": 2}`, `globals` is a predefined map which references the GreyScript `globals` map.

Use `(def name 'value')` to define a variable `name` with a value `"value"`

Use `(lambda (arguments) (body))` to define an anonymous lambda expression(aka function), you can bind it to a variable name with syntax like `(def square (lambda (x) (* x x)))`. This is the only native datatype and you should NEVER pass this through API.

Use `(glosure (arguments) (body))` to define an anonymous glosure(aka GreyScript function), you can bind it to a variable name with syntax like `(def square (glosure (x) (* x x)))`. This is only used for GreyScript interop and you should not use this when you can use lambda instead.

### Other MiniScript general functions are likely supported, GreyHack general functions are supported but methods needs to invoked with `dot`.

### Detailed tutorial at Tutorial.md.

## Example
`(def cat (lambda (path) (dot (dot (dot (get_shell) 'host_computer') 'File' path) 'get_content')))` A cat command, use like `(cat '/path/to/file')`

### More example at examples folder