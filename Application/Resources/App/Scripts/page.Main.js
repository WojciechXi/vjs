class MainPage extends Page {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        let todos = window.localStorage.getItem('todos');
        new Property(object, 'Todos', todos ? JSON.parse(todos) : [], object.OnPropertyChanged);
    }

    Save() {
        let object = this;
        window.localStorage.setItem('todos', JSON.stringify(object.Todos));
    }

    Render() {
        let object = this;
        object.Children = [
            new Column({
                width: '100%',
                maxWidth: '1080px',
                children: [
                    new Button({
                        padding: '0.75rem 1rem',
                        gap: 0.25,
                        children: [
                            new Text({ text: 'Dodaj nowe zadanie', }),
                            new Icon({ text: 'add' }),
                        ],
                        onClick: function (sender, event) {
                            object.Todos.push({
                                Title: 'New Todo',
                                Completed: false,
                            });
                            object.OnPropertyChanged('Todos');
                            object.Save();
                        }
                    }),
                    new Column({
                        width: '100%',
                        childrenLoop: function (todo) {
                            let column = new Column({
                                cursor: 'pointer',
                                padding: '0.75rem 1rem',
                                children: [
                                    new Text({
                                        callback: function (view) {
                                            new Binding(column, 'Todo', function (sender, data) {
                                                view.Text = column.Todo.Title + (column.Todo.Completed ? ' (Completed)' : '');
                                            });
                                        },
                                    }),
                                ],
                                onClick: function (sender, event) {
                                    let page = new TitlePage({
                                        backgroundColor: 'rgb(31,31,31)',
                                        color: 'white',
                                        maxWidth: 360,
                                        height: 'auto',
                                        left: '50%',
                                        top: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        callback: function (view) {
                                            new Binding(column, 'Todo', function (sender, data) {
                                                view.Title = column.Todo.Title;
                                            });
                                            view.Content = [
                                                new TextFieldMaterial({
                                                    width: '100%',
                                                    placeholder: 'Nazwa zadania',
                                                    value: todo.Title,
                                                    onInput: function (sender, event) {
                                                        todo.Title = sender.Value;
                                                        column.OnPropertyChanged('Todo');
                                                        object.Save();
                                                    },
                                                }),
                                                new Label({
                                                    direction: 'row',
                                                    padding: '0.75rem 1rem',
                                                    alignItems: 'center',
                                                    gap: 0.25,
                                                    children: [
                                                        new Text({ text: 'Completed:', }),
                                                        new Input({
                                                            type: 'checkbox',
                                                            callback: function (view) {
                                                                view.Element.checked = todo.Completed;
                                                            },
                                                            onChange: function (sender, event) {
                                                                todo.Completed = sender.Element.checked;
                                                                column.OnPropertyChanged('Todo');
                                                                object.Save();
                                                            },
                                                        }),
                                                    ],
                                                }),
                                                new Button({
                                                    padding: '0.75rem 1rem',
                                                    children: [
                                                        new Text({ text: 'Delete', }),
                                                    ],
                                                    onClick: function (sender, event) {
                                                        let index = object.Todos.indexOf(todo);
                                                        object.Todos.splice(index, 1);
                                                        object.OnPropertyChanged('Todos');
                                                        object.Save();
                                                        Navigator.Pop();
                                                    }
                                                }),
                                            ];
                                        },
                                    });

                                    Navigator.Push(page);
                                },
                            });

                            column.Todo = todo;
                            return column;
                        },
                        callback: function (view) {
                            new Binding(object, 'Todos', function (sender, data) {
                                view.Children = object.Todos;
                            });
                        },
                    }),
                ],
            }),
        ];
    }

}