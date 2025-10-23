class Td extends Layout {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'Colspan', data.colspan ?? null, object.OnPropertyChanged);
        new Property(object, 'Rowspan', data.rowspan ?? null, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'Colspan', function (sender, data) {
            object.Attr('colspan', object.Colspan);
        });
        new Binding(object, 'Rowspan', function (sender, data) {
            object.Attr('rowspan', object.Rowspan);
        });
    }

    get ElementTag() { return 'td'; }

}