class Tr extends Layout {

    get ElementTag() { return 'tr'; }

    Init(data = {}) {
        super.Init(data);
        let object = this;

        object.Listen('mousedown', function (sender, event) {
            if (event.ctrlKey && object.CanSelect) {
                event.preventDefault();
                event.stopPropagation();
                object.IsSelected = !object.IsSelected;
            }
        });
    }

}