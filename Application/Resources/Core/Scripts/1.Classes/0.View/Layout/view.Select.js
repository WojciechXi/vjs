class Select extends Layout {

    get ElementTag() { return 'select'; }
    get ElementEvents() {
        let events = super.ElementEvents;
        let object = this;
        events.change = function (sender, event) {
            object.Value = object.Element.value;
            object.OnChange.Invoke(object, event);
        };
        return events;
    }

    get OnChange() { return this.onChange ?? (this.onChange = new Callback()); }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Value', data.value ?? '', function (property, oldValue, newValue) {
            object.Prop('value', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        if (data.onChange) object.OnChange.Listen(data.onChange);
    }

}