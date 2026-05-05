class Form extends Layout {

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

    get OnSubmit() { return this.onSubmit ?? (this.onSubmit = new Callback()); }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Action', data.action ?? null, function (property, oldValue, newValue) {
            object.Prop('action', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
        new Property(object, 'Method', data.method ?? null, function (property, oldValue, newValue) {
            object.Prop('method', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
        new Property(object, 'Enctype', data.enctype ?? 'multipart/form-data', function (property, oldValue, newValue) {
            object.Prop('enctype', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        if (data.onSubmit) object.OnSubmit.Listen(data.onSubmit);
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