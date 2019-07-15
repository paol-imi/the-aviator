/* --- Animations --- */
class Animations {
    // generate the animation with the given args
    // a promise is returned within the .complete() method
    static animate(args) {
        let complete,
            promise = new Promise(onComplete => {
                // timepline
                let tl = new TimelineLite({
                    onComplete: function(){
                        onComplete()
                    }
                })

                // load the animation
                args.forEach(animation => tl.to.apply(tl, animation))

                // complete the animation
                complete = () => tl.progress(1)
            })

        // calling .complete() will end the animation and resolve the promise
        promise.complete = complete

        return promise
    }
}