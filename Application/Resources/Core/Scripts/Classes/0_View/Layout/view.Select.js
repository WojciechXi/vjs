class Select extends Layout {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', object.OnPropertyChanged);

        if (data.onChange) object.OnChange.Listen(data.onChange);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Value', function (sender, data) {
            object.Prop('value', object.Value);
        });
    }

    get ElementTag() { return 'select'; }
    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.change = function (event) {
            object.Value = this.value;
            object.OnChange.Invoke(object, event);
        };
        return events;
    }

    get OnChange() {
        let object = this;
        return object.onChange ?? (object.onChange = new Callback());
    }

}