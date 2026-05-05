class Anim {

    constructor(duration, onStep, onEnd = null, onStart = null, onStop = null) {
        const object = this;
        object.duration = duration;
        object.play = false;
        object.timingFunction = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        object.OnStart.Listen(onStart);
        object.OnStep.Listen(onStep);
        object.OnEnd.Listen(onEnd);
        object.OnStop.Listen(onStop);
    }

    get OnStart() {
        const object = this;
        return object.onStart ?? (object.onStart = new Callback());
    }

    get OnStep() {
        const object = this;
        return object.onStep ?? (object.onStep = new Callback());
    }

    get OnEnd() {
        const object = this;
        return object.onEnd ?? (object.onEnd = new Callback());
    }

    get OnStop() {
        const object = this;
        return object.onStop ?? (object.onStop = new Callback());
    }

    Start() {
        const object = this;
        if (object.play) return;
        object.play = true;
        object.begin = Date.now();
        object.OnStart.Invoke(object);
        object.Step(0);
    }

    Step() {
        const object = this;
        if (!object.play) return;
        object.current = Date.now() - object.begin;
        object.transition = Math.Clamp(object.current / object.duration, 0, 1);
        if (object.transition >= 1) {
            return object.End(true);
        } else {
            const t = object.timingFunction(object.transition);

            object.OnStep.Invoke(object, {
                t: t,
                i: 1 - t,
            });
            requestAnimationFrame(function () {
                object.Step();
            });
        }
    }

    End(success = false) {
        const object = this;
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
        const object = this;
        if (!object.play) return;
        object.play = false;
        object.end = Date.now();
        object.OnStop.Invoke(object, false);
    }

}