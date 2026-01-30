class ContextMenu extends Page {

    Init(data = {}) {
        data.zIndex = data.zIndex ?? 9999;
        super.Init(data);
        let object = this;

        object.BackgroundColor = 'transparent';
        object.Listen('click', function (sender, event) {
            if (event.target != object.Element) return;
            object.Pull();
        });

        object.Listen('contextmenu', function (sender, event) {
            event.preventDefault();
        });

        new Property(object, 'Event', data.event ?? null, object.OnPropertyChanged);
        new Property(object, 'Label', data.label ?? null, object.OnPropertyChanged);
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
            new Column({
                backgroundColor: 'var(--pageBackground)',
                color: 'var(--pageColor)',
                boxShadow: '0rem 0.5rem 1rem rgba(0, 0, 0, 0.5)',
                position: 'absolute',
                left: '0px',
                top: '0px',
                whiteSpace: 'nowrap',
                children: [
                    new Text({
                        callback: function (view) {
                            new Binding(object, 'Label', function () {
                                view.Display = object.Label ? null : 'none';
                                view.Text = object.Label;
                            });
                        },
                    }),
                    new Column({
                        callback: function (view) {
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
                                view.Children = children;
                            });
                        },
                    }),
                ],
                callback: function (view) {
                    let updatePosition = function () {
                        view.Left = '0px';
                        view.Top = '0px';

                        let elementHeight = view.Element.clientHeight;
                        let elementWidth = view.Element.clientWidth;

                        requestAnimationFrame(function () {
                            if (object.Rect.x + elementWidth > window.innerWidth) {
                                view.Left = window.innerWidth - elementWidth;
                            } else {
                                view.Left = object.Rect.x;
                            }

                            if (object.Rect.y + elementHeight > window.innerHeight) {
                                view.Top = window.innerHeight - elementHeight;
                            } else {
                                view.Top = object.Rect.y;
                            }
                        });
                    };

                    new Binding(object, 'Event', function (sender, data) {
                        if (object.Event) {
                            object.Rect = {
                                x: object.Event.clientX,
                                y: object.Event.clientY,
                            };

                            updatePosition();
                        }
                    });

                    new Binding(object, 'Options', function (sender, data) {
                        updatePosition();
                    });
                },
            }),
        ];
    }

}