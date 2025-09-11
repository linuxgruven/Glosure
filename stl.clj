(defmacro defun (name arguments body) ()
    (def name (lambda arguments body)))

(defmacro defunction (name arguments body) ()
    (def name (glosure arguments body)))

(defmacro for (initializer condition iterator body) ()
    ((lambda () (begin
        initializer
        (while condition (begin
            body
            iterator))))))

(defmacro foreach (key value collection body) (,keys)
    ((lambda () (begin
        (def ,keys (indexes collection))
        (while ,keys (begin
            (def key (pull ,keys))
            (def value (at collection key))
            body))))))

(defmacro defalias (name keyword) ()
    (defmacro name () () keyword))

(defmacro swap (a b) (,temp) (begin
    (def ,temp a)
    (def a b)
    (def b ,temp)))

(defmacro ++inc (var) ()
    (def var (+ var 1)))

(defmacro inc++ (var) (,temp) (begin
    (def ,temp var)
    (def var (+ var 1))
    ,temp))

(defmacro --dec (var) ()
    (def var (- var 1)))

(defmacro dec-- (var) (,temp) (begin
    (def ,temp var)
    (def var (- var 1))
    ,temp))


(def params
    (if (hasIndex globals 'params')
        (at globals 'params')
        (list)))

(def script-path (program_path))
