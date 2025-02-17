# Glosure
A programming language with lisp-like syntax written in MiniScript for the game Grey Hack.

This language was made to achieve the most features with the least code, as a Grey Hack hacktool.

You do not need to alter the code and it natively support everything for grey hack, so you do not need to code to do anything anymore, or actually you are just switched from greyscript to coding here.

## Usage
Use `'hi'` to repersent a string

Use `42` to repersent a number

Use `(list 1 2 'a')` to repersent a list `[1, 2, "a"]`

Use `(map 'a' 1 'b' 2)` to repersent a map `{"a": 1, "b": 2}`

Use `(def name value)` to define a variable

Use `(lambda (arguments) (body))` to define a lambda(aka function)

Use `(macro (arguments) (body))` to define a macro(Don't ask me how it works I don't even understand how to use it, AI told me to make a macro feature so I did.)

Use `(if (expression) (statement))` to use if statement.

Use `(insert_any_general_function_name argument_1 argument_2 argument_N)` to call any Grey Hack general function.(import_code isn't a function)

Use `(true)` to repersent `true`, you should use `1` instead.

Use `(false)` to repersent `false`, you should use `0` instead.

Use `(null)` to repersent `null`, this is dangerous and can cause unexpected crash. You should only use this when you have to.

Use `(dot object method_name argument_1 argument_2 argument_N)` to access a method under a grey hack object. This is dangerous and can cause crash if used incorrectly, read Manual.exe while using it.

## Example
TODO