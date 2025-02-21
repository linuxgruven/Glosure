# Glosure
A programming language with lisp-like syntax written in MiniScript for the game Grey Hack.

This language was made to achieve the most features with the least code, as a Grey Hack hacktool.

You do not need to alter the code and it natively support everything for grey hack, so you do not need to code to do anything anymore, or actually you are just switched from greyscript to coding here.

## Usage
This language has 7 datatypes, they are `string` `number` `list` `map` `null` `lambda` `glosure`.

Use `'hi'` to repersent a string `"hi"`

Use `42` to repersent a number `42`

Use `(list 1 2 'a')` to repersent a list `[1, 2, "a"]`

Use `(map 'a' 1 'b' 2)` to repersent a map `{"a": 1, "b": 2}`

`(true)` is a function evaluates to `true`, you should use `1` instead.

`(false)` is a function evaluates to `false`, you should use `0` instead.

`(null)` is a function evaluates to `null`, this is dangerous and can cause unexpected crash. You should only use this when you have to, for example a Grey Hack API requires you to pass `null` as arguments.

Use `(def name 'value')` to define a variable `name` with a value `"value"`

Use `(lambda (arguments) (body))` to define an anonymous lambda expression(aka function), you can bind it to a variable name with syntax like `(def square (lambda (x) (* x x)))`. this is the only native datatype and you should NEVER pass this through API.

Use `(while expression statement)` to loop without recursion.

Use `(if expression statement optional_else_statement)` to use if or if-else statement.

Use `(function_name argument_1 argument_2 argument_N)` to call a binded lambda or a Grey Hack general function on Manual.exe(import_code isn't a function).

Use `(dot object method_name argument_1 argument_2 argument_N)` to access a method under a grey hack object. This is dangerous and can cause crash if used incorrectly, read Manual.exe while using it.

`(at name index)` essentially works like `name[index]`, you can use it on any container.

### Tutorial at Tutorial.md

## Example
`(def cat (lambda (path) (dot (dot (dot (get_shell) 'host_computer') 'File' path) 'get_content')))` A cat command, use like `(cat '/path/to/file')`

### More example at examples folder