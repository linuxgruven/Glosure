Error = function(msg) //This is up to implementation to decide.
    return exit("<color=red><noparse>" + @msg + "</noparse></color>") //reference implementation simply panics. 
end function
tree = function(anyObject, depth = 5) //basically str() with custom depth limit, this walk the tree with recursion until everything is consumed.
    if depth == 0 then return "..."
    if @anyObject isa map then
        if hasIndex(anyObject, "classID") then return @anyObject.classID //doesnt unfold Grey Hack object anymore
        ret = []
        for pair in anyObject
            ret.push(tree(@pair.key, depth - 1) + ": " + tree(@pair.value, depth - 1))
        end for
        return "{" + ret.join(", ") + "}"
    else
        if @anyObject isa funcRef or anyObject isa number then return "" + @anyObject
        if anyObject isa string then return """" + anyObject + """"
        if anyObject isa list then
            ret = []
            for item in anyObject
                ret.push(tree(@item, depth - 1))
            end for
            return "[" + ret.join(", ") + "]"
        end if
        if anyObject == null then return "null"
        return "" + anyObject 
    end if
end function
reader = function(codeStr) //code string to s-expression
    codeStr = values(codeStr)
    stack = [[]]
    while len(codeStr)
        token = []
        c = codeStr.pull
        if (", " + char(9) + char(10) + char(13)).indexOf(c) != null then //ignore whitespace
            continue
        else if c == "(" then //parse a new list
            stack.push([])
        else if c == ")" then //end a list
            if len(stack) < 2 then return Error("Glosure: Error: Unbalanced parenthesis.")
            curr = stack.pop
            stack[-1].push(curr)
        else if indexOf("0123456789.", c) != null then //tokenize number
            token.push(c)
            while len(codeStr) and indexOf("0123456789.", codeStr[0]) != null
                token.push(codeStr.pull)
            end while
            stack[-1].push(val(token.join("")))
        else if c == "'" then //tokenize string
            token.push(c)
            while len(codeStr) and codeStr[0] != "'"
                c = codeStr.pull
                if c == "\" then //"
                    if codeStr[0] == "t" then
                        token.push(char(9))
                        codeStr.pull
                    else if codeStr[0] == "n" then
                        token.push(char(10))
                        codeStr.pull
                    else if codeStr[0] == "r" then
                        token.push(char(13))
                        codeStr.pull
                    else
                        token.push(codeStr.pull)
                    end if
                else
                    token.push(c)
                end if
            end while
            codeStr.pull
            stack[-1].push(token.join(""))
        else if c == ";" then //ignore comment
            while len(codeStr) and codeStr[0] != char(10)
                codeStr.pull
            end while
        else //tokenize symbol
            token.push(c)
            while len(codeStr) and (" .'();" + char(9) + char(10) + char(13)).indexOf(codeStr[0]) == null
                token.push(codeStr.pull)
            end while
            stack[-1].push(token.join(""))
        end if
    end while
    if len(stack) != 1 then return Error("Glosure: Error: Unbalanced parenthesis.")
    return ["begin"] + stack[0]
end function
Env = function(__outer) //environment for Glosure, only build new environment when calling lambda.
    Error = @Error
    env = {}
    env.classID = "env"
    env.__outer = __outer
    env.__local = {}
    env.get = function(symbol)
        if hasIndex(self.__local, @symbol) then return @self.__local[@symbol]
        if self.__outer then return @self.__outer.get(symbol)
        return Error("Glosure: Runtime Error: Unknown symbol '" + symbol + "'.")
    end function
    env.set = function(symbol, value)
        self.__local[@symbol] = @value
        return @value
    end function
    return env
end function
eval = function(expr, env) //evaluate Glosure s-expression
    if not @expr isa list then
        if not @expr isa string then return @expr
        if expr[0] == "'" then return expr[1:] else return env.get(expr)
    end if
    if not len(expr) then return null
    first = @expr[0]
    if @first == "def" then //bind value to symbol
        if len(@expr) < 3 then return Error("Glosure: Runtime Error: def keyword requires 2 arguments.")
        return env.set(@expr[1], eval(@expr[2], env))
    else if @first == "if" then //if statement
        if len(@expr) < 3 then return Error("Glosure: Runtime Error: if keyword requires 2 or 3 arguments.")
        if eval(@expr[1], env) then return eval(@expr[2], env)
        if len(@expr) > 3 then return eval(@expr[3], env) else return null
    else if @first == "while" then //while loop, with no break keyword.
        if len(@expr) != 3 then return Error("Glosure: Runtime Error: while keyword requires 2 arguments.")
        result = null
        while eval(@expr[1], env)
            result = eval(@expr[2], env)
        end while
        return @result
    else if @first == "lambda" then //lambda statement
        if len(@expr) < 3 then return Error("Glosure: Runtime Error: lambda keyword requires 3 or more arguments.")
        if not @expr[1] isa list then return Error("Glosure: Runtime Error: lambda requires a list as params.")
        return {
            "classID": "lambda",
            "params": @expr[1],
            "body": expr[2:],
            "env": @env,
        }
    else if @first == "begin" then //evaluate each argument and return the last one.
        result = null
        for stmt in expr[1:]
            result = eval(@stmt, env)
        end for
        return @result
    else if @first == "exec" then //interpret a string as Glosure code.
        if len(@expr) != 2 then return Error("Glosure: Runtime Error: exec keyword requires 1 argument.")
        return execute(eval(@expr[1], env), env)
    else if @first == "eval" then //evaluate a list as Glosure code.
        if len(@expr) != 2 then return Error("Glosure: Runtime Error: eval keyword requires 1 argument.")
        return eval(eval(@expr[1], env), env)
    else if @first == "glosure" then //build a "glosure"(host function), advanced feature, extremely dangerous
        if len(@expr) != 3 then return Error("Glosure: Runtime Error: glosure keyword requires 3 or more arguments.")
        if not @expr[1] isa list then return Error("Glosure: Runtime Error: glosure requires a list as params.")
        if len(@expr[1]) > 5 then return Error("Glosure: Runtime Error: glosure can only take 5 or less params.")
        lambda = {
            "classID": "lambda",
            "params": @expr[1],
            "body": expr[2:],
            "env": @env,
        }
        __eval = @eval
        __env = @env
        buildGlosure = function
            __eval = @outer.__eval
            __env = @outer.__env
            lambda = @outer.lambda
            glosure0 = function()
                return __eval([lambda], __env)
            end function
            glosure1 = function(arg0)
                return __eval([lambda, @arg0], __env)
            end function
            glosure2 = function(arg0, arg1)
                return __eval([lambda, @arg0, @arg1], __env)
            end function
            glosure3 = function(arg0, arg1, arg2)
                return __eval([lambda, @arg0, @arg1, @arg2], __env)
            end function
            glosure4 = function(arg0, arg1, arg2, arg3)
                return __eval([lambda, @arg0, @arg1, @arg2, @arg3], __env)
            end function
            glosure5 = function(arg0, arg1, arg2, arg3, arg4)
                return __eval([lambda, @arg0, @arg1, @arg2, @arg3, @arg4], __env)
            end function
            if len(lambda.params) == 0 then return @glosure0
            if len(lambda.params) == 1 then return @glosure1
            if len(lambda.params) == 2 then return @glosure2
            if len(lambda.params) == 3 then return @glosure3
            if len(lambda.params) == 4 then return @glosure4
            return @glosure5
        end function
        return buildGlosure
    else if @first == "dot" then //invoke host method. Warning: more arguments than a method can take will result in crash and the Glosure interpreter cannot catch this error!
        length = []
        temp = function(object, method, args)
            method = @object[@method]
            return method(@object)
        end function
        length.push(@temp)
        temp = function(object, method, args)
            method = @object[@method]
            return method(@object, @args[0])
        end function
        length.push(@temp)
        temp = function(object, method, args)
            method = @object[@method]
            return method(@object, @args[0], @args[1])
        end function
        length.push(@temp)
        temp = function(object, method, args)
            method = @object[@method]
            return method(@object, @args[0], @args[1], @args[2])
        end function
        length.push(@temp)
        temp = function(object, method, args)
            method = @object[@method]
            return method(@object, @args[0], @args[1], @args[2], @args[3])
        end function
        length.push(@temp)
        temp = function(object, method, args)
            method = @object[@method]
            return method(@object, @args[0], @args[1], @args[2], @args[3], @args[4])
        end function
        length.push(@temp)
        if len(args) < 2 then return Error("Glosure: Runtime Error: dot keyword requires at least 2 arguments.")
        if len(args) > len(length) - 1 then return Error("Glosure: Runtime Error: dot keyword take at most " + (len(length) + 1) + " params but received " + len(args) + " arguments.")
        args = []
        for arg in expr[1:]
            args.push(eval(@arg, env))
        end for
        object = @args[0]
        method = @args[1]
        args = args[2:]
        run = @length[len(args)]
        return run(@object, @method, args)
    else if @first == "list" then
        args = []
        for arg in expr[1:]
            args.push(eval(@arg, env))
        end for
        return args
    else if @first == "map" then
        args = []
        for arg in expr[1:]
            args.push(eval(@arg, env))
        end for
        if len(args) % 2 != 0 then args.push(null) //append a null if the last one does not have a pair.
        ret = {}
        for i in range(0, len(args) - 1, 2)
            ret[@args[i]] = @args[i + 1]
        end for
        return @ret
    else if @first == "context" then
        return env.__local
    else
        func = eval(@first, env)
        args = expr[1:]
        evaluatedArgs = []
        if @func isa map and hasIndex(func, "classID") and func.classID == "lambda" then
            if len(args) > len(func.params) then return Error("Glosure: Runtime Error: calling a lambda takes at most " + len(func.params) + " params but received " + len(args) + " arguments.")
            for arg in args
                evaluatedArgs.push(eval(@arg, env))
            end for
            while len(evaluatedArgs) < len(func.params)
                evaluatedArgs.push(null) //append null for not enough arguments
            end while
            newEnv = Env(func.env)
            for i in indexes(func.params)
                newEnv.set(@func.params[i], @evaluatedArgs[i])
            end for
            result = null
            for bodyExpr in func.body
                result = eval(@bodyExpr, newEnv)
            end for
            return @result
        else if @func isa funcRef then
            for arg in args
                evaluatedArgs.push(eval(@arg, env))
            end for
            length = []
            temp = function(args, func)
                return func()
            end function
            length.push(@temp)
            temp = function(args, func)
                return func(@args[0])
            end function
            length.push(@temp)
            temp = function(args, func)
                return func(@args[0], @args[1])
            end function
            length.push(@temp)
            temp = function(args, func)
                return func(@args[0], @args[1], @args[2])
            end function
            length.push(@temp)
            temp = function(args, func)
                return func(@args[0], @args[1], @args[2], @args[3])
            end function
            length.push(@temp)
            temp = function(args, func)
                return func(@args[0], @args[1], @args[2], @args[3], @args[4])
            end function
            length.push(@temp)
            if len(evaluatedArgs) > len(length) - 1 then return Error("Glosure: Runtime Error: glosure takes at most " + (len(length) - 1) + " params but received " + len(evaluatedArgs) + " arguments.")
            run = @length[len(evaluatedArgs)]
            return run(evaluatedArgs, @func)
        end if
    end if
end function
GlobalEnv = function
    globalEnv = Env(null) //global and general methods do not have access to environment. those are for keywords.
    globalEnv.__local["&"] = function(a, b)
        return @a and @b
    end function
    globalEnv.__local["|"] = function(a, b)
        return @a or @b
    end function
    globalEnv.__local["!"] = function(a)
        return not @a
    end function
    globalEnv.__local["=="] = function(a, b)
        return @a == @b
    end function
    globalEnv.__local["!="] = function(a, b)
        return @a != @b
    end function
    globalEnv.__local[">="] = function(a, b)
        return @a >= @b
    end function
    globalEnv.__local["<="] = function(a, b)
        return @a <= @b
    end function
    globalEnv.__local[">"] = function(a, b)
        return @a > @b
    end function
    globalEnv.__local["<"] = function(a, b)
        return @a < @b
    end function
    globalEnv.__local["+"] = function(a, b)
        return @a + @b
    end function
    globalEnv.__local["-"] = function(a, b)
        return @a - @b
    end function
    globalEnv.__local["*"] = function(a, b)
        return @a * @b
    end function
    globalEnv.__local["/"] = function(a, b)
        return @a / @b
    end function
    globalEnv.__local["^"] = function(a, b)
        return @a ^ (@b)
    end function
    globalEnv.__local["%"] = function(a, b)
        return @a % @b
    end function
    globalEnv.__local.at = function(a, b)
        return @a[@b]
    end function
    globalEnv.__local.set = function(a, b, c)
        (@a)[@b] = @c
        return @c
    end function
    general = {"active_user": @active_user, "bitwise": @bitwise, "clear_screen": @clear_screen, "command_info": @command_info, "current_date": @current_date, "current_path": @current_path, "exit": @exit, "format_columns": @format_columns, "get_ctf": @get_ctf, "get_custom_object": @get_custom_object, "get_router": @get_router, "get_shell": @get_shell, "get_switch": @get_switch, "home_dir": @home_dir, "include_lib": @include_lib, "is_lan_ip": @is_lan_ip, "is_valid_ip": @is_valid_ip, "launch_path": @launch_path, "mail_login": @mail_login, "nslookup": @nslookup, "parent_path": @parent_path, "print": @print, "program_path": @program_path, "reset_ctf_password": @reset_ctf_password, "typeof": @typeof, "user_bank_number": @user_bank_number, "user_input": @user_input, "user_mail_address": @user_mail_address, "wait": @wait, "whois": @whois, "to_int": @to_int, "time": @time, "abs": @abs, "acos": @acos, "asin": @asin, "atan": @atan, "ceil": @ceil, "char": @char, "cos": @cos, "floor": @floor, "log": @log, "pi": @pi, "range": @range, "round": @round, "rnd": @rnd, "sign": @sign, "sin": @sin, "sqrt": @sqrt, "str": @str, "tan": @tan, "yield": @yield, "slice": @slice, "params": @params, "globals": @globals, "true": true, "false": false, "null": null}
    for method in general + string + list + map
        globalEnv.__local[@method.key] = @method.value
    end for
    return globalEnv
end function

execute = function(codeStr, env)
    return eval(reader(codeStr), env)
end function
repl = function(env)
    while true
        codeStr = user_input("</> ")
        if codeStr == ";quit" then break
        result = eval(reader(codeStr), env)
        if @result isa string then print(result) else print(tree(@result))
    end while
end function

prepareCode = "" //This one is hardcoded code you can run at start up.
env = Env(GlobalEnv)
execute(prepareCode, env)
repl(env)