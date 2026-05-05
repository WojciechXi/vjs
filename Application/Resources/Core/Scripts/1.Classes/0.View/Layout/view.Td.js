class Td extends Layout {

    get ElementTag() { return 'td'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Colspan', data.colspan ?? null, function (property, oldValue, newValue) {
            object.Attr('colspan', object.Colspan);
            object.OnPropertyChanged(property, oldValue, newValue);
        });

        new Property(object, 'Rowspan', data.rowspan ?? null, function (property, oldValue, newValue) {
            object.Attr('rowspan', object.Rowspan);
            object.OnPropertyChanged(property, oldValue, newValue);
        });
    }

}