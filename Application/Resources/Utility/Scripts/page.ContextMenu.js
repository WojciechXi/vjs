class ContextMenu extends Page {

    Init(data = {}) {
        data.zIndex = data.zIndex ?? 9999;
        super.Init(data);
        let object = this;

        object.BackgroundColor = 'transparent';
        object.OnClick.Listen(function (sender, event) {
            if (event.target != object.Element) return;
            object.Pull();
        });

        object.OnContextMenu.Listen(function (sender, event) {
            event.preventDefault();
        });

        new Property(object, 'Event', data.event ?? null, object.OnPropertyChanged);
        new Property(object, 'Options', data.options ?? {}, object.OnPropertyChanged);

        new Property(object, 'Rect', { x: 0, y: 0 }, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: 'var(--pageBackground)',
                color: 'var(--pageColor)',
                boxShadow: '0rem 0.5rem 1rem rgba(0, 0, 0, 0.5)',
                position: 'absolute',
                left: '0px',
                top: '0px',
                callback: function (layout) {
                    let updatePosition = function () {
                        layout.Left = '0px';
                        layout.Top = '0px';

                        let elementHeight = layout.Element.clientHeight;
                        let elementWidth = layout.Element.clientWidth;

                        requestAnimationFrame(function () {
                            if (object.Rect.x + elementWidth > window.innerWidth) {
                                layout.Left = window.innerWidth - elementWidth;
                            } else {
                                layout.Left = object.Rect.x;
                            }

                            if (object.Rect.y + elementHeight > window.innerHeight) {
                                layout.Top = window.innerHeight - elementHeight;
                            } else {
                                layout.Top = object.Rect.y;
                            }
                        });
                    };

                    new Binding(object, 'Options', function (sender, data) {
                        let children = [];
                        Object.keys(object.Options).forEach(function (key) {
                            children.push(new Link({
                                classes: ['button'],
                                children: [
                                    new Text({
                                        text: key,
                                    }),
                                ],
                                onClick: function (sender, event) {
                                    object.Pull();
                                    object.Options[key](object, event);
                                },
                            }));
                        });
                        layout.Children = children;

                        updatePosition();
                    });

                    new Binding(object, 'Event', function (sender, data) {
                        if (object.Event) {
                            object.Rect = {
                                x: object.Event.clientX,
                                y: object.Event.clientY,
                            };

                            updatePosition();
                        } else {

                        }
                    });
                },
            }),
        ];
    }

}