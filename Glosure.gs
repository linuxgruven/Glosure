tree = function(anyObject, depth = 5) //basically str() with custom depth limit, this walk the tree with recursion until everything is consumed.
    if depth == 0 then return "..."
    if @anyObject isa map then
        if hasIndex(anyObject, "classID") then return @anyObject.classID //deal with Grey Hack object
        if hasIndex(anyObject, "type") then return @anyObject.type //deal with Glosure object
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



Reader = function(stri) //A reader that consumes tokens or chars, used in lexer and parser.
    reader = {}
    reader.__stri = stri
    reader.__pos = -1
    reader.next = function(num = 1)
        self.__pos = self.__pos + num
        if self.__pos >= self.__stri.len then return null else return self.__stri[self.__pos]
    end function
    reader.peek = function(num = 1)
        if self.__pos + num >= self.__stri.len then return null else return self.__stri[self.__pos + num]
    end function
    return reader
end function

lexer = function(codeStr) //lexical analysis for Glosure, ignore whitespaces, comments, commas.
    tokens = []
    reader = Reader(codeStr)
    while reader.peek
        c = reader.next
        if (", " + char(9) + char(10) + char(13)).indexOf(c) != null then
            continue
        else if "()".indexOf(c) != null then
            tokens.push(c)
        else if "0123456789.".indexOf(c) != null then
            token = [c]
            while reader.peek != null and "0123456789.".indexOf(reader.peek) != null
                token.push(reader.next)
            end while
            tokens.push(token.join("").val)
        else if c == "'" then
            token = ["'"]
            while reader.peek != null and reader.peek != "'"
                c = reader.next
                if reader.peek == "\" and reader.peek(2) then //"
                    c = reader.next(2)
                    if c == "n" then
                        token.push(char(10))
                    else if c == "t" then
                        token.push(char(9))
                    else if c == "r" then
                        token.push(char(13))
                    else
                        token.push(c)
                    end if
                else
                    token.push(c)
                end if
            end while
            reader.next
            tokens.push(token.join(""))
        else if c == ";" then
            while reader.peek != null and reader.peek != char(10)
                reader.next
            end while
        else
            token = [c]
            while reader.peek != null and (" '();" + char(9) + char(10) + char(13)).indexOf(reader.peek) == null
                token.push(reader.next)
            end while
            tokens.push(token.join(""))
        end if
    end while
    return tokens
end function

parser = function(tokens) //Syntax analysis for Glosure, only parse one atom. Use (begin arguments) to form a multiple atom program.
    reader = Reader(tokens)
    readList = function
        lst = []
        while reader.peek != null
            atom = readAtom
            if atom == null then break
            lst.push(atom)
        end while
        return lst
    end function
    readAtom = function
        atom = reader.next
        if atom == "(" then return readList
        if atom == ")" then return null
        return atom
    end function
    return readAtom
end function

Env = function(parent) //environment for Glosure, only build new environment when calling lambda or expending macro.
    env = {}
    env.vars = {}
    env.parent = parent
    env.get = function(name)
        if self.vars.hasIndex(name) then return @self.vars[name]
        if self.parent then return self.parent.get(name)
        return exit("Unknown identifier.")
    end function
    env.set = function(name, value)
        self.vars[name] = @value
    end function
    return env
end function

eval = function(expr, env) //evaluate Glosure s-expression
    if not expr isa list then
        if expr isa number then return expr
        if expr[0] == "'" then return expr[1:]
        return env.get(expr)
    end if
    if not expr then return null
    first = expr[0]
    if first == "def" then
        value = eval(expr[2], env)
        env.set(expr[1], value)
        return value
    else if first == "if" then
        condition = eval(expr[1], env)
        if condition then
            return eval(expr[2], env)
        else
            if expr.len > 3 then return eval(expr[3], env) else return null
        end if
    else if first == "while" then
        result = null
        while eval(expr[1], env)
            result = eval(expr[2], env)
        end while
        return result
    else if first == "lambda" then
        return {
            "type": "lambda",
            "params": expr[1],
            "body": expr[2:],
            "env": env,
        }
    else if first == "begin" then
        result = null
        for stmt in expr[1:]
            result = eval(stmt, env)
        end for
        return result
    else if first == "exec" then
        result = null
        for stmt in expr[1:]
            result = execute(stmt, env)
        end for
        return result
    else
        func = eval(first, env)
        args = expr[1:]
        evaluatedArgs = []
        for arg in args
            evaluatedArgs.push(eval(arg, env))
        end for
        if @func isa map and func.type == "lambda" then
            newEnv = Env(func.env)
            for i in indexes(func.params)
                newEnv.set(func.params[i], evaluatedArgs[i])
            end for
            result = null
            for bodyExpr in func.body
                result = eval(bodyExpr, newEnv)
            end for
            return result
        else if @func isa funcRef then
            return func(evaluatedArgs)
        end if
    end if
end function

globalEnv = Env(null) //global and general methods do not have access to environment. those are for keywords.
    globalEnv.vars["true"] = function(args)
        return true
    end function
    globalEnv.vars["false"] = function(args)
        return false
    end function
    globalEnv.vars["null"] = function(args) // WARNING: only use null for interacting with miniscript.
        return null
    end function
    globalEnv.vars["&"] = function(args)
        return args[0] and args[1]
    end function
    globalEnv.vars["|"] = function(args)
        return args[0] or args[1]
    end function
    globalEnv.vars["!"] = function(args)
        return not args[0]
    end function
    globalEnv.vars["=="] = function(args)
        return args[0] == args[1]
    end function
    globalEnv.vars["!="] = function(args)
        return args[0] != args[1]
    end function
    globalEnv.vars[">="] = function(args)
        return args[0] >= args[1]
    end function
    globalEnv.vars["<="] = function(args)
        return args[0] <= args[1]
    end function
    globalEnv.vars[">"] = function(args)
        return args[0] > args[1]
    end function
    globalEnv.vars["<"] = function(args)
        return args[0] < args[1]
    end function
    globalEnv.vars["*"] = function(args)
        return args[0] * args[1]
    end function
    globalEnv.vars["/"] = function(args)
        return args[0] / args[1]
    end function
    globalEnv.vars["+"] = function(args)
        return args[0] + args[1]
    end function
    globalEnv.vars["-"] = function(args)
        return args[0] - args[1]
    end function
    globalEnv.vars["^"] = function(args)
        return args[0] ^ args[1]
    end function
    globalEnv.vars.concat = function(args)
        result = ""
        for arg in args
            result = result + @arg
        end for
        return result
    end function
    globalEnv.vars.at = function(args)
        return @args[0][args[1]]
    end function
    globalEnv.vars.print = function(args)
        if args.len > 1 then return print(tree(args[0]), args[1])
        return print(tree(args[0]))
    end function
    globalEnv.vars.time = function(args)
        return time
    end function
    globalEnv.vars.round = function(args)
        return round(args[0], args[1])
    end function
    globalEnv.vars.list = function(args)
        return args
    end function
    globalEnv.vars.map = function(args)
        ret = {}
        for i in range(0, args.len-1, 2)
            key = args[i]
            value = args[i + 1]
            if key isa string then key = key[1:]
            ret[key] = value
        end for
        return ret
    end function
    globalEnv.vars.dot = function(args)
        length = []
        length.push(function(object, method, args))
            method = @object[@method]
            return method(object)
        end function
        length.push(function(object, method, args))
            method = @object[@method]
            return method(object, args[0])
        end function
        length.push(function(object, method, args))
            method = @object[@method]
            return method(object, args[0], args[1])
        end function
        length.push(function(object, method, args))
            method = @object[@method]
            return method(object, args[0], args[1], args[2])
        end function
        length.push(function(object, method, args))
            method = @object[@method]
            return method(object, args[0], args[1], args[2], args[3])
        end function
        length.push(function(object, method, args))
            method = @object[@method]
            return method(object, args[0], args[1], args[2], args[3], args[4])
        end function
        object = args[0]
        method = args[1]
        args = args[2:]
        run = @length[len(args)]
        return run(@object, @method, args)
    end function

general = {}
    general.active_user = function(args)
        return active_user
    end function
    general.bitwise = function(args)
        return bitwise(@args[0], @args[1], @args[2])
    end function
    general.clear_screen = function(args)
        return clear_screen
    end function
    general.command_info = function(args)
        return command_info(@args[0])
    end function
    general.current_date = function(args)
        return current_date
    end function
    general.current_path = function(args)
        return current_path
    end function
    general.exit = function(args)
        return exit(@args[0])
    end function
    general.format_columns = function(args)
        return format_columns(@args[0])
    end function
    general.get_ctf = function(args)
        return get_ctf(@args[0], @args[1], @args[2])
    end function
    general.get_custom_object = function(args)
        return get_custom_object
    end function
    general.get_router = function(args)
        return get_router(@args[0])
    end function
    general.get_shell = function(args)
        return get_shell(@args[0], @args[1])
    end function
    general.get_switch = function(args)
        return get_switch(@args[0])
    end function
    general.home_dir = function(args)
        return home_dir
    end function
    //theres no import_code, sorry.
    general.include_lib = function(args)
        return include_lib(@args[0])
    end function
    general.is_lan_ip = function(args)
        return is_lan_ip(@args[0])
    end function
    general.is_valid_ip = function(args)
        return is_valid_ip(@args[0])
    end function
    general.launch_path = function(args)
        return launch_path
    end function
    general.mail_login = function(args)
        return mail_login(@args[0], @args[1])
    end function
    general.nslookup = function(args)
        return nslookup(@args[0])
    end function
    general.parent_path = function(args)
        return parent_path(@args[0])
    end function
    general.print = function(args)
        return print(@args[0])
    end function
    general.program_path = function(args)
        return program_path
    end function
    general.reset_ctf_password = function(args)
        return reset_ctf_password(@args[0])
    end function
    general.typeof = function(args)
        return typeof(@args[0])
    end function
    general.user_bank_number = function(args)
        return user_bank_number
    end function
    general.user_input = function(args)
        return user_input(@args[0], @args[1], @args[2])
    end function
    general.user_mail_address = function(args)
        return user_mail_address
    end function
    general.wait = function(args)
        return wait(@args[0])
    end function
    general.whois = function(args)
        return whois(@args[0])
    end function
    general.to_int = function(args)
        return to_int(args[0])
    end function

for method in general
    globalEnv.vars[method.key] = @method.value
end for

execute = function(codeStr, env)
    return eval(parser(lexer(codeStr)), env)
end function

repl = function(env)
    while true
        codeStr = user_input("</> ")
        if codeStr == ";quit" then break
        result = eval(parser(lexer(codeStr)), env)
        if @result isa string then print(result) else print(tree(result))
    end while
end function

prepareCode = "()" //This one is hardcoded code you can run at start up.
env = Env(globalEnv)
execute(prepareCode, env)
repl(env)