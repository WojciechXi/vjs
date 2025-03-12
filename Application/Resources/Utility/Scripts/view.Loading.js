class Loading extends Layout {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'center';
        object.JustifyContent = 'center';

        object.Padding = 1;

        object.Width = '100%';
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                width: '3rem',
                height: '3rem',
                alignItems: 'center',
                justifyContent: 'center',
                children: [
                    new Icon({
                        text: 'motion_photos_on',
                        fontSize: 2,
                    }),
                ],
                callback: function (view) {
                    view.Attr('spin', true);
                },
            }),
        ];
    }

}