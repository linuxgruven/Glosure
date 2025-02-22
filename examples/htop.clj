(def htop (lambda (comp) (begin
    (def bar (lambda (n l) (join (list '<color=#21bcff>' (* '#' (ceil (* (/ n  100) l))) '</color><color=#032e41>' (* '-' (- l (ceil (* (/ n  100 ) l)))) '</color>') '')))
    (while 1 (begin
        (def tasks (list))
        (def cpu 0)
        (def mem 0)
        (def lines (slice (split (dot comp 'show_procs') '\\n') 1))
        (while lines (begin
            (def task (split (pull lines) ' '))
            (def cpu (+ cpu (val (slice (at task 2) 0 (- 0 1)))))
            (def mem (+ mem (val (slice (at task 3) 0 (- 0 1)))))
            (push tasks (if (== (at task 0) 'root') (join (list '<color=#ff4b4b>' (at task 0) '</color> <color=#20ff98>' (at task 1) '</color> <color=#21bcff>' (at task 2) '</color> <color=#21bcff>' (at task 3) '</color> <color=#baff50>' (at task 4) '</color>') '') (join (list '<color=#fbfbfb>' (at task 0) '</color> <color=#20ff98>' (at task 1) '</color> <color=#21bcff>' (at task 2) '</color> <color=#21bcff>' (at task 3) '</color> <color=#baff50>' (at task 4) '</color>') '')))))
        (wait (/ (! (print (join (list '<color=#fbfbfb>tasks: ' (len tasks) '</color>\\n<color=#fbfbfb>cpu_usage: [</color>' (bar cpu 25) '<color=#fbfbfb>]==[ </color><color=#21bcff>' cpu '%</color> <color=#fbfbfb>]</color>\n<color=#fbfbfb>mem_usage: [</color>' (bar mem 25) '<color=#fbfbfb>]==[ </color><color=#21bcff>' mem '%</color> <color=#fbfbfb>]</color>\\n' (format_columns (join (+ (list '<color=#9d9d9d>USER</color> <color=#9d9d9d>PID</color> <color=#9d9d9d>CPU</color> <color=#9d9d9d>MEM</color> <color=#9d9d9d>COLOR</color>') tasks) '\\n'))) '') 1)) 2)))))))

(set (at globals 'command') 'htop' (glosure (a b c d) ;this one is for 5hell htop
    (def bar (lambda (n l) (join (list '<color=#21bcff>' (* '#' (ceil (* (/ n  100) l))) '</color><color=#032e41>' (* '-' (- l (ceil (* (/ n  100 ) l)))) '</color>') '')))
    (def comp (dot (get_shell) 'host_computer'))
    (while (!= (indexOf (def procs (dot comp 'show_procs')) 'Notepad') null) (begin
        (def tasks (list))
        (def cpu 0)
        (def mem 0)
        (def lines (slice (split procs '\\n') 1))
        (while lines (begin
            (def task (split (pull lines) ' '))
            (def cpu (+ cpu (val (slice (at task 2) 0 (- 0 1)))))
            (def mem (+ mem (val (slice (at task 3) 0 (- 0 1)))))
            (push tasks (if (== (at task 0) 'root') (join (list '<color=#ff4b4b>' (at task 0) '</color> <color=#20ff98>' (at task 1) '</color> <color=#21bcff>' (at task 2) '</color> <color=#21bcff>' (at task 3) '</color> <color=#baff50>' (at task 4) '</color>') '') (join (list '<color=#fbfbfb>' (at task 0) '</color> <color=#20ff98>' (at task 1) '</color> <color=#21bcff>' (at task 2) '</color> <color=#21bcff>' (at task 3) '</color> <color=#baff50>' (at task 4) '</color>') '')))))
        (wait (/ (! (print (join (list '<color=#fbfbfb>tasks: ' (len tasks) '</color>\\n<color=#fbfbfb>cpu_usage: [</color>' (bar cpu 25) '<color=#fbfbfb>]==[ </color><color=#21bcff>' cpu '%</color> <color=#fbfbfb>]</color>\n<color=#fbfbfb>mem_usage: [</color>' (bar mem 25) '<color=#fbfbfb>]==[ </color><color=#21bcff>' mem '%</color> <color=#fbfbfb>]</color>\\n' (format_columns (join (+ (list '<color=#9d9d9d>USER</color> <color=#9d9d9d>PID</color> <color=#9d9d9d>CPU</color> <color=#9d9d9d>MEM</color> <color=#9d9d9d>COLOR</color>') tasks) '\\n'))) '') 1)) 2))))))

