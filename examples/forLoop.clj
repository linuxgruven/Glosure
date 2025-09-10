;; Macro that implements a C-like for loop
(defmacro for initializer condition iterator body ((lambda ()
    initializer
    (while condition (begin
        body
        iterator)))))

;; Usage example
(for (def i 0) (< i 5) (def i (+ i 1)) (begin ;; begin is unneccessary if loop evaluates one expression only
    (print i)))

;; Macro that implements a foreach loop
(defmacro foreach container k v body ((lambda ()
    (def idxs (indexes container))
    (while (len idxs) (begin
        (def k (pull idxs))
        (def v (at container k))
        body)))))

;; Usage example
(foreach 'Hello world!' _ v  (begin ;; begin is unneccessary if loop evaluates one expression only
    (print v)))