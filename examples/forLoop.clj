;; Macro that implements a C-like for loop
(defmacro for initializer condition iterator body
(begin
    initializer
    (while condition
    (begin
        body
        iterator))))

;; Usage example
(for (def i 0) (< i 5) (def i (+ i 1))
(begin ;; begin is unneccessary if loop evaluates one expression only
 (print i)))
