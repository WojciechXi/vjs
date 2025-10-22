class Model {

    static get Endpoints() {
        return {
            insert: null,
            update: null,
            delete: null,
        };
    }

    static get ResponseKeyModels() {
        return {};
    }

    static get KeyModels() {
        return {};
    }

    static Parse(object) {
        let c = this;
        return object ? new c(object) : null;
    }

    static ParseArray(objects) {
        let c = this;

        let models = [];
        objects.forEach(function (object) {
            if (!object) return;
            models.push(new c(object));
        });
        return models;
    }

    static ParseResponse(key, value) {
        if (this.ResponseKeyModels[key]) return this.ResponseKeyModels[key].Parse(value);
        return value;
    }

    static Insert(data, response) {
        let c = this;

        if (c.Endpoints.insert) {
            Ajax.Post(c.Endpoints.insert, {
                data: data,
                load: function (data) {
                    Object.keys(data).forEach(function (key) {
                        data[key] = c.ParseResponse(key, data[key]);
                    });

                    response(data);
                },
            });
        } else {

        }
    }

    constructor(data) {
        let object = this;

        Object.keys(data).forEach(function (key) {
            object.Set(key, data[key]);
        });
    }

    Get(key) {
        let object = this;
        return object[key];
    }

    Parse(key, value) {
        if (this.constructor.KeyModels[key]) return this.constructor.KeyModels[key].Parse(value);
        return value;
    }

    Set(key, value) {
        let object = this;
        object[key] = object.Parse(key, value);
    }

    Update(data, response) {
        let object = this;

        if (object.constructor.Endpoints.update) {
            let endpoint = object.constructor.Endpoints.update.replace('{id}', object.id);

            Ajax.Put(endpoint, {
                data: data,
                load: function (data) {
                    Object.keys(data).forEach(function (key) {
                        data[key] = c.ParseResponse(key, data[key]);
                    });

                    response(data);
                },
            });
        } else {

        }
    }

    Delete(response) {
        let object = this;

        if (object.constructor.Endpoints.delete) {
            let endpoint = object.constructor.Endpoints.delete.replace('{id}', object.id);

            Ajax.Delete(endpoint, {
                data: data,
                load: function (data) {
                    Object.keys(data).forEach(function (key) {
                        data[key] = c.ParseResponse(key, data[key]);
                    });

                    response(data);
                },
            });
        } else {

        }
    }

}