# Glosure: A Lisp syntax processor designed for Grey Hack.

## 1. What is Glosure?

Glosure is a scripting programming language with lisp-like syntax designed for Grey Hack. Glosure.gs is Glosure's reference implementation and it is a syntax processor/interpreter for Glosure in Grey Hack.

The name for Glosure means "Grey hack closure". The name for Glosure.gs means "Glosure lisp-like object-oriented scripting user runtime environment".

## 2. Why use Glosure?

Glosure can be used as a tool, an embedded interpreter for a tool, a scripting language, or the core interpreter of a bigger tool built upon Glosure.

## 3. Get started.

### From this chapter we will be using standalone Glosure.gs, we will also be using REPL to make things simpler.

### When explaining how things works or introducing advanced features, we may assume that you have experiences with GreyScript or MiniScript, but the tutorial itself does not require you to have experience with them.

To build Glosure.gs you should copy the content of Glosure.gs to in-game CodeEditor.exe and build it as `glosure`.

We will build a simple hello world program.

Run your built Glosure REPL with `glosure`

It should prompts you a interface that looks like `</> `

This is the REPL, you can input code here and it executes as soon as you press enter.

for now, we input `(print 'Hello World!') ;This expression prints 'Hello World!'.` and hit enter.

Output should looks like:
```
</> (print 'Hello World!') ;This expression prints 'Hello World!'.
Hello World!
null
```

The `print` refers to something called print, in this case it is a glosure. glosure means a host native function, in this case it is a GreyScript native function.

The `()` means it is either:

1. call a glosure, here `print` is a glosure, aka GreyScript native function.
2. call a lambda, lambda is a expression that allows you to pass arguments and get return value. basically the Glosure version of function.
3. a keyword expression, there are a few keywords in Glosure, we will talk about later.

At here, `print` is the name of a glosure, so it calls the glosure with argument `'Hello World!'`

To summerize, lambda name, glosure name or keyword goes to the first after a left parenthesis, and all arguments goes after it. End a call with right parenthesis. **Glosure `(a b c)` is like GreyScript `a(b, c)`.**

A key difference between Glosure and GreyScript is, in Glosure you have to use parenthesis to call a glosure, if you evaluates the name without parenthesis, it gives you a reference to the glosure. Like this:
```
</> print
FUNCTION(s="", replace_text=0)
```

The `'` around `Hello World!` means this is a string, a string is a bunch of characters. **Glosure `'hi'` evaluates to GreyScript `"hi"`, but not exactly the same, we will explain later.**

The `;` means what ever after it on the same line is a comment, comments gets ignored by the interpreter and is used for human to read.

Putting all the peices together, this line means call glosure `print` with argument `'Hello World!'`, with a comment after this statement telling you this line of code prints hello world.

The `null` means the return value of this statement is `null`, it is the return value of `print`, and the REPL always print the return value.

## 4. Keywords
There are 12 keywords in Glosure, they are:
```clojure
def lambda if while begin exec eval glosure dot list map context defmacro quote
```
`def` defines a variable. Used like `(def name 'value')`, this expression defines a variable called `name` with its value being `'value'`, variable means a value binded to a name.

`lambda` defines a lambda. Used like `(lambda (arg1, arg2, ...) (expr))`. it does not bind to a name by default, aka anonymous function or certain cases closure.
if you want to run it as soon as it is defined, you can use it like this`((lambda (x) (* x x)) 2) ;returns 4`, if you want to use it later, you should give it a name with `def`, like `(def square (lambda (x) (* x x)))`.
Once binded, you can call the lambda with `(square 2) ;returns 4`.

`glosure` defines a glosure. Use it like `lambda` but returns a host native `function` instead of `lambda`. Use for host interop, do not use it when you can use `lambda` instead. This is advanced and dangerous.

`if` is used to control which expression gets evaluated, and which does not.
Use `if` like `(if (== 1 1) (print 'math works!') (print 'rocketorbit needs to fix the interpreter!'))`.
`if` takes either 2 or 3 arguments, it evaluates the first argument, if the result is not `0`, `null`, empty string, empty list or empty map, it evaluates the second statement and return the result.
Otherwise it returns `null` or evaluate and return the third argument, depending on if there is the third argument.

`while` is used to loop. The syntax for while is like `(while (1) (print 'spam!'))`, `while` takes 2 arguments, it evaluates the first argument, if the result is not `0`, `null`, empty string, empty list or empty map, it evaluates the second, and then evalutates the first again.
It repeats evaluating the first argument, until it is either `0`, `null`, empty string, empty list or empty map. When the first argument evaluates to these values, it stops evalutating the second argument, and return the last result of the second.

`begin` is used to combine multiple expressions. It evaluates them in order, return the last one. `begin` takes any number of arguments.

`exec` is used to run a string as Glosure code. This is advanced and dangerous, but it is very powerful. `exec` takes one argument.

`eval` is used to run a list as Glosure expression. This is VERY advanced and VERY dangerous, it requires you to have a very good understanding of both GreyScript and Glosure, and it is used for meta-programming. `eval` takes one argument.

`dot` is used to execute GreyScript methods. It takes 2 to 7 arguments, this first argument is the object, the second is the method name, the third to the seventh are arguments, `(dot (get_shell) 'host_computer')` is the same as GreyScript `get_shell().host_computer`. This causes crash if the method you are trying to run does not exist.

`list` takes any number of arguments, evaluate them in order, and return a list with all of them.

`map` takes any even number of arguments, evaluate them in order, and return a map with all of them, each odd one is the key, even one is the value.

`context` takes no arguments and return a map to the current context. You should not abuse it.

For other keywords please take a look into Metaprogramming section.

### All keywords needs to be invoked with parenthesis, the same way like a glosure or a lambda.

## 5. Metaprogramming

Glosure is able to metaprogram itself with these keywords
```clojure
exec eval defmacro quote
```

### Quoting

```clojure
(quote) ;; returns an empty string
(quote an example symbols) ;; returns 'an example symbols' string
```
Nothing more, nothing less

### Evaluation and Execution

You can evaluate an s-expression list with `eval`.
```clojure
(eval (list 'print' (quote hello world!))) ;; Equivalent of (print 'hello world!')
```

You can evaluane a string with `exec`:
```clojure
(exec '(print \'hello world!\')') ;; Self descriptive
```

### Macros

Macro is a way to define your own syntax within Glosure.

The syntax of defining a macro is as follows:
```clojure
(defmacro NAME (OPT_ARG_1 OPT_ARG_2 OPT_ARG_N) (OPT_GENSYM_1 OPT_GENSYM_2 OPT_GENSYM_M) IMPLEMENTATION)
```
Don't panic! It's simpler than it seems. Let's break it down:
- `NAME` is, obviously, a name that your macro is going to be using, just like every builtin keyword has it's own name;
- `OPT_ARG_N` are N arguments that are being taken by the macro. For example, `if` takes N = three arguments;
- `OPT_GENSYM_M` are M symbols that going to be `gensym`ed. This is being used for hygienic macros, so if you're unsure what this is for, simply set no gensym symbols;
- `IMPLEMENTATION` is to what your macro is going to expand into!

It still seems hard, I know, so let me just get you to the examples. The simplest macro you can write is this:
```clojure
(defmacro _ () () dot)
```
So what it does? It expands `_` to `dot` and behaves alike to it! So now you can write:
```clojure
(_ get_shell 'host_computer')
```
And be sure it works exactly like:
```clojure
(dot get_shell 'host_computer')
```
Isn't that amazing?

But that's not everything! Here is another example:
```clojure
(defmacro defun (name arguments body) () (def name (lambda arguments body)))
```
This one will allow us for `defun` keyword just like in other LISPs:
```clojure
(defun square (number) (* number number))
(square 2) ;; 4
```

And the last example is `swap`:
```clojure
(defmacro swap (a b) (temp) (begin ;; Notice temp!
  (def temp a)
  (def a b)
  (def b temp)))
```
Which allows you to swap two variables
```clojure
(def x 1)
(def y 5)
(swap x y) ;; x = 5, y = 1
(swap x y) ;; x = 1, y = 5 again
```

Hope these examples are descriptive enough for you to start writing your own macros! You can find more examples at examples folder of the repository.
