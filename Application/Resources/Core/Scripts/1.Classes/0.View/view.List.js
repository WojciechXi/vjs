class List extends Layout {

    get ElementTag() { return 'ul'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'ListStyleType', data.listStyleType ?? null, function (property, oldValue, newValue) {
            object.Css('list-style-type', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'ListStyleImage', data.listStyleImage ?? null, function (property, oldValue, newValue) {
            object.Css('list-style-image', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'ListStylePosition', data.listStylePosition ?? null, function (property, oldValue, newValue) {
            object.Css('list-style-position', newValue);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}