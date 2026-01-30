class Form extends Layout {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Action', data.action ?? '', object.OnPropertyChanged);
        new Property(object, 'Method', data.method ?? 'GET', object.OnPropertyChanged);
        new Property(object, 'Enctype', data.enctype ?? 'multipart/form-data', object.OnPropertyChanged);

        if (data.onSubmit) object.OnSubmit.Listen(data.onSubmit);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Action', function (sender, data) {
            object.Prop('action', data.value);
        });
        new Binding(object, 'Method', function (sender, data) {
            object.Prop('method', data.value);
        });
        new Binding(object, 'Enctype', function (sender, data) {
            object.Prop('enctype', data.value);
        });
    }

    get ElementTag() { return 'form'; }
    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.submit = function (sender, event) {
            event.preventDefault();
            event.stopPropagation();
            object.OnSubmit.Invoke(object, event);
        };
        return events;
    }

    get OnSubmit() {
        let object = this;
        return object.onSubmit ?? (object.onSubmit = new Callback());
    }

    Submit() {
        let object = this;
        object.OnSubmit.Invoke(object, {});
    }

    Reset() {
        let object = this;
        object.Element.reset();
    }

}