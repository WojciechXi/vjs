class Page extends Layout {

    get ElementTag() { return 'page'; }
    get ContentView() { return this.contentView ?? (this.contentView = new Main()); }
    get OnPush() { return this.onPush ?? (this.onPush = new Callback()); }
    get OnPull() { return this.onPull ?? (this.onPull = new Callback()); }

    Init(data = {}) {
        super.Init(data);
        const object = this;

        new Property(object, 'Content', data.content ?? [], function (property, oldValue, newValue) {
            object.ContentView.Children = Array.isArray(newValue) ? newValue : [];
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'InAnimation', data.inAnimation ?? new Anim(data.inDuration ?? 250, function (sender, data) {
            if (object.InStep) object.InStep(object, data);
        }, function (sender, data) {
            if (object.InEnd) object.InEnd(object, data);
        }));
        new Property(object, 'OutAnimation', data.outAnimation ?? new Anim(data.outDuration ?? 250, function (sender, data) {
            if (object.OutStep) object.OutStep(object, data);
        }, function (sender, data) {
            if (object.OutEnd) object.OutEnd(object, data);
        }));

        new Property(object, 'InStep', data.inStep ?? function (sender, data) {
            let opacity = data.t;
            let scale = Math.Lerp(0.9, 1, data.t);
            sender.Opacity = opacity;
            sender.ContentView.Transform = `scale(${scale})`;
        });
        new Property(object, 'InEnd', data.inEnd ?? function (sender, data) {
            sender.Opacity = null;
        });

        new Property(object, 'OutStep', data.outStep ?? function (sender, data) {
            let opacity = data.i;
            let scale = Math.Lerp(1, 0.9, data.t);
            sender.Opacity = opacity;
            sender.ContentView.Transform = `scale(${scale})`;
        });
        new Property(object, 'OutEnd', data.outEnd ?? function (sender, data) {
            sender.Remove();
        });

        if (data.onPush) object.OnPush.Listen(data.onPush);
        if (data.onPull) object.OnPull.Listen(data.onPull);
    }

    Bind() {
        super.Bind();
        const object = this;

        new Binding(object, 'Parent', function (sender, data) {
            if (object.Parent) object.Push();
        });
    }

    Render() {
        const object = this;
        object.Children = [
            object.ContentView,
        ];
    }

    GetHistory() {
        const object = this;
        return {
            class: object.constructor.name,
        };
    }

    Push() {
        const object = this;
        object.OnPush.Invoke(object, {});
        if (object.OutAnimation) object.OutAnimation.Stop();
        if (object.InAnimation) object.InAnimation.Start();
    }

    Pull(dispose = false) {
        const object = this;

        object.OnPull.Invoke(object, {
            dispose: dispose,
        });

        if (object.InAnimation) object.InAnimation.Stop();
        if (object.OutAnimation) object.OutAnimation.Start();
        else object.Remove();

        if (dispose) setTimeout(function () {
            object.Dispose();
        }, 5000);
    }

}