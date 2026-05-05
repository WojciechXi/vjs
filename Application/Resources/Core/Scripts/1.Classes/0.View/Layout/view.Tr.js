class Tr extends Layout {

    get ElementTag() { return 'tr'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Listen('mousedown', function (sender, event) {
            if (event.ctrlKey && sender.CanSelect) {
                event.preventDefault();
                event.stopPropagation();
                sender.IsSelected = !sender.IsSelected;
            }
        });
    }

}