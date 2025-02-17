Reader = function(stri)
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

lexer = function(codeStr)
    tokens = []
    reader = Reader(codeStr)
    while reader.peek
        c = reader.next
        if (", " + char(9) + char(10)).indexOf(c) != null then
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
            while reader.peek and reader.peek != "'"
                c = reader.next
                if reader.peek == "\" and reader.peek(2) then //"
                    c = reader.next(2)
                    if c == "n" then
                        token.push(char(10))
                    else if c == "t" then
                        token.push(char(9))
                    else
                        token.push(c)
                    end if
                else
                    token.push(c)
                end if
            end while
            reader.next
            tokens.push(token.join(""))
        else
            token = [c]
            while reader.peek and (" '()" + char(9) + char(10)).indexOf(reader.peek) == null
                token.push(reader.next)
            end while
            tokens.push(token.join(""))
        end if
    end while
    return tokens
end function

parser = function(tokens)
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

Env = function(parent)
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

applyMacro = function(macro, args, env)
    newEnv = Env(macro.env)
    for i in indexes(macro.params)
        newEnv.set(macro.params[i], args[i])
    end for
    result = null
    for bodyExpr in macro.body
        result = eval(bodyExpr, newEnv)
    end for
    return result
end function

eval = function(expr, env)
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
    else if first == "lambda" then
        return {
            "type": "lambda",
            "params": expr[1],
            "body": expr[2:],
            "env": env,
        }
    else if first == "macro" then
        return {
            "type": "macro",
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
    else
        func = eval(first, env)
        args = expr[1:]
        if @func isa map and func.type == "macro" then
            expended = applyMacro(func, args, env)
            return eval(expended, env)
        end if
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

globalEnv = Env(null)
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
    globalEnv.vars.print = function(args)
        return print(args.join(" "))
    end function
    globalEnv.vars.input = function(args)
        return user_input(args[0], args[1], args[2])
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

for method in general
    globalEnv.vars[method.key] = @method.value
end for

execute = function(codeStr)
    return eval(parser(lexer(codeStr)), globalEnv)
end function

repl = function
    while true
        print(eval(parser(lexer(user_input("</> "))), globalEnv))
    end while
end function
repl