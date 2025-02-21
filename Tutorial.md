# Glosure: A Lisp syntax processor designed for Grey Hack.

## 1. What is Glosure?

Glosure is a scripting programming language with lisp-like syntax designed for Grey Hack. Glosure.gs is Glosure's reference implementation and it is a syntax processor/intepreter for Glosure in Grey Hack.

The name for Glosure means "Grey hack closure". The name for Glosure.gs means "Glosure lisp-like object-oriented scripting user runtime environment".

## 2. Why use Glosure?

Glosure can be used as a tool, an embedded intepreter for a tool, a scripting language, or the core intepreter of a bigger tool built upon Glosure.

## 3. Get started.

### From this chapter we will be using standalone Glosure.gs, we will also be using REPL to make things simpler.

### When explaining how things works or introducing advanced features, we may assume that you have experiences with GreyScript or MiniScript, but the tutorial itself does not require you to have experience with them.

To build Glosure.gs you should copy the content of Glosure.gs to in-game CodeEditor.exe and build it as `glosure`.

We will build a simple hello world program.

Run your built Glosure REPL with `glosure`

It should prompts you a interface that looks like `</> `

This is the REPL, you can input code here and it executes as soon as you press enter.

for now, we input `(print 'Hello World!')` and hit enter.

Output should looks like:
```
(print 'Hello World!')
Hello World!
null
```

The `print` refers to something called print, in this case it is a glosure. glosure means host function, in this case it is a GreyScript function.

Whn