class BoxView extends Column {

    Init(data = {}) {
        super.Init(data);
        let object = this;

        if (!data.backgroundColor) object.BackgroundColor = 'rgba(15, 15, 15, 0.1)';

        if (!data.magin) object.Margin = 0.5;
        if (!data.borderRadius) object.BorderRadius = 0.5;

        if (!data.overflow) object.Overflow = 'hidden';
    }

}