class App extends Layout {

    static {
        App.v2 = false;
        App.v2Prevent = [
            'submit',
            // 'click', 'mousedown', 'mouseup',
            // 'dragmove', 'dragenter', 'dragover', 'dragstart', 'dragleave',
            'drop',
        ];
    }

    Init(data = {}) {
        super.Init(data);
        const object = this;
        App.Instance = object;

        new Property(object, 'Title', data.title ?? 'App', function (property, oldValue, newValue) {
            document.title = newValue;
            object.OnPropertyChanged(property, oldValue, newValue);
        });
        new Property(object, 'Description', data.description ?? '', object.OnPropertyChanged);

        if (App.v2) {
            console.log('App.v2');
            for (let event of App.v2Prevent) window.addEventListener(event, function (event) { event.preventDefault(); event.stopPropagation(); });
        } else console.log('App.v1');

        if (data.body) {
            data.body.appendChild(object.Element);
            object.Loaded();
            object.OnLoad.Invoke(object, data.event ?? null);
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

        window.addEventListener('dragenter', function (event) {
        });
    }

    Loaded() {
        const object = this;
    }

    get ElementTag() {
        return 'app';
    }

    get OnLoad() {
        const object = this;
        return object.onLoad ?? (object.onLoad = new Callback());
    }

    get OnResize() {
        const object = this;
        return object.onResize ?? (object.onResize = new Callback());
    }
}