class Page extends Layout {
    Init(data = {}) {
        super.Init(data);
        const object = this;
        new Property(object, 'Content', data.content ?? [], object.OnPropertyChanged);

        new Property(object, 'InAnimation', data.inAnimation ?? new Anim(125, function (sender, data) {
            if (object.InStep) object.InStep(object, data);
        }, function (sender, data) {
            if (object.InEnd) object.InEnd(object, data);
        }));
        new Property(object, 'OutAnimation', data.outAnimation ?? new Anim(125, function (sender, data) {
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

        new Binding(object, 'Content', function (sender, data) {
            object.ContentView.Children = Array.isArray(object.Content) ? object.Content : [];
        });
    }

    Render() {
        const object = this;
        object.Children = [
            object.ContentView,
        ];
    }

    get ElementTag() { return 'page'; }
    get ContentView() {
        const object = this;
        return object.contentView ?? (object.contentView = new Main());
    }
    get OnPush() {
        const object = this;
        return object.onPush ?? (object.onPush = new Callback());
    }

    get OnPull() {
        const object = this;
        return object.onPull ?? (object.onPull = new Callback());
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