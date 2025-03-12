class TestApp extends App {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'CRM';
        object.Description = 'Motosati';

        new Property(object, 'User', data.user ?? null, object.OnPropertyChanged);
        new Property(object, 'Conversations', data.conversations ?? [], object.OnPropertyChanged);
        new Property(object, 'Notifications', data.notifications ?? [], object.OnPropertyChanged);
        new Property(object, 'NotificationsData', data.notificationsData ?? {
            unread: 0,
            total: 0,
        }, object.OnPropertyChanged);
        new Property(object, 'Night', Storage.Is('Night', 'true'), object.OnPropertyChanged);

        Ajax.OnResponse.Listen(function (ajax, data) {
            if (data.response && data.response.notify) {
                App.Instance.AddChild(new NotifyPage(data.response.notify));
            }
        });

        setInterval(function () {
            object.ReloadNotifications();
        }, 10000);

        setInterval(function () {
            // object.ReloadConversations();
        }, 10000);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'User', function (sender, data) {
            if (object.User) {
                let conversations = JSON.parse(Storage.Get(`User.${object.User.id}.Conversations`, '[]'));
                object.Conversations = conversations;
                object.ReloadConversations();
            } else {
                object.Conversations = [];
            }
        });

        new Binding(object, 'Night', function (sender, data) {
            object.Attr('night', object.Night);
            Storage.Set('Night', object.Night ? 'true' : 'false');
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Auth();
    }

    Auth() {
        let object = this;

        object.Clear();

        Ajax.Get('/auth', {
            load: function (response) {
                object.User = response.user;
                if (object.User) {
                    let homePage = new HomePage();
                    object.AddChild(homePage);

                    object.ReloadNotifications();
                } else {
                    let authPage = new AuthPage();
                    object.AddChild(authPage);

                    object.Notifications = [];
                }
            },
        })
    }

    ReloadNotifications() {
        let object = this;
        if (!object.User) return;

        Ajax.Get(`/notification`, {
            load: function (response) {
                if (response.success) {
                    object.Notifications = response.notifications;
                    object.NotificationsData = response.notificationsData;
                } else {
                    object.Notifications = [];
                    object.NotificationsData = {
                        unread: 0,
                        total: 0,
                    };
                }
            },
        });
    }

    ReloadConversations() {
        let object = this;
        if (!object.User) return;

        Ajax.Get('/conversation', {
            load: function (response) {
                if (response.success) {
                    object.Conversations = response.conversations;
                }
            },
        });
    }

    AddConversation(newConversation) {
        let object = this;

        newConversation.conversationMessages = [];
        object.Conversations.Add(newConversation);

        Ajax.Get(`/conversation/${newConversation.id}/conversationMessages`, {
            load: function (response) {
                if (response.success) {
                    newConversation.conversationMessages = response.conversationMessages;
                }
            },
        });

        object.OnPropertyChanged('Conversations');
    }

}

class Permission {

    static Has(permission) {
        if (!permission) return false;
        if (!App.Instance) return false;
        if (!App.Instance.User) return false;
        if (!App.Instance.User.role) return false;
        if (!App.Instance.User.role.permissions) return false;
        if (App.Instance.User.role.permissions.indexOf('*') >= 0) return true;
        return App.Instance.User.role.permissions.indexOf(permission) >= 0;
    }

}

const Colors = {
    System: '#008B8B',
    Conversation: '#CD5C5C',
    Note: '#8FBC8F',
    Task: '#8B0000',
    Reservation: '#8B008B',
    Service: '#B8860B',
    Product: '#006400',
    Customer: '#8A2BE2',
    Label: '#A52A2A',
    Notification: '#DEB887',
    User: '#5F9EA0',
    Role: '#6495ED',
};

const Icons = {

};

class AccountPage extends WindowPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = data.title ?? 'Konto';
        object.Theme = Colors.System;
    }

    Render() {
        super.Render();
        let object = this;

        object.BodyChildren = [
            object.AvatarForm,
            new Label({
                children: [
                    new Hr(),
                ],
            }),
            object.PasswordForm,
            new Label({
                children: [
                    new Hr(),
                ],
            }),
            new Column({
                children: [
                    new Label({
                        alignItems: 'center',
                        children: [
                            new Text({
                                text: 'Ciemny motyw',
                            }),
                            new Layout({
                                children: [
                                    new Checkbox({
                                        checked: TestApp.Instance.Night,
                                        onChange: function (sender, event) {
                                            TestApp.Instance.Night = sender.Checked;
                                        },
                                    })
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

    get AvatarForm() {
        let object = this;
        return object.avatarForm ?? (object.avatarForm = new Form({
            action: '/account/avatar',
            method: 'PUT',
            onSubmit: function (sender, event) {
                Ajax.Put(sender.Action, {
                    form: sender.Element,
                    load: function (response) {
                        console.log(response);
                    },
                });
            },
            children: [
                new Label({
                    width: '100%',
                    children: [
                        new Text({
                            fontSize: 2,
                            text: 'Zdjęcie profilowe'
                        }),
                    ],
                }),
                new Label({
                    width: '100%',
                    children: [
                        new Input({
                            width: '100%',
                            name: 'avatar',
                            type: 'file',
                        }),
                    ],
                }),
                new Row({
                    justifyContent: 'flex-end',
                    children: [
                        new Button({
                            children: [
                                new Text({
                                    text: 'Zmień zdjęcie profilowe',
                                })
                            ],
                        }),
                    ],
                }),
            ],
        }));
    }

    get PasswordForm() {
        let object = this;
        return object.passwordForm ?? (object.passwordForm = new Form({
            onSubmit: function (form, event) {
                Ajax.Put('/account/password', {
                    form: form.Element,
                    load: function (response) {
                        if (response.success) {
                            form.Reset();
                        }
                    },
                });
            },
            children: [
                new Label({
                    width: '100%',
                    children: [
                        new Text({
                            fontSize: 2,
                            text: 'Hasło'
                        })
                    ],
                }),
                new Label({
                    width: '100%',
                    children: [
                        new Input({
                            placeholder: 'Hasło',
                            name: 'password',
                            type: 'password',
                        }),
                    ],
                }),
                new Label({
                    width: '100%',
                    children: [
                        new Input({
                            placeholder: 'Powtórz hasło',
                            name: 'passwordRepeat',
                            type: 'password',
                        }),
                    ],
                }),
                new Row({
                    justifyContent: 'flex-end',
                    children: [
                        new Button({
                            children: [
                                new Text({
                                    text: 'Zmień hasło',
                                })
                            ],
                        }),
                    ],
                }),
            ],
        }));
    }

}

class AttachmentButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'flex-start';

        new Property(object, 'Attachment', data.attachment ?? {}, object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: Colors.System,
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        text: 'attachment',
                        callback: function (icon) {
                            new Binding(object, 'Attachment', function (sender, property) {
                                icon.Text = 'attachment';

                                if (object.Attachment && object.Attachment.file) {
                                    switch (object.Attachment.file.extension) {
                                        case 'jpg':
                                        case 'jpeg':
                                        case 'png':
                                        case 'webp':
                                        case 'gif':
                                            icon.Text = 'image';
                                            break;
                                        case 'pdf':
                                            icon.Text = 'picture_as_pdf';
                                            break;
                                        case 'csv':
                                        case 'ods':
                                        case 'xls':
                                        case 'xlsx':
                                            icon.Text = 'functions';
                                            break;
                                        case 'odp':
                                        case 'ppt':
                                        case 'pptx':
                                            icon.Text = 'pie_chart';
                                            break;
                                        case 'odt':
                                        case 'doc':
                                        case 'docx':
                                            icon.Text = 'description';
                                            break;
                                    }
                                }
                            });
                        },
                    }),
                ],
                callback: function (iconBackground) {
                    new Binding(object, 'Attachment', function (sender, property) {
                        iconBackground.BackgroundColor = 'black';
                        iconBackground.Color = 'white';

                        if (object.Attachment && object.Attachment.file) {
                            switch (object.Attachment.file.extension) {
                                case 'jpg':
                                case 'jpeg':
                                case 'png':
                                case 'webp':
                                case 'gif':
                                    iconBackground.BackgroundColor = 'darkgray';
                                    iconBackground.Color = 'white';
                                    break;
                                case 'pdf':
                                    iconBackground.BackgroundColor = '#cb0606';
                                    iconBackground.Color = 'white';
                                    break;
                                case 'csv':
                                case 'ods':
                                case 'xls':
                                case 'xlsx':
                                    iconBackground.BackgroundColor = '#107b0f';
                                    iconBackground.Color = 'white';
                                    break;
                                case 'odp':
                                case 'ppt':
                                case 'pptx':
                                    iconBackground.BackgroundColor = '#d14424';
                                    iconBackground.Color = 'white';
                                    break;
                                case 'odt':
                                case 'doc':
                                case 'docx':
                                    iconBackground.BackgroundColor = '#2b5798';
                                    iconBackground.Color = 'white';
                                    break;
                            }
                        }
                    });
                },
            }),
            new Layout({
                width: '0%',
                flexGrow: 1,
                children: [
                    new UserLabelView({
                        width: '100%',
                        callback: function (view) {
                            new Binding(object, 'Attachment', function (sender, property) {
                                view.User = object.Attachment ? object.Attachment.owner : null;
                            });
                        },
                    }),
                    new Text({
                        width: '100%',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        callback: function (view) {
                            new Binding(object, 'Attachment', function (sender, property) {
                                view.Tooltip = view.Text = object.Attachment && object.Attachment.file ? `${object.Attachment.file.name}.${object.Attachment.file.extension}` : 'Brak nazwy';
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}

class AttachmentsView extends Column {

    Init(data = {}) {
        super.Init();
        let object = this;

        new Property(object, 'CanAdd', data.canAdd ?? true, object.OnPropertyChanged);
        new Property(object, 'Attachments', data.attachments ?? [], object.OnPropertyChanged);
        new Property(object, 'Target', data.target ?? null, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Target', function (sender, data) {
            object.ReloadAttachments();
        });
    }

    Render() {
        let object = this;

        object.Children = [
            object.Form,
            new Column({
                childrenLoop: function (attachment) {
                    return object.GetAttachmentButton(attachment);
                },
                callback: function (view) {
                    object.attachmentList = view;

                    new Binding(object, 'Attachments', function (sender, data) {
                        view.Children = object.Attachments;
                    });
                },
            }),
        ];
    }

    GetAttachmentButton(attachment) {
        return new AttachmentButton({
            attachment: attachment,
            onClick: function (sender, data) {
                window.open(sender.Attachment.file.url, '_blank');
            },
        });
    }

    ReloadAttachments() {
        let object = this;

        object.Attachments = [];
        object.Loading.Parent = object.attachmentList;

        if (!object.Target) {
            object.Attachments = [];
            return;
        }

        Ajax.Post(`/attachment/query`, {
            data: {
                objectType: object.Target.class,
                objectId: object.Target.id,
            },
            load: function (response) {
                if (response.success) {
                    object.Attachments = response.attachments;
                } else {
                    object.Attachments = [];
                }
            },
        });
    }

    get Form() {
        let object = this;
        return object.form ?? (object.form = new Form({
            width: '100%',
            onSubmit: function (form, event) {
                form.Disabled = true;
                Ajax.Post(`/attachment`, {
                    form: form.Element,
                    load: function (response) {
                        form.Disabled = false;

                        if (response.success) {
                            form.Reset();
                            response.attachments.forEach(function (attachment) {
                                let attachmentView = object.GetAttachmentButton(attachment);
                                attachmentView.Parent = object.attachmentList;
                            });
                        }
                    },
                });
            },
            callback: function (view) {
                new Binding(object, 'CanAdd', function (sender, data) {
                    view.Display = object.CanAdd ? null : 'none';
                });
            },
            children: [
                new Input({
                    type: 'hidden',
                    name: 'objectType',
                    callback: function (view) {
                        new Binding(object, 'Target', function (sender, data) {
                            view.Value = object.Target ? object.Target.class : '';
                        });
                    },
                }),
                new Input({
                    type: 'hidden',
                    name: 'objectId',
                    callback: function (view) {
                        new Binding(object, 'Target', function (sender, data) {
                            view.Value = object.Target ? object.Target.id : '0';
                        });
                    },
                }),
                new Row({
                    width: '100%',
                    children: [
                        new Label({
                            width: '0%',
                            flexGrow: 1,
                            children: [
                                new Input({
                                    width: '100%',
                                    name: 'file',
                                    type: 'file',
                                    multiple: true,
                                })
                            ],
                        }),
                        new ButtonSetting({
                            icon: 'add',
                            header: 'Dodaj',
                            text: 'Załączniki',
                        }),
                    ],
                }),
            ],
        }));
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

}

class AuthPage extends Page {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'center';
        object.JustifyContent = 'center';

        object.ContentView.MaxWidth = 450;

        new Property(object, 'Output', '', object.OnPropertyChanged);
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            object.Form,
        ];
    }

    get Form() {
        let object = this;
        return object.form ?? (object.form = new Form({
            action: '/auth',
            method: 'POST',
            onSubmit: function (sender, event) {
                object.Output = '';
                Ajax.Post(sender.Action, {
                    form: sender.Element,
                    load: function (response) {
                        if (response.success) {
                            TestApp.Instance.Auth();
                        } else if (response.message) {
                            object.Output = response.message;
                        }
                    },
                });
            },
            children: [
                new Label({
                    width: '100%',
                    children: [
                        new Column({
                            children: [
                                new Img({
                                    width: '100%',
                                    source: '/Assets/logo.png',
                                }),
                            ],
                        }),
                    ],
                }),
                new Label({
                    width: '100%',
                    children: [
                        new Row({
                            padding: '1px',
                            borderRadius: 2,
                            alignItems: 'center',
                            backgroundColor: 'var(--inputColor)',
                            color: 'var(--inputBackground)',
                            width: '100%',
                            overflow: 'hidden',
                            children: [
                                new Input({
                                    width: '0%',
                                    flexGrow: 1,
                                    placeholder: 'Adres email',
                                    name: 'email',
                                    type: 'email',
                                    autocomplete: 'email',
                                }),
                                new Icon({
                                    text: 'alternate_email',
                                    padding: '0.5rem 1rem',
                                }),
                            ],
                        }),
                    ],
                }),
                new Label({
                    width: '100%',
                    children: [
                        new Row({
                            padding: '1px',
                            borderRadius: 2,
                            alignItems: 'center',
                            backgroundColor: 'var(--inputColor)',
                            color: 'var(--inputBackground)',
                            width: '100%',
                            overflow: 'hidden',
                            children: [
                                new Input({
                                    width: '0%',
                                    flexGrow: 1,
                                    placeholder: 'Hasło',
                                    name: 'password',
                                    type: 'password',
                                    autocomplete: 'password',
                                }),
                                new Icon({
                                    text: 'password',
                                    padding: '0.5rem 1rem',
                                }),
                            ],
                        }),
                    ],
                }),
                new Label({
                    width: '100%',
                    children: [
                        new Output({
                            callback: function (view) {
                                new Binding(object, 'Output', function (sender, data) {
                                    view.Value = object.Output;
                                });
                            },
                        }),
                    ],
                }),
                new Row({
                    width: '100%',
                    justifyContent: 'flex-end',
                    children: [
                        new Button({
                            children: [
                                new Text({
                                    text: 'Zaloguj się',
                                })
                            ],
                        }),
                    ],
                }),
            ],
        }));
    }

}

class CalendarPage extends TitlePage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Kalendarz';

        object.ContentView.FlexGrow = 1;
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new CalendarMonth({
                width: '100%',
                callback: function (view) {
                    object.OnPush.Listen(function () {
                        view.Date = new Date();
                    });
                },
            }),
        ];
    }

}

class CalendarDay extends Layout {

}

class CalendarMonth extends Table {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Date', data.date ?? new Date(), object.OnPropertyChanged);
        new Property(object, 'Events', data.events ?? [], object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Date', function (sender, data) {
            Ajax.Post(`/calendar/events`, {
                data: {
                    date: `${object.Date.getFullYear()}-${object.Date.getMonth() + 1}`,
                },
                load: function (response) {
                    object.Events = response.events;
                },
            });
        });
    }

    Render() {
        let object = this;

        object.Children = [
            object.THead,
            object.TBody,
        ];
    }

    get THead() {
        let object = this;
        return object.thead ?? (object.thead = new THead({
            children: [
                new Tr({
                    height: '0px',
                    children: [
                        new Th({
                            colspan: 7,
                            children: [
                                new Row({
                                    gap: 0.5,
                                    padding: 0.5,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    children: [
                                        new Button({
                                            fontSize: 1,
                                            children: [
                                                new Icon({
                                                    text: 'arrow_back_ios',
                                                }),
                                            ],
                                            onClick: function (sender, event) {
                                                object.Date = new Date(object.Date.getFullYear(), object.Date.getMonth() - 1, 1);
                                            },
                                        }),
                                        new Text({
                                            width: 360,
                                            fontSize: 2,
                                            callback: function (view) {
                                                new Binding(object, 'Date', function (sender, data) {
                                                    view.Text = `${object.Date.toLocaleString('default', { month: 'long' })} ${object.Date.getFullYear()}`;
                                                });
                                            },
                                        }),
                                        new Button({
                                            fontSize: 1,
                                            children: [
                                                new Icon({
                                                    text: 'arrow_forward_ios',
                                                }),
                                            ],
                                            onClick: function (sender, event) {
                                                object.Date = new Date(object.Date.getFullYear(), object.Date.getMonth() + 1, 1);
                                            },
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
                new Tr({
                    height: '0px',
                    children: [
                        new Th({
                            width: `${100 / 7}%`,
                            children: [
                                new Text({
                                    text: 'Poniedziałek'
                                }),
                            ],
                        }),
                        new Th({
                            width: `${100 / 7}%`,
                            children: [
                                new Text({
                                    text: 'Wtorek'
                                }),
                            ],
                        }),
                        new Th({
                            width: `${100 / 7}%`,
                            children: [
                                new Text({
                                    text: 'Środa'
                                }),
                            ],
                        }),
                        new Th({
                            width: `${100 / 7}%`,
                            children: [
                                new Text({
                                    text: 'Czwartek'
                                }),
                            ],
                        }),
                        new Th({
                            width: `${100 / 7}%`,
                            children: [
                                new Text({
                                    text: 'Piątek'
                                }),
                            ],
                        }),
                        new Th({
                            width: `${100 / 7}%`,
                            children: [
                                new Text({
                                    text: 'Sobota'
                                }),
                            ],
                        }),
                        new Th({
                            width: `${100 / 7}%`,
                            children: [
                                new Text({
                                    text: 'Niedziela'
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        }));
    }

    get TBody() {
        let object = this;
        return object.tbody ?? (object.tbody = new TBody({
            callback: function (view) {
                new Binding(object, 'Date', function (sender, data) {
                    let today = new Date();

                    let firstDay = new Date(object.Date.getFullYear(), object.Date.getMonth(), 1);
                    let lastDay = new Date(object.Date.getFullYear(), object.Date.getMonth() + 1, 0);

                    let dayOfWeek = firstDay.getDay() - 1;
                    if (dayOfWeek < 0) dayOfWeek = 6;

                    let weeks = [];
                    for (let w = 0; w < 6; w++) {
                        let tr = new Tr({
                            height: 180,
                            verticalAlign: 'top',
                        });

                        for (let d = 0; d < 7; d++) {
                            let date = new Date(firstDay.getFullYear(), firstDay.getMonth(), w * 7 + d - dayOfWeek + 1);
                            let dateLocal = new Date(firstDay.getFullYear(), firstDay.getMonth(), w * 7 + d - dayOfWeek + 1 + 1);

                            let td = new Td({
                                onContextMenu: function (td, event) {
                                    event.preventDefault();
                                    let contextMenu = new ContextMenu({
                                        event: event,
                                        options: {
                                            'Nowa notatka': function (contextMenu, event) {
                                                Ajax.Post(`/note`, {
                                                    data: {
                                                        date: dateLocal.toISOString().slice(0, 10),
                                                    },
                                                    load: function (response) {
                                                        if (response.success) {
                                                            let eventList = td.Find('EventList');
                                                            if (eventList) {
                                                                let eventView = object.GetEventView(response.note);
                                                                eventView.Parent = eventList;
                                                                eventView.Click();
                                                            }
                                                        }
                                                    },
                                                });
                                            },
                                            'Nowe zadanie': function (contextMenu, event) {
                                                Ajax.Post(`/task`, {
                                                    data: {
                                                        date: dateLocal.toISOString().slice(0, 10),
                                                    },
                                                    load: function (response) {
                                                        console.log(response);
                                                        if (response.success) {
                                                            let eventList = td.Find('EventList');
                                                            if (eventList) {
                                                                let eventView = object.GetEventView(response.task);
                                                                eventView.Parent = eventList;
                                                                eventView.Click();
                                                            }
                                                        }
                                                    },
                                                });
                                            },
                                        },
                                    });
                                    App.Instance.AddChild(contextMenu);
                                },
                                callback: function (view) {
                                    if (date.getFullYear() == today.getFullYear()) {
                                        if (date.getMonth() == today.getMonth()) {
                                            if (date.getDate() == today.getDate()) {
                                                view.BackgroundColor = `var(--inputBackground)`;
                                                view.Color = `var(--inputColor)`;
                                            }
                                        }
                                    }
                                },
                                position: 'relative',
                                children: [
                                    new Row({
                                        children: [
                                            new Text({
                                                fontWeight: 'bold',
                                                text: date.getDate(),
                                            }),
                                            new Column({
                                                width: '0%',
                                                flexGrow: 1,
                                                name: 'EventList',
                                                childrenLoop: function (event) {
                                                    return object.GetEventView(event);
                                                },
                                                callback: function (view) {
                                                    new Binding(object, 'Events', function (data, sender) {
                                                        if (object.Events) {
                                                            let events = object.Events.filter(function (event) {
                                                                let eventDate = new Date(event.date);
                                                                return date.getFullYear() == eventDate.getFullYear() && date.getMonth() == eventDate.getMonth() && date.getDate() == eventDate.getDate();
                                                            });

                                                            view.Children = events;
                                                        }
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            });

                            tr.AddChild(td);
                        }

                        weeks.push(tr);
                    }

                    view.Children = weeks;
                });
            },
        }));
    }

    GetEventView(event) {
        let object = this;

        if (event.class == 'Note') {
            return new NoteCalendarButton({
                note: event,
                onClick: function (noteCalendarButton, data) {
                    let notePage = new NotePage({
                        note: noteCalendarButton.Note,
                        onNoteChange: function (notePage, data) {
                            noteCalendarButton.Note = notePage.Note;
                        },
                        onNoteTrash: function (notePage, data) {
                            noteCalendarButton.Remove();
                        },
                    });

                    TestApp.Instance.AddChild(notePage);
                },
            });
        }

        if (event.class == 'Task') {
            return new TaskCalendarButton({
                task: event,
                onClick: function (taskCalendarButton, data) {
                    let taskPage = new TaskPage({
                        task: taskCalendarButton.Task,
                        onTaskChange: function (taskPage, data) {
                            taskCalendarButton.Task = taskPage.Task;
                        },
                        onTaskTrash: function (taskPage, data) {
                            taskCalendarButton.Remove();
                        },
                    });

                    TestApp.Instance.AddChild(taskPage);
                },
            });
        }

        if (event.class == 'CalendarEvent') {
            return new Row({
                gap: 0.125,
                padding: 0.125,
                alignItems: 'center',
                color: 'royalblue',
                children: [
                    new Icon({
                        text: 'calendar_month',
                    }),
                    new Text({
                        width: '0%',
                        flexGrow: 1,
                        overflow: 'hidden',
                        fontSize: 0.6,
                        text: event.name,
                    }),
                ]
            });
        }

        return new Row({
            gap: 0.125,
            padding: 0.125,
            children: [
                new Icon({
                    text: 'calendar_month',
                }),
                new Text({
                    width: '0%',
                    flexGrow: 1,
                    overflow: 'hidden',
                    fontSize: 0.6,
                    text: event.class,
                }),
            ]
        });
    }

}

class CalendarWeek extends Layout {

}

class CommentButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'flex-start';

        new Property(object, 'Comment', data.comment ?? {}, object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: Colors.System,
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        text: 'comment',
                    }),
                ],
            }),
            new Layout({
                width: '0%',
                flexGrow: 1,
                children: [
                    new UserLabelView({
                        callback: function (view) {
                            new Binding(object, 'Comment', function (sender, property) {
                                view.User = object.Comment ? object.Comment.owner : null;
                            });
                        },
                    }),
                    new Text({
                        callback: function (view) {
                            new Binding(object, 'Comment', function (sender, property) {
                                view.Text = object.Comment && object.Comment.body ? object.Comment.body : '';
                            });
                        },
                    }),
                    new Text({
                        fontSize: 0.6,
                        callback: function (view) {
                            new Binding(object, 'Comment', function (sender, property) {
                                view.Text = object.Comment ? object.Comment.created : '';
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}



class CommentPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Komentarz';

        new Property(object, 'Comment', data.comment ?? {}, object.OnPropertyChanged);
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Row({
                children: [
                    new Column({
                        flexGrow: 3,
                        width: '75%',
                        children: [
                            new CommentView({
                                callback: function (view) {
                                    new Binding(object, 'Comment', function (data, sender) {
                                        view.Comment = object.Comment;
                                    });
                                },
                            }),
                            new Label({
                                children: [
                                    new Text({
                                        fontSize: 2,
                                        text: 'Komentarze'
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 1,
                        width: '25%',
                        minWidth: '270px',
                        children: [
                            new ButtonSetting({
                                icon: 'close',
                                header: 'Zamknij',
                                text: '',
                                onClick: function (sender, event) {
                                    object.Pull();
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }


}

class CommentEditPage extends ModalPage {

    Init(data = {}) {
        super.Init();
        let object = this;

        new Property(object, 'Comment', data.comment ?? {}, object.OnPropertyChanged);

        if (data.onCommentChange) object.OnCommentChange.Listen(data.onCommentChange);
        if (data.onCommentRestore) object.OnCommentRestore.Listen(data.onCommentRestore);
        if (data.onCommentTrash) object.OnCommentTrash.Listen(data.onCommentTrash);
        if (data.onCommentDelete) object.OnCommentDelete.Listen(data.onCommentDelete);
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Row({
                children: [
                    new Column({
                        flexGrow: 3,
                        width: '75%',
                        children: [
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'description',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Textarea({
                                                width: '100%',
                                                placeholder: 'Treść',
                                                rows: 5,
                                                onFocus: function (textarea, event) {
                                                    textarea.Rows = 10;
                                                },
                                                onBlur: function (textarea, event) {
                                                    textarea.Rows = 5;
                                                },
                                                callback: function (view) {
                                                    new Binding(object, 'Comment', function (sender, data) {
                                                        view.Value = object.Comment.body;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        body: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 1,
                        width: '25%',
                        minWidth: '270px',
                        children: [
                            new Column({
                                callback: function (view) {
                                    if (object.Comment.trashBy) {
                                        view.Children = [
                                            new ButtonSetting({
                                                icon: 'restore',
                                                iconColor: 'forestgreen',
                                                header: 'Przywróć',
                                                text: 'Przywróć komentarz z kosza',
                                                onClick: function (button, event) {
                                                    object.Restore();
                                                },
                                            }),
                                            new ButtonSetting({
                                                icon: 'delete',
                                                iconColor: 'crimson',
                                                header: 'Usuń',
                                                text: 'Usuń komentarz na zawsze',
                                                onClick: function (button, event) {
                                                    object.Delete();
                                                },
                                            }),
                                        ];
                                    } else {
                                        view.Children = [
                                            new ButtonSetting({
                                                icon: 'delete',
                                                iconColor: 'crimson',
                                                header: 'Usuń',
                                                text: 'Przenieś komentarz do kosza',
                                                onClick: function (button, event) {
                                                    object.Trash();
                                                },
                                            }),
                                        ];
                                    }
                                },
                            }),
                            new ButtonSetting({
                                icon: 'close',
                                header: 'Zamknij',
                                text: '',
                                onClick: function (sender, event) {
                                    object.Pull();
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

    Update(data = {}) {
        let object = this;
        Ajax.Put(`/comment/${object.Comment.id}`, {
            data: data,
            load: function (response) {
                if (response.success) {
                    object.Comment = response.comment;
                    object.OnCommentChange.Invoke(object, {
                        comment: object.Comment,
                    });
                }
            },
        });
    }

    Restore() {
        let object = this;
        Ajax.Post(`/comment/${object.Comment.id}/restore`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.Comment = response.comment;
                    object.OnCommentChange.Invoke(object, {
                        comment: object.Comment,
                    });
                    object.OnCommentRestore.Invoke(object, {
                        comment: object.Comment,
                    });
                }
            },
        });
    }

    Trash() {
        let object = this;
        Ajax.Post(`/comment/${object.Comment.id}/trash`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.Comment = response.comment;
                    object.OnCommentChange.Invoke(object, {
                        comment: object.Comment,
                    });
                    object.OnCommentTrash.Invoke(object, {
                        comment: object.Comment,
                    });
                }
            },
        });
    }

    Delete() {
        let object = this;
        Ajax.Delete(`/comment/${object.Comment.id}`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.OnCommentDelete.Invoke(object, {
                        comment: object.Comment,
                    });
                }
            },
        });
    }

    get OnCommentChange() {
        let object = this;
        return object.onCommentChange ?? (object.onCommentChange = new Callback());
    }

    get OnCommentRestore() {
        let object = this;
        return object.onCommentRestore ?? (object.onCommentRestore = new Callback());
    }

    get OnCommentTrash() {
        let object = this;
        return object.onCommentTrash ?? (object.onCommentTrash = new Callback());
    }

    get OnCommentDelete() {
        let object = this;
        return object.onCommentDelete ?? (object.onCommentDelete = new Callback());
    }

}

class CommentView extends Column {

    Init(data = {}) {
        super.Init();
        let object = this;

        new Property(object, 'Comment', data.comment ?? {}, object.OnPropertyChanged);
    }

    Render() {
        let object = this;
        object.Children = [
            new Column({
                padding: 1,
                children: [
                    new Row({
                        gap: 1,
                        justifyContent: 'space-between',
                        children: [
                            new UserLabelView({
                                callback: function (view) {
                                    new Binding(object, 'Comment', function (sender, data) {
                                        view.User = object.Comment ? object.Comment.owner : null;
                                    });
                                },
                            }),
                            new Text({
                                fontSize: 0.6,
                                callback: function (view) {
                                    new Binding(object, 'Comment', function (sender, data) {
                                        view.Text = object.Comment ? object.Comment.created : '';
                                    });
                                },
                            }),
                        ],
                    }),
                    new Row({
                        alignItems: 'flex-start',
                        children: [
                            new Column({
                                width: '0%',
                                flexGrow: 1,
                                children: [
                                    new Text({
                                        whiteSpace: 'pre-line',
                                        callback: function (view) {
                                            new Binding(object, 'Comment', function (sender, data) {
                                                view.Text = object.Comment ? object.Comment.body : '';
                                            });
                                        },
                                    }),
                                    new AttachmentsView({
                                        canAdd: false,
                                        callback: function (view) {
                                            new Binding(object, 'Comment', function (sender, data) {
                                                view.Target = object.Comment;
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new Icon({
                                text: 'edit',
                                cursor: 'pointer',
                                onClick: function (icon, event) {
                                    let commentEditPage = new CommentEditPage({
                                        comment: object.Comment,
                                        onCommentChange: function (commentEditPage, data) {
                                            object.Comment = commentEditPage.Comment;
                                        },
                                        onCommentTrash: function (commentEditPage, data) {
                                            object.Remove();
                                        },
                                    });

                                    App.Instance.AddChild(commentEditPage);
                                },
                            }),
                        ],
                    }),
                ],
            }),
            new Column({
                padding: '0rem 0rem 0rem 1rem',
                children: [
                    new CommentsView({
                        isReversed: true,
                        callback: function (view) {
                            new Binding(object, 'Comment', function (sender, data) {
                                view.Target = object.Comment;
                                view.IsTree = object.Comment.objectType != 'Comment';
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}

class CommentsView extends Column {

    Init(data = {}) {
        super.Init();
        let object = this;

        new Property(object, 'IsReversed', data.isReversed ?? false, object.OnPropertyChanged);
        new Property(object, 'IsTree', data.isTree ?? true, object.OnPropertyChanged);
        new Property(object, 'Comments', data.comments ?? [], object.OnPropertyChanged);
        new Property(object, 'Target', data.target ?? null, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Target', function (sender, data) {
            object.ReloadComments();
        });
    }

    Render() {
        let object = this;

        object.Children = [
            new BoxView({
                children: [
                    object.Form,
                    new Column({
                        childrenLoop: function (comment) {
                            return object.GetCommentView(comment);
                        },
                        callback: function (view) {
                            object.commentList = view;

                            new Binding(object, 'Comments', function (sender, data) {
                                view.Children = object.Comments;
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    GetCommentView(comment) {
        return new CommentView({
            comment: comment,
        });
    }

    ReloadComments() {
        let object = this;

        object.Comments = [];
        object.Loading.Parent = object.commentList;

        if (!object.Target) {
            object.Comments = [];
            return;
        }

        Ajax.Post(`/comment/query`, {
            data: {
                objectType: object.Target.class,
                objectId: object.Target.id,
            },
            load: function (response) {
                if (response.success) {
                    object.Comments = response.comments;
                } else {
                    object.Comments = [];
                }
            },
        });
    }

    get Form() {
        let object = this;
        return object.form ?? (object.form = new Form({
            width: '100%',
            callback: function (view) {
                new Binding(object, 'IsTree', function (sender, data) {
                    view.Display = object.IsTree ? null : 'none';
                });

                new Binding(object, 'IsReversed', function (sender, data) {
                    view.Order = object.IsReversed ? 1 : 0;
                });
            },
            onSubmit: function (form, event) {
                form.Disabled = true;
                Ajax.Post(`/comment`, {
                    form: form.Element,
                    files: object.FilesInput.Files,
                    load: function (response) {
                        form.Disabled = false;

                        if (response.success) {
                            form.Reset();
                            object.FilesInput.Files = [];
                            let commentView = object.GetCommentView(response.comment);
                            commentView.Parent = object.commentList;
                        }
                    },
                });
            },
            children: [
                new Input({
                    type: 'hidden',
                    name: 'objectType',
                    callback: function (view) {
                        new Binding(object, 'Target', function (sender, data) {
                            view.Value = object.Target ? object.Target.class : '';
                        });
                    },
                }),
                new Input({
                    type: 'hidden',
                    name: 'objectId',
                    callback: function (view) {
                        new Binding(object, 'Target', function (sender, data) {
                            view.Value = object.Target ? object.Target.id : '0';
                        });
                    },
                }),
                new Label({
                    width: '100%',
                    flexWrap: 'wrap',
                    children: [
                        new UserLabelView({
                            width: '100%',
                            callback: function (view) {
                                new Binding(TestApp.Instance, 'User', function (sender, data) {
                                    view.User = TestApp.Instance.User;
                                });
                            },
                        }),
                    ],
                }),
                new Row({
                    width: '100%',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    children: [
                        new Label({
                            width: '0%',
                            flexGrow: 1,
                            minWidth: '270px',
                            children: [
                                new Textarea({
                                    width: '100%',
                                    name: 'body',
                                    placeholder: 'Komentarz',
                                    resize: 'none',
                                    rows: 1,
                                    onFocus: function (textarea, event) {
                                        textarea.Rows = 3;
                                    },
                                    onBlur: function (textarea, event) {
                                        textarea.Rows = 1;
                                    },
                                    onPaste: function (textarea, event) {
                                        object.FilesInput.AddFiles(event.clipboardData.files);
                                    },
                                    onKeyDown: function (textarea, event) {
                                        if (event.keyCode == 13 && !event.shiftKey) {
                                            event.preventDefault();
                                            object.Form.Submit();
                                        }
                                    }
                                })
                            ],
                        }),
                        new Button({
                            padding: 1,
                            children: [
                                new Icon({
                                    text: 'attachment',
                                }),
                            ],
                            onClick: function (button, event) {
                                let input = new Input({
                                    type: 'file',
                                    multiple: true,
                                    onChange: function (input, event) {
                                        object.FilesInput.AddFiles(input.Element.files);
                                        input.GC();
                                    },
                                });

                                input.Click();
                            },
                        }),
                        new ButtonSetting({
                            icon: 'add',
                            header: 'Wyślij',
                            text: 'Dodaj komentarz',
                        }),
                    ],
                }),
                object.FilesInput,
            ],
        }));
    }

    get FilesInput() {
        let object = this;
        return object.filesInput ?? (object.filesInput = new FilesInput({
            showButton: false,
        }));
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

}

class ConversationButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'flex-start';

        new Property(object, 'Conversation', data.conversation ?? {}, object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: Colors.Conversation,
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        text: 'question_answer',
                    }),
                ],
            }),
            new Layout({
                width: '0%',
                flexGrow: 1,
                children: [
                    new UserLabelView({
                        callback: function (view) {
                            new Binding(object, 'Conversation', function (sender, property) {
                                view.User = object.Conversation ? object.Conversation.owner : null;
                            });
                        },
                    }),
                    new Text({
                        callback: function (view) {
                            new Binding(object, 'Conversation', function (sender, property) {
                                view.Text = object.Conversation && object.Conversation.name ? object.Conversation.name : 'Brak';
                            });
                        },
                    }),
                    new LastConversationMessageView({
                        callback: function (view) {
                            new Binding(object, 'Conversation', function (sender, property) {
                                view.ConversationMessage = object.Conversation.lastConversationMessage;
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}

class ConversationPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.ContentView.FlexGrow = 1;
        object.ContentView.Overflow = 'auto';

        object.BackgroundPosition = 'center, center';
        object.BackgroundSize = 'cover, cover';
        object.BackgroundRepeat = 'no-repeat, no-repeat';

        new Property(object, 'Conversation', data.conversation ?? {}, object.OnPropertyChanged);
        new Property(object, 'ConversationMessages', data.conversationMessages ?? [], object.OnPropertyChanged);

        if (data.onConversationChange) object.OnConversationChange.Listen(data.onConversationChange);
        if (data.onConversationRestore) object.OnConversationRestore.Listen(data.onConversationRestore);
        if (data.onConversationTrash) object.OnConversationTrash.Listen(data.onConversationTrash);
        if (data.onConversationDelete) object.OnConversationDelete.Listen(data.onConversationDelete);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Conversation', function (sender, data) {
            if (object.Conversation) {
                object.Title = object.Conversation && object.Conversation.name ? object.Conversation.name : 'Brak nazwy';

                if (object.Conversation.background) {
                    object.BackgroundImage = `linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${object.Conversation.background.url}')`;
                    object.Color = 'white';
                } else {
                    object.BackgroundImage = null;
                    object.Color = null;
                }
            }
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.ActionButtons = [
            new Button({
                children: [
                    new Layout({
                        width: '2rem',
                        height: '2rem',
                        justifyContent: 'center',
                        alignItems: 'center',
                        children: [
                            new Icon({
                                text: 'edit',
                            }),
                        ],
                    }),
                ],
                onClick: function (button, event) {
                    let conversationEditPage = new ConversationEditPage({
                        conversation: object.Conversation,
                        onConversationChange: function (conversationEditPage, data) {
                            object.Conversation = conversationEditPage.Conversation;
                            object.OnConversationChange.Invoke(object, {
                                conversation: object.Conversation,
                            });
                        },
                        onConversationRestore: function (conversationEditPage, data) {
                            object.Conversation = conversationEditPage.Conversation;
                            object.Pull();
                            object.OnConversationRestore.Invoke(object, {
                                conversation: object.Conversation,
                            });
                        },
                        onConversationTrash: function (conversationEditPage, data) {
                            object.Conversation = conversationEditPage.Conversation;
                            object.Pull();
                            object.OnConversationTrash.Invoke(object, {
                                conversation: object.Conversation,
                            });
                        },
                        onConversationDelete: function (conversationEditPage, data) {
                            object.Conversation = conversationEditPage.Conversation;
                            object.Pull();
                            object.OnConversationDelete.Invoke(object, {
                                conversation: object.Conversation,
                            });
                        },
                    });

                    object.Parent.AddChild(conversationEditPage);
                },
            }),
        ];

        object.Content = [
            new Column({
                gap: 0.5,
                padding: 0.5,
                flexGrow: 1,
                overflow: 'auto',
                childrenLoop: function (conversationMessage) {
                    return object.GetConversationMessageView(conversationMessage);
                },
                callback: function (view) {
                    object.conversationMessageList = view;

                    new Binding(object, 'ConversationMessages', function (sender, data) {
                        view.Children = object.ConversationMessages;
                    });

                    object.ReloadConversationMessages();
                },
            }),
            new Form({
                callback: function (form) {
                    object.form = form;
                },
                onSubmit: function (form, event) {
                    form.Disabled = true;
                    Ajax.Post(`/conversationMessage`, {
                        form: form.Element,
                        load: function (response) {
                            form.Disabled = false;

                            if (response.success) {
                                form.Reset();
                                let conversationMessageView = object.GetConversationMessageView(response.conversationMessage);
                                conversationMessageView.Parent = object.conversationMessageList;
                            }
                        },
                    });
                },
                children: [
                    new Input({
                        type: 'hidden',
                        name: 'conversationId',
                        callback: function (view) {
                            new Binding(object, 'Conversation', function (sender, data) {
                                view.Value = object.Conversation ? object.Conversation.id : '0';
                            });
                        },
                    }),
                    new Label({
                        width: '100%',
                        flexWrap: 'wrap',
                        children: [
                            new UserLabelView({
                                width: '100%',
                                callback: function (view) {
                                    new Binding(TestApp.Instance, 'User', function (sender, data) {
                                        view.User = TestApp.Instance.User;
                                    });
                                },
                            }),
                        ],
                    }),
                    new Row({
                        width: '100%',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-end',
                        children: [
                            new Label({
                                width: '0%',
                                flexGrow: 1,
                                minWidth: '270px',
                                children: [
                                    new Textarea({
                                        width: '100%',
                                        name: 'body',
                                        placeholder: 'Wiadomość',
                                        resize: 'none',
                                        rows: 3,
                                        onKeyDown: function (textarea, event) {
                                            if (event.key == 'Enter' && !event.shiftKey) {
                                                event.preventDefault();
                                                object.form.Submit();
                                            }
                                        }
                                    })
                                ],
                            }),
                            new ButtonSetting({
                                icon: 'add',
                                header: 'Wyślij',
                                text: 'Dodaj komentarz',
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

    GetConversationMessageView(conversationMessage) {
        return new ConversationMessageView({
            conversationMessage: conversationMessage,
            onConversationMessageTrash: function (conversationMessageView, data) {
                conversationMessageView.Remove();
            },
        });
    }

    ReloadConversationMessages() {
        let object = this;

        object.ConversationMessages = [];
        object.Loading.Parent = object.conversationMessageList;

        Ajax.Get(`/conversation/${object.Conversation.id}/conversationMessages`, {
            load: function (response) {
                object.ConversationMessages = response.conversationMessages;
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

    get OnConversationChange() {
        let object = this;
        return object.onConversationChange ?? (object.onConversationChange = new Callback());
    }

    get OnConversationRestore() {
        let object = this;
        return object.onConversationRestore ?? (object.onConversationRestore = new Callback());
    }

    get OnConversationTrash() {
        let object = this;
        return object.onConversationTrash ?? (object.onConversationTrash = new Callback());
    }

    get OnConversationDelete() {
        let object = this;
        return object.onConversationDelete ?? (object.onConversationDelete = new Callback());
    }


}

class ConversationEditPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Conversation', data.conversation ?? {}, object.OnPropertyChanged);

        if (data.onConversationChange) object.OnConversationChange.Listen(data.onConversationChange);
        if (data.onConversationRestore) object.OnConversationRestore.Listen(data.onConversationRestore);
        if (data.onConversationTrash) object.OnConversationTrash.Listen(data.onConversationTrash);
        if (data.onConversationDelete) object.OnConversationDelete.Listen(data.onConversationDelete);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Conversation', function (sender, data) {
            object.Title = object.Conversation.name;
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Row({
                children: [
                    new Column({
                        flexGrow: 65,
                        width: '65%',
                        children: [
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'task_alt',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'Nazwa',
                                                callback: function (view) {
                                                    new Binding(object, 'Conversation', function (sender, data) {
                                                        view.Value = object.Conversation.name;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        name: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'image',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'Tło',
                                                type: 'file',
                                                onChange: function (sender, event) {
                                                    if (sender.Element.files) {
                                                        object.Update({}, Array.from(sender.Element.files));
                                                    }
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 35,
                        width: '35%',
                        minWidth: '300px',
                        children: [
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Użytkownicy'
                                            }),
                                        ],
                                    }),
                                    new ConversationUsersView({
                                        callback: function (view) {
                                            new Binding(object, 'Conversation', function (sender, data) {
                                                view.Conversation = object.Conversation;
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new Column({
                                        callback: function (view) {
                                            if (object.Conversation.trashBy) {
                                                view.Children = [
                                                    new ButtonSetting({
                                                        icon: 'restore',
                                                        iconColor: 'forestgreen',
                                                        header: 'Przywróć',
                                                        text: 'Przywróć zadanie z kosza',
                                                        onClick: function (button, event) {
                                                            object.Restore();
                                                        },
                                                    }),
                                                    new ButtonSetting({
                                                        icon: 'delete',
                                                        iconColor: 'crimson',
                                                        header: 'Usuń',
                                                        text: 'Usuń zadanie na zawsze',
                                                        onClick: function (button, event) {
                                                            object.Delete();
                                                        },
                                                    }),
                                                ];
                                            } else {
                                                view.Children = [
                                                    new ButtonSetting({
                                                        icon: 'delete',
                                                        iconColor: 'crimson',
                                                        header: 'Usuń',
                                                        text: 'Przenieś zadanie do kosza',
                                                        onClick: function (button, event) {
                                                            object.Trash();
                                                        },
                                                    }),
                                                ];
                                            }
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new ButtonSetting({
                                        icon: 'close',
                                        header: 'Zamknij',
                                        text: '',
                                        onClick: function (sender, event) {
                                            object.Pull();
                                        },
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

    Update(data = {}, files = []) {
        let object = this;
        Ajax.Put(`/conversation/${object.Conversation.id}`, {
            data: data,
            files: files,
            load: function (response) {
                if (response.success) {
                    object.Conversation = response.conversation;
                    object.OnConversationChange.Invoke(object, {
                        conversation: object.Conversation,
                    });
                }
            },
        });
    }

    Restore() {
        let object = this;
        Ajax.Post(`/conversation/${object.Conversation.id}/restore`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.Conversation = response.conversation;
                    object.OnConversationChange.Invoke(object, {
                        conversation: object.Conversation,
                    });
                    object.OnConversationRestore.Invoke(object, {
                        conversation: object.Conversation,
                    });
                }
            },
        });
    }

    Trash() {
        let object = this;
        Ajax.Post(`/conversation/${object.Conversation.id}/trash`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.Conversation = response.conversation;
                    object.OnConversationChange.Invoke(object, {
                        conversation: object.Conversation,
                    });
                    object.OnConversationTrash.Invoke(object, {
                        conversation: object.Conversation,
                    });
                }
            },
        });
    }

    Delete() {
        let object = this;
        Ajax.Delete(`/conversation/${object.Conversation.id}`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.OnConversationDelete.Invoke(object, {
                        conversation: object.Conversation,
                    });
                }
            },
        });
    }

    get OnConversationChange() {
        let object = this;
        return object.onConversationChange ?? (object.onConversationChange = new Callback());
    }

    get OnConversationRestore() {
        let object = this;
        return object.onConversationRestore ?? (object.onConversationRestore = new Callback());
    }

    get OnConversationTrash() {
        let object = this;
        return object.onConversationTrash ?? (object.onConversationTrash = new Callback());
    }

    get OnConversationDelete() {
        let object = this;
        return object.onConversationDelete ?? (object.onConversationDelete = new Callback());
    }


}

class ConversationMessageView extends Column {

    Init(data = {}) {
        super.Init();
        let object = this;

        new Property(object, 'ConversationMessage', data.conversationMessage ?? {}, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'ConversationMessage', function (sender, data) {
            if (object.ConversationMessage.owner) {
                if (object.ConversationMessage.owner.id == App.Instance.User.id) object.AlignSelf = 'flex-end';
                else object.AlignSelf = 'flex-start';
            } else {
                object.AlignSelf = 'center';
            }
        });
    }

    Render() {
        let object = this;
        object.Children = [
            new Column({
                padding: 1,
                children: [
                    new UserLabelView({
                        callback: function (view) {
                            new Binding(object, 'ConversationMessage', function (sender, data) {
                                view.User = object.ConversationMessage ? object.ConversationMessage.owner : null;
                            });
                        },
                    }),
                    new Text({
                        fontSize: 0.6,
                        callback: function (view) {
                            new Binding(object, 'ConversationMessage', function (sender, data) {
                                view.Text = object.ConversationMessage ? object.ConversationMessage.created : '';
                            });
                        },
                    }),
                    new Row({
                        alignItems: 'flex-start',
                        children: [
                            new Text({
                                width: '0%',
                                flexGrow: 1,
                                whiteSpace: 'pre-line',
                                callback: function (view) {
                                    new Binding(object, 'ConversationMessage', function (sender, data) {
                                        view.Text = object.ConversationMessage ? object.ConversationMessage.body : '';
                                    });
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

}

class LastConversationMessageView extends Column {

    Init(data = {}) {
        super.Init();
        let object = this;

        new Property(object, 'ConversationMessage', data.conversationMessage ?? {}, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'ConversationMessage', function (sender, data) {
            if (!object.ConversationMessage) return;

            if (object.ConversationMessage.owner) {
                if (object.ConversationMessage.owner.id == App.Instance.User.id) {

                }
                else {

                }
            } else {

            }
        });
    }

    Render() {
        let object = this;
        object.Children = [
            new Column({
                children: [
                    new UserLabelView({
                        callback: function (view) {
                            new Binding(object, 'ConversationMessage', function (sender, data) {
                                view.User = object.ConversationMessage ? object.ConversationMessage.owner : null;
                            });
                        },
                    }),
                    new Text({
                        fontSize: 0.6,
                        callback: function (view) {
                            new Binding(object, 'ConversationMessage', function (sender, data) {
                                view.Text = object.ConversationMessage ? object.ConversationMessage.created : '';
                            });
                        },
                    }),
                    new Row({
                        alignItems: 'flex-start',
                        children: [
                            new Text({
                                width: '0%',
                                flexGrow: 1,
                                whiteSpace: 'pre-line',
                                callback: function (view) {
                                    new Binding(object, 'ConversationMessage', function (sender, data) {
                                        view.Text = object.ConversationMessage ? object.ConversationMessage.body : '';
                                    });
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

}

class ConversationUserButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'flex-start';

        new Property(object, 'ConversationUser', data.conversationUser ?? {}, object.OnPropertyChanged);

        if (data.onDelete) object.OnDelete.Listen(data.onDelete);

        object.OnContextMenu.Listen(function (sender, event) {
            event.preventDefault();
            let contextMenu = new ContextMenu({
                event: event,
                options: {
                    'Usuń': function (sender, event) {
                        object.Delete();
                    },
                },
            });

            App.Instance.AddChild(contextMenu);
        });
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: Colors.User,
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        text: 'account_circle',
                    }),
                ],
            }),
            new Layout({
                width: '0%',
                flexGrow: 1,
                children: [
                    new UserLabelView({
                        width: '100%',
                        callback: function (view) {
                            new Binding(object, 'ConversationUser', function (sender, property) {
                                view.User = object.ConversationUser ? object.ConversationUser.user : null;
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    Delete() {
        let object = this;
        Ajax.Delete(`/conversationUser/${object.ConversationUser.id}`, {
            load: function (response) {
                if (response.success) {
                    object.OnDelete.Invoke(object, {
                        conversationUser: object.ConversationUser,
                    });
                }
            },
        });
    }

    get OnDelete() {
        let object = this;
        return object.onDelete ?? (object.onDelete = new Callback());
    }

}

class ConversationUsersView extends Column {

    Init(data = {}) {
        super.Init();
        let object = this;

        new Property(object, 'ConversationUsers', data.conversationUsers ?? [], object.OnPropertyChanged);
        new Property(object, 'Conversation', data.conversation ?? null, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Conversation', function (sender, data) {
            object.ReloadConversationUsers();
        });
    }

    Render() {
        let object = this;

        object.Children = [
            new UserButton({
                onClick: function (button, event) {
                    let userPickerPage = new UserPickerPage({
                        onSelect: function (sender, data) {
                            if (!data.user) return;
                            Ajax.Post(`/conversationUser`, {
                                data: {
                                    conversationId: object.Conversation.id,
                                    userId: data.user.id
                                },
                                load: function (response) {
                                    if (response.success) {
                                        let button = object.GetConversationUserButton(response.conversationUser);
                                        button.Parent = object.conversationUserList;
                                    }
                                },
                            });
                        },
                    });

                    TestApp.Instance.AddChild(userPickerPage);
                },
            }),
            new Column({
                childrenLoop: function (conversationUser) {
                    return object.GetConversationUserButton(conversationUser);
                },
                callback: function (view) {
                    object.conversationUserList = view;

                    new Binding(object, 'ConversationUsers', function (sender, data) {
                        view.Children = object.ConversationUsers;
                    });
                },
            }),
        ];
    }

    GetConversationUserButton(conversationUser) {
        return new ConversationUserButton({
            conversationUser: conversationUser,
            onDelete: function (conversationUserButton, data) {
                conversationUserButton.Remove();
            },
        });
    }

    ReloadConversationUsers() {
        let object = this;

        object.ConversationUsers = [];
        object.Loading.Parent = object.conversationUserList;

        if (!object.Conversation) {
            object.ConversationUsers = [];
            return;
        }

        Ajax.Get(`/conversation/${object.Conversation.id}/conversationUsers`, {
            load: function (response) {
                if (response.success) {
                    object.ConversationUsers = response.conversationUsers;
                } else {
                    object.ConversationUsers = [];
                }
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

}

class ConversationsPage extends WindowPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Konwersacje';
        object.Theme = Colors.Conversation;
    }

    Render() {
        super.Render();
        let object = this;

        object.BodyChildren = [
            new Column({
                children: [
                    new Column({
                        childrenLoop: function (conversation) {
                            return object.GetConversationButton(conversation);
                        },
                        callback: function (view) {
                            object.conversationList = view;

                            new Binding(App.Instance, 'Conversations', function (app, data) {
                                view.Children = App.Instance.Conversations;
                            });
                        },
                    }),
                ],
            }),
        ];

        object.FooterChildren = [
            new Row({
                justifyContent: 'flex-end',
                fontSize: 0.6,
                children: [
                    new Button({
                        children: [
                            new Text({
                                text: 'Nowa konwersacja',
                            }),
                        ],
                        onClick: function (sender, event) {
                            Ajax.Post(`/conversation`, {
                                load: function (response) {
                                    if (response.success) {
                                        App.Instance.AddConversation(response.conversation);
                                    }
                                },
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    GetConversationButton(conversation) {
        let object = this;
        return new ConversationButton({
            conversation: conversation,
            onClick: function (conversationButton, event) {
                let conversationPage = new ConversationPage({
                    conversation: conversationButton.Conversation,
                    onConversationChange: function (conversationPage, data) {
                        conversationButton.Conversation = conversationPage.Conversation;
                    },
                    onConversationTrash: function (conversationPage, data) {
                        conversationButton.Remove();
                    },
                });

                object.Body.AddChild(conversationPage);
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

}

class CustomerButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'flex-start';

        new Property(object, 'Customer', data.customer ?? {}, object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: Colors.Customer,
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        text: 'people',
                    }),
                ],
            }),
            new Layout({
                width: '0%',
                flexGrow: 1,
                children: [
                    new Row({
                        children: [
                            new UserLabelView({
                                callback: function (view) {
                                    new Binding(object, 'Customer', function (sender, property) {
                                        view.User = object.Customer ? object.Customer.owner : null;
                                    });
                                },
                            }),
                            new LabelTag({
                                callback: function (view) {
                                    new Binding(object, 'Customer', function (sender, property) {
                                        view.Label = object.Customer ? object.Customer.label : null;
                                    });
                                },
                            }),
                        ],
                    }),
                    new Text({
                        callback: function (view) {
                            new Binding(object, 'Customer', function (sender, property) {
                                let name = [];
                                if (object.Customer) {
                                    if (object.Customer.name) name.push(object.Customer.name);
                                    if (object.Customer.phoneNumber) name.push(object.Customer.phoneNumber);
                                    if (object.Customer.emailAddress) name.push(object.Customer.emailAddress);
                                }
                                view.Text = name.length ? name.join(' ') : 'Brak';
                            });
                        },
                    }),
                    new Text({
                        fontSize: 0.6,
                        callback: function (view) {
                            new Binding(object, 'Customer', function (sender, property) {
                                view.Text = object.Customer ? object.Customer.address : '';
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}

class CustomerPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Customer', data.customer ?? {}, object.OnPropertyChanged);
        new Property(object, 'Notes', data.notes ?? [], object.OnPropertyChanged);
        new Property(object, 'Tasks', data.tasks ?? [], object.OnPropertyChanged);

        if (data.onCustomerChange) object.OnCustomerChange.Listen(data.onCustomerChange);
        if (data.onCustomerRestore) object.OnCustomerRestore.Listen(data.onCustomerRestore);
        if (data.onCustomerTrash) object.OnCustomerTrash.Listen(data.onCustomerTrash);
        if (data.onCustomerDelete) object.OnCustomerDelete.Listen(data.onCustomerDelete);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Customer', function (sender, data) {
            object.Title = object.Customer.name;
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Row({
                children: [
                    new Column({
                        flexGrow: 65,
                        width: '65%',
                        children: [
                            new Column({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                fontSize: 2,
                                                text: 'Notatki'
                                            }),
                                        ],
                                    }),
                                    new Column({
                                        childrenLoop: function (note) {
                                            return new NoteButton({
                                                note: note,
                                                onClick: function (noteButton, event) {
                                                    let notePage = new NotePage({
                                                        note: noteButton.Note,
                                                        onNoteChange: function (notePage, data) {
                                                            noteButton.Note = notePage.Note;
                                                        },
                                                        onNoteTrash: function (notePage, data) {
                                                            noteButton.Remove();
                                                        },
                                                    });

                                                    object.Parent.AddChild(notePage);
                                                },
                                            });
                                        },
                                        callback: function (view) {
                                            new Binding(object, 'Notes', function (sender, data) {
                                                view.Children = object.Notes;
                                            });
                                        },
                                    }),
                                ],
                                callback: function (view) {
                                    new Binding(object, 'Notes', function (sender, data) {
                                        view.Display = object.Notes.length ? null : 'none';
                                    });
                                },
                            }),
                            new Column({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                fontSize: 2,
                                                text: 'Zadania'
                                            }),
                                        ],
                                    }),
                                    new Column({
                                        childrenLoop: function (task) {
                                            return new TaskButton({
                                                task: task,
                                                onClick: function (taskButton, event) {
                                                    let taskPage = new TaskPage({
                                                        task: taskButton.Task,
                                                        onTaskChange: function (taskPage, data) {
                                                            taskButton.Task = taskPage.Task;
                                                        },
                                                        onTaskTrash: function (taskPage, data) {
                                                            taskButton.Remove();
                                                        },
                                                    });

                                                    object.Parent.AddChild(taskPage);
                                                },
                                            });
                                        },
                                        callback: function (view) {
                                            new Binding(object, 'Tasks', function (sender, data) {
                                                view.Children = object.Tasks;
                                            });
                                        },
                                    }),
                                ],
                                callback: function (view) {
                                    new Binding(object, 'Tasks', function (sender, data) {
                                        view.Display = object.Tasks.length ? null : 'none';
                                    });
                                },
                            }),
                            new Label({
                                children: [
                                    new Text({
                                        fontSize: 2,
                                        text: 'Komentarze'
                                    }),
                                ],
                            }),
                            new CommentsView({
                                callback: function (view) {
                                    new Binding(object, 'Customer', function (sender, data) {
                                        view.Target = object.Customer;
                                    });
                                },
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 35,
                        width: '35%',
                        minWidth: '300px',
                        children: [
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Załączniki'
                                            }),
                                        ],
                                    }),
                                    new AttachmentsView({
                                        callback: function (view) {
                                            new Binding(object, 'Customer', function (sender, data) {
                                                view.Target = object.Customer;
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Zarządzaj',
                                            })
                                        ],
                                    }),
                                    new ButtonSetting({
                                        icon: 'edit',
                                        iconColor: 'darkgray',
                                        header: 'Edytuj',
                                        text: 'Zmień dane klienta',
                                        onClick: function (button, event) {
                                            let customerEditPage = new CustomerEditPage({
                                                customer: object.Customer,
                                                onCustomerChange: function (customerEditPage, data) {
                                                    object.Customer = customerEditPage.Customer;
                                                    object.OnCustomerChange.Invoke(object, {
                                                        customer: object.Customer,
                                                    });
                                                },
                                                onCustomerRestore: function (customerEditPage, data) {
                                                    object.Customer = customerEditPage.Customer;
                                                    object.Pull();
                                                    object.OnCustomerRestore.Invoke(object, {
                                                        customer: object.Customer,
                                                    });
                                                },
                                                onCustomerTrash: function (customerEditPage, data) {
                                                    object.Customer = customerEditPage.Customer;
                                                    object.Pull();
                                                    object.OnCustomerTrash.Invoke(object, {
                                                        customer: object.Customer,
                                                    });
                                                },
                                                onCustomerDelete: function (customerEditPage, data) {
                                                    object.Customer = customerEditPage.Customer;
                                                    object.Pull();
                                                    object.OnCustomerDelete.Invoke(object, {
                                                        customer: object.Customer,
                                                    });
                                                },
                                            });

                                            object.Parent.AddChild(customerEditPage);
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new ButtonSetting({
                                        icon: 'close',
                                        header: 'Zamknij',
                                        text: '',
                                        onClick: function (sender, event) {
                                            object.Pull();
                                        },
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ];

        object.ReloadItems();
    }

    ReloadItems() {
        let object = this;

        object.Notes = [];
        object.Tasks = [];

        Ajax.Get(`/customer/${object.Customer.id}/items`, {
            load: function (response) {
                if (response.success) {
                    object.Notes = response.notes;
                    object.Tasks = response.tasks;
                }
            },
        });
    }

    get OnCustomerChange() {
        let object = this;
        return object.onCustomerChange ?? (object.onCustomerChange = new Callback());
    }

    get OnCustomerRestore() {
        let object = this;
        return object.onCustomerRestore ?? (object.onCustomerRestore = new Callback());
    }

    get OnCustomerTrash() {
        let object = this;
        return object.onCustomerTrash ?? (object.onCustomerTrash = new Callback());
    }

    get OnCustomerDelete() {
        let object = this;
        return object.onCustomerDelete ?? (object.onCustomerDelete = new Callback());
    }


}

class CustomerEditPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Customer', data.customer ?? {}, object.OnPropertyChanged);

        if (data.onCustomerChange) object.OnCustomerChange.Listen(data.onCustomerChange);
        if (data.onCustomerRestore) object.OnCustomerRestore.Listen(data.onCustomerRestore);
        if (data.onCustomerTrash) object.OnCustomerTrash.Listen(data.onCustomerTrash);
        if (data.onCustomerDelete) object.OnCustomerDelete.Listen(data.onCustomerDelete);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Customer', function (sender, data) {
            object.Title = object.Customer.name;
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Row({
                children: [
                    new Column({
                        flexGrow: 3,
                        width: '75%',
                        children: [
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'people',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'Nazwa',
                                                callback: function (view) {
                                                    new Binding(object, 'Customer', function (sender, data) {
                                                        view.Value = object.Customer.name;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        name: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'NIP',
                                                callback: function (view) {
                                                    new Binding(object, 'Customer', function (sender, data) {
                                                        view.Value = object.Customer.tin;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        tin: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'description',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Textarea({
                                                width: '100%',
                                                placeholder: 'Adres',
                                                rows: 5,
                                                onFocus: function (textarea, event) {
                                                    textarea.Rows = 10;
                                                },
                                                onBlur: function (textarea, event) {
                                                    textarea.Rows = 5;
                                                },
                                                callback: function (view) {
                                                    new Binding(object, 'Customer', function (sender, data) {
                                                        view.Value = object.Customer.address;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        address: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 1,
                        width: '25%',
                        minWidth: '270px',
                        children: [
                            new LabelButton({
                                callback: function (view) {
                                    new Binding(object, 'Customer', function (sender, data) {
                                        view.Label = object.Customer.label;
                                    });
                                },
                                onClick: function (button, event) {
                                    let labelPickerPage = new LabelPickerPage({
                                        selected: object.Customer.labelId,
                                        onSelect: function (sender, data) {
                                            object.Update({
                                                labelId: data.label ? data.label.id : 0,
                                            });
                                        },
                                    });

                                    TestApp.Instance.AddChild(labelPickerPage);
                                },
                            }),
                            new Label({
                                children: [
                                    new Text({
                                        text: 'Adres email',
                                    })
                                ],
                            }),
                            new Label({
                                children: [
                                    new Input({
                                        width: '100%',
                                        placeholder: 'Adres email',
                                        callback: function (view) {
                                            new Binding(object, 'Customer', function (sender, data) {
                                                view.Value = object.Customer.emailAddress;
                                            });
                                        },
                                        onChange: function (sender, event) {
                                            object.Update({
                                                emailAddress: sender.Value,
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new Label({
                                children: [
                                    new Text({
                                        text: 'Numer telefonu',
                                    })
                                ],
                            }),
                            new Label({
                                children: [
                                    new Input({
                                        width: '100%',
                                        placeholder: 'Numer telefonu',
                                        callback: function (view) {
                                            new Binding(object, 'Customer', function (sender, data) {
                                                view.Value = object.Customer.phoneNumber;
                                            });
                                        },
                                        onChange: function (sender, event) {
                                            object.Update({
                                                phoneNumber: sender.Value,
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new Column({
                                callback: function (view) {
                                    if (object.Customer.trashBy) {
                                        view.Children = [
                                            new ButtonSetting({
                                                icon: 'restore',
                                                iconColor: 'forestgreen',
                                                header: 'Przywróć',
                                                text: 'Przywróć klienta z kosza',
                                                onClick: function (button, event) {
                                                    object.Restore();
                                                },
                                            }),
                                            new ButtonSetting({
                                                icon: 'delete',
                                                iconColor: 'crimson',
                                                header: 'Usuń',
                                                text: 'Usuń klienta na zawsze',
                                                onClick: function (button, event) {
                                                    object.Delete();
                                                },
                                            }),
                                        ];
                                    } else {
                                        view.Children = [
                                            new ButtonSetting({
                                                icon: 'delete',
                                                iconColor: 'crimson',
                                                header: 'Usuń',
                                                text: 'Przenieś klienta do kosza',
                                                onClick: function (button, event) {
                                                    object.Trash();
                                                },
                                            }),
                                        ];
                                    }
                                },
                            }),
                            new ButtonSetting({
                                icon: 'close',
                                header: 'Zamknij',
                                text: '',
                                onClick: function (sender, event) {
                                    object.Pull();
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

    Update(data = {}) {
        let object = this;
        Ajax.Put(`/customer/${object.Customer.id}`, {
            data: data,
            load: function (response) {
                if (response.success) {
                    object.Customer = response.customer;
                    object.OnCustomerChange.Invoke(object, {
                        customer: object.Customer,
                    });
                }
            },
        });
    }

    Restore() {
        let object = this;
        Ajax.Post(`/customer/${object.Customer.id}/restore`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.Customer = response.customer;
                    object.OnCustomerChange.Invoke(object, {
                        customer: object.Customer,
                    });
                    object.OnCustomerRestore.Invoke(object, {
                        customer: object.Customer,
                    });
                }
            },
        });
    }

    Trash() {
        let object = this;
        Ajax.Post(`/customer/${object.Customer.id}/trash`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.Customer = response.customer;
                    object.OnCustomerChange.Invoke(object, {
                        customer: object.Customer,
                    });
                    object.OnCustomerTrash.Invoke(object, {
                        customer: object.Customer,
                    });
                }
            },
        });
    }

    Delete() {
        let object = this;
        Ajax.Delete(`/customer/${object.Customer.id}`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.OnCustomerDelete.Invoke(object, {
                        customer: object.Customer,
                    });
                }
            },
        });
    }

    get OnCustomerChange() {
        let object = this;
        return object.onCustomerChange ?? (object.onCustomerChange = new Callback());
    }

    get OnCustomerRestore() {
        let object = this;
        return object.onCustomerRestore ?? (object.onCustomerRestore = new Callback());
    }

    get OnCustomerTrash() {
        let object = this;
        return object.onCustomerTrash ?? (object.onCustomerTrash = new Callback());
    }

    get OnCustomerDelete() {
        let object = this;
        return object.onCustomerDelete ?? (object.onCustomerDelete = new Callback());
    }


}

class CustomerPickerPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Klienci';

        object.TitleView.MaxWidth = 720;
        object.ContentView.MaxWidth = 720;

        new Property(object, 'Query', data.query ?? '', object.OnPropertyChanged);
        new Property(object, 'Customers', data.customers ?? [], object.OnPropertyChanged);

        if (data.onSelect) object.OnSelect.Listen(data.onSelect);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'Query', function (sender, data) {
            clearTimeout(object.queryTimeout);
            object.queryTimeout = setTimeout(function () {
                object.ReloadCustomers();
            }, 250);
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Column({
                children: [
                    new Form({
                        children: [
                            new Label({
                                width: '50%',
                                children: [
                                    new Input({
                                        width: '100%',
                                        name: 'name',
                                        placeholder: 'Nazwa',
                                    })
                                ],
                            }),
                            new Label({
                                width: '50%',
                                children: [
                                    new Input({
                                        width: '100%',
                                        name: 'tin',
                                        placeholder: 'NIP',
                                    })
                                ],
                            }),
                            new Label({
                                width: '100%',
                                children: [
                                    new Textarea({
                                        width: '100%',
                                        name: 'address',
                                        placeholder: 'Adres',
                                    })
                                ],
                            }),
                            new Label({
                                width: '50%',
                                children: [
                                    new Input({
                                        width: '100%',
                                        name: 'phoneNumber',
                                        placeholder: 'Numer telefonu',
                                    })
                                ],
                            }),
                            new Label({
                                width: '50%',
                                children: [
                                    new Input({
                                        width: '100%',
                                        type: 'email',
                                        name: 'emailAddress',
                                        placeholder: 'Adres email',
                                    })
                                ],
                            }),
                            new ButtonSetting({
                                width: '100%',
                                icon: 'add',
                                iconColor: 'forestgreen',
                                header: 'Utwórz',
                                text: 'Dodaj nowego klienta',
                            }),
                        ],
                        onSubmit: function (form, event) {
                            Ajax.Post(`/customer`, {
                                form: form.Element,
                                load: function (response) {
                                    if (response.success) {
                                        object.Pull();
                                        object.OnSelect.Invoke(object, {
                                            customer: response.customer,
                                        });
                                    }
                                },
                            });
                        },
                    }),
                    new Row({
                        children: [
                            new ButtonSetting({
                                width: '50%',
                                icon: 'close',
                                header: 'Zamknij',
                                text: 'Wyjdź bez zapisywania',
                                onClick: function (sender, event) {
                                    object.Pull();
                                },
                            }),
                            new ButtonSetting({
                                width: '50%',
                                icon: 'delete',
                                iconColor: 'crimson',
                                header: 'Wyczyść',
                                text: '',
                                onClick: function (sender, event) {
                                    object.Pull();
                                    object.OnSelect.Invoke(object, {
                                        customer: {
                                            id: 0,
                                        },
                                    });
                                },
                            }),
                        ],
                    }),
                    new Label({
                        width: '100%',
                        children: [
                            new Input({
                                width: '100%',
                                placeholder: 'Szukaj',
                                value: object.Query,
                                onInput: function (input, event) {
                                    object.Query = input.Value;
                                },
                            })
                        ],
                    }),
                    new Column({
                        childrenLoop: function (customer) {
                            return new CustomerButton({
                                customer: customer,
                                onClick: function (sender, data) {
                                    object.Pull();
                                    object.OnSelect.Invoke(object, {
                                        customer: customer,
                                    });
                                },
                            });
                        },
                        callback: function (view) {
                            object.customerList = view;

                            new Binding(object, 'Customers', function (sender, data) {
                                view.Children = object.Customers;
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    ReloadCustomers() {
        let object = this;

        object.Customers = [];
        object.Loading.Parent = object.customerList;

        Ajax.Post(`/customer/query`, {
            data: {
                query: object.Query,
            },
            load: function (response) {
                if (response.success) {
                    object.Customers = response.customers;
                }
            }
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

    get OnSelect() {
        let object = this;
        return object.onSelect ?? (object.onSelect = new Callback());
    }

}

class CustomersPage extends WindowPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        // object.ContentView.Position = 'relative';
        // object.ContentView.FlexGrow = 1;

        object.Title = 'Klienci';
        object.Theme = Colors.Customer;

        new Property(object, 'Query', data.query ?? '', object.OnPropertyChanged);
        new Property(object, 'Customers', data.customers ?? [], object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Query', function (sender, data) {
            clearTimeout(object.queryTimeout);
            object.queryTimeout = setTimeout(function () {
                object.ReloadCustomers();
            }, 250);
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.BodyChildren = [
            new Column({
                height: '100%',
                children: [
                    new Label({
                        width: '100%',
                        children: [
                            new Row({
                                padding: '1px',
                                borderRadius: 2,
                                alignItems: 'center',
                                backgroundColor: 'var(--inputColor)',
                                color: 'var(--inputBackground)',
                                width: '100%',
                                overflow: 'hidden',
                                children: [
                                    new Input({
                                        width: '0%',
                                        flexGrow: 1,
                                        placeholder: 'Szukaj',
                                        name: 'search',
                                        type: 'search',
                                        onInput: function (input, event) {
                                            object.Query = input.Value;
                                        },
                                    }),
                                    new Icon({
                                        text: 'search',
                                        padding: '0.5rem 1rem',
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 1,
                        overflow: 'auto',
                        childrenLoop: function (customer) {
                            return object.GetCustomerButton(customer);
                        },
                        callback: function (view) {
                            object.customerList = view;

                            new Binding(object, 'Customers', function (sender, data) {
                                view.Children = object.Customers;
                            });
                        },
                    }),
                ],
            }),
        ];

        object.FooterChildren = [
            new Row({
                justifyContent: 'flex-end',
                fontSize: 0.6,
                children: [
                    new Button({
                        children: [
                            new Text({
                                text: 'Odśwież',
                            }),
                        ],
                        onClick: function (sender, event) {
                            object.ReloadCustomers();
                        },
                    }),
                    new Button({
                        children: [
                            new Text({
                                text: 'Nowy klient',
                            }),
                        ],
                        onClick: function (sender, event) {
                            Ajax.Post(`/customer`, {
                                load: function (response) {
                                    if (response.success) {
                                        let customerButton = object.GetCustomerButton(response.customer);
                                        customerButton.Parent = object.customerList;
                                        customerButton.Click();
                                    }
                                },
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    GetCustomerButton(customer) {
        let object = this;

        return new CustomerButton({
            customer: customer,
            onClick: function (customerButton, event) {
                let customerPage = new CustomerPage({
                    customer: customer,
                    onCustomerChange: function (customerPage, data) {
                        customerButton.Customer = customerPage.Customer;
                    },
                    onCustomerTrash: function (customerPage, data) {
                        customerButton.Remove();
                    },
                });

                object.Body.AddChild(customerPage);
            },
        });
    }

    ReloadCustomers() {
        let object = this;

        object.Customers = [];
        object.Loading.Parent = object.customerList;

        Ajax.Post(`/customer/query`, {
            data: {
                query: object.Query,
                userId: object.User ? object.User.id : 0,
            },
            load: function (response) {
                object.Customers = response.customers;
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

}

class HomePage extends HalfPage {

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Label({
                children: [
                    new Column({
                        children: [
                            new Img({
                                source: '/Assets/logo.png',
                                width: '100%',
                                cursor: 'pointer',
                                onClick: function (sender, event) {
                                    object.Open(object.CalendarPage);
                                },
                            }),
                        ],
                    }),
                ],
            }),
            new ButtonSetting({
                icon: 'search',
                iconColor: Colors.System,
                iconColor: 'royalblue',
                header: 'Wyszukiwanie',
                text: 'Znajdź notatkę, zadanie lub klienta',
                display: Permission.Has('Search') ? null : 'none',
                onClick: function (sender, event) {
                    App.Instance.AddChild(object.SearchPage);
                },
            }),
            new ButtonSetting({
                icon: 'question_answer',
                iconColor: Colors.Conversation,
                header: 'Konwersacje',
                text: 'Lista kownersacji',
                display: Permission.Has('Conversation') ? null : 'none',
                onClick: function (sender, event) {
                    App.Instance.AddChild(object.ConversationsPage);
                },
            }),
            new ButtonSetting({
                icon: 'note',
                iconColor: Colors.Note,
                header: 'Notatki',
                text: 'Lista notatek',
                display: Permission.Has('Note') ? null : 'none',
                onClick: function (sender, event) {
                    App.Instance.AddChild(object.NotesPage);
                },
            }),
            new ButtonSetting({
                icon: 'task_alt',
                iconColor: Colors.Task,
                header: 'Zadania',
                text: 'Lista zadań',
                display: Permission.Has('Task') ? null : 'none',
                onClick: function (sender, event) {
                    App.Instance.AddChild(object.TaskTablesPage);
                },
            }),
            new ButtonSetting({
                icon: 'bookmark',
                iconColor: Colors.Reservation,
                header: 'Rezerwacje',
                text: 'Lista rezerwacji',
                display: Permission.Has('Reservation') ? null : 'none',
                onClick: function (sender, event) {
                    App.Instance.AddChild(object.ReservationsPage);
                },
            }),
            new ButtonSetting({
                icon: 'shopping_bag',
                iconColor: Colors.Product,
                header: 'Produkty',
                text: 'Lista produktów',
                display: Permission.Has('Product') ? null : 'none',
                onClick: function (sender, event) {
                    App.Instance.AddChild(object.ProductsPage);
                },
            }),
            new ButtonSetting({
                icon: 'construction',
                iconColor: Colors.Service,
                header: 'Serwisy',
                text: 'Lista serwisów',
                display: Permission.Has('Service') ? null : 'none',
                onClick: function (sender, event) {
                    App.Instance.AddChild(object.ServicesPage);
                },
            }),
            new ButtonSetting({
                icon: 'people',
                iconColor: Colors.Customer,
                header: 'Klienci',
                text: 'Lista klientów',
                display: Permission.Has('Customer') ? null : 'none',
                onClick: function (sender, event) {
                    App.Instance.AddChild(object.CustomersPage);
                },
            }),
            new ButtonSetting({
                icon: 'label',
                iconColor: Colors.Label,
                header: 'Etykiety',
                text: 'Lista etykiet',
                display: Permission.Has('Label') ? null : 'none',
                onClick: function (sender, event) {
                    App.Instance.AddChild(object.LabelsPage);
                },
            }),
            new ButtonSetting({
                icon: 'account_circle',
                iconColor: Colors.User,
                header: 'Użytkownicy',
                text: 'Lista użytkowników',
                display: Permission.Has('User') ? null : 'none',
                onClick: function (sender, event) {
                    App.Instance.AddChild(object.UsersPage);
                },
            }),
            new Column({
                flexGrow: 1,
                height: '0%'
            }),
            new ButtonSetting({
                icon: 'notifications',
                iconColor: Colors.Notification,
                header: 'Powiadomienia',
                text: 'Brak powiadomień',
                onClick: function (sender, event) {
                    App.Instance.AddChild(object.NotificationsPage);
                },
                callback: function (view) {
                    new Binding(App.Instance, 'NotificationsData', function (app, data) {
                        if (app.NotificationsData.unread) {
                            view.IconColor = 'crimson';
                            if (app.NotificationsData.unread == 1) view.Text = `${app.NotificationsData.unread} nowe powiadomienie.`;
                            if (['2', '3', '4'].indexOf(app.NotificationsData.unread) >= 0) view.Text = `${app.NotificationsData.unread} nowe powiadomienia.`;
                            else view.Text = `${app.NotificationsData.unread} nowych powiadomień.`;
                        } else if (app.NotificationsData.total) {
                            view.IconColor = 'grey';
                            view.Text = 'Brak nowych powiadomień.';
                        } else {
                            view.IconColor = 'grey';
                            view.Text = 'Brak powiadomień.';
                        }
                    });
                },
            }),
            new ButtonSetting({
                icon: 'account_circle',
                iconColor: Colors.System,
                header: 'Konto',
                text: 'Ustawienia konta',
                onClick: function (sender, event) {
                    App.Instance.AddChild(object.AccountPage);
                },
            }),
            new ButtonSetting({
                icon: 'delete',
                iconColor: Colors.System,
                header: 'Kosz',
                text: 'Usunięte elementy',
                display: Permission.Has('Trash') ? null : 'none',
                onClick: function (sender, event) {
                    App.Instance.AddChild(object.TrashPage);
                },
            }),
            new ButtonSetting({
                icon: 'logout',
                iconColor: Colors.System,
                header: 'Wyloguj się',
                onClick: function (sender, event) {
                    Ajax.Post('/logout', {
                        load: function (response) {
                            if (response.success) {
                                TestApp.Instance.Auth();
                            }
                        }
                    });
                },
            }),
        ];

        object.Open(object.CalendarPage);
    }

    get TaskTablesPage() {
        let object = this;
        return object.taskTablesPage ?? (object.taskTablesPage = new TaskTablesPage());
    }

    get ConversationsPage() {
        let object = this;
        return object.conversationsPage ?? (object.conversationsPage = new ConversationsPage());
    }

    get NotesPage() {
        let object = this;
        return object.notesPage ?? (object.notesPage = new NotesPage());
    }

    get CalendarPage() {
        let object = this;
        return object.calendarPage ?? (object.calendarPage = new CalendarPage());
    }

    get NotificationsPage() {
        let object = this;
        return object.notificationsPage ?? (object.notificationsPage = new NotificationsPage());
    }

    get ReservationsPage() {
        let object = this;
        return object.reservationsPage ?? (object.reservationsPage = new ReservationsPage());
    }

    get ProductsPage() {
        let object = this;
        return object.productsPage ?? (object.productsPage = new ProductsPage());
    }

    get CustomersPage() {
        let object = this;
        return object.customersPage ?? (object.customersPage = new CustomersPage());
    }

    get ServicesPage() {
        let object = this;
        return object.servicesPage ?? (object.servicesPage = new ServicesPage());
    }

    get LabelsPage() {
        let object = this;
        return object.labelsPage ?? (object.labelsPage = new LabelsPage());
    }

    get UsersPage() {
        let object = this;
        return object.usersPage ?? (object.usersPage = new UsersPage());
    }

    get SearchPage() {
        let object = this;
        return object.searchPage ?? (object.searchPage = new SearchPage());
    }

    get TrashPage() {
        let object = this;
        return object.trashPage ?? (object.trashPage = new TrashPage());
    }

    get AccountPage() {
        let object = this;
        return object.accountPage ?? (object.accountPage = new AccountPage());
    }

}

class LabelButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'flex-start';

        new Property(object, 'Label', data.label ?? {}, object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: Colors.Label,
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        text: 'label',
                    }),
                ],
            }),
            new Layout({
                width: '0%',
                flexGrow: 1,
                children: [
                    new UserLabelView({
                        callback: function (view) {
                            new Binding(object, 'Label', function (sender, property) {
                                view.User = object.Label ? object.Label.owner : null;
                            });
                        },
                    }),
                    new Text({
                        callback: function (view) {
                            new Binding(object, 'Label', function (sender, property) {
                                view.Text = object.Label && object.Label.name ? object.Label.name : 'Brak';
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}

class LabelEditPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Label', data.label ?? {}, object.OnPropertyChanged);

        if (data.onLabelChange) object.OnLabelChange.Listen(data.onLabelChange);
        if (data.onLabelRestore) object.OnLabelRestore.Listen(data.onLabelRestore);
        if (data.onLabelTrash) object.OnLabelTrash.Listen(data.onLabelTrash);
        if (data.onLabelDelete) object.OnLabelDelete.Listen(data.onLabelDelete);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Label', function (sender, data) {
            object.Title = object.Label.name;
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Row({
                children: [
                    new Column({
                        flexGrow: 3,
                        width: '75%',
                        children: [
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'people',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'Nazwa',
                                                callback: function (view) {
                                                    new Binding(object, 'Label', function (sender, data) {
                                                        view.Value = object.Label.name;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        name: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 1,
                        width: '25%',
                        minWidth: '270px',
                        children: [
                            new Column({
                                callback: function (view) {
                                    if (object.Label.trashBy) {
                                        view.Children = [
                                            new ButtonSetting({
                                                icon: 'restore',
                                                iconColor: 'forestgreen',
                                                header: 'Przywróć',
                                                text: 'Przywróć klienta z kosza',
                                                onClick: function (button, event) {
                                                    object.Restore();
                                                },
                                            }),
                                            new ButtonSetting({
                                                icon: 'delete',
                                                iconColor: 'crimson',
                                                header: 'Usuń',
                                                text: 'Usuń klienta na zawsze',
                                                onClick: function (button, event) {
                                                    object.Delete();
                                                },
                                            }),
                                        ];
                                    } else {
                                        view.Children = [
                                            new ButtonSetting({
                                                icon: 'delete',
                                                iconColor: 'crimson',
                                                header: 'Usuń',
                                                text: 'Przenieś klienta do kosza',
                                                onClick: function (button, event) {
                                                    object.Trash();
                                                },
                                            }),
                                        ];
                                    }
                                },
                            }),
                            new ButtonSetting({
                                icon: 'close',
                                header: 'Zamknij',
                                text: '',
                                onClick: function (sender, event) {
                                    object.Pull();
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

    Update(data = {}) {
        let object = this;
        Ajax.Put(`/label/${object.Label.id}`, {
            data: data,
            load: function (response) {
                if (response.success) {
                    object.Label = response.label;
                    object.OnLabelChange.Invoke(object, {
                        label: object.Label,
                    });
                }
            },
        });
    }

    Restore() {
        let object = this;
        Ajax.Post(`/label/${object.Label.id}/restore`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.Label = response.label;
                    object.OnLabelChange.Invoke(object, {
                        label: object.Label,
                    });
                    object.OnLabelRestore.Invoke(object, {
                        label: object.Label,
                    });
                }
            },
        });
    }

    Trash() {
        let object = this;
        Ajax.Post(`/label/${object.Label.id}/trash`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.Label = response.label;
                    object.OnLabelChange.Invoke(object, {
                        label: object.Label,
                    });
                    object.OnLabelTrash.Invoke(object, {
                        label: object.Label,
                    });
                }
            },
        });
    }

    Delete() {
        let object = this;
        Ajax.Delete(`/label/${object.Label.id}`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.OnLabelDelete.Invoke(object, {
                        label: object.Label,
                    });
                }
            },
        });
    }

    get OnLabelChange() {
        let object = this;
        return object.onLabelChange ?? (object.onLabelChange = new Callback());
    }

    get OnLabelRestore() {
        let object = this;
        return object.onLabelRestore ?? (object.onLabelRestore = new Callback());
    }

    get OnLabelTrash() {
        let object = this;
        return object.onLabelTrash ?? (object.onLabelTrash = new Callback());
    }

    get OnLabelDelete() {
        let object = this;
        return object.onLabelDelete ?? (object.onLabelDelete = new Callback());
    }


}

class LabelPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Label', data.label ?? {}, object.OnPropertyChanged);
        new Property(object, 'Notes', data.notes ?? [], object.OnPropertyChanged);
        new Property(object, 'Tasks', data.tasks ?? [], object.OnPropertyChanged);

        if (data.onLabelChange) object.OnLabelChange.Listen(data.onLabelChange);
        if (data.onLabelRestore) object.OnLabelRestore.Listen(data.onLabelRestore);
        if (data.onLabelTrash) object.OnLabelTrash.Listen(data.onLabelTrash);
        if (data.onLabelDelete) object.OnLabelDelete.Listen(data.onLabelDelete);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Label', function (sender, data) {
            object.Title = object.Label.name;
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Row({
                children: [
                    new Column({
                        flexGrow: 65,
                        width: '65%',
                        children: [
                            new Column({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                fontSize: 2,
                                                text: 'Notatki'
                                            }),
                                        ],
                                    }),
                                    new Column({
                                        childrenLoop: function (note) {
                                            return new NoteButton({
                                                note: note,
                                                onClick: function (noteButton, event) {
                                                    let notePage = new NotePage({
                                                        note: noteButton.Note,
                                                        onNoteChange: function (notePage, data) {
                                                            noteButton.Note = notePage.Note;
                                                        },
                                                        onNoteTrash: function (notePage, data) {
                                                            noteButton.Remove();
                                                        },
                                                    });

                                                    object.Parent.AddChild(notePage);
                                                },
                                            });
                                        },
                                        callback: function (view) {
                                            new Binding(object, 'Notes', function (sender, data) {
                                                view.Children = object.Notes;
                                            });
                                        },
                                    }),
                                ],
                                callback: function (view) {
                                    new Binding(object, 'Notes', function (sender, data) {
                                        view.Display = object.Notes.length ? null : 'none';
                                    });
                                },
                            }),
                            new Column({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                fontSize: 2,
                                                text: 'Zadania'
                                            }),
                                        ],
                                    }),
                                    new Column({
                                        childrenLoop: function (task) {
                                            return new TaskButton({
                                                task: task,
                                                onClick: function (taskButton, event) {
                                                    let taskPage = new TaskPage({
                                                        task: taskButton.Task,
                                                        onTaskChange: function (taskPage, data) {
                                                            taskButton.Task = taskPage.Task;
                                                        },
                                                        onTaskTrash: function (taskPage, data) {
                                                            taskButton.Remove();
                                                        },
                                                    });

                                                    object.Parent.AddChild(taskPage);
                                                },
                                            });
                                        },
                                        callback: function (view) {
                                            new Binding(object, 'Tasks', function (sender, data) {
                                                view.Children = object.Tasks;
                                            });
                                        },
                                    }),
                                ],
                                callback: function (view) {
                                    new Binding(object, 'Tasks', function (sender, data) {
                                        view.Display = object.Tasks.length ? null : 'none';
                                    });
                                },
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 35,
                        width: '35%',
                        minWidth: '300px',
                        children: [
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Zarządzaj',
                                            })
                                        ],
                                    }),
                                    new ButtonSetting({
                                        icon: 'edit',
                                        iconColor: 'darkgray',
                                        header: 'Edytuj',
                                        text: 'Zmień dane etykiety',
                                        onClick: function (button, event) {
                                            let labelEditPage = new LabelEditPage({
                                                label: object.Label,
                                                onLabelChange: function (labelEditPage, data) {
                                                    object.Label = labelEditPage.Label;
                                                    object.OnLabelChange.Invoke(object, {
                                                        label: object.Label,
                                                    });
                                                },
                                                onLabelRestore: function (labelEditPage, data) {
                                                    object.Label = labelEditPage.Label;
                                                    object.Pull();
                                                    object.OnLabelRestore.Invoke(object, {
                                                        label: object.Label,
                                                    });
                                                },
                                                onLabelTrash: function (labelEditPage, data) {
                                                    object.Label = labelEditPage.Label;
                                                    object.Pull();
                                                    object.OnLabelTrash.Invoke(object, {
                                                        label: object.Label,
                                                    });
                                                },
                                                onLabelDelete: function (labelEditPage, data) {
                                                    object.Label = labelEditPage.Label;
                                                    object.Pull();
                                                    object.OnLabelDelete.Invoke(object, {
                                                        label: object.Label,
                                                    });
                                                },
                                            });

                                            object.Parent.AddChild(labelEditPage);
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new ButtonSetting({
                                        icon: 'close',
                                        header: 'Zamknij',
                                        text: '',
                                        onClick: function (sender, event) {
                                            object.Pull();
                                        },
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ];

        object.ReloadItems();
    }

    ReloadItems() {
        let object = this;

        object.Notes = [];
        object.Tasks = [];

        Ajax.Get(`/label/${object.Label.id}/items`, {
            load: function (response) {
                if (response.success) {
                    object.Notes = response.notes;
                    object.Tasks = response.tasks;
                }
            },
        });
    }

    get OnLabelChange() {
        let object = this;
        return object.onLabelChange ?? (object.onLabelChange = new Callback());
    }

    get OnLabelRestore() {
        let object = this;
        return object.onLabelRestore ?? (object.onLabelRestore = new Callback());
    }

    get OnLabelTrash() {
        let object = this;
        return object.onLabelTrash ?? (object.onLabelTrash = new Callback());
    }

    get OnLabelDelete() {
        let object = this;
        return object.onLabelDelete ?? (object.onLabelDelete = new Callback());
    }


}

class LabelPickerPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Notatki';

        object.TitleView.MaxWidth = 720;
        object.ContentView.MaxWidth = 720;

        new Property(object, 'Query', data.query ?? '', object.OnPropertyChanged);
        new Property(object, 'Labels', data.labels ?? [], object.OnPropertyChanged);

        if (data.onSelect) object.OnSelect.Listen(data.onSelect);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'Query', function (sender, data) {
            clearTimeout(object.queryTimeout);
            object.queryTimeout = setTimeout(function () {
                object.ReloadLabels();
            }, 250);
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Column({
                children: [
                    new Form({
                        children: [
                            new Label({
                                width: '100%',
                                children: [
                                    new Input({
                                        width: '100%',
                                        name: 'name',
                                        placeholder: 'Nazwa',
                                    })
                                ],
                            }),
                            new ButtonSetting({
                                width: '100%',
                                icon: 'add',
                                iconColor: 'forestgreen',
                                header: 'Utwórz',
                                text: 'Dodaj nową etykietę',
                            }),
                        ],
                        onSubmit: function (form, event) {
                            Ajax.Post(`/label`, {
                                form: form.Element,
                                load: function (response) {
                                    if (response.success) {
                                        object.Pull();
                                        object.OnSelect.Invoke(object, {
                                            label: response.label,
                                        });
                                    }
                                },
                            });
                        },
                    }),
                    new Row({
                        children: [
                            new ButtonSetting({
                                width: '50%',
                                icon: 'close',
                                header: 'Zamknij',
                                text: 'Wyjdź bez zapisywania',
                                onClick: function (sender, event) {
                                    object.Pull();
                                },
                            }),
                            new ButtonSetting({
                                width: '50%',
                                icon: 'delete',
                                iconColor: 'crimson',
                                header: 'Wyczyść',
                                text: '',
                                onClick: function (sender, event) {
                                    object.Pull();
                                    object.OnSelect.Invoke(object, {
                                        label: {
                                            id: 0,
                                        },
                                    });
                                },
                            }),
                        ],
                    }),
                    new Label({
                        width: '100%',
                        children: [
                            new Input({
                                width: '100%',
                                placeholder: 'Szukaj',
                                value: object.Query,
                                onInput: function (input, event) {
                                    object.Query = input.Value;
                                },
                            })
                        ],
                    }),
                    new Column({
                        childrenLoop: function (label) {
                            return new LabelButton({
                                label: label,
                                onClick: function (sender, data) {
                                    object.Pull();
                                    object.OnSelect.Invoke(object, {
                                        label: label,
                                    });
                                },
                            });
                        },
                        callback: function (view) {
                            new Binding(object, 'Labels', function (sender, data) {
                                view.Children = object.Labels;
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    ReloadLabels() {
        let object = this;

        Ajax.Post(`/label/query`, {
            data: {
                query: object.Query,
            },
            load: function (response) {
                if (response.success) {
                    object.Labels = response.labels;
                }
            }
        });
    }

    get OnSelect() {
        let object = this;
        return object.onSelect ?? (object.onSelect = new Callback());
    }

}

class LabelTag extends Layout {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Padding = 0.125;

        new Property(object, 'Label', data.label ?? {}, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Label', function (sender, data) {
            object.Display = object.Label ? null : 'none';
        });
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                padding: 0.125,
                borderRadius: 0.125,
                children: [
                    new Text({
                        fontSize: 0.5,
                        callback: function (view) {
                            new Binding(object, 'Label', function (sender, data) {
                                view.Text = object.Label && object.Label.name ? object.Label.name : 'Brak';
                            });
                        },
                    }),
                ],
                callback: function (view) {
                    new Binding(object, 'Label', function (sender, data) {
                        view.BackgroundColor = object.Label && object.Label.backgroundColor ? object.Label.backgroundColor : 'black';
                        view.Color = object.Label && object.Label.color ? object.Label.color : 'white';
                    });
                },
            }),
        ];
    }

}

class LabelsPage extends WindowPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Etykiety';
        object.Theme = Colors.Label;

        new Property(object, 'Labels', data.labels ?? [], object.OnPropertyChanged);

        object.OnPush.Listen(function () {
            object.ReloadLabels();
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.BodyChildren = [
            new Column({
                children: [
                    new Column({
                        childrenLoop: function (label) {
                            return object.GetLabelButton(label);
                        },
                        callback: function (view) {
                            object.labelList = view;

                            new Binding(object, 'Labels', function (sender, data) {
                                view.Children = object.Labels;
                            });

                            object.ReloadLabels();
                        },
                    }),
                ],
            }),
        ];

        object.FooterChildren = [
            new Row({
                justifyContent: 'flex-end',
                fontSize: 0.6,
                children: [
                    new Button({
                        children: [
                            new Text({
                                text: 'Odśwież',
                            }),
                        ],
                        onClick: function (sender, event) {
                            object.ReloadLabels();
                        },
                    }),
                    new Button({
                        children: [
                            new Text({
                                text: 'Nowa etykieta',
                            }),
                        ],
                        onClick: function (sender, event) {
                            Ajax.Post(`/label`, {
                                load: function (response) {
                                    if (response.success) {
                                        let labelButton = object.GetLabelButton(response.label);
                                        labelButton.Parent = object.labelList;
                                        labelButton.Click();
                                    }
                                },
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    GetLabelButton(label) {
        let object = this;

        return new LabelButton({
            label: label,
            onClick: function (labelButton, event) {
                let labelPage = new LabelPage({
                    label: labelButton.Label,
                    onLabelChange: function (labelPage, data) {
                        labelButton.Label = labelPage.Label;
                    },
                    onLabelTrash: function (labelPage, data) {
                        labelButton.Remove();
                    },
                });

                object.Body.AddChild(labelPage);
            },
        });
    }

    ReloadLabels() {
        let object = this;

        object.Labels = [];
        object.Loading.Parent = object.labelList;

        Ajax.Get(`/label`, {
            load: function (response) {
                object.Labels = response.labels;
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

}

class NoteCalendarButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Gap = 0.125;
        object.Padding = 0.125;

        new Property(object, 'Note', data.note ?? {}, object.OnPropertyChanged);
    }

    Render() {
        super.Render();
        let object = this;

        object.Children = [
            new Icon({
                text: 'note',
                color: Colors.Note,
            }),
            new Text({
                width: '0%',
                flexGrow: 1,
                overflow: 'hidden',
                fontSize: 0.6,
                callback: function (view) {
                    new Binding(object, 'Note', function (sender, data) {
                        view.Text = object.Note.name;
                    })
                },
            }),
            new LabelTag({
                callback: function (view) {
                    new Binding(object, 'Note', function (sender, data) {
                        view.Label = object.Note ? object.Note.label : null;
                    });
                },
            }),
            new UserAvatar({
                callback: function (view) {
                    new Binding(object, 'Note', function (sender, data) {
                        view.User = object.Note ? object.Note.owner : null;
                    });
                },
            }),
        ];
    }


}

class NoteButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'flex-start';

        new Property(object, 'Note', data.note ?? {}, object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: Colors.Note,
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        text: 'note',
                    }),
                ],
            }),
            new Layout({
                width: '0%',
                flexGrow: 1,
                children: [
                    new Row({
                        children: [
                            new UserLabelView({
                                callback: function (view) {
                                    new Binding(object, 'Note', function (sender, property) {
                                        view.User = object.Note ? object.Note.owner : null;
                                    });
                                },
                            }),
                            new LabelTag({
                                callback: function (view) {
                                    new Binding(object, 'Note', function (sender, property) {
                                        view.Label = object.Note ? object.Note.label : null;
                                    });
                                },
                            }),
                        ],
                    }),
                    new Text({
                        callback: function (view) {
                            new Binding(object, 'Note', function (sender, property) {
                                view.Text = object.Note && object.Note.name ? object.Note.name : 'Brak nazwy';
                            });
                        },
                    }),
                    new Text({
                        fontSize: 0.6,
                        callback: function (view) {
                            new Binding(object, 'Note', function (sender, property) {
                                view.Text = object.Note && object.Note.body ? object.Note.body : '';
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}

class NotePage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Note', data.note ?? {}, object.OnPropertyChanged);

        if (data.onNoteChange) object.OnNoteChange.Listen(data.onNoteChange);
        if (data.onNoteRestore) object.OnNoteRestore.Listen(data.onNoteRestore);
        if (data.onNoteTrash) object.OnNoteTrash.Listen(data.onNoteTrash);
        if (data.onNoteDelete) object.OnNoteDelete.Listen(data.onNoteDelete);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Note', function (sender, data) {
            object.Title = object.Note.name;
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Row({
                children: [
                    new Column({
                        flexGrow: 65,
                        width: '65%',
                        children: [
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'note',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'Nazwa notatki',
                                                callback: function (view) {
                                                    new Binding(object, 'Note', function (sender, data) {
                                                        view.Value = object.Note.name;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        name: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'description',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Textarea({
                                                width: '100%',
                                                placeholder: 'Treść notatki',
                                                rows: 5,
                                                onFocus: function (textarea, event) {
                                                    textarea.Rows = 10;
                                                },
                                                onBlur: function (textarea, event) {
                                                    textarea.Rows = 5;
                                                },
                                                callback: function (view) {
                                                    new Binding(object, 'Note', function (sender, data) {
                                                        view.Value = object.Note.body;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        body: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new Label({
                                children: [
                                    new Text({
                                        fontSize: 2,
                                        text: 'Komentarze'
                                    }),
                                ],
                            }),
                            new CommentsView({
                                callback: function (view) {
                                    new Binding(object, 'Note', function (sender, data) {
                                        view.Target = object.Note;
                                    });
                                },
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 35,
                        width: '35%',
                        minWidth: '300px',
                        children: [
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Zmień termin',
                                            })
                                        ],
                                    }),
                                    new Label({
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'Termin',
                                                type: 'date',
                                                callback: function (view) {
                                                    new Binding(object, 'Note', function (sender, data) {
                                                        view.Value = object.Note.date;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        date: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Załączniki'
                                            }),
                                        ],
                                    }),
                                    new AttachmentsView({
                                        callback: function (view) {
                                            new Binding(object, 'Note', function (sender, data) {
                                                view.Target = object.Note;
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Przypisz',
                                            })
                                        ],
                                    }),
                                    new LabelButton({
                                        callback: function (view) {
                                            new Binding(object, 'Note', function (sender, data) {
                                                view.Label = object.Note.label;
                                            });
                                        },
                                        onClick: function (button, event) {
                                            let labelPickerPage = new LabelPickerPage({
                                                selected: object.Note.labelId,
                                                onSelect: function (sender, data) {
                                                    object.Update({
                                                        labelId: data.label ? data.label.id : 0,
                                                    });
                                                },
                                            });

                                            TestApp.Instance.AddChild(labelPickerPage);
                                        },
                                    }),
                                    new CustomerButton({
                                        callback: function (view) {
                                            new Binding(object, 'Note', function (sender, data) {
                                                view.Customer = object.Note.customer;
                                            });
                                        },
                                        onClick: function (button, event) {
                                            let customerPickerPage = new CustomerPickerPage({
                                                selected: object.Note.customerId,
                                                onSelect: function (sender, data) {
                                                    object.Update({
                                                        customerId: data.customer ? data.customer.id : 0,
                                                    });
                                                },
                                            });

                                            TestApp.Instance.AddChild(customerPickerPage);
                                        },
                                    }),
                                    new ProductButton({
                                        callback: function (view) {
                                            new Binding(object, 'Note', function (sender, data) {
                                                view.Product = object.Note.product;
                                            });
                                        },
                                        onClick: function (button, event) {
                                            let productPickerPage = new ProductPickerPage({
                                                selected: object.Note.productId,
                                                onSelect: function (sender, data) {
                                                    object.Update({
                                                        productId: data.product ? data.product.id : 0,
                                                    });
                                                },
                                            });

                                            TestApp.Instance.AddChild(productPickerPage);
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Zarządzaj',
                                            })
                                        ],
                                    }),
                                    new Column({
                                        callback: function (view) {
                                            if (object.Note.trashBy) {
                                                view.Children = [
                                                    new ButtonSetting({
                                                        icon: 'restore',
                                                        iconColor: 'forestgreen',
                                                        header: 'Przywróć',
                                                        text: 'Przywróć notatkę z kosza',
                                                        onClick: function (button, event) {
                                                            object.Restore();
                                                        },
                                                    }),
                                                    new ButtonSetting({
                                                        icon: 'delete',
                                                        iconColor: 'crimson',
                                                        header: 'Usuń',
                                                        text: 'Usuń notatkę na zawsze',
                                                        onClick: function (button, event) {
                                                            object.Delete();
                                                        },
                                                    }),
                                                ];
                                            } else {
                                                view.Children = [
                                                    new ButtonSetting({
                                                        icon: 'delete',
                                                        iconColor: 'crimson',
                                                        header: 'Usuń',
                                                        text: 'Przenieś notatkę do kosza',
                                                        onClick: function (button, event) {
                                                            object.Trash();
                                                        },
                                                    }),
                                                ];
                                            }
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new ButtonSetting({
                                        icon: 'close',
                                        header: 'Zamknij',
                                        text: '',
                                        onClick: function (sender, event) {
                                            object.Pull();
                                        },
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

    Update(data = {}) {
        let object = this;
        Ajax.Put(`/note/${object.Note.id}`, {
            data: data,
            load: function (response) {
                if (response.success) {
                    object.Note = response.note;
                    object.OnNoteChange.Invoke(object, {
                        note: object.Note,
                    });
                }
            },
        });
    }

    Restore() {
        let object = this;
        Ajax.Post(`/note/${object.Note.id}/restore`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.Note = response.note;
                    object.OnNoteChange.Invoke(object, {
                        note: object.Note,
                    });
                    object.OnNoteRestore.Invoke(object, {
                        note: object.Note,
                    });
                }
            },
        });
    }

    Trash() {
        let object = this;
        Ajax.Post(`/note/${object.Note.id}/trash`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.Note = response.note;
                    object.OnNoteChange.Invoke(object, {
                        note: object.Note,
                    });
                    object.OnNoteTrash.Invoke(object, {
                        note: object.Note,
                    });
                }
            },
        });
    }

    Delete() {
        let object = this;
        Ajax.Delete(`/note/${object.Note.id}`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.OnNoteDelete.Invoke(object, {
                        note: object.Note,
                    });
                }
            },
        });
    }

    get OnNoteChange() {
        let object = this;
        return object.onNoteChange ?? (object.onNoteChange = new Callback());
    }

    get OnNoteRestore() {
        let object = this;
        return object.onNoteRestore ?? (object.onNoteRestore = new Callback());
    }

    get OnNoteTrash() {
        let object = this;
        return object.onNoteTrash ?? (object.onNoteTrash = new Callback());
    }

    get OnNoteDelete() {
        let object = this;
        return object.onNoteDelete ?? (object.onNoteDelete = new Callback());
    }


}

class NotePickerPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Notatki';

        object.TitleView.MaxWidth = 720;
        object.ContentView.MaxWidth = 720;

        new Property(object, 'Query', data.query ?? '', object.OnPropertyChanged);
        new Property(object, 'Notes', data.notes ?? [], object.OnPropertyChanged);

        if (data.onSelect) object.OnSelect.Listen(data.onSelect);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'Query', function (sender, data) {
            clearTimeout(object.queryTimeout);
            object.queryTimeout = setTimeout(function () {
                object.ReloadNotes();
            }, 250);
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Column({
                children: [
                    new Form({
                        children: [
                            new Label({
                                width: '50%',
                                children: [
                                    new Input({
                                        width: '100%',
                                        name: 'name',
                                        placeholder: 'Nazwa',
                                    })
                                ],
                            }),
                            new Label({
                                width: '50%',
                                children: [
                                    new Input({
                                        width: '100%',
                                        name: 'tin',
                                        placeholder: 'NIP',
                                    })
                                ],
                            }),
                            new Label({
                                width: '100%',
                                children: [
                                    new Textarea({
                                        width: '100%',
                                        name: 'address',
                                        placeholder: 'Adres',
                                    })
                                ],
                            }),
                            new Label({
                                width: '50%',
                                children: [
                                    new Input({
                                        width: '100%',
                                        name: 'phoneNumber',
                                        placeholder: 'Numer telefonu',
                                    })
                                ],
                            }),
                            new Label({
                                width: '50%',
                                children: [
                                    new Input({
                                        width: '100%',
                                        type: 'email',
                                        name: 'emailAddress',
                                        placeholder: 'Adres email',
                                    })
                                ],
                            }),
                            new ButtonSetting({
                                width: '100%',
                                icon: 'add',
                                iconColor: 'forestgreen',
                                header: 'Utwórz',
                                text: 'Dodaj nowego klienta',
                            }),
                        ],
                        onSubmit: function (form, event) {
                            Ajax.Post(`/note`, {
                                form: form.Element,
                                load: function (response) {
                                    if (response.success) {
                                        object.Pull();
                                        object.OnSelect.Invoke(object, {
                                            note: response.note,
                                        });
                                    }
                                },
                            });
                        },
                    }),
                    new Row({
                        children: [
                            new ButtonSetting({
                                width: '50%',
                                icon: 'close',
                                header: 'Zamknij',
                                text: 'Wyjdź bez zapisywania',
                                onClick: function (sender, event) {
                                    object.Pull();
                                },
                            }),
                            new ButtonSetting({
                                width: '50%',
                                icon: 'delete',
                                iconColor: 'crimson',
                                header: 'Wyczyść',
                                text: '',
                                onClick: function (sender, event) {
                                    object.Pull();
                                    object.OnSelect.Invoke(object, {
                                        note: {
                                            id: 0,
                                        },
                                    });
                                },
                            }),
                        ],
                    }),
                    new Label({
                        width: '100%',
                        children: [
                            new Input({
                                width: '100%',
                                placeholder: 'Szukaj',
                                value: object.Query,
                                onInput: function (input, event) {
                                    object.Query = input.Value;
                                },
                            })
                        ],
                    }),
                    new Column({
                        childrenLoop: function (note) {
                            return new NoteButton({
                                note: note,
                                onClick: function (sender, data) {
                                    object.Pull();
                                    object.OnSelect.Invoke(object, {
                                        note: note,
                                    });
                                },
                            });
                        },
                        callback: function (view) {
                            new Binding(object, 'Notes', function (sender, data) {
                                view.Children = object.Notes;
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    ReloadNotes() {
        let object = this;

        Ajax.Post(`/note/query`, {
            data: {
                query: object.Query,
            },
            load: function (response) {
                if (response.success) {
                    object.Notes = response.notes;
                }
            }
        });
    }

    get OnSelect() {
        let object = this;
        return object.onSelect ?? (object.onSelect = new Callback());
    }

}

class NotesPage extends WindowPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Notatki';
        object.Theme = Colors.Note;

        new Property(object, 'Notes', data.notes ?? [], object.OnPropertyChanged);

        object.OnPush.Listen(function () {
            object.ReloadNotes();
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.BodyChildren = [
            new Column({
                children: [
                    new Column({
                        childrenLoop: function (note) {
                            return object.GetNoteButton(note);
                        },
                        callback: function (view) {
                            object.noteList = view;

                            new Binding(object, 'Notes', function (sender, data) {
                                view.Children = object.Notes;
                            });

                            object.ReloadNotes();
                        },
                    }),
                ],
            }),
        ];

        object.FooterChildren = [
            new Row({
                justifyContent: 'flex-end',
                fontSize: 0.6,
                children: [
                    new Button({
                        children: [
                            new Text({
                                text: 'Odśwież',
                            }),
                        ],
                        onClick: function (sender, event) {
                            object.ReloadNotes();
                        },
                    }),
                    new Button({
                        children: [
                            new Text({
                                text: 'Nowa notatka',
                            }),
                        ],
                        onClick: function (sender, event) {
                            Ajax.Post(`/note`, {
                                load: function (response) {
                                    if (response.success) {
                                        let noteButton = object.GetNoteButton(response.note);
                                        noteButton.Parent = object.noteList;
                                        noteButton.Click();
                                    }
                                },
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    GetNoteButton(note) {
        let object = this;
        return new NoteButton({
            note: note,
            onClick: function (noteButton, event) {
                let notePage = new NotePage({
                    note: noteButton.Note,
                    onNoteChange: function (notePage, data) {
                        noteButton.Note = notePage.Note;
                    },
                    onNoteTrash: function (notePage, data) {
                        noteButton.Remove();
                    },
                });

                object.Body.AddChild(notePage);
            },
        });
    }

    ReloadNotes() {
        let object = this;

        object.Notes = [];
        object.Loading.Parent = object.noteList;

        Ajax.Get(`/note`, {
            load: function (response) {
                object.Notes = response.notes;
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

}

class NotificationButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'flex-start';

        new Property(object, 'Notification', data.notification ?? {}, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Notification', function (sender, data) {
            object.Opacity = object.Notification.isRead ? 0.5 : null;
        });
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: Colors.Notification,
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        text: 'notifications',
                    }),
                ],
            }),
            new Layout({
                width: '0%',
                flexGrow: 1,
                children: [
                    new UserLabelView({
                        callback: function (view) {
                            new Binding(object, 'Notification', function (sender, property) {
                                view.User = object.Notification ? object.Notification.user : null;
                            });
                        },
                    }),
                    new Text({
                        callback: function (view) {
                            new Binding(object, 'Notification', function (sender, property) {
                                let text = [];

                                if (object.Notification.user) {
                                    text.push(object.Notification.user.name);
                                }

                                if (object.Notification.type = 'Comment.New') {
                                    text.push('dodał komentarz');
                                    if (object.Notification.object) {
                                        if (object.Notification.object.class == 'Note') text.push(`do notatki <q>${object.Notification.object.name}</q>`);
                                        else if (object.Notification.object.class == 'Task') text.push(`do zadania <q>${object.Notification.object.name}</q>`);
                                        else if (object.Notification.object.class == 'Product') text.push(`do produktu <q>${object.Notification.object.name}</q>`);
                                        else if (object.Notification.object.class == 'Customer') text.push(`do klienta <q>${object.Notification.object.name}</q>`);
                                        else if (object.Notification.object.class == 'Comment') text.push(`do komentarza <q>${object.Notification.object.body}</q>`);
                                        else text.push(`do elementu <q>${object.Notification.object.class}</q>`);
                                    } else {
                                        text.push('do usuniętego elementu.');
                                    }
                                }

                                view.Text = text.length ? text.join(' ') : 'Brak informacji';
                            });
                        },
                    }),
                    new Text({
                        fontSize: 0.6,
                        callback: function (view) {
                            new Binding(object, 'Notification', function (sender, property) {
                                view.Text = object.Notification ? object.Notification.created : '';
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}

class NotificationsPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Powiadomienia';

        object.TitleView.MaxWidth = 720;
        object.ContentView.MaxWidth = 720;
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Column({
                children: [
                    new Column({
                        childrenLoop: function (notification) {
                            return object.GetNotificationButton(notification);
                        },
                        callback: function (view) {
                            object.notificationList = view;

                            new Binding(App.Instance, 'Notifications', function (sender, data) {
                                view.Children = App.Instance.Notifications;
                            });
                        },
                    }),
                ],
            }),
            new Button({
                fontSize: 2,
                borderRadius: 3,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                right: '1rem',
                bottom: '1rem',
                width: '3rem',
                height: '3rem',
                children: [
                    new Icon({
                        text: 'add',
                    })
                ],
                onClick: function (sender, event) {
                    Ajax.Post(`/notification`, {
                        load: function (response) {
                            if (response.success) {
                                let notificationButton = object.GetNotificationButton(response.notification);
                                notificationButton.Parent = object.notificationList;
                                notificationButton.Click();
                            }
                        },
                    });
                },
            }),
        ];
    }

    GetNotificationButton(notification) {
        let object = this;
        return new NotificationButton({
            notification: notification,
            onClick: function (notificationButton, event) {
                if (!notificationButton.Notification.isRead) {
                    Ajax.Put(`/notification/${notificationButton.Notification.id}`, {
                        data: {
                            isRead: true,
                        },
                        load: function (response) {
                            if (response.success) {
                                notificationButton.Notification = response.notification;
                            }
                        },
                    });
                }

                notification = notificationButton.Notification;

                if (notification.object) {
                    if (notification.object.class == 'Note') {
                        let notePage = new NotePage({
                            note: notification.object,
                        });

                        App.Instance.AddChild(notePage);
                    } else if (notification.object.class == 'Task') {
                        let taskPage = new TaskPage({
                            task: notification.object,
                        });

                        App.Instance.AddChild(taskPage);
                    } else if (notification.object.class == 'Customer') {
                        let customerPage = new CustomerPage({
                            customer: notification.object,
                        });

                        App.Instance.AddChild(customerPage);
                    } else if (notification.object.class == 'Product') {
                        let productPage = new ProductPage({
                            product: notification.object,
                        });

                        App.Instance.AddChild(productPage);
                    } else if (notification.object.class == 'Comment') {
                        let commentPage = new CommentPage({
                            comment: notification.object,
                        });

                        App.Instance.AddChild(commentPage);
                    }
                }
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

}

class ProductButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'flex-start';

        new Property(object, 'Product', data.product ?? {}, object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: Colors.Product,
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        text: 'shopping_bag',
                    }),
                ],
            }),
            new Layout({
                width: '0%',
                flexGrow: 1,
                children: [
                    new Row({
                        children: [
                            new UserLabelView({
                                callback: function (view) {
                                    new Binding(object, 'Product', function (sender, property) {
                                        view.User = object.Product ? object.Product.owner : null;
                                    });
                                },
                            }),
                            new LabelTag({
                                callback: function (view) {
                                    new Binding(object, 'Product', function (sender, property) {
                                        view.Label = object.Product ? object.Product.label : null;
                                    });
                                },
                            }),
                        ],
                    }),
                    new Text({
                        callback: function (view) {
                            new Binding(object, 'Product', function (sender, property) {
                                view.Text = object.Product && object.Product.name ? object.Product.name : 'Brak';
                            });
                        },
                    }),
                    new Text({
                        fontSize: 0.6,
                        callback: function (view) {
                            new Binding(object, 'Product', function (sender, property) {
                                view.Text = object.Product ? object.Product.description : '';
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}

class ProductEditPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Product', data.product ?? {}, object.OnPropertyChanged);

        if (data.onProductChange) object.OnProductChange.Listen(data.onProductChange);
        if (data.onProductRestore) object.OnProductRestore.Listen(data.onProductRestore);
        if (data.onProductTrash) object.OnProductTrash.Listen(data.onProductTrash);
        if (data.onProductDelete) object.OnProductDelete.Listen(data.onProductDelete);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Product', function (sender, data) {
            object.Title = object.Product && object.Product.name ? object.Product.name : 'Brak nazwy';
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Row({
                children: [
                    new Column({
                        flexGrow: 3,
                        width: '75%',
                        children: [
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'shopping_bag',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'Nazwa',
                                                callback: function (view) {
                                                    new Binding(object, 'Product', function (sender, data) {
                                                        view.Value = object.Product.name;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        name: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'description',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Textarea({
                                                width: '100%',
                                                placeholder: 'Opis',
                                                rows: 5,
                                                onFocus: function (textarea, event) {
                                                    textarea.Rows = 10;
                                                },
                                                onBlur: function (textarea, event) {
                                                    textarea.Rows = 5;
                                                },
                                                callback: function (view) {
                                                    new Binding(object, 'Product', function (sender, data) {
                                                        view.Value = object.Product.description;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        description: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 1,
                        width: '25%',
                        minWidth: '270px',
                        children: [
                            new LabelButton({
                                callback: function (view) {
                                    new Binding(object, 'Product', function (sender, data) {
                                        view.Label = object.Product.label;
                                    });
                                },
                                onClick: function (button, event) {
                                    let labelPickerPage = new LabelPickerPage({
                                        selected: object.Product.labelId,
                                        onSelect: function (sender, data) {
                                            object.Update({
                                                labelId: data.label ? data.label.id : 0,
                                            });
                                        },
                                    });

                                    TestApp.Instance.AddChild(labelPickerPage);
                                },
                            }),
                            new Column({
                                callback: function (view) {
                                    if (object.Product.trashBy) {
                                        view.Children = [
                                            new ButtonSetting({
                                                icon: 'restore',
                                                iconColor: 'forestgreen',
                                                header: 'Przywróć',
                                                text: 'Przywróć klienta z kosza',
                                                onClick: function (button, event) {
                                                    object.Restore();
                                                },
                                            }),
                                            new ButtonSetting({
                                                icon: 'delete',
                                                iconColor: 'crimson',
                                                header: 'Usuń',
                                                text: 'Usuń klienta na zawsze',
                                                onClick: function (button, event) {
                                                    object.Delete();
                                                },
                                            }),
                                        ];
                                    } else {
                                        view.Children = [
                                            new ButtonSetting({
                                                icon: 'delete',
                                                iconColor: 'crimson',
                                                header: 'Usuń',
                                                text: 'Przenieś klienta do kosza',
                                                onClick: function (button, event) {
                                                    object.Trash();
                                                },
                                            }),
                                        ];
                                    }
                                },
                            }),
                            new ButtonSetting({
                                icon: 'close',
                                header: 'Zamknij',
                                text: '',
                                onClick: function (sender, event) {
                                    object.Pull();
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

    Update(data = {}) {
        let object = this;
        Ajax.Put(`/product/${object.Product.id}`, {
            data: data,
            load: function (response) {
                if (response.success) {
                    object.Product = response.product;
                    object.OnProductChange.Invoke(object, {
                        product: object.Product,
                    });
                }
            },
        });
    }

    Restore() {
        let object = this;
        Ajax.Post(`/product/${object.Product.id}/restore`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.Product = response.product;
                    object.OnProductChange.Invoke(object, {
                        product: object.Product,
                    });
                    object.OnProductRestore.Invoke(object, {
                        product: object.Product,
                    });
                }
            },
        });
    }

    Trash() {
        let object = this;
        Ajax.Post(`/product/${object.Product.id}/trash`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.Product = response.product;
                    object.OnProductChange.Invoke(object, {
                        product: object.Product,
                    });
                    object.OnProductTrash.Invoke(object, {
                        product: object.Product,
                    });
                }
            },
        });
    }

    Delete() {
        let object = this;
        Ajax.Delete(`/product/${object.Product.id}`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.OnProductDelete.Invoke(object, {
                        product: object.Product,
                    });
                }
            },
        });
    }

    get OnProductChange() {
        let object = this;
        return object.onProductChange ?? (object.onProductChange = new Callback());
    }

    get OnProductRestore() {
        let object = this;
        return object.onProductRestore ?? (object.onProductRestore = new Callback());
    }

    get OnProductTrash() {
        let object = this;
        return object.onProductTrash ?? (object.onProductTrash = new Callback());
    }

    get OnProductDelete() {
        let object = this;
        return object.onProductDelete ?? (object.onProductDelete = new Callback());
    }


}

class ProductPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Product', data.product ?? {}, object.OnPropertyChanged);
        new Property(object, 'Notes', data.notes ?? [], object.OnPropertyChanged);
        new Property(object, 'Tasks', data.tasks ?? [], object.OnPropertyChanged);

        if (data.onProductChange) object.OnProductChange.Listen(data.onProductChange);
        if (data.onProductRestore) object.OnProductRestore.Listen(data.onProductRestore);
        if (data.onProductTrash) object.OnProductTrash.Listen(data.onProductTrash);
        if (data.onProductDelete) object.OnProductDelete.Listen(data.onProductDelete);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Product', function (sender, data) {
            object.Title = object.Product && object.Product.name ? object.Product.name : 'Brak nazwy';
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Row({
                children: [
                    new Column({
                        flexGrow: 65,
                        width: '65%',
                        children: [
                            new Column({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                fontSize: 2,
                                                text: 'Notatki'
                                            }),
                                        ],
                                    }),
                                    new Column({
                                        childrenLoop: function (note) {
                                            return new NoteButton({
                                                note: note,
                                                onClick: function (noteButton, event) {
                                                    let notePage = new NotePage({
                                                        note: noteButton.Note,
                                                        onNoteChange: function (notePage, data) {
                                                            noteButton.Note = notePage.Note;
                                                        },
                                                        onNoteTrash: function (notePage, data) {
                                                            noteButton.Remove();
                                                        },
                                                    });

                                                    object.Parent.AddChild(notePage);
                                                },
                                            });
                                        },
                                        callback: function (view) {
                                            new Binding(object, 'Notes', function (sender, data) {
                                                view.Children = object.Notes;
                                            });
                                        },
                                    }),
                                ],
                                callback: function (view) {
                                    new Binding(object, 'Notes', function (sender, data) {
                                        view.Display = object.Notes.length ? null : 'none';
                                    });
                                },
                            }),
                            new Column({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                fontSize: 2,
                                                text: 'Zadania'
                                            }),
                                        ],
                                    }),
                                    new Column({
                                        childrenLoop: function (task) {
                                            return new TaskButton({
                                                task: task,
                                                onClick: function (taskButton, event) {
                                                    let taskPage = new TaskPage({
                                                        task: taskButton.Task,
                                                        onTaskChange: function (taskPage, data) {
                                                            taskButton.Task = taskPage.Task;
                                                        },
                                                        onTaskTrash: function (taskPage, data) {
                                                            taskButton.Remove();
                                                        },
                                                    });

                                                    object.Parent.AddChild(taskPage);
                                                },
                                            });
                                        },
                                        callback: function (view) {
                                            new Binding(object, 'Tasks', function (sender, data) {
                                                view.Children = object.Tasks;
                                            });
                                        },
                                    }),
                                ],
                                callback: function (view) {
                                    new Binding(object, 'Tasks', function (sender, data) {
                                        view.Display = object.Tasks.length ? null : 'none';
                                    });
                                },
                            }),
                            new Label({
                                children: [
                                    new Text({
                                        text: 'Komentarze',
                                        fontSize: 2,
                                    }),
                                ],
                            }),
                            new CommentsView({
                                callback: function (view) {
                                    new Binding(object, 'Product', function (sender, data) {
                                        view.Target = object.Product;
                                    });
                                },
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 35,
                        width: '35%',
                        children: [
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Załączniki'
                                            }),
                                        ],
                                    }),
                                    new AttachmentsView({
                                        callback: function (view) {
                                            new Binding(object, 'Product', function (sender, data) {
                                                view.Target = object.Product;
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Zarządzaj',
                                            })
                                        ],
                                    }),
                                    new ButtonSetting({
                                        icon: 'edit',
                                        iconColor: 'darkgray',
                                        header: 'Edytuj',
                                        text: 'Zmień dane produktu',
                                        onClick: function (button, event) {
                                            let productEditPage = new ProductEditPage({
                                                product: object.Product,
                                                onProductChange: function (productEditPage, data) {
                                                    object.Product = productEditPage.Product;
                                                    object.OnProductChange.Invoke(object, {
                                                        product: object.Product,
                                                    });
                                                },
                                                onProductRestore: function (productEditPage, data) {
                                                    object.Product = productEditPage.Product;
                                                    object.Pull();
                                                    object.OnProductRestore.Invoke(object, {
                                                        product: object.Product,
                                                    });
                                                },
                                                onProductTrash: function (productEditPage, data) {
                                                    object.Product = productEditPage.Product;
                                                    object.Pull();
                                                    object.OnProductTrash.Invoke(object, {
                                                        product: object.Product,
                                                    });
                                                },
                                                onProductDelete: function (productEditPage, data) {
                                                    object.Product = productEditPage.Product;
                                                    object.Pull();
                                                    object.OnProductDelete.Invoke(object, {
                                                        product: object.Product,
                                                    });
                                                },
                                            });

                                            TestApp.Instance.AddChild(productEditPage);
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new ButtonSetting({
                                        icon: 'close',
                                        header: 'Zamknij',
                                        text: '',
                                        onClick: function (sender, event) {
                                            object.Pull();
                                        },
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ];

        object.ReloadItems();
    }

    ReloadItems() {
        let object = this;

        object.Notes = [];
        object.Tasks = [];

        Ajax.Get(`/product/${object.Product.id}/items`, {
            load: function (response) {
                if (response.success) {
                    object.Notes = response.notes;
                    object.Tasks = response.tasks;
                }
            },
        });
    }

    get OnProductChange() {
        let object = this;
        return object.onProductChange ?? (object.onProductChange = new Callback());
    }

    get OnProductRestore() {
        let object = this;
        return object.onProductRestore ?? (object.onProductRestore = new Callback());
    }

    get OnProductTrash() {
        let object = this;
        return object.onProductTrash ?? (object.onProductTrash = new Callback());
    }

    get OnProductDelete() {
        let object = this;
        return object.onProductDelete ?? (object.onProductDelete = new Callback());
    }


}

class ProductPickerPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Produkty';

        object.TitleView.MaxWidth = 720;
        object.ContentView.MaxWidth = 720;

        new Property(object, 'Query', data.query ?? '', object.OnPropertyChanged);
        new Property(object, 'Products', data.products ?? [], object.OnPropertyChanged);

        if (data.onSelect) object.OnSelect.Listen(data.onSelect);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'Query', function (sender, data) {
            clearTimeout(object.queryTimeout);
            object.queryTimeout = setTimeout(function () {
                object.ReloadProducts();
            }, 250);
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Column({
                children: [
                    new Form({
                        children: [
                            new Label({
                                width: '100%',
                                children: [
                                    new Input({
                                        width: '100%',
                                        name: 'name',
                                        placeholder: 'Nazwa',
                                    })
                                ],
                            }),
                            new Label({
                                width: '100%',
                                children: [
                                    new Textarea({
                                        width: '100%',
                                        name: 'description',
                                        placeholder: 'Opis',
                                        rows: 5,
                                    })
                                ],
                            }),
                            new ButtonSetting({
                                width: '100%',
                                icon: 'add',
                                iconColor: 'forestgreen',
                                header: 'Utwórz',
                                text: 'Dodaj nowy produkt',
                            }),
                        ],
                        onSubmit: function (form, event) {
                            Ajax.Post(`/product`, {
                                form: form.Element,
                                load: function (response) {
                                    if (response.success) {
                                        object.Pull();
                                        object.OnSelect.Invoke(object, {
                                            product: response.product,
                                        });
                                    }
                                },
                            });
                        },
                    }),
                    new Row({
                        children: [
                            new ButtonSetting({
                                width: '50%',
                                icon: 'close',
                                header: 'Zamknij',
                                text: 'Wyjdź bez zapisywania',
                                onClick: function (sender, event) {
                                    object.Pull();
                                },
                            }),
                            new ButtonSetting({
                                width: '50%',
                                icon: 'delete',
                                iconColor: 'crimson',
                                header: 'Wyczyść',
                                text: '',
                                onClick: function (sender, event) {
                                    object.Pull();
                                    object.OnSelect.Invoke(object, {
                                        product: {
                                            id: 0,
                                        },
                                    });
                                },
                            }),
                        ],
                    }),
                    new Label({
                        width: '100%',
                        children: [
                            new Input({
                                width: '100%',
                                placeholder: 'Szukaj',
                                value: object.Query,
                                onInput: function (input, event) {
                                    object.Query = input.Value;
                                },
                            })
                        ],
                    }),
                    new Column({
                        childrenLoop: function (product) {
                            return new ProductButton({
                                product: product,
                                onClick: function (sender, data) {
                                    object.Pull();
                                    object.OnSelect.Invoke(object, {
                                        product: product,
                                    });
                                },
                            });
                        },
                        callback: function (view) {
                            object.productList = view;

                            new Binding(object, 'Products', function (sender, data) {
                                view.Children = object.Products;
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    ReloadProducts() {
        let object = this;

        object.Products = [];
        object.Loading.Parent = object.productList;

        Ajax.Post(`/product/query`, {
            data: {
                query: object.Query,
            },
            load: function (response) {
                if (response.success) {
                    object.Products = response.products;
                }
            }
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

    get OnSelect() {
        let object = this;
        return object.onSelect ?? (object.onSelect = new Callback());
    }

}

class ProductsPage extends WindowPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Klienci';
        object.Theme = Colors.Product;

        new Property(object, 'Products', data.products ?? [], object.OnPropertyChanged);

        object.OnPush.Listen(function () {
            object.ReloadProducts();
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.BodyChildren = [
            new Column({
                children: [
                    new Column({
                        childrenLoop: function (product) {
                            return object.GetProductButton(product);
                        },
                        callback: function (view) {
                            object.productList = view;

                            new Binding(object, 'Products', function (sender, data) {
                                view.Children = object.Products;
                            });

                            object.ReloadProducts();
                        },
                    }),
                ],
            }),
        ];

        object.FooterChildren = [
            new Row({
                justifyContent: 'flex-end',
                fontSize: 0.6,
                children: [
                    new Button({
                        children: [
                            new Text({
                                text: 'Odśwież',
                            }),
                        ],
                        onClick: function (sender, event) {
                            object.ReloadProducts();
                        },
                    }),
                    new Button({
                        children: [
                            new Text({
                                text: 'Nowy produkt',
                            }),
                        ],
                        onClick: function (sender, event) {
                            Ajax.Post(`/product`, {
                                load: function (response) {
                                    if (response.success) {
                                        let productButton = object.GetProductButton(response.product);
                                        productButton.Parent = object.productList;
                                        productButton.Click();
                                    }
                                },
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    GetProductButton(product) {
        let object = this;
        return new ProductButton({
            product: product,
            onClick: function (productButton, event) {
                let productPage = new ProductPage({
                    product: product,
                    onProductChange: function (productPage, data) {
                        productButton.Product = productPage.Product;
                    },
                    onProductTrash: function (productPage, data) {
                        productButton.Remove();
                    },
                });

                object.Body.AddChild(productPage);
            },
        });
    }

    ReloadProducts() {
        let object = this;

        object.Products = [];
        object.Loading.Parent = object.productList;

        Ajax.Get(`/product`, {
            load: function (response) {
                object.Products = response.products;
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

}



class ReservationsPage extends WindowPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Rezerwacje';
        object.Theme = Colors.Reservation;

        new Property(object, 'Reservations', data.reservations ?? [], object.OnPropertyChanged);

        object.OnPush.Listen(function () {
            object.ReloadReservations();
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.BodyChildren = [
            new Column({
                children: [
                    new Column({
                        childrenLoop: function (reservation) {
                            return new ReservationButton({
                                reservation: reservation,
                                onClick: function (reservationButton, event) {
                                    let reservationPage = new ReservationPage({
                                        reservation: reservationButton.Reservation,
                                        onReservationChange: function (reservationPage, data) {
                                            reservationButton.Reservation = reservationPage.Reservation;
                                        },
                                    });

                                    object.Parent.AddChild(reservationPage);
                                },
                            });
                        },
                        callback: function (view) {
                            object.reservationList = view;

                            new Binding(object, 'Reservations', function (sender, data) {
                                view.Children = object.Reservations;
                            });

                            object.ReloadReservations();
                        },
                    }),
                ],
            }),
        ];

        object.FooterChildren = [
            new Row({
                justifyContent: 'flex-end',
                fontSize: 0.6,
                children: [
                    new Button({
                        children: [
                            new Text({
                                text: 'Odśwież',
                            }),
                        ],
                        onClick: function (sender, event) {
                            object.ReloadReservations();
                        },
                    }),
                    new Button({
                        children: [
                            new Text({
                                text: 'Nowa rezerwacja',
                            }),
                        ],
                        onClick: function (sender, event) {
                            Ajax.Post(`/reservation`, {
                                load: function (response) {
                                    if (response.success) {
                                        object.ReloadReservations();

                                        let reservationPage = new ReservationPage({
                                            reservation: response.reservation,
                                        });

                                        object.Parent.AddChild(reservationPage);
                                    }
                                },
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    ReloadReservations() {
        let object = this;

        object.Reservations = [];
        object.Loading.Parent = object.reservationList;

        Ajax.Get(`/reservation`, {
            load: function (response) {
                object.Reservations = response.reservations;
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

}

class RoleButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'flex-start';

        new Property(object, 'Role', data.role ?? {}, object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: Colors.System,
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        text: 'verified',
                    }),
                ],
            }),
            new Layout({
                width: '0%',
                flexGrow: 1,
                children: [
                    new Text({
                        callback: function (view) {
                            new Binding(object, 'Role', function (sender, property) {
                                view.Text = object.Role.name;
                            });
                        },
                    }),
                    new Text({
                        fontSize: 0.6,
                        callback: function (view) {
                            new Binding(object, 'Role', function (sender, property) {
                                view.Text = object.Role.email;
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}



class SearchPage extends WindowPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Wyszukiwanie';
        object.Theme = Colors.System;

        new Property(object, 'Query', data.query ?? '', object.OnPropertyChanged);
        new Property(object, 'User', data.user ?? null, object.OnPropertyChanged);

        new Property(object, 'Tasks', data.tasks ?? [], object.OnPropertyChanged);
        new Property(object, 'Notes', data.notes ?? [], object.OnPropertyChanged);
        new Property(object, 'Customers', data.customers ?? [], object.OnPropertyChanged);
        new Property(object, 'Labels', data.labels ?? [], object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Query', function (sender, data) {
            clearTimeout(object.queryTimeout);
            object.queryTimeout = setTimeout(function () {
                object.ReloadSearch();
            }, 250);
        });

        new Binding(object, 'User', function (sender, data) {
            clearTimeout(object.queryTimeout);
            object.ReloadSearch();
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.BodyChildren = [
            new Column({
                height: '100%',
                children: [
                    new Column({
                        children: [
                            new UserButton({
                                callback: function (view) {
                                    new Binding(object, 'User', function (sender, data) {
                                        view.User = object.User;
                                    });
                                },
                                onClick: function (button, event) {
                                    let userPickerPage = new UserPickerPage({
                                        selected: object.User ? object.User.userId : 0,
                                        onSelect: function (sender, data) {
                                            object.User = data.user;
                                        },
                                    });

                                    App.Instance.AddChild(userPickerPage);
                                },
                            }),
                            new Label({
                                width: '100%',
                                children: [
                                    new Row({
                                        padding: '1px',
                                        borderRadius: 2,
                                        alignItems: 'center',
                                        backgroundColor: 'var(--inputColor)',
                                        color: 'var(--inputBackground)',
                                        width: '100%',
                                        overflow: 'hidden',
                                        children: [
                                            new Input({
                                                width: '0%',
                                                flexGrow: 1,
                                                placeholder: 'Szukaj',
                                                name: 'search',
                                                type: 'search',
                                                onInput: function (input, event) {
                                                    object.Query = input.Value;
                                                },
                                            }),
                                            new Icon({
                                                text: 'search',
                                                padding: '0.5rem 1rem',
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ]
                    }),
                    new Column({
                        flexGrow: 1,
                        overflow: 'auto',
                        children: [
                            new Column({
                                callback: function (view) {
                                    object.loadingContainer = view;
                                },
                            }),
                            new Column({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                fontSize: 2,
                                                text: 'Zadania'
                                            }),
                                        ],
                                    }),
                                    new Column({
                                        childrenLoop: function (task) {
                                            return new TaskButton({
                                                task: task,
                                                onClick: function (taskButton, event) {
                                                    let taskPage = new TaskPage({
                                                        task: taskButton.Task,
                                                        onTaskChange: function (taskPage, data) {
                                                            taskButton.Task = taskPage.Task;
                                                        },
                                                        onTaskTrash: function (taskPage, data) {
                                                            taskButton.Remove();
                                                        },
                                                    });

                                                    object.Body.AddChild(taskPage);
                                                },
                                            });
                                        },
                                        callback: function (view) {
                                            new Binding(object, 'Tasks', function (sender, data) {
                                                view.Children = object.Tasks;
                                            });
                                        },
                                    }),
                                ],
                                callback: function (view) {
                                    new Binding(object, 'Tasks', function (sender, data) {
                                        view.Display = object.Tasks.length ? null : 'none';
                                    });
                                },
                            }),
                            new Column({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                fontSize: 2,
                                                text: 'Notatki'
                                            }),
                                        ],
                                    }),
                                    new Column({
                                        childrenLoop: function (note) {
                                            return new NoteButton({
                                                note: note,
                                                onClick: function (noteButton, event) {
                                                    let notePage = new NotePage({
                                                        note: noteButton.Note,
                                                        onNoteChange: function (notePage, data) {
                                                            noteButton.Note = notePage.Note;
                                                        },
                                                        onNoteTrash: function (notePage, data) {
                                                            noteButton.Remove();
                                                        },
                                                    });

                                                    object.Body.AddChild(notePage);
                                                },
                                            });
                                        },
                                        callback: function (view) {
                                            new Binding(object, 'Notes', function (sender, data) {
                                                view.Children = object.Notes;
                                            });
                                        },
                                    }),
                                ],
                                callback: function (view) {
                                    new Binding(object, 'Notes', function (sender, data) {
                                        view.Display = object.Notes.length ? null : 'none';
                                    });
                                },
                            }),
                            new Column({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                fontSize: 2,
                                                text: 'Klienci'
                                            }),
                                        ],
                                    }),
                                    new Column({
                                        childrenLoop: function (customer) {
                                            return new CustomerButton({
                                                customer: customer,
                                                onClick: function (customerButton, event) {
                                                    let customerPage = new CustomerPage({
                                                        customer: customerButton.Customer,
                                                        onCustomerChange: function (customerPage, data) {
                                                            customerButton.Customer = customerPage.Customer;
                                                        },
                                                        onCustomerTrash: function (customerPage, data) {
                                                            customerButton.Remove();
                                                        },
                                                    });

                                                    object.Body.AddChild(customerPage);
                                                },
                                            });
                                        },
                                        callback: function (view) {
                                            new Binding(object, 'Customers', function (sender, data) {
                                                view.Children = object.Customers;
                                            });
                                        },
                                    }),
                                ],
                                callback: function (view) {
                                    new Binding(object, 'Customers', function (sender, data) {
                                        view.Display = object.Customers.length ? null : 'none';
                                    });
                                },
                            }),
                            new Column({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                fontSize: 2,
                                                text: 'Etykiety'
                                            }),
                                        ],
                                    }),
                                    new Column({
                                        childrenLoop: function (label) {
                                            return new LabelButton({
                                                label: label,
                                                onClick: function (labelButton, event) {
                                                    let labelPage = new LabelPage({
                                                        label: labelButton.Label,
                                                        onLabelChange: function (labelPage, data) {
                                                            labelButton.Label = labelPage.Label;
                                                        },
                                                        onLabelTrash: function (labelPage, data) {
                                                            labelButton.Remove();
                                                        },
                                                    });

                                                    object.Body.AddChild(labelPage);
                                                },
                                            });
                                        },
                                        callback: function (view) {
                                            new Binding(object, 'Labels', function (sender, data) {
                                                view.Children = object.Labels;
                                            });
                                        },
                                    }),
                                ],
                                callback: function (view) {
                                    new Binding(object, 'Labels', function (sender, data) {
                                        view.Display = object.Labels.length ? null : 'none';
                                    });
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

    ReloadSearch() {
        let object = this;

        object.Loading.Parent = object.loadingContainer;

        Ajax.Post(`/search`, {
            data: {
                query: object.Query,
                userId: object.User ? object.User.id : 0,
            },
            load: function (response) {
                object.Loading.Parent = null;

                object.Tasks = response.tasks ?? [];
                object.Notes = response.notes ?? [];
                object.Customers = response.customers ?? [];
                object.Labels = response.labels ?? [];
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

}

class ServiceButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'flex-start';

        new Property(object, 'Service', data.service ?? {}, object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: Colors.Service,
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        text: 'construction',
                    }),
                ],
            }),
            new Layout({
                width: '0%',
                flexGrow: 1,
                children: [
                    new Row({
                        children: [
                            new UserLabelView({
                                callback: function (view) {
                                    new Binding(object, 'Service', function (sender, property) {
                                        view.User = object.Service ? object.Service.owner : null;
                                    });
                                },
                            }),
                            new LabelTag({
                                callback: function (view) {
                                    new Binding(object, 'Service', function (sender, property) {
                                        view.Label = object.Service ? object.Service.label : null;
                                    });
                                },
                            }),
                        ],
                    }),
                    new Text({
                        callback: function (view) {
                            new Binding(object, 'Service', function (sender, property) {
                                view.Text = object.Service && object.Service.name ? object.Service.name : 'Brak nazwy';
                            });
                        },
                    }),
                    new Text({
                        fontSize: 0.6,
                        callback: function (view) {
                            new Binding(object, 'Service', function (sender, property) {
                                view.Text = object.Service && object.Service.description ? object.Service.description : '';
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}

class ServicePage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Service', data.service ?? {}, object.OnPropertyChanged);
        new Property(object, 'ServicePositions', data.servicePositions ?? [], object.OnPropertyChanged);

        if (data.onServiceChange) object.OnServiceChange.Listen(data.onServiceChange);
        if (data.onServiceRestore) object.OnServiceRestore.Listen(data.onServiceRestore);
        if (data.onServiceTrash) object.OnServiceTrash.Listen(data.onServiceTrash);
        if (data.onServiceDelete) object.OnServiceDelete.Listen(data.onServiceDelete);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Service', function (sender, data) {
            object.Title = object.Service.name;
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Row({
                children: [
                    new Column({
                        flexGrow: 65,
                        width: '65%',
                        children: [
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'construction',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'Nazwa serwisu',
                                                callback: function (view) {
                                                    new Binding(object, 'Service', function (sender, data) {
                                                        view.Value = object.Service.name;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        name: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'description',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Textarea({
                                                width: '100%',
                                                placeholder: 'Opis serwisu',
                                                rows: 5,
                                                onFocus: function (textarea, event) {
                                                    textarea.Rows = 10;
                                                },
                                                onBlur: function (textarea, event) {
                                                    textarea.Rows = 5;
                                                },
                                                callback: function (view) {
                                                    new Binding(object, 'Service', function (sender, data) {
                                                        view.Value = object.Service.description;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        description: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new Label({
                                children: [
                                    new Text({
                                        fontSize: 2,
                                        text: 'Stanowiska'
                                    }),
                                ],
                            }),
                            new Label({
                                children: [
                                    new Hr(),
                                ],
                            }),
                            new Column({
                                childrenLoop: function (servicePosition) {
                                    return object.GetServicePositionButton(servicePosition);
                                },
                                callback: function (servicePositionList) {
                                    object.servicePositionList = servicePositionList;

                                    new Binding(object, 'ServicePositions', function (sender, data) {
                                        servicePositionList.Children = object.ServicePositions;
                                    });

                                    object.ReloadServicePositions();
                                },
                            }),
                            new ButtonSetting({
                                icon: 'construction',
                                iconColor: 'forestgreen',
                                header: 'Nowe stanowisko',
                                text: 'Dodaj nowe stanowisko',
                                onClick: function (sender, event) {
                                    Ajax.Post(`/servicePosition`, {
                                        data: {
                                            serviceId: object.Service.id,
                                        },
                                        load: function (response) {
                                            if (response.success) {
                                                let servicePositionButton = object.GetServicePositionButton(response.servicePosition);
                                                servicePositionButton.Parent = object.servicePositionList;
                                                servicePositionButton.Click();
                                            }
                                        },
                                    });
                                },
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 35,
                        width: '35%',
                        minWidth: '300px',
                        children: [
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Załączniki'
                                            }),
                                        ],
                                    }),
                                    new AttachmentsView({
                                        callback: function (view) {
                                            new Binding(object, 'Service', function (sender, data) {
                                                view.Target = object.Service;
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Zarządzaj',
                                            })
                                        ],
                                    }),
                                    new Column({
                                        callback: function (view) {
                                            if (object.Service.trashBy) {
                                                view.Children = [
                                                    new ButtonSetting({
                                                        icon: 'restore',
                                                        iconColor: 'forestgreen',
                                                        header: 'Przywróć',
                                                        text: 'Przywróć serwis z kosza',
                                                        onClick: function (button, event) {
                                                            object.Restore();
                                                        },
                                                    }),
                                                    new ButtonSetting({
                                                        icon: 'delete',
                                                        iconColor: 'crimson',
                                                        header: 'Usuń',
                                                        text: 'Usuń serwis na zawsze',
                                                        onClick: function (button, event) {
                                                            object.Delete();
                                                        },
                                                    }),
                                                ];
                                            } else {
                                                view.Children = [
                                                    new ButtonSetting({
                                                        icon: 'delete',
                                                        iconColor: 'crimson',
                                                        header: 'Usuń',
                                                        text: 'Przenieś serwis do kosza',
                                                        onClick: function (button, event) {
                                                            object.Trash();
                                                        },
                                                    }),
                                                ];
                                            }
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new ButtonSetting({
                                        icon: 'close',
                                        header: 'Zamknij',
                                        text: '',
                                        onClick: function (sender, event) {
                                            object.Pull();
                                        },
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

    GetServicePositionButton(servicePosition) {
        return new ServicePositionButton({
            servicePosition: servicePosition,
            onClick: function (servicePositionButton, event) {
                let servicePositionPage = new ServicePositionPage({
                    servicePosition: servicePositionButton.ServicePosition,
                    onServicePositionChange: function (servicePositionPage, data) {
                        servicePositionButton.ServicePosition = servicePositionPage.ServicePosition;
                    },
                    onServicePositionTrash: function (servicePositionPage, data) {
                        servicePositionButton.Remove();
                    },
                });

                App.Instance.AddChild(servicePositionPage);
            },
        });
    }

    ReloadServicePositions() {
        let object = this;
        Ajax.Get(`/service/${object.Service.id}/servicePositions`, {
            load: function (response) {
                if (response.success) {
                    object.ServicePositions = response.servicePositions;
                }
            },
        });
    }

    Update(data = {}) {
        let object = this;
        Ajax.Put(`/service/${object.Service.id}`, {
            data: data,
            load: function (response) {
                if (response.success) {
                    object.Service = response.service;
                    object.OnServiceChange.Invoke(object, {
                        service: object.Service,
                    });
                }
            },
        });
    }

    Restore() {
        let object = this;
        Ajax.Post(`/service/${object.Service.id}/restore`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.Service = response.service;
                    object.OnServiceChange.Invoke(object, {
                        service: object.Service,
                    });
                    object.OnServiceRestore.Invoke(object, {
                        service: object.Service,
                    });
                }
            },
        });
    }

    Trash() {
        let object = this;
        Ajax.Post(`/service/${object.Service.id}/trash`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.Service = response.service;
                    object.OnServiceChange.Invoke(object, {
                        service: object.Service,
                    });
                    object.OnServiceTrash.Invoke(object, {
                        service: object.Service,
                    });
                }
            },
        });
    }

    Delete() {
        let object = this;
        Ajax.Delete(`/service/${object.Service.id}`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.OnServiceDelete.Invoke(object, {
                        service: object.Service,
                    });
                }
            },
        });
    }

    get OnServiceChange() {
        let object = this;
        return object.onServiceChange ?? (object.onServiceChange = new Callback());
    }

    get OnServiceRestore() {
        let object = this;
        return object.onServiceRestore ?? (object.onServiceRestore = new Callback());
    }

    get OnServiceTrash() {
        let object = this;
        return object.onServiceTrash ?? (object.onServiceTrash = new Callback());
    }

    get OnServiceDelete() {
        let object = this;
        return object.onServiceDelete ?? (object.onServiceDelete = new Callback());
    }


}

class ServicePositionButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'flex-start';

        new Property(object, 'ServicePosition', data.servicePosition ?? {}, object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: Colors.Service,
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        text: 'construction',
                    }),
                ],
            }),
            new Layout({
                width: '0%',
                flexGrow: 1,
                children: [
                    new Row({
                        children: [
                            new UserLabelView({
                                callback: function (view) {
                                    new Binding(object, 'ServicePosition', function (sender, property) {
                                        view.User = object.ServicePosition ? object.ServicePosition.owner : null;
                                    });
                                },
                            }),
                            new LabelTag({
                                callback: function (view) {
                                    new Binding(object, 'ServicePosition', function (sender, property) {
                                        view.Label = object.ServicePosition ? object.ServicePosition.label : null;
                                    });
                                },
                            }),
                        ],
                    }),
                    new Text({
                        callback: function (view) {
                            new Binding(object, 'ServicePosition', function (sender, property) {
                                view.Text = object.ServicePosition && object.ServicePosition.name ? object.ServicePosition.name : 'Brak nazwy';
                            });
                        },
                    }),
                    new Text({
                        fontSize: 0.6,
                        callback: function (view) {
                            new Binding(object, 'ServicePosition', function (sender, property) {
                                view.Text = object.ServicePosition && object.ServicePosition.description ? object.ServicePosition.description : '';
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}

class ServicePositionPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'ServicePosition', data.servicePosition ?? {}, object.OnPropertyChanged);

        if (data.onServicePositionChange) object.OnServicePositionChange.Listen(data.onServicePositionChange);
        if (data.onServicePositionRestore) object.OnServicePositionRestore.Listen(data.onServicePositionRestore);
        if (data.onServicePositionTrash) object.OnServicePositionTrash.Listen(data.onServicePositionTrash);
        if (data.onServicePositionDelete) object.OnServicePositionDelete.Listen(data.onServicePositionDelete);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'ServicePosition', function (sender, data) {
            object.Title = object.ServicePosition.name;
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Row({
                children: [
                    new Column({
                        flexGrow: 65,
                        width: '65%',
                        children: [
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'construction',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'Nazwa stanowiska',
                                                callback: function (view) {
                                                    new Binding(object, 'ServicePosition', function (sender, data) {
                                                        view.Value = object.ServicePosition.name;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        name: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'description',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Textarea({
                                                width: '100%',
                                                placeholder: 'Opis stanowiska',
                                                rows: 5,
                                                onFocus: function (textarea, event) {
                                                    textarea.Rows = 10;
                                                },
                                                onBlur: function (textarea, event) {
                                                    textarea.Rows = 5;
                                                },
                                                callback: function (view) {
                                                    new Binding(object, 'ServicePosition', function (sender, data) {
                                                        view.Value = object.ServicePosition.description;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        description: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 35,
                        width: '35%',
                        minWidth: '300px',
                        children: [
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Przypisz',
                                            })
                                        ],
                                    }),
                                    new UserButton({
                                        callback: function (view) {
                                            new Binding(object, 'ServicePosition', function (sender, data) {
                                                view.User = object.ServicePosition.user;
                                            });
                                        },
                                        onClick: function (button, event) {
                                            let userPickerPage = new UserPickerPage({
                                                selected: object.ServicePosition.userId,
                                                onSelect: function (sender, data) {
                                                    object.Update({
                                                        userId: data.user ? data.user.id : 0,
                                                    });
                                                },
                                            });

                                            App.Instance.AddChild(userPickerPage);
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Załączniki'
                                            }),
                                        ],
                                    }),
                                    new AttachmentsView({
                                        callback: function (view) {
                                            new Binding(object, 'ServicePosition', function (sender, data) {
                                                view.Target = object.ServicePosition;
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Zarządzaj',
                                            })
                                        ],
                                    }),
                                    new Column({
                                        callback: function (view) {
                                            if (object.ServicePosition.trashBy) {
                                                view.Children = [
                                                    new ButtonSetting({
                                                        icon: 'restore',
                                                        iconColor: 'forestgreen',
                                                        header: 'Przywróć',
                                                        text: 'Przywróć serwis z kosza',
                                                        onClick: function (button, event) {
                                                            object.Restore();
                                                        },
                                                    }),
                                                    new ButtonSetting({
                                                        icon: 'delete',
                                                        iconColor: 'crimson',
                                                        header: 'Usuń',
                                                        text: 'Usuń serwis na zawsze',
                                                        onClick: function (button, event) {
                                                            object.Delete();
                                                        },
                                                    }),
                                                ];
                                            } else {
                                                view.Children = [
                                                    new ButtonSetting({
                                                        icon: 'delete',
                                                        iconColor: 'crimson',
                                                        header: 'Usuń',
                                                        text: 'Przenieś serwis do kosza',
                                                        onClick: function (button, event) {
                                                            object.Trash();
                                                        },
                                                    }),
                                                ];
                                            }
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new ButtonSetting({
                                        icon: 'close',
                                        header: 'Zamknij',
                                        text: '',
                                        onClick: function (sender, event) {
                                            object.Pull();
                                        },
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

    Update(data = {}) {
        let object = this;
        Ajax.Put(`/servicePosition/${object.ServicePosition.id}`, {
            data: data,
            load: function (response) {
                if (response.success) {
                    object.ServicePosition = response.servicePosition;
                    object.OnServicePositionChange.Invoke(object, {
                        servicePosition: object.ServicePosition,
                    });
                }
            },
        });
    }

    Restore() {
        let object = this;
        Ajax.Post(`/servicePosition/${object.ServicePosition.id}/restore`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.ServicePosition = response.servicePosition;
                    object.OnServicePositionChange.Invoke(object, {
                        servicePosition: object.ServicePosition,
                    });
                    object.OnServicePositionRestore.Invoke(object, {
                        servicePosition: object.ServicePosition,
                    });
                }
            },
        });
    }

    Trash() {
        let object = this;
        Ajax.Post(`/servicePosition/${object.ServicePosition.id}/trash`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.ServicePosition = response.servicePosition;
                    object.OnServicePositionChange.Invoke(object, {
                        servicePosition: object.ServicePosition,
                    });
                    object.OnServicePositionTrash.Invoke(object, {
                        servicePosition: object.ServicePosition,
                    });
                }
            },
        });
    }

    Delete() {
        let object = this;
        Ajax.Delete(`/servicePosition/${object.ServicePosition.id}`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.OnServicePositionDelete.Invoke(object, {
                        servicePosition: object.ServicePosition,
                    });
                }
            },
        });
    }

    get OnServicePositionChange() {
        let object = this;
        return object.onServicePositionChange ?? (object.onServicePositionChange = new Callback());
    }

    get OnServicePositionRestore() {
        let object = this;
        return object.onServicePositionRestore ?? (object.onServicePositionRestore = new Callback());
    }

    get OnServicePositionTrash() {
        let object = this;
        return object.onServicePositionTrash ?? (object.onServicePositionTrash = new Callback());
    }

    get OnServicePositionDelete() {
        let object = this;
        return object.onServicePositionDelete ?? (object.onServicePositionDelete = new Callback());
    }


}

class ServicesPage extends WindowPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Serwisy';
        object.Theme = Colors.Service;

        new Property(object, 'Services', data.services ?? [], object.OnPropertyChanged);

        object.OnPush.Listen(function () {
            object.ReloadServices();
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.BodyChildren = [
            new Column({
                children: [
                    new Column({
                        childrenLoop: function (service) {
                            return object.GetServiceButton(service);
                        },
                        callback: function (view) {
                            object.serviceList = view;

                            new Binding(object, 'Services', function (sender, data) {
                                view.Children = object.Services;
                            });

                            object.ReloadServices();
                        },
                    }),
                ],
            }),
        ];

        object.FooterChildren = [
            new Row({
                justifyContent: 'flex-end',
                fontSize: 0.6,
                children: [
                    new Button({
                        children: [
                            new Text({
                                text: 'Odśwież',
                            }),
                        ],
                        onClick: function (sender, event) {
                            object.ReloadServices();
                        },
                    }),
                    new Button({
                        children: [
                            new Text({
                                text: 'Nowy serwis',
                            }),
                        ],
                        onClick: function (sender, event) {
                            Ajax.Post(`/service`, {
                                load: function (response) {
                                    if (response.success) {
                                        let serviceButton = object.GetServiceButton(response.service);
                                        serviceButton.Parent = object.serviceList;
                                        serviceButton.Click();
                                    }
                                },
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    GetServiceButton(service) {
        let object = this;

        return new ServiceButton({
            service: service,
            onClick: function (serviceButton, event) {
                let servicePage = new ServicePage({
                    service: serviceButton.Service,
                    onServiceChange: function (servicePage, data) {
                        serviceButton.Service = servicePage.Service;
                    },
                    onServiceTrash: function (servicePage, data) {
                        serviceButton.Remove();
                    },
                });

                object.Body.AddChild(servicePage);
            },
        });
    }

    ReloadServices() {
        let object = this;

        object.Services = [];
        object.Loading.Parent = object.serviceList;

        Ajax.Get(`/service`, {
            load: function (response) {
                object.Services = response.services;
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

}

class TaskCalendarButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Gap = 0.125;
        object.Padding = 0.125;

        new Property(object, 'Task', data.task ?? {}, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;
    }

    Render() {
        let object = this;

        object.Children = [
            new Icon({
                text: 'task_alt',
                color: Colors.Task,
            }),
            new Text({
                width: '0%',
                flexGrow: 1,
                overflow: 'hidden',
                fontSize: 0.6,
                callback: function (view) {
                    new Binding(object, 'Task', function (sender, data) {
                        view.Text = object.Task && object.Task.name ? object.Task.name : 'Brak nazwy';

                        if (object.Task && object.Task.priority == 3) {
                            view.Color = 'crimson';
                            view.FontWeight = 'bold';
                        } else if (object.Task && object.Task.priority == 2) {
                            view.Color = 'goldenrod';
                            view.FontWeight = 'bold';
                        } else if (object.Task && object.Task.priority == 1) {
                            view.Color = 'gold';
                            view.FontWeight = 'bold';
                        } else {
                            view.Color = null;
                            view.FontWeight = null;
                        }
                    });
                },
            }),
            new LabelTag({
                callback: function (view) {
                    new Binding(object, 'Task', function (sender, data) {
                        view.Label = object.Task ? object.Task.label : null;
                    });
                },
            }),
            new Icon({
                padding: '0rem 0.25rem',
                borderRadius: 0.25,
                callback: function (view) {
                    new Binding(object, 'Task', function (sender, data) {
                        if (object.Task && object.Task.status == 'Done') {
                            view.Text = 'verified';
                            view.BackgroundColor = 'forestgreen';
                            view.Color = 'white';
                        } else if (object.Task && object.Task.status == 'During') {
                            view.Text = 'sync';
                            view.BackgroundColor = 'royalblue';
                            view.Color = 'white';
                        } else if (object.Task && object.Task.status == 'Cancelled') {
                            view.Text = 'close';
                            view.BackgroundColor = 'crimson';
                            view.Color = 'white';
                        } else {
                            view.Text = 'pending';
                            view.BackgroundColor = 'purple';
                            view.Color = 'white';
                        }
                    });
                },
            }),
            new UserAvatar({
                callback: function (view) {
                    new Binding(object, 'Task', function (sender, data) {
                        view.User = object.Task ? object.Task.owner : null;
                    });
                },
            }),
        ];
    }


}

class TaskButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Padding = 0;

        new Property(object, 'Task', data.task ?? {}, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Task', function (sender, data) {
            if (object.Task && object.Task.color) {
                object.BorderLeft = `4px solid ${object.Task.color}`;
            } else {
                object.BorderLeft = `4px solid rgba(0,0,0,0)`;
            }
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Children = [
            new Column({
                flexGrow: 1,
                children: [
                    new Column({
                        padding: 0.5,
                        children: [
                            new Row({
                                children: [
                                    new UserLabelView({
                                        callback: function (view) {
                                            new Binding(object, 'Task', function (sender, property) {
                                                view.User = object.Task ? object.Task.owner : null;
                                            });
                                        },
                                    }),
                                    new LabelTag({
                                        callback: function (view) {
                                            new Binding(object, 'Task', function (sender, property) {
                                                view.Label = object.Task ? object.Task.label : null;
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new UserLabelView({
                                callback: function (view) {
                                    new Binding(object, 'Task', function (sender, property) {
                                        view.User = object.Task && object.Task.user != object.Task.owner ? object.Task.user : null;
                                    });
                                },
                            }),
                            new Row({
                                alignItems: 'flex-start',
                                children: [
                                    new Text({
                                        width: '0%',
                                        flexGrow: 1,
                                        callback: function (view) {
                                            new Binding(object, 'Task', function (sender, data) {
                                                view.Text = object.Task && object.Task.name ? object.Task.name : 'Brak nazwy';

                                                if (object.Task && object.Task.priority == 3) {
                                                    view.Color = 'crimson';
                                                    view.FontWeight = 'bold';
                                                } else if (object.Task && object.Task.priority == 2) {
                                                    view.Color = 'goldenrod';
                                                    view.FontWeight = 'bold';
                                                } else if (object.Task && object.Task.priority == 1) {
                                                    view.Color = 'gold';
                                                } else {
                                                    view.Color = null;
                                                    view.FontWeight = null;
                                                }
                                            });
                                        },
                                    }),
                                    new Icon({
                                        padding: '0rem 0.25rem',
                                        borderRadius: 0.25,
                                        callback: function (view) {
                                            new Binding(object, 'Task', function (sender, data) {
                                                if (object.Task && object.Task.status == 'Done') {
                                                    view.Text = 'verified';
                                                    view.BackgroundColor = 'forestgreen';
                                                    view.Color = 'white';
                                                } else if (object.Task && object.Task.status == 'During') {
                                                    view.Text = 'sync';
                                                    view.BackgroundColor = 'royalblue';
                                                    view.Color = 'white';
                                                } else if (object.Task && object.Task.status == 'Cancelled') {
                                                    view.Text = 'close';
                                                    view.BackgroundColor = 'crimson';
                                                    view.Color = 'white';
                                                } else {
                                                    view.Text = 'pending';
                                                    view.BackgroundColor = 'purple';
                                                    view.Color = 'white';
                                                }
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new Text({
                                fontSize: 0.6,
                                callback: function (view) {
                                    new Binding(object, 'Task', function (sender, data) {
                                        view.Text = object.Task.description;
                                    });
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }


}

class TaskPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'Task', data.task ?? {}, object.OnPropertyChanged);

        if (data.onTaskChange) object.OnTaskChange.Listen(data.onTaskChange);
        if (data.onTaskRestore) object.OnTaskRestore.Listen(data.onTaskRestore);
        if (data.onTaskTrash) object.OnTaskTrash.Listen(data.onTaskTrash);
        if (data.onTaskDelete) object.OnTaskDelete.Listen(data.onTaskDelete);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'Task', function (sender, data) {
            object.Title = object.Task.name;
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Row({
                children: [
                    new Column({
                        flexGrow: 65,
                        width: '65%',
                        children: [
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'task_alt',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'Nazwa zadania',
                                                callback: function (view) {
                                                    new Binding(object, 'Task', function (sender, data) {
                                                        view.Value = object.Task.name;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        name: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'description',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Textarea({
                                                width: '100%',
                                                placeholder: 'Opis zadania',
                                                rows: 5,
                                                onFocus: function (textarea, event) {
                                                    textarea.Rows = 10;
                                                },
                                                onBlur: function (textarea, event) {
                                                    textarea.Rows = 5;
                                                },
                                                callback: function (view) {
                                                    new Binding(object, 'Task', function (sender, data) {
                                                        view.Value = object.Task.description;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        description: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new Label({
                                children: [
                                    new Text({
                                        fontSize: 2,
                                        text: 'Komentarze'
                                    }),
                                ],
                            }),
                            new CommentsView({
                                callback: function (view) {
                                    new Binding(object, 'Task', function (sender, data) {
                                        view.Target = object.Task;
                                    });
                                },
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 35,
                        width: '35%',
                        minWidth: '300px',
                        children: [
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Zmień priorytet',
                                            })
                                        ],
                                    }),
                                    new Label({
                                        children: [
                                            new Select({
                                                width: '100%',
                                                children: [
                                                    new SelectOption({
                                                        value: '0',
                                                        text: 'Niski',
                                                    }),
                                                    new SelectOption({
                                                        value: '1',
                                                        text: 'Średni',
                                                    }),
                                                    new SelectOption({
                                                        value: '2',
                                                        text: 'Wysoki',
                                                    }),
                                                    new SelectOption({
                                                        value: '3',
                                                        text: 'Wykurwisty',
                                                    }),
                                                ],
                                                callback: function (view) {
                                                    new Binding(object, 'Task', function (sender, data) {
                                                        view.Value = object.Task.priority.toString();
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        priority: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Zmień termin',
                                            })
                                        ],
                                    }),
                                    new Label({
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'Termin',
                                                type: 'date',
                                                callback: function (view) {
                                                    new Binding(object, 'Task', function (sender, data) {
                                                        view.Value = object.Task.date;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        date: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Zmień kolor',
                                            })
                                        ],
                                    }),
                                    new Label({
                                        children: [
                                            new Select({
                                                width: '100%',
                                                children: [
                                                    new SelectOption({
                                                        text: 'Brak',
                                                        value: '',
                                                    }),
                                                    new SelectOption({
                                                        text: 'Szary',
                                                        value: 'darkgray',
                                                    }),
                                                    new SelectOption({
                                                        text: 'Czarny',
                                                        value: 'black',
                                                    }),
                                                    new SelectOption({
                                                        text: 'Czerwony',
                                                        value: 'crimson',
                                                    }),
                                                    new SelectOption({
                                                        text: 'Niebieski',
                                                        value: 'royalblue',
                                                    }),
                                                    new SelectOption({
                                                        text: 'Zielony',
                                                        value: 'forestgreen',
                                                    }),
                                                    new SelectOption({
                                                        text: 'Fioletowy',
                                                        value: 'purple',
                                                    }),
                                                    new SelectOption({
                                                        text: 'Pomarańczowy',
                                                        value: 'orange',
                                                    }),
                                                ],
                                                callback: function (view) {
                                                    new Binding(object, 'Task', function (sender, data) {
                                                        view.Value = object.Task.color;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        color: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Przypisz',
                                            })
                                        ],
                                    }),
                                    new UserButton({
                                        callback: function (view) {
                                            new Binding(object, 'Task', function (sender, data) {
                                                view.User = object.Task.user;
                                            });
                                        },
                                        onClick: function (button, event) {
                                            let userPickerPage = new UserPickerPage({
                                                selected: object.Task.userId,
                                                onSelect: function (sender, data) {
                                                    object.Update({
                                                        userId: data.user ? data.user.id : 0,
                                                    });
                                                },
                                            });

                                            App.Instance.AddChild(userPickerPage);
                                        },
                                    }),
                                    new LabelButton({
                                        callback: function (view) {
                                            new Binding(object, 'Task', function (sender, data) {
                                                view.Label = object.Task.label;
                                            });
                                        },
                                        onClick: function (button, event) {
                                            let labelPickerPage = new LabelPickerPage({
                                                selected: object.Task.labelId,
                                                onSelect: function (sender, data) {
                                                    object.Update({
                                                        labelId: data.label ? data.label.id : 0,
                                                    });
                                                },
                                            });

                                            App.Instance.AddChild(labelPickerPage);
                                        },
                                    }),
                                    new CustomerButton({
                                        callback: function (view) {
                                            new Binding(object, 'Task', function (sender, data) {
                                                view.Customer = object.Task.customer;
                                            });
                                        },
                                        onClick: function (button, event) {
                                            let customerPickerPage = new CustomerPickerPage({
                                                selected: object.Task.customerId,
                                                onSelect: function (sender, data) {
                                                    object.Update({
                                                        customerId: data.customer.id,
                                                    });
                                                },
                                            });

                                            App.Instance.AddChild(customerPickerPage);
                                        },
                                    }),
                                    new ProductButton({
                                        callback: function (view) {
                                            new Binding(object, 'Task', function (sender, data) {
                                                view.Product = object.Task.product;
                                            });
                                        },
                                        onClick: function (button, event) {
                                            let productPickerPage = new ProductPickerPage({
                                                selected: object.Task.productId,
                                                onSelect: function (sender, data) {
                                                    object.Update({
                                                        productId: data.product.id,
                                                    });
                                                },
                                            });

                                            App.Instance.AddChild(productPickerPage);
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Załączniki'
                                            }),
                                        ],
                                    }),
                                    new AttachmentsView({
                                        callback: function (view) {
                                            new Binding(object, 'Task', function (sender, data) {
                                                view.Target = object.Task;
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Zmień status',
                                            })
                                        ],
                                    }),
                                    new Column({
                                        callback: function (view) {
                                            new Binding(object, 'Task', function (sender, data) {
                                                let buttons = [];

                                                if (object.Task.status != 'Awaiting') {
                                                    buttons.push(new ButtonSetting({
                                                        icon: 'pending',
                                                        iconColor: 'purple',
                                                        header: 'Oczekujące',
                                                        text: 'Oznacz zadanie jako oczękujące',
                                                        onClick: function (button, event) {
                                                            object.Update({
                                                                status: 'Awaiting',
                                                            });
                                                        },
                                                    }));
                                                }

                                                if (object.Task.status != 'During') {
                                                    buttons.push(new ButtonSetting({
                                                        icon: 'sync',
                                                        iconColor: 'royalblue',
                                                        header: 'Trwające',
                                                        text: 'Oznacz zadanie jako trwające',
                                                        onClick: function (button, event) {
                                                            object.Update({
                                                                status: 'During',
                                                            });
                                                        },
                                                    }));
                                                }

                                                if (object.Task.status != 'Done') {
                                                    buttons.push(new ButtonSetting({
                                                        icon: 'verified',
                                                        iconColor: 'forestgreen',
                                                        header: 'Ukończone',
                                                        text: 'Oznacz zadanie jako ukończone',
                                                        onClick: function (button, event) {
                                                            object.Update({
                                                                status: 'Done',
                                                            });
                                                        },
                                                    }));
                                                }

                                                view.Children = buttons;
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Zarządzaj',
                                            })
                                        ],
                                    }),
                                    new Column({
                                        callback: function (view) {
                                            if (object.Task.trashBy) {
                                                view.Children = [
                                                    new ButtonSetting({
                                                        icon: 'restore',
                                                        iconColor: 'forestgreen',
                                                        header: 'Przywróć',
                                                        text: 'Przywróć zadanie z kosza',
                                                        onClick: function (button, event) {
                                                            object.Restore();
                                                        },
                                                    }),
                                                    new ButtonSetting({
                                                        icon: 'delete',
                                                        iconColor: 'crimson',
                                                        header: 'Usuń',
                                                        text: 'Usuń zadanie na zawsze',
                                                        onClick: function (button, event) {
                                                            object.Delete();
                                                        },
                                                    }),
                                                ];
                                            } else {
                                                view.Children = [
                                                    new ButtonSetting({
                                                        icon: 'delete',
                                                        iconColor: 'crimson',
                                                        header: 'Usuń',
                                                        text: 'Przenieś zadanie do kosza',
                                                        onClick: function (button, event) {
                                                            object.Trash();
                                                        },
                                                    }),
                                                ];
                                            }
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new ButtonSetting({
                                        icon: 'close',
                                        header: 'Zamknij',
                                        text: '',
                                        onClick: function (sender, event) {
                                            object.Pull();
                                        },
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

    Update(data = {}) {
        let object = this;
        Ajax.Put(`/task/${object.Task.id}`, {
            data: data,
            load: function (response) {
                if (response.success) {
                    object.Task = response.task;
                    object.OnTaskChange.Invoke(object, {
                        task: object.Task,
                    });
                }
            },
        });
    }

    Restore() {
        let object = this;
        Ajax.Post(`/task/${object.Task.id}/restore`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.Task = response.task;
                    object.OnTaskChange.Invoke(object, {
                        task: object.Task,
                    });
                    object.OnTaskRestore.Invoke(object, {
                        task: object.Task,
                    });
                }
            },
        });
    }

    Trash() {
        let object = this;
        Ajax.Post(`/task/${object.Task.id}/trash`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.Task = response.task;
                    object.OnTaskChange.Invoke(object, {
                        task: object.Task,
                    });
                    object.OnTaskTrash.Invoke(object, {
                        task: object.Task,
                    });
                }
            },
        });
    }

    Delete() {
        let object = this;
        Ajax.Delete(`/task/${object.Task.id}`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.OnTaskDelete.Invoke(object, {
                        task: object.Task,
                    });
                }
            },
        });
    }

    get OnTaskChange() {
        let object = this;
        return object.onTaskChange ?? (object.onTaskChange = new Callback());
    }

    get OnTaskRestore() {
        let object = this;
        return object.onTaskRestore ?? (object.onTaskRestore = new Callback());
    }

    get OnTaskTrash() {
        let object = this;
        return object.onTaskTrash ?? (object.onTaskTrash = new Callback());
    }

    get OnTaskDelete() {
        let object = this;
        return object.onTaskDelete ?? (object.onTaskDelete = new Callback());
    }


}

class TaskPickerPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Zadania';

        object.TitleView.MaxWidth = 720;
        object.ContentView.MaxWidth = 720;

        new Property(object, 'Query', data.query ?? '', object.OnPropertyChanged);
        new Property(object, 'Tasks', data.tasks ?? [], object.OnPropertyChanged);

        if (data.onSelect) object.OnSelect.Listen(data.onSelect);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'Query', function (sender, data) {
            clearTimeout(object.queryTimeout);
            object.queryTimeout = setTimeout(function () {
                object.ReloadTasks();
            }, 250);
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Column({
                backgroundColor: 'var(--pageBackground)',
                color: 'var(--pageColor)',
                width: '100%',
                maxWidth: 720,
                children: [
                    new Form({
                        children: [
                            new Label({
                                width: '50%',
                                children: [
                                    new Input({
                                        width: '100%',
                                        name: 'name',
                                        placeholder: 'Nazwa',
                                    })
                                ],
                            }),
                            new Label({
                                width: '50%',
                                children: [
                                    new Input({
                                        width: '100%',
                                        name: 'tin',
                                        placeholder: 'NIP',
                                    })
                                ],
                            }),
                            new Label({
                                width: '100%',
                                children: [
                                    new Textarea({
                                        width: '100%',
                                        name: 'address',
                                        placeholder: 'Adres',
                                    })
                                ],
                            }),
                            new Label({
                                width: '50%',
                                children: [
                                    new Input({
                                        width: '100%',
                                        name: 'phoneNumber',
                                        placeholder: 'Numer telefonu',
                                    })
                                ],
                            }),
                            new Label({
                                width: '50%',
                                children: [
                                    new Input({
                                        width: '100%',
                                        type: 'email',
                                        name: 'emailAddress',
                                        placeholder: 'Adres email',
                                    })
                                ],
                            }),
                            new ButtonSetting({
                                width: '100%',
                                icon: 'add',
                                iconColor: 'forestgreen',
                                header: 'Utwórz',
                                text: 'Dodaj nowego klienta',
                            }),
                        ],
                        onSubmit: function (form, event) {
                            Ajax.Post(`/task`, {
                                form: form.Element,
                                load: function (response) {
                                    if (response.success) {
                                        object.Pull();
                                        object.OnSelect.Invoke(object, {
                                            task: response.task,
                                        });
                                    }
                                },
                            });
                        },
                    }),
                    new Row({
                        children: [
                            new ButtonSetting({
                                width: '50%',
                                icon: 'close',
                                header: 'Zamknij',
                                text: 'Wyjdź bez zapisywania',
                                onClick: function (sender, event) {
                                    object.Pull();
                                },
                            }),
                            new ButtonSetting({
                                width: '50%',
                                icon: 'delete',
                                iconColor: 'crimson',
                                header: 'Wyczyść',
                                text: '',
                                onClick: function (sender, event) {
                                    object.Pull();
                                    object.OnSelect.Invoke(object, {
                                        note: {
                                            id: 0,
                                        },
                                    });
                                },
                            }),
                        ],
                    }),
                    new Label({
                        width: '100%',
                        children: [
                            new Input({
                                width: '100%',
                                placeholder: 'Szukaj',
                                value: object.Query,
                                onInput: function (input, event) {
                                    object.Query = input.Value;
                                },
                            })
                        ],
                    }),
                    new Column({
                        childrenLoop: function (task) {
                            return new TaskButton({
                                task: task,
                                onClick: function (sender, data) {
                                    object.Pull();
                                    object.OnSelect.Invoke(object, {
                                        task: task,
                                    });
                                },
                            });
                        },
                        callback: function (view) {
                            new Binding(object, 'Tasks', function (sender, data) {
                                view.Children = object.Tasks;
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    ReloadTasks() {
        let object = this;

        Ajax.Post(`/task/query`, {
            data: {
                query: object.Query,
            },
            load: function (response) {
                if (response.success) {
                    object.Tasks = response.tasks;
                }
            }
        });
    }

    get OnSelect() {
        let object = this;
        return object.onSelect ?? (object.onSelect = new Callback());
    }

}

class TaskColumnEditPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'TaskColumn', data.taskColumn ?? {}, object.OnPropertyChanged);

        if (data.onTaskColumnChange) object.OnTaskColumnChange.Listen(data.onTaskColumnChange);
        if (data.onTaskColumnRestore) object.OnTaskColumnRestore.Listen(data.onTaskColumnRestore);
        if (data.onTaskColumnTrash) object.OnTaskColumnTrash.Listen(data.onTaskColumnTrash);
        if (data.onTaskColumnDelete) object.OnTaskColumnDelete.Listen(data.onTaskColumnDelete);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'TaskColumn', function (sender, data) {
            object.Title = object.TaskColumn.name;
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Row({
                children: [
                    new Column({
                        flexGrow: 3,
                        width: '75%',
                        children: [
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'task_alt',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'Nazwa',
                                                callback: function (view) {
                                                    new Binding(object, 'TaskColumn', function (sender, data) {
                                                        view.Value = object.TaskColumn.name;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        name: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 1,
                        width: '25%',
                        minWidth: '270px',
                        children: [
                            new Label({
                                children: [
                                    new Text({
                                        text: 'Użytkownik zadania po dodaniu',
                                    })
                                ],
                            }),
                            new UserButton({
                                callback: function (view) {
                                    new Binding(object, 'TaskColumn', function (sender, data) {
                                        view.User = object.TaskColumn.taskUser;
                                    });
                                },
                                onClick: function (button, event) {
                                    let userPickerPage = new UserPickerPage({
                                        selected: object.TaskColumn.taskUserId,
                                        onSelect: function (sender, data) {
                                            object.Update({
                                                taskUserId: data.user ? data.user.id : 0,
                                            });
                                        },
                                    });

                                    App.Instance.AddChild(userPickerPage);
                                },
                            }),
                            new Label({
                                children: [
                                    new Text({
                                        text: 'Etykieta zadania po dodaniu',
                                    })
                                ],
                            }),
                            new LabelButton({
                                callback: function (view) {
                                    new Binding(object, 'TaskColumn', function (sender, data) {
                                        view.Label = object.TaskColumn.taskLabel;
                                    });
                                },
                                onClick: function (button, event) {
                                    let labelPickerPage = new LabelPickerPage({
                                        selected: object.TaskColumn.taskLabelId,
                                        onSelect: function (sender, data) {
                                            object.Update({
                                                taskLabelId: data.label ? data.label.id : 0,
                                            });
                                        },
                                    });

                                    App.Instance.AddChild(labelPickerPage);
                                },
                            }),
                            new Label({
                                children: [
                                    new Text({
                                        text: 'Status zadania po dodaniu',
                                    })
                                ],
                            }),
                            new Label({
                                children: [
                                    new Select({
                                        width: '100%',
                                        children: [
                                            new SelectOption({
                                                text: 'Brak',
                                                value: '',
                                            }),
                                            new SelectOption({
                                                text: 'Oczekujące',
                                                value: 'Awaiting',
                                            }),
                                            new SelectOption({
                                                text: 'Realizowane',
                                                value: 'During',
                                            }),
                                            new SelectOption({
                                                text: 'Ukończone',
                                                value: 'Done',
                                            }),
                                            new SelectOption({
                                                text: 'Anulowane',
                                                value: 'Cancelled',
                                            }),
                                        ],
                                        callback: function (view) {
                                            new Binding(object, 'TaskColumn', function (sender, data) {
                                                view.Value = object.TaskColumn.taskStatus;
                                            });
                                        },
                                        onChange: function (sender, event) {
                                            object.Update({
                                                taskStatus: sender.Value,
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new Label({
                                children: [
                                    new Text({
                                        text: 'Kolor zadania po dodaniu',
                                    })
                                ],
                            }),
                            new Label({
                                children: [
                                    new Select({
                                        width: '100%',
                                        children: [
                                            new SelectOption({
                                                text: 'Brak',
                                                value: '',
                                            }),
                                            new SelectOption({
                                                text: 'Domyślny',
                                                value: 'default',
                                            }),
                                            new SelectOption({
                                                text: 'Szary',
                                                value: 'darkgray',
                                            }),
                                            new SelectOption({
                                                text: 'Czarny',
                                                value: 'black',
                                            }),
                                            new SelectOption({
                                                text: 'Czerwony',
                                                value: 'crimson',
                                            }),
                                            new SelectOption({
                                                text: 'Niebieski',
                                                value: 'royalblue',
                                            }),
                                            new SelectOption({
                                                text: 'Zielony',
                                                value: 'forestgreen',
                                            }),
                                            new SelectOption({
                                                text: 'Fioletowy',
                                                value: 'purple',
                                            }),
                                            new SelectOption({
                                                text: 'Pomarańczowy',
                                                value: 'orange',
                                            }),
                                        ],
                                        callback: function (view) {
                                            new Binding(object, 'TaskColumn', function (sender, data) {
                                                view.Value = object.TaskColumn.taskColor;
                                            });
                                        },
                                        onChange: function (sender, event) {
                                            object.Update({
                                                taskColor: sender.Value,
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new Column({
                                callback: function (view) {
                                    if (object.TaskColumn.trashBy) {
                                        view.Children = [
                                            new ButtonSetting({
                                                icon: 'restore',
                                                iconColor: 'forestgreen',
                                                header: 'Przywróć',
                                                text: 'Przywróć zadanie z kosza',
                                                onClick: function (button, event) {
                                                    object.Restore();
                                                },
                                            }),
                                            new ButtonSetting({
                                                icon: 'delete',
                                                iconColor: 'crimson',
                                                header: 'Usuń',
                                                text: 'Usuń zadanie na zawsze',
                                                onClick: function (button, event) {
                                                    object.Delete();
                                                },
                                            }),
                                        ];
                                    } else {
                                        view.Children = [
                                            new ButtonSetting({
                                                icon: 'delete',
                                                iconColor: 'crimson',
                                                header: 'Usuń',
                                                text: 'Przenieś zadanie do kosza',
                                                onClick: function (button, event) {
                                                    object.Trash();
                                                },
                                            }),
                                        ];
                                    }
                                },
                            }),
                            new ButtonSetting({
                                icon: 'close',
                                header: 'Zamknij',
                                text: '',
                                onClick: function (sender, event) {
                                    object.Pull();
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

    Update(data = {}) {
        let object = this;
        Ajax.Put(`/taskColumn/${object.TaskColumn.id}`, {
            data: data,
            load: function (response) {
                if (response.success) {
                    object.TaskColumn = response.taskColumn;
                    object.OnTaskColumnChange.Invoke(object, {
                        taskColumn: object.TaskColumn,
                    });
                }
            },
        });
    }

    Restore() {
        let object = this;
        Ajax.Post(`/taskColumn/${object.TaskColumn.id}/restore`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.TaskColumn = response.taskColumn;
                    object.OnTaskColumnChange.Invoke(object, {
                        taskColumn: object.TaskColumn,
                    });
                    object.OnTaskColumnRestore.Invoke(object, {
                        taskColumn: object.TaskColumn,
                    });
                }
            },
        });
    }

    Trash() {
        let object = this;
        Ajax.Post(`/taskColumn/${object.TaskColumn.id}/trash`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.TaskColumn = response.taskColumn;
                    object.OnTaskColumnChange.Invoke(object, {
                        taskColumn: object.TaskColumn,
                    });
                    object.OnTaskColumnTrash.Invoke(object, {
                        taskColumn: object.TaskColumn,
                    });
                }
            },
        });
    }

    Delete() {
        let object = this;
        Ajax.Delete(`/taskColumn/${object.TaskColumn.id}`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.OnTaskColumnDelete.Invoke(object, {
                        taskColumn: object.TaskColumn,
                    });
                }
            },
        });
    }

    get OnTaskColumnChange() {
        let object = this;
        return object.onTaskColumnChange ?? (object.onTaskColumnChange = new Callback());
    }

    get OnTaskColumnRestore() {
        let object = this;
        return object.onTaskColumnRestore ?? (object.onTaskColumnRestore = new Callback());
    }

    get OnTaskColumnTrash() {
        let object = this;
        return object.onTaskColumnTrash ?? (object.onTaskColumnTrash = new Callback());
    }

    get OnTaskColumnDelete() {
        let object = this;
        return object.onTaskColumnDelete ?? (object.onTaskColumnDelete = new Callback());
    }


}



class TaskColumnView extends Layout {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.BorderRadius = 0.5;
        object.BackgroundColor = 'var(--inputBackground)';
        object.Color = 'var(--inputColor)';
        object.Overflow = 'hidden';

        new Property(object, 'TaskColumn', data.taskColumn ?? {}, object.OnPropertyChanged);
        new Property(object, 'Tasks', data.tasks ?? [], object.OnPropertyChanged);

        if (data.onTaskColumnChange) object.OnTaskColumnChange.Listen(data.onTaskColumnChange);
        if (data.onTaskColumnRestore) object.OnTaskColumnRestore.Listen(data.onTaskColumnRestore);
        if (data.onTaskColumnTrash) object.OnTaskColumnTrash.Listen(data.onTaskColumnTrash);
        if (data.onTaskColumnDelete) object.OnTaskColumnDelete.Listen(data.onTaskColumnDelete);
    }

    Bind() {
        super.Bind();
        let object = this;
    }

    Render() {
        super.Render();
        let object = this;

        object.Children = [
            new Row({
                children: [
                    new Label({
                        width: '0%',
                        flexGrow: 1,
                        children: [
                            new Text({
                                callback: function (view) {
                                    new Binding(object, 'TaskColumn', function (sender, data) {
                                        view.Text = object.TaskColumn.name;
                                    });
                                },
                            }),
                        ],
                    }),
                    new Button({
                        children: [
                            new Icon({
                                text: 'edit'
                            }),
                        ],
                        onClick: function (sender, event) {
                            let taskColumnEditPage = new TaskColumnEditPage({
                                taskColumn: object.TaskColumn,
                                onTaskColumnChange: function (taskColumnEditPage, data) {
                                    object.TaskColumn = taskColumnEditPage.TaskColumn;
                                    object.OnTaskColumnChange.Invoke(object, {
                                        taskColumn: object.TaskColumn,
                                    });
                                },
                                onTaskColumnTrash: function (taskColumnEditPage, data) {
                                    object.TaskColumn = taskColumnEditPage.TaskColumn;
                                    object.OnTaskColumnTrash.Invoke(object, {
                                        taskColumn: object.TaskColumn,
                                    });
                                },
                            });

                            TestApp.Instance.AddChild(taskColumnEditPage);
                        },
                    }),
                    new Button({
                        children: [
                            new Icon({
                                text: 'add'
                            }),
                        ],
                        onClick: function (sender, event) {
                            Ajax.Post(`/task`, {
                                data: {
                                    taskColumnId: object.TaskColumn.id,
                                },
                                load: function (response) {
                                    if (response.success) {
                                        let taskButton = object.GetTaskButton(response.task);
                                        taskButton.Parent = object.taskList;
                                        taskButton.Click();
                                    }
                                },
                            });
                        },
                    }),
                ],
            }),
            new Column({
                padding: 0.5,
                gap: 0.5,
                minHeight: 100,
                childrenLoop: function (task) {
                    return object.GetTaskButton(task);
                },
                onDrop: function (taskList, event) {
                    let dragItem = window.dragItem;
                    window.dragItem = null;

                    if (dragItem && dragItem instanceof TaskButton) {
                        if (dragItem.Task.taskColumnId == object.TaskColumn.id) return;
                        let lastParent = dragItem.Parent;
                        dragItem.Parent = taskList;

                        dragItem.Disabled = true;
                        Ajax.Put(`/task/${dragItem.Task.id}`, {
                            data: {
                                taskColumnId: object.TaskColumn.id,
                            },
                            load: function (response) {
                                dragItem.Disabled = null;
                                if (response.success) {
                                    dragItem.Task = response.task;
                                } else {
                                    dragItem.Parent = lastParent;
                                }
                            },
                        });
                    }
                },
                callback: function (view) {
                    object.taskList = view;

                    new Binding(object, 'Tasks', function (sender, data) {
                        view.Children = object.Tasks;
                    });

                    object.ReloadTasks();
                },
            }),
        ];
    }

    GetTaskButton(task) {
        return new TaskButton({
            task: task,
            onContextMenu: function (taskButton, event) {
                event.preventDefault();
                let contextMenu = new ContextMenu({
                    event: event,
                    options: {
                        'Usuń': function (contextMenu, event) {
                            taskButton.Disabled = true;
                            Ajax.Post(`/task/${taskButton.Task.id}/trash`, {
                                load: function (response) {
                                    taskButton.Disabled = false;
                                    if (response.success) {
                                        taskButton.Remove();
                                    }
                                },
                            });
                        },
                    },
                });
                App.Instance.AddChild(contextMenu);
            },
            onClick: function (taskButton, event) {
                let taskPage = new TaskPage({
                    task: taskButton.Task,
                    onTaskChange: function (taskPage, data) {
                        taskButton.Task = taskPage.Task;
                    },
                    onTaskTrash: function (taskPage, data) {
                        taskButton.Remove();
                    },
                });

                TestApp.Instance.AddChild(taskPage);
            },
            callback: function (view) {
                view.Attr('draggable', true);
            },
        })
    }

    ReloadTasks() {
        let object = this;

        object.Tasks = [];
        object.Loading.Parent = object.taskList;

        Ajax.Get(`/taskColumn/${object.TaskColumn.id}/tasks`, {
            load: function (response) {
                if (response.success) {
                    object.Tasks = response.tasks;
                }
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

    get OnTaskColumnChange() {
        let object = this;
        return object.onTaskColumnChange ?? (object.onTaskColumnChange = new Callback());
    }

    get OnTaskColumnRestore() {
        let object = this;
        return object.onTaskColumnRestore ?? (object.onTaskColumnRestore = new Callback());
    }

    get OnTaskColumnTrash() {
        let object = this;
        return object.onTaskColumnTrash ?? (object.onTaskColumnTrash = new Callback());
    }

    get OnTaskColumnDelete() {
        let object = this;
        return object.onTaskColumnDelete ?? (object.onTaskColumnDelete = new Callback());
    }

}

class TaskTableButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'flex-start';

        object.Transition = '0.4s';
        object.FlexGrow = 1;

        object.OnMouseEnter.Listen(function () {
            object.FlexGrow = 10;
        });

        object.OnMouseLeave.Listen(function () {
            object.FlexGrow = 1;
        });

        new Property(object, 'TaskTable', data.taskTable ?? {}, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'TaskTable', function (sender, data) {
            if (object.TaskTable) {
                if (object.TaskTable.background) {
                    let image = new Image();
                    image.onload = function (event) {
                        object.BackgroundImage = `linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${object.TaskTable.background.url}')`;
                        object.Color = 'white';

                        object.BackgroundPosition = 'center, center';
                        object.BackgroundSize = 'cover, cover';
                        object.BackgroundRepeat = 'no-repeat, no-repeat';
                    };
                    image.src = object.TaskTable.background.url;
                    object.BackgroundImage = `url('/Assets/loading.gif')`;
                    object.BackgroundSize = 'contain';
                    object.BackgroundPosition = 'center';
                    object.BackgroundRepeat = 'no-repeat';
                } else {
                    object.BackgroundImage = null;
                    object.Color = null;
                }
            }
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: 'crimson',
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        text: 'task_alt',
                    }),
                ],
            }),
            new Column({
                flexGrow: 1,
                children: [
                    new Column({
                        children: [
                            new UserLabelView({
                                user: object.TaskTable.owner,
                            }),
                            new Text({
                                callback: function (view) {
                                    new Binding(object, 'TaskTable', function (sender, data) {
                                        view.Text = object.TaskTable.name;
                                    });
                                },
                            }),
                            new Text({
                                fontSize: 0.6,
                                whiteSpace: 'pre-line',
                                callback: function (view) {
                                    new Binding(object, 'TaskTable', function (sender, data) {
                                        view.Text = object.TaskTable.description;
                                    });
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }


}

class TaskTableEditPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'TaskTable', data.taskTable ?? {}, object.OnPropertyChanged);

        if (data.onTaskTableChange) object.OnTaskTableChange.Listen(data.onTaskTableChange);
        if (data.onTaskTableRestore) object.OnTaskTableRestore.Listen(data.onTaskTableRestore);
        if (data.onTaskTableTrash) object.OnTaskTableTrash.Listen(data.onTaskTableTrash);
        if (data.onTaskTableDelete) object.OnTaskTableDelete.Listen(data.onTaskTableDelete);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'TaskTable', function (sender, data) {
            object.Title = object.TaskTable.name;
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Row({
                children: [
                    new Column({
                        flexGrow: 65,
                        width: '65%',
                        children: [
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'task_alt',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'Nazwa',
                                                callback: function (view) {
                                                    new Binding(object, 'TaskTable', function (sender, data) {
                                                        view.Value = object.TaskTable.name;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        name: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'description',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Textarea({
                                                width: '100%',
                                                placeholder: 'Opis',
                                                callback: function (view) {
                                                    new Binding(object, 'TaskTable', function (sender, data) {
                                                        view.Value = object.TaskTable.description;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        description: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'image',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'Tło',
                                                type: 'file',
                                                onChange: function (sender, event) {
                                                    if (sender.Element.files) {
                                                        object.Update({}, Array.from(sender.Element.files));
                                                    }
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 35,
                        width: '35%',
                        minWidth: '300px',
                        children: [
                            new BoxView({
                                children: [
                                    new Label({
                                        children: [
                                            new Text({
                                                text: 'Użytkownicy'
                                            }),
                                        ],
                                    }),
                                    new TaskTableUsersView({
                                        callback: function (view) {
                                            new Binding(object, 'TaskTable', function (sender, data) {
                                                view.TaskTable = object.TaskTable;
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new Column({
                                        callback: function (view) {
                                            if (object.TaskTable.trashBy) {
                                                view.Children = [
                                                    new ButtonSetting({
                                                        icon: 'restore',
                                                        iconColor: 'forestgreen',
                                                        header: 'Przywróć',
                                                        text: 'Przywróć zadanie z kosza',
                                                        onClick: function (button, event) {
                                                            object.Restore();
                                                        },
                                                    }),
                                                    new ButtonSetting({
                                                        icon: 'delete',
                                                        iconColor: 'crimson',
                                                        header: 'Usuń',
                                                        text: 'Usuń zadanie na zawsze',
                                                        onClick: function (button, event) {
                                                            object.Delete();
                                                        },
                                                    }),
                                                ];
                                            } else {
                                                view.Children = [
                                                    new ButtonSetting({
                                                        icon: 'delete',
                                                        iconColor: 'crimson',
                                                        header: 'Usuń',
                                                        text: 'Przenieś zadanie do kosza',
                                                        onClick: function (button, event) {
                                                            object.Trash();
                                                        },
                                                    }),
                                                ];
                                            }
                                        },
                                    }),
                                ],
                            }),
                            new BoxView({
                                children: [
                                    new ButtonSetting({
                                        icon: 'close',
                                        header: 'Zamknij',
                                        text: '',
                                        onClick: function (sender, event) {
                                            object.Pull();
                                        },
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

    Update(data = {}, files = []) {
        let object = this;
        Ajax.Put(`/taskTable/${object.TaskTable.id}`, {
            data: data,
            files: files,
            load: function (response) {
                if (response.success) {
                    object.TaskTable = response.taskTable;
                    object.OnTaskTableChange.Invoke(object, {
                        taskTable: object.TaskTable,
                    });
                }
            },
        });
    }

    Restore() {
        let object = this;
        Ajax.Post(`/taskTable/${object.TaskTable.id}/restore`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.TaskTable = response.taskTable;
                    object.OnTaskTableChange.Invoke(object, {
                        taskTable: object.TaskTable,
                    });
                    object.OnTaskTableRestore.Invoke(object, {
                        taskTable: object.TaskTable,
                    });
                }
            },
        });
    }

    Trash() {
        let object = this;
        Ajax.Post(`/taskTable/${object.TaskTable.id}/trash`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.TaskTable = response.taskTable;
                    object.OnTaskTableChange.Invoke(object, {
                        taskTable: object.TaskTable,
                    });
                    object.OnTaskTableTrash.Invoke(object, {
                        taskTable: object.TaskTable,
                    });
                }
            },
        });
    }

    Delete() {
        let object = this;
        Ajax.Delete(`/taskTable/${object.TaskTable.id}`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.OnTaskTableDelete.Invoke(object, {
                        taskTable: object.TaskTable,
                    });
                }
            },
        });
    }

    get OnTaskTableChange() {
        let object = this;
        return object.onTaskTableChange ?? (object.onTaskTableChange = new Callback());
    }

    get OnTaskTableRestore() {
        let object = this;
        return object.onTaskTableRestore ?? (object.onTaskTableRestore = new Callback());
    }

    get OnTaskTableTrash() {
        let object = this;
        return object.onTaskTableTrash ?? (object.onTaskTableTrash = new Callback());
    }

    get OnTaskTableDelete() {
        let object = this;
        return object.onTaskTableDelete ?? (object.onTaskTableDelete = new Callback());
    }


}

class TaskTablePage extends WindowPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Theme = Colors.Task;

        object.Body.BackgroundPosition = 'center, center';
        object.Body.BackgroundSize = 'cover, cover';
        object.Body.BackgroundRepeat = 'no-repeat, no-repeat';

        new Property(object, 'TaskTable', data.taskTable ?? {}, object.OnPropertyChanged);
        new Property(object, 'TaskColumns', data.taskColumns ?? [], object.OnPropertyChanged);

        if (data.onTaskTableChange) object.OnTaskTableChange.Listen(data.onTaskTableChange);
        if (data.onTaskTableRestore) object.OnTaskTableRestore.Listen(data.onTaskTableRestore);
        if (data.onTaskTableTrash) object.OnTaskTableTrash.Listen(data.onTaskTableTrash);
        if (data.onTaskTableDelete) object.OnTaskTableDelete.Listen(data.onTaskTableDelete);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'TaskTable', function (sender, data) {
            if (object.TaskTable) {
                object.Title = object.TaskTable.name;

                if (object.TaskTable.background) {
                    object.Body.BackgroundImage = `linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${object.TaskTable.background.url}')`;
                    object.Body.Color = 'white';
                } else {
                    object.Body.BackgroundImage = null;
                    object.Body.Color = null;
                }
            }
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.BodyChildren = [
            new Row({
                gap: 0.5,
                padding: 0.5,
                alignItems: 'flex-start',
                flexWrap: 'nowrap',
                childrenLoop: function (taskColumn) {
                    return object.GetTaskColumnView(taskColumn);
                },
                callback: function (view) {
                    object.taskColumnList = view;

                    new Binding(object, 'TaskColumns', function (sender, data) {
                        view.Children = object.TaskColumns;
                    });

                    object.ReloadTaskColumns();
                },
            }),
        ];

        object.FooterChildren = [
            new Row({
                justifyContent: 'flex-end',
                fontSize: 0.6,
                children: [
                    new Button({
                        children: [
                            new Text({
                                text: 'Odśwież',
                            }),
                        ],
                        onClick: function (sender, event) {
                            object.ReloadTaskColumns();
                        },
                    }),
                    new Button({
                        children: [
                            new Text({
                                text: 'Nowa kolumna zadań',
                            }),
                        ],
                        onClick: function (sender, event) {
                            Ajax.Post(`/taskColumn`, {
                                data: {
                                    taskTableId: object.TaskTable.id,
                                },
                                load: function (response) {
                                    if (response.success) {
                                        let taskColumnView = object.GetTaskColumnView(response.taskColumn);
                                        taskColumnView.Parent = object.taskColumnList;
                                    }
                                },
                            });
                        },
                    }),
                    new Button({
                        children: [
                            new Text({
                                text: 'Edytuj tabelę zadań',
                            }),
                        ],
                        onClick: function (sender, event) {
                            let taskTableEditPage = new TaskTableEditPage({
                                taskTable: object.TaskTable,
                                onTaskTableChange: function (taskTableEditPage, data) {
                                    object.TaskTable = taskTableEditPage.TaskTable;
                                    object.OnTaskTableChange.Invoke(object, {
                                        taskTable: object.TaskTable,
                                    });
                                },
                                onTaskTableRestore: function (taskTableEditPage, data) {
                                    object.TaskTable = taskTableEditPage.TaskTable;
                                    object.Pull();
                                    object.OnTaskTableRestore.Invoke(object, {
                                        taskTable: object.TaskTable,
                                    });
                                },
                                onTaskTableTrash: function (taskTableEditPage, data) {
                                    object.TaskTable = taskTableEditPage.TaskTable;
                                    object.Pull();
                                    object.OnTaskTableTrash.Invoke(object, {
                                        taskTable: object.TaskTable,
                                    });
                                },
                                onTaskTableDelete: function (taskTableEditPage, data) {
                                    object.TaskTable = taskTableEditPage.TaskTable;
                                    object.Pull();
                                    object.OnTaskTableDelete.Invoke(object, {
                                        taskTable: object.TaskTable,
                                    });
                                },
                            });

                            App.Instance.AddChild(taskTableEditPage);
                        },
                    }),
                ],
            }),
        ];
    }

    GetTaskColumnView(taskColumn) {
        return new TaskColumnView({
            taskColumn: taskColumn,
            flexShrink: 0,
            minWidth: 360,
            width: 360,
            onTaskColumnTrash: function (taskColumnView, data) {
                taskColumnView.Remove();
            },
        });
    }

    ReloadTaskColumns() {
        let object = this;

        object.TaskColumns = [];
        object.Loading.Parent = object.taskColumnList;

        Ajax.Get(`/taskTable/${object.TaskTable.id}/taskColumns`, {
            load: function (response) {
                object.TaskColumns = response.taskColumns;
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

    get OnTaskTableChange() {
        let object = this;
        return object.onTaskTableChange ?? (object.onTaskTableChange = new Callback());
    }

    get OnTaskTableRestore() {
        let object = this;
        return object.onTaskTableRestore ?? (object.onTaskTableRestore = new Callback());
    }

    get OnTaskTableTrash() {
        let object = this;
        return object.onTaskTableTrash ?? (object.onTaskTableTrash = new Callback());
    }

    get OnTaskTableDelete() {
        let object = this;
        return object.onTaskTableDelete ?? (object.onTaskTableDelete = new Callback());
    }


}

class TaskTableUserButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'flex-start';

        new Property(object, 'TaskTableUser', data.taskTableUser ?? {}, object.OnPropertyChanged);

        if (data.onDelete) object.OnDelete.Listen(data.onDelete);

        object.OnContextMenu.Listen(function (sender, event) {
            event.preventDefault();
            let contextMenu = new ContextMenu({
                event: event,
                options: {
                    'Usuń': function (sender, event) {
                        object.Delete();
                    },
                },
            });

            App.Instance.AddChild(contextMenu);
        });
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: Colors.User,
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        text: 'account_circle',
                    }),
                ],
            }),
            new Layout({
                width: '0%',
                flexGrow: 1,
                children: [
                    new UserLabelView({
                        width: '100%',
                        callback: function (view) {
                            new Binding(object, 'TaskTableUser', function (sender, property) {
                                view.User = object.TaskTableUser ? object.TaskTableUser.user : null;
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    Delete() {
        let object = this;
        Ajax.Delete(`/taskTableUser/${object.TaskTableUser.id}`, {
            load: function (response) {
                if (response.success) {
                    object.OnDelete.Invoke(object, {
                        taskTableUser: object.TaskTableUser,
                    });
                }
            },
        });
    }

    get OnDelete() {
        let object = this;
        return object.onDelete ?? (object.onDelete = new Callback());
    }

}

class TaskTableUsersView extends Column {

    Init(data = {}) {
        super.Init();
        let object = this;

        new Property(object, 'TaskTableUsers', data.taskTableUsers ?? [], object.OnPropertyChanged);
        new Property(object, 'TaskTable', data.taskTable ?? null, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'TaskTable', function (sender, data) {
            object.ReloadTaskTableUsers();
        });
    }

    Render() {
        let object = this;

        object.Children = [
            new UserButton({
                onClick: function (button, event) {
                    let userPickerPage = new UserPickerPage({
                        onSelect: function (sender, data) {
                            if (!data.user) return;
                            Ajax.Post(`/taskTableUser`, {
                                data: {
                                    taskTableId: object.TaskTable.id,
                                    userId: data.user.id
                                },
                                load: function (response) {
                                    if (response.success) {
                                        let button = object.GetTaskTableUserButton(response.taskTableUser);
                                        button.Parent = object.taskTableUserList;
                                    }
                                },
                            });
                        },
                    });

                    TestApp.Instance.AddChild(userPickerPage);
                },
            }),
            new Column({
                childrenLoop: function (taskTableUser) {
                    return object.GetTaskTableUserButton(taskTableUser);
                },
                callback: function (view) {
                    object.taskTableUserList = view;

                    new Binding(object, 'TaskTableUsers', function (sender, data) {
                        view.Children = object.TaskTableUsers;
                    });
                },
            }),
        ];
    }

    GetTaskTableUserButton(taskTableUser) {
        return new TaskTableUserButton({
            taskTableUser: taskTableUser,
            onDelete: function (taskTableUserButton, data) {
                taskTableUserButton.Remove();
            },
        });
    }

    ReloadTaskTableUsers() {
        let object = this;

        object.TaskTableUsers = [];
        object.Loading.Parent = object.taskTableUserList;

        if (!object.TaskTable) {
            object.TaskTableUsers = [];
            return;
        }

        Ajax.Get(`/taskTable/${object.TaskTable.id}/taskTableUsers`, {
            load: function (response) {
                if (response.success) {
                    object.TaskTableUsers = response.taskTableUsers;
                } else {
                    object.TaskTableUsers = [];
                }
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

}

class TaskTablesPage extends WindowPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Zadania';
        object.Theme = Colors.Task;

        new Property(object, 'TaskTables', data.taskTables ?? [], object.OnPropertyChanged);

        object.OnPush.Listen(function () {
            object.ReloadTaskTables();
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.BodyChildren = [
            new Column({
                flexGrow: 1,
                children: [
                    new Column({
                        flexGrow: 1,
                        childrenLoop: function (taskTable) {
                            return object.GetTaskTableButton(taskTable);
                        },
                        callback: function (view) {
                            object.taskTableList = view;

                            new Binding(object, 'TaskTables', function (sender, data) {
                                view.Children = object.TaskTables;
                            });

                            object.ReloadTaskTables();
                        },
                    }),
                ],
            }),
        ];

        object.FooterChildren = [
            new Row({
                justifyContent: 'flex-end',
                fontSize: 0.6,
                children: [
                    new Button({
                        children: [
                            new Text({
                                text: 'Odśwież',
                            }),
                        ],
                        onClick: function (sender, event) {
                            object.ReloadTaskTables();
                        },
                    }),
                    new Button({
                        children: [
                            new Text({
                                text: 'Nowa tabela zadań',
                            }),
                        ],
                        onClick: function (sender, event) {
                            Ajax.Post(`/taskTable`, {
                                load: function (response) {
                                    if (response.success) {
                                        let taskTableButton = object.GetTaskTableButton(response.taskTable);
                                        taskTableButton.Parent = object.taskTableList;
                                        taskTableButton.Click();
                                    }
                                },
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    GetTaskTableButton(taskTable) {
        let object = this;

        return new TaskTableButton({
            taskTable: taskTable,
            onClick: function (taskTableButton, event) {
                event.preventDefault();
                event.stopPropagation();

                let taskTablePage = new TaskTablePage({
                    taskTable: taskTable,
                    onTaskTableChange: function (taskTablePage, data) {
                        taskTableButton.TaskTable = taskTablePage.TaskTable;
                    },
                    onTaskTableTrash: function (taskTablePage, data) {
                        taskTableButton.Remove();
                    },
                });

                App.Instance.AddChild(taskTablePage);
            },
        });
    }

    ReloadTaskTables() {
        let object = this;

        object.TaskTables = [];
        object.Loading.Parent = object.taskTableList;

        Ajax.Get(`/taskTable`, {
            load: function (response) {
                object.TaskTables = response.taskTables;
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

}

class TasksPage extends TitlePage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Zadania';
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
        ];
    }

}

class TrashPage extends WindowPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Kosz';

        new Property(object, 'TaskTables', data.taskTables ?? [], object.OnPropertyChanged);
        new Property(object, 'TaskColumns', data.taskColumns ?? [], object.OnPropertyChanged);
        new Property(object, 'Tasks', data.tasks ?? [], object.OnPropertyChanged);
        new Property(object, 'Notes', data.notes ?? [], object.OnPropertyChanged);
        new Property(object, 'Customers', data.customers ?? [], object.OnPropertyChanged);
        new Property(object, 'Users', data.users ?? [], object.OnPropertyChanged);
        new Property(object, 'Comments', data.comments ?? [], object.OnPropertyChanged);

        object.OnPush.Listen(function () {
            object.ReloadTrash();
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.BodyChildren = [
            new Column({
                children: [
                    new Label({
                        children: [
                            new Text({
                                fontSize: 2,
                                text: 'Tabele zadań'
                            }),
                        ],
                    }),
                    new Column({
                        childrenLoop: function (taskTable) {
                            return new Text({
                                text: taskTable.name,
                            })
                        },
                        callback: function (view) {
                            new Binding(object, 'TaskTables', function (sender, data) {
                                view.Children = object.TaskTables;
                            });
                        },
                    }),
                ],
                callback: function (view) {
                    new Binding(object, 'TaskTables', function (sender, data) {
                        view.Display = object.TaskTables && object.TaskTables.length ? null : 'none';
                    });
                },
            }),
            new Column({
                children: [
                    new Label({
                        children: [
                            new Text({
                                fontSize: 2,
                                text: 'Kolumny zadań'
                            }),
                        ],
                    }),
                    new Column({
                        childrenLoop: function (taskColumn) {
                            return new Text({
                                text: taskColumn.name,
                            })
                        },
                        callback: function (view) {
                            new Binding(object, 'TaskColumns', function (sender, data) {
                                view.Children = object.TaskColumns;
                            });
                        },
                    }),
                ],
                callback: function (view) {
                    new Binding(object, 'TaskColumns', function (sender, data) {
                        view.Display = object.TaskColumns && object.TaskColumns.length ? null : 'none';
                    });
                },
            }),
            new Column({
                children: [
                    new Label({
                        children: [
                            new Text({
                                fontSize: 2,
                                text: 'Zadania'
                            }),
                        ],
                    }),
                    new Column({
                        childrenLoop: function (task) {
                            return new TaskButton({
                                task: task,
                                onClick: function (taskButton, event) {
                                    let taskPage = new TaskPage({
                                        task: taskButton.Task,
                                        onTaskChange: function (taskPage, data) {
                                            taskButton.Task = taskPage.Task;
                                        },
                                        onTaskRestore: function (taskPage, data) {
                                            taskButton.Remove();
                                        },
                                        onTaskDelete: function (taskPage, data) {
                                            taskButton.Remove();
                                        },
                                    });

                                    object.Parent.AddChild(taskPage);
                                },
                            });
                        },
                        callback: function (view) {
                            new Binding(object, 'Tasks', function (sender, data) {
                                view.Children = object.Tasks;
                            });
                        },
                    }),
                ],
                callback: function (view) {
                    new Binding(object, 'Tasks', function (sender, data) {
                        view.Display = object.Tasks ?? object.Tasks.length ? null : 'none';
                    });
                },
            }),
            new Column({
                children: [
                    new Label({
                        children: [
                            new Text({
                                fontSize: 2,
                                text: 'Notatki'
                            }),
                        ],
                    }),
                    new Column({
                        childrenLoop: function (note) {
                            return new NoteButton({
                                note: note,
                                onClick: function (noteButton, event) {
                                    let notePage = new NotePage({
                                        note: noteButton.Note,
                                        onNoteChange: function (notePage, data) {
                                            noteButton.Note = notePage.Note;
                                        },
                                        onNoteRestore: function (notePage, data) {
                                            noteButton.Remove();
                                        },
                                        onNoteDelete: function (notePage, data) {
                                            noteButton.Remove();
                                        },
                                    });

                                    object.Parent.AddChild(notePage);
                                },
                            });
                        },
                        callback: function (view) {
                            new Binding(object, 'Notes', function (sender, data) {
                                view.Children = object.Notes;
                            });
                        },
                    }),
                ],
                callback: function (view) {
                    new Binding(object, 'Notes', function (sender, data) {
                        view.Display = object.Notes ?? object.Notes.length ? null : 'none';
                    });
                },
            }),
            new Column({
                children: [
                    new Label({
                        children: [
                            new Text({
                                fontSize: 2,
                                text: 'Klienci'
                            }),
                        ],
                    }),
                    new Column({
                        childrenLoop: function (customer) {
                            return new CustomerButton({
                                customer: customer,
                                onClick: function (customerButton, event) {
                                    let customerPage = new CustomerEditPage({
                                        customer: customerButton.Customer,
                                        onCustomerChange: function (customerPage, data) {
                                            customerButton.Customer = customerPage.Customer;
                                        },
                                        onCustomerRestore: function (customerPage, data) {
                                            customerButton.Remove();
                                        },
                                        onCustomerDelete: function (customerPage, data) {
                                            customerButton.Remove();
                                        },
                                    });

                                    object.Parent.AddChild(customerPage);
                                },
                            });
                        },
                        callback: function (view) {
                            new Binding(object, 'Customers', function (sender, data) {
                                view.Children = object.Customers;
                            });
                        },
                    }),
                ],
                callback: function (view) {
                    new Binding(object, 'Customers', function (sender, data) {
                        view.Display = object.Customers ?? object.Customers.length ? null : 'none';
                    });
                },
            }),
            new Column({
                children: [
                    new Label({
                        children: [
                            new Text({
                                fontSize: 2,
                                text: 'Użytkownicy'
                            }),
                        ],
                    }),
                    new Column({
                        childrenLoop: function (user) {
                            return new UserButton({
                                user: user,
                                onClick: function (userButton, event) {
                                    let userPage = new UserPage({
                                        user: userButton.User,
                                        onUserChange: function (userPage, data) {
                                            userButton.User = userPage.User;
                                        },
                                        onUserRestore: function (userPage, data) {
                                            userButton.Remove();
                                        },
                                        onUserDelete: function (userPage, data) {
                                            userButton.Remove();
                                        },
                                    });

                                    object.Parent.AddChild(userPage);
                                },
                            });
                        },
                        callback: function (view) {
                            new Binding(object, 'Users', function (sender, data) {
                                view.Children = object.Users;
                            });
                        },
                    }),
                ],
                callback: function (view) {
                    new Binding(object, 'Users', function (sender, data) {
                        view.Display = object.Users && object.Users.length ? null : 'none';
                    });
                },
            }),
            new Column({
                children: [
                    new Label({
                        children: [
                            new Text({
                                fontSize: 2,
                                text: 'Komentarze'
                            }),
                        ],
                    }),
                    new Column({
                        childrenLoop: function (comment) {
                            return new CommentButton({
                                comment: comment,
                                onClick: function (commentButton, event) {
                                    let commentEditPage = new CommentEditPage({
                                        comment: commentButton.Comment,
                                        onCommentChange: function (commentEditPage, data) {
                                            commentButton.Comment = commentEditPage.Comment;
                                        },
                                        onCommentRestore: function (commentEditPage, data) {
                                            commentButton.Remove();
                                        },
                                        onCommentDelete: function (commentEditPage, data) {
                                            commentButton.Remove();
                                        },
                                    });

                                    object.Parent.AddChild(commentEditPage);
                                },
                            });
                        },
                        callback: function (view) {
                            new Binding(object, 'Comments', function (sender, data) {
                                view.Children = object.Comments;
                            });
                        },
                    }),
                ],
                callback: function (view) {
                    new Binding(object, 'Comments', function (sender, data) {
                        view.Display = object.Comments && object.Comments.length ? null : 'none';
                    });
                },
            }),
        ];
    }

    ReloadTrash() {
        let object = this;

        Ajax.Get(`/trash`, {
            load: function (response) {
                object.TaskTables = response.taskTables;
                object.TaskColumns = response.taskColumns;
                object.Tasks = response.tasks;
                object.Notes = response.notes;
                object.Customers = response.customers;
                object.Users = response.users;
                object.Comments = response.comments;
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

}

class UserButton extends Button {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.AlignItems = 'flex-start';

        new Property(object, 'User', data.user ?? null, object.OnPropertyChanged);
    }

    Render() {
        let object = this;

        object.Children = [
            new Layout({
                backgroundColor: Colors.User,
                color: 'white',
                borderRadius: 0.5,
                width: '2rem',
                height: '2rem',
                justifyContent: 'center',
                alignItems: 'center',
                children: [
                    new Icon({
                        text: 'account_circle',
                    }),
                ],
            }),
            new Layout({
                width: '0%',
                flexGrow: 1,
                children: [
                    new Text({
                        callback: function (view) {
                            new Binding(object, 'User', function (sender, property) {
                                view.Text = object.User && object.User.name ? object.User.name : 'Brak';
                            });
                        },
                    }),
                    new Text({
                        fontSize: 0.6,
                        callback: function (view) {
                            new Binding(object, 'User', function (sender, property) {
                                view.Text = object.User ? object.User.email : '';
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}

class UserPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'User', data.user ?? {}, object.OnPropertyChanged);

        if (data.onUserChange) object.OnUserChange.Listen(data.onUserChange);
        if (data.onUserRestore) object.OnUserRestore.Listen(data.onUserRestore);
        if (data.onUserTrash) object.OnUserTrash.Listen(data.onUserTrash);
        if (data.onUserDelete) object.OnUserDelete.Listen(data.onUserDelete);
    }

    Bind() {
        super.Bind();
        let object = this;

        new Binding(object, 'User', function (sender, data) {
            object.Title = object.User.name;
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Row({
                children: [
                    new Column({
                        flexGrow: 3,
                        width: '75%',
                        children: [
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'account_circle',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'Nazwa',
                                                callback: function (view) {
                                                    new Binding(object, 'User', function (sender, data) {
                                                        view.Value = object.User.name;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        name: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new Row({
                                children: [
                                    new Label({
                                        children: [
                                            new Icon({
                                                padding: 0.5,
                                                text: 'alternate_email',
                                            }),
                                        ],
                                    }),
                                    new Label({
                                        width: '0%',
                                        flexGrow: 1,
                                        children: [
                                            new Input({
                                                width: '100%',
                                                placeholder: 'Adres email',
                                                type: 'email',
                                                callback: function (view) {
                                                    new Binding(object, 'User', function (sender, data) {
                                                        view.Value = object.User.email;
                                                    });
                                                },
                                                onChange: function (sender, event) {
                                                    object.Update({
                                                        email: sender.Value,
                                                    });
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new Column({
                        flexGrow: 1,
                        width: '25%',
                        minWidth: '270px',
                        children: [
                            new Label({
                                children: [
                                    new Text({
                                        text: 'Zmień hasło',
                                    })
                                ],
                            }),
                            new Label({
                                width: '100%',
                                children: [
                                    new Input({
                                        width: '100%',
                                        placeholder: 'Hasło',
                                        type: 'password',
                                        callback: function (view) {
                                            new Binding(object, 'User', function (sender, data) {
                                                view.Value = '';
                                            });
                                        },
                                        onChange: function (sender, event) {
                                            object.Update({
                                                password: sender.Value,
                                            });
                                        },
                                    }),
                                ],
                            }),
                            new Column({
                                callback: function (view) {
                                    if (object.User.trashBy) {
                                        view.Children = [
                                            new ButtonSetting({
                                                icon: 'restore',
                                                iconColor: 'forestgreen',
                                                header: 'Przywróć',
                                                text: 'Przywróć notatkę z kosza',
                                                onClick: function (button, event) {
                                                    object.Restore();
                                                },
                                            }),
                                            new ButtonSetting({
                                                icon: 'delete',
                                                iconColor: 'crimson',
                                                header: 'Usuń',
                                                text: 'Usuń notatkę na zawsze',
                                                onClick: function (button, event) {
                                                    object.Delete();
                                                },
                                            }),
                                        ];
                                    } else {
                                        view.Children = [
                                            new ButtonSetting({
                                                icon: 'delete',
                                                iconColor: 'crimson',
                                                header: 'Usuń',
                                                text: 'Przenieś notatkę do kosza',
                                                onClick: function (button, event) {
                                                    object.Trash();
                                                },
                                            }),
                                        ];
                                    }
                                },
                            }),
                            new ButtonSetting({
                                icon: 'close',
                                header: 'Zamknij',
                                text: '',
                                onClick: function (sender, event) {
                                    object.Pull();
                                },
                            }),
                        ],
                    }),
                ],
            }),
        ];
    }

    Update(data = {}) {
        let object = this;
        Ajax.Put(`/user/${object.User.id}`, {
            data: data,
            load: function (response) {
                if (response.success) {
                    object.User = response.user;
                    object.OnUserChange.Invoke(object, {
                        user: object.User,
                    });
                }
            },
        });
    }

    Restore() {
        let object = this;
        Ajax.Post(`/user/${object.User.id}/restore`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.User = response.user;
                    object.OnUserChange.Invoke(object, {
                        user: object.User,
                    });
                    object.OnUserRestore.Invoke(object, {
                        user: object.User,
                    });
                }
            },
        });
    }

    Trash() {
        let object = this;
        Ajax.Post(`/user/${object.User.id}/trash`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.User = response.user;
                    object.OnUserChange.Invoke(object, {
                        user: object.User,
                    });
                    object.OnUserTrash.Invoke(object, {
                        user: object.User,
                    });
                }
            },
        });
    }

    Delete() {
        let object = this;
        Ajax.Delete(`/user/${object.User.id}`, {
            load: function (response) {
                if (response.success) {
                    object.Pull();
                    object.OnUserDelete.Invoke(object, {
                        user: object.User,
                    });
                }
            },
        });
    }

    get OnUserChange() {
        let object = this;
        return object.onUserChange ?? (object.onUserChange = new Callback());
    }

    get OnUserRestore() {
        let object = this;
        return object.onUserRestore ?? (object.onUserRestore = new Callback());
    }

    get OnUserTrash() {
        let object = this;
        return object.onUserTrash ?? (object.onUserTrash = new Callback());
    }

    get OnUserDelete() {
        let object = this;
        return object.onUserDelete ?? (object.onUserDelete = new Callback());
    }


}

class UserPickerPage extends ModalPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Produkty';

        object.TitleView.MaxWidth = 720;
        object.ContentView.MaxWidth = 720;

        new Property(object, 'Query', data.query ?? '', object.OnPropertyChanged);
        new Property(object, 'Users', data.users ?? [], object.OnPropertyChanged);

        if (data.onSelect) object.OnSelect.Listen(data.onSelect);
    }

    Bind() {
        super.Bind();
        let object = this;
        new Binding(object, 'Query', function (sender, data) {
            clearTimeout(object.queryTimeout);
            object.queryTimeout = setTimeout(function () {
                object.ReloadUsers();
            }, 250);
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Content = [
            new Column({
                children: [
                    new Row({
                        children: [
                            new ButtonSetting({
                                width: '50%',
                                icon: 'close',
                                header: 'Zamknij',
                                text: 'Wyjdź bez zapisywania',
                                onClick: function (sender, event) {
                                    object.Pull();
                                },
                            }),
                            new ButtonSetting({
                                width: '50%',
                                icon: 'delete',
                                iconColor: 'crimson',
                                header: 'Wyczyść',
                                text: '',
                                onClick: function (sender, event) {
                                    object.Pull();
                                    object.OnSelect.Invoke(object, {
                                        user: null,
                                    });
                                },
                            }),
                        ],
                    }),
                    new Label({
                        width: '100%',
                        children: [
                            new Input({
                                width: '100%',
                                placeholder: 'Szukaj',
                                value: object.Query,
                                onInput: function (input, event) {
                                    object.Query = input.Value;
                                },
                            })
                        ],
                    }),
                    new Column({
                        childrenLoop: function (user) {
                            return new UserButton({
                                user: user,
                                onClick: function (sender, data) {
                                    object.Pull();
                                    object.OnSelect.Invoke(object, {
                                        user: user,
                                    });
                                },
                            });
                        },
                        callback: function (view) {
                            object.userList = view;

                            new Binding(object, 'Users', function (sender, data) {
                                view.Children = object.Users;
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    ReloadUsers() {
        let object = this;

        object.Users = [];
        object.Loading.Parent = object.userList;

        Ajax.Post(`/user/query`, {
            data: {
                query: object.Query,
            },
            load: function (response) {
                if (response.success) {
                    object.Users = response.users;
                }
            }
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

    get OnSelect() {
        let object = this;
        return object.onSelect ?? (object.onSelect = new Callback());
    }

}

class UserAvatar extends Img {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.ObjectFit = data.objectFit ?? 'cover';
        object.ObjectPosition = data.objectPosition ?? 'center';
        object.BorderRadius = data.borderRadius ?? '1rem';
        object.Width = data.width ?? '1rem';
        object.Height = data.height ?? '1rem';

        new Property(object, 'User', data.user ?? null, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();

        let object = this;

        new Binding(object, 'User', function (sender, data) {
            object.Display = object.User ? null : 'none';
            object.Source = object.User && object.User.avatar ? object.User.avatar.url : '/Assets/logo.png';
        });
    }

}

class UserLabelView extends Layout {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        new Property(object, 'User', data.user ?? null, object.OnPropertyChanged);
    }

    Bind() {
        super.Bind();

        let object = this;

        new Binding(object, 'User', function (sender, data) {
            object.Display = object.User ? null : 'none';
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.Children = [
            new Row({
                alignItems: 'center',
                gap: 0.25,
                children: [
                    new UserAvatar({
                        callback: function (view) {
                            new Binding(object, 'User', function (sender, data) {
                                view.User = object.User;
                            });
                        },
                    }),
                    new Text({
                        flexGrow: 1,
                        width: '0%',
                        fontSize: 0.6,
                        callback: function (view) {
                            new Binding(object, 'User', function (sender, data) {
                                view.Text = object.User && object.User.name ? object.User.name : '';
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}

class UsersPage extends WindowPage {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Title = 'Użytkownicy';
        object.Theme = Colors.User;

        new Property(object, 'Users', data.users ?? [], object.OnPropertyChanged);

        object.OnPush.Listen(function () {
            object.ReloadUsers();
        });
    }

    Render() {
        super.Render();
        let object = this;

        object.BodyChildren = [
            new Column({
                children: [
                    new Column({
                        childrenLoop: function (user) {
                            return object.GetUserButton(user);
                        },
                        callback: function (view) {
                            object.userList = view;

                            new Binding(object, 'Users', function (sender, data) {
                                view.Children = object.Users;
                            });

                            object.ReloadUsers();
                        },
                    }),
                ],
            }),
        ];

        object.FooterChildren = [
            new Row({
                justifyContent: 'flex-end',
                fontSize: 0.6,
                children: [
                    new Button({
                        children: [
                            new Text({
                                text: 'Odśwież',
                            }),
                        ],
                        onClick: function (sender, event) {
                            object.ReloadUsers();
                        },
                    }),
                    new Button({
                        children: [
                            new Text({
                                text: 'Nowy użytkownik',
                            }),
                        ],
                        onClick: function (sender, event) {
                            Ajax.Post(`/user`, {
                                load: function (response) {
                                    if (response.success) {
                                        let userButton = object.GetUserButton(response.user);
                                        userButton.Parent = object.userList;
                                        userButton.Click();
                                    }
                                },
                            });
                        },
                    }),
                ],
            }),
        ];
    }

    GetUserButton(user) {
        let object = this;

        return new UserButton({
            user: user,
            onClick: function (userButton, event) {
                let userPage = new UserPage({
                    user: userButton.User,
                    onUserChange: function (userPage, data) {
                        userButton.User = userPage.User;
                    },
                    onUserTrash: function (userPage, data) {
                        userButton.Remove();
                    },
                });

                object.Body.AddChild(userPage);
            },
        });
    }

    ReloadUsers() {
        let object = this;

        object.Users = [];
        object.Loading.Parent = object.userList;

        Ajax.Get(`/user`, {
            load: function (response) {
                object.Users = response.users;
            },
        });
    }

    get Loading() {
        let object = this;
        return object.loading ?? (object.loading = new Loading());
    }

}