(ns music-box.core)

(def canvas (.getElementById js/document "canvas"))
(def context (.getContext canvas "2d"))

(defn color
  ([r g b]  (str "rgb(" r "," g "," b ");"))
  ([r g b a]  (str "rgba(" r "," g "," b "," a ");")))

(defn red
  ([] (color 200 0 0))
  ([a] (color 200 0 0 a)))

(set! (.-width canvas) (.-width js/screen))
(set! (.-height canvas) (.-height js/screen))

(defn clear-canvas []
 (.clearRect context 0 0 (.-width canvas) (.-height canvas)))

(def row '({:color "rgb(200,0,0)" :x 0 :y 0}
           {:color "rgb(200,0,0)" :x 1 :y 0}
           {:color "rgb(0,200,0)" :x 2 :y 0}
           {:color "rgb(0,0,200)" :x 3 :y 0}))

(defn draw-square [square]
  (let [size 50
        x-offset (* (:x square) 20)
        y-offset (* (+ (:y square) 1) 20)
        x (+ (* (:x square) size) x-offset)
        y (+ (* (:y square) size) y-offset)]
    (set! (.-fillStyle context) (:color square))
    (.fillRect context x y size size)))

(defn draw-row [row]
  (loop [squares row]
    (if (not (empty? squares))
      (do
       (draw-square (first squares))
       (recur (rest squares))))))

(defn update-square [square]
  (let [x (:x square)
        y (:y square)]
    (assoc square :x (+ x 1))))

(defn update-row [row]
  (loop [squares row
         updated-squares u]
    (if (not (empty? squares))
      (recur (rest squares) (cons (update-square (first squares)) updated-squares))
      updated-squares)))

(defn main [r]
  (clear-canvas)
  (draw-row r))
  (.requestAnimationFrame js/window #(main (update-row r)))

(main row)
;; (. js/console (log "context is" context))

