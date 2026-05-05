class Link extends Layout {

    get ElementTag() { return 'a'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Target', data.target ?? null, function (property, oldValue, newValue) {
            object.Attr('target', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Href', data.href ?? null, function (property, oldValue, newValue) {
            object.Attr('target', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}