class Anim {

    constructor(duration, onStep, onEnd = null, onStart = null, onStop = null) {
        let object = this;
        object.duration = duration;

        object.play = false;

        object.OnStart.Listen(onStart);
        object.OnStep.Listen(onStep);
        object.OnEnd.Listen(onEnd);
        object.OnStop.Listen(onStop);
    }

    get OnStart() {
        let object = this;
        return object.onStart ?? (object.onStart = new Callback());
    }
    get OnStep() {
        let object = this;
        return object.onStep ?? (object.onStep = new Callback());
    }
    get OnEnd() {
        let object = this;
        return object.onEnd ?? (object.onEnd = new Callback());
    }
    get OnStop() {
        let object = this;
        return object.onStop ?? (object.onStop = new Callback());
    }

    Start() {
        let object = this;

        if (object.play) return;

        object.play = true;
        object.begin = Date.now();

        object.OnStart.Invoke(object);

        object.Step(0);
    }

    Step() {
        let object = this;

        if (!object.play) return;

        object.current = Date.now() - object.begin;
        object.transition = Math.Clamp(object.current / object.duration, 0, 1);

        if (object.transition >= 1) {
            return object.End(true);
        } else {
            object.OnStep.Invoke(object, {
                t: object.transition,
                i: 1 - object.transition,
            });

            requestAnimationFrame(function () {
                object.Step();
            });
        }
    }

    End(success = false) {
        let object = this;

        if (!object.play) return;

        object.play = false;
        object.end = Date.now();

        object.OnStep.Invoke(object, {
            t: 1,
            i: 0,
        });
        object.OnEnd.Invoke(object, success);
    }

    Stop() {
        let object = this;

        if (!object.play) return;

        object.play = false;
        object.end = Date.now();

        object.OnStop.Invoke(object, false);
    }

}