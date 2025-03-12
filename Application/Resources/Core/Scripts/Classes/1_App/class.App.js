class App extends Layout {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        App.Instance = object;

        new Property(object, 'Title', data.title ?? 'App', object.OnPropertyChanged);
        new Property(object, 'Description', data.description ?? '', object.OnPropertyChanged);

        window.addEventListener('load', function (event) {
            document.body.appendChild(object.Element);

            object.Loaded();
            object.OnLoad.Invoke(object, event);
        });

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