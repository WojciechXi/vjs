class Page extends Layout {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Content', data.content ?? [], object.OnPropertyChanged);

        new Property(object, 'In', data.in ?? new Anim(125, function (sender, data) {
            let opacity = data.t;
            let scale = Math.Lerp(0.9, 1, data.t);

            object.Opacity = opacity;
            object.ContentView.Transform = `scale(${scale})`;
        }, function (sender, data) {
            object.Opacity = null;
        }), object.OnPropertyChanged);

        new Property(object, 'Out', data.out ?? new Anim(125, function (sender, data) {
            let opacity = data.i;
            let scale = Math.Lerp(1, 0.9, data.t);

            object.Opacity = opacity;
            object.ContentView.Transform = `scale(${scale})`;
        }), object.OnPropertyChanged);

        new Binding(object, 'Out', function (sender, data) {
            if (data.value) data.value.OnEnd.Listen(function (sender, success) {
                if (success) object.Remove();
            });
        });

        if (data.onPush) object.OnPush.Listen(data.onPush);
        if (data.onPull) object.OnPull.Listen(data.onPull);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Parent', function (sender, data) {
            if (object.Parent) {
                object.Push();
            }
        });

        new Binding(object, 'Content', function (sender, data) {
            object.ContentView.Children = Array.isArray(object.Content) ? object.Content : [];
        });
    }

    Render() {
        let object = this;

        object.Children = [
            object.ContentView,
        ];
    }

    get ElementTag() { return 'page'; }
    get ContentView() {
        let object = this;
        return object.contentView ?? (object.contentView = new Main());
    }

    get OnPush() {
        let object = this;
        return object.onPush ?? (object.onPush = new Callback());
    }
    get OnPull() {
        let object = this;
        return object.onPull ?? (object.onPull = new Callback());
    }

    GetHistory() {
        let object = this;
        return {
            class: object.constructor.name,
        };
    }

    Push() {
        let object = this;

        object.OnPush.Invoke(object, {});

        if (object.Out) object.Out.Stop();
        if (object.In) object.In.Start();
    }

    Pull() {
        let object = this;

        object.OnPull.Invoke(object, {});

        if (object.In) object.In.Stop();
        if (object.Out) object.Out.Start();
        else object.Remove();
    }

}