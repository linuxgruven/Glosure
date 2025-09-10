(defmacro swap (a b) (,temp) (begin ;; swap macro example
  (def ,temp a)
  (def a b)
  (def b ,temp)))


;; Usage
(def a 1)
(def b 5)

(print (list a b))
(swap a b)
(print (list a b))
(swap a b)
(print (list a b))
