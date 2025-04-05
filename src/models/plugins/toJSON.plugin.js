const deleteAtPath = (obj, path, index) => {
  if (index === path.length - 1) {
    delete obj[path[index]];
    return;
  }
  if (obj[path[index]]) {
    deleteAtPath(obj[path[index]], path, index + 1);
  }
};

const transformObject = (obj, schema) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformObject(item, schema));
  }

  if (obj && typeof obj === "object") {
    Object.keys(obj).forEach((key) => {
      if (key === "_id") {
        obj.id = obj._id.toString();
        delete obj._id;
      } else if (key === "__v") {
        delete obj.__v;
      } else if (
        schema &&
        schema.paths[key] &&
        schema.paths[key].options &&
        schema.paths[key].options.private
      ) {
        delete obj[key];
      } else {
        obj[key] = transformObject(
          obj[key],
          schema && schema.paths[key] && schema.paths[key].schema
        );
      }
    });
  }

  return obj;
};

const toJSON = (schema) => {
  let transform;
  if (schema.options.toJSON && schema.options.toJSON.transform) {
    transform = schema.options.toJSON.transform;
  }

  schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
    transform(doc, ret, options) {
      ret = transformObject(ret, schema);

      if (transform) {
        return transform(doc, ret, options);
      }

      return ret;
    },
  });
};

module.exports = toJSON;
