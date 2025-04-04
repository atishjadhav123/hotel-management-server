const validator = require("validator")

exports.checkempty = (fields) => {
    console.log("------", fields);

    const error = {}
    let isError = false
    for (const key in fields) {
        console.log(fields[key]);

        if (validator.isEmpty(fields[key] ? "" + fields[key] : "")) {
            error[key] = `${key} is Required`
            isError = true
        }
    }
    return { isError, error }
}
