class App extends Layout {

    static {
        App.v2 = false;
        App.v2Prevent = [
            'submit',
            'click', 'mousedown', 'mouseup',
            'dragmove', 'dragenter', 'dragover', 'dragstart', 'dragleave', 'drop',
        ];
    }

    Init(data = {}) {
        super.Init(data);
        let object = this;
        App.Instance = object;

        new Property(object, 'Title', data.title ?? 'App', object.OnPropertyChanged);
        new Property(object, 'Description', data.description ?? '', object.OnPropertyChanged);

        if (App.v2) { console.log('App.v2'); for (let event of App.v2Prevent) window.addEventListener(event, function (event) { event.preventDefault(); event.stopPropagation(); }); }
        else console.log('App.v1');

        if (data.body) {
            data.body.appendChild(object.Element);

            object.Loaded();
            object.OnLoad.Invoke(object, event);
        } else {
            window.addEventListener('load', function (event) {
                document.body.appendChild(object.Element);

                object.Loaded();
                object.OnLoad.Invoke(object, event);
            });
        }

        window.addEventListener('resize', function (event) {
            object.OnResize.Invoke(object, event);
        });

        window.addEventListener('dragenter', function () {

        });
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Title', function (sender, data) {
            document.title = data.value;
        });
    }

    Loaded() {
        let object = this;
    }

    get ElementTag() {
        return 'app';
    }

    get OnLoad() {
        let object = this;
        return object.onLoad ?? (object.onLoad = new Callback());
    }

    get OnResize() {
        let object = this;
        return object.onResize ?? (object.onResize = new Callback());
    }

}