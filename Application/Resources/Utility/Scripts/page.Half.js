class HalfPage extends Page {

    Init(data = {}) {
        super.Init(data);
        let object = this;
        new Property(object, 'HalfChildren', data.halfChildren ?? [], object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'HalfChildren', function (sender, data) {
            object.HalfView.Children = object.HalfChildren;
        });
    }

    Render() {
        let object = this;
        object.Children = [
            object.ContentView,
            object.HalfView,
        ];
    }

    Open(page) {
        let object = this;
        object.HalfView.AddChild(page);
        page.Push();
    }

    Close() {
        let object = this;
        if (object.HalfChildren.length) object.HalfChildren[0].Pull();
    }

    get ElementTag() { return 'half-page'; }

    get HalfView() {
        let object = this;
        return object.halfView ?? (object.halfView = new Layout({
            display: 'none',
            onLayoutChange: function (sender, data) {
                sender.Display = sender.Children.length ? null : 'none';
            },
        }));
    }

}