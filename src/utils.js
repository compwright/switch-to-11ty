function parseArgs(strToParse) {
    let str = strToParse;
    let data = {};
    
    let eq, delimiter, argEnd, param, value;
    while (str.length > 0) {
        // Find `param1=value1 param2=value2 ...`
        //             ^
        eq = str.indexOf('=');
    
        // Chop `param1` from `=value1 param2=value2 ...`
        param = str.substr(0, eq);
    
        // Chop `=` from `value1 param2=value2 ...`
        str = str.substr(eq + 1);
        delimiter = ' ';
    
        // Find `some value' param2=value2 ...`
        //                 ^
        if (str[0] === "'") {
            delimiter = "' ";
        } else if (str[0] === '"') {
            delimiter = '" ';
        }
    
        // Find `value1 param2=value2 ...`
        //             ^
        argEnd = str.indexOf(delimiter);
        if (argEnd === -1) {
            // last arg
            data[param] = str;
            break;
        }

        // Include the trailing quote, if present
        if (delimiter.length > 1) {
            argEnd += delimiter.length - 1;
        }
    
        // Chop `value1 ` from `param2=value2 ...`
        value = str.substr(0, argEnd);
        str = str.substr(argEnd + 1);
    
        data[param] = value;
    }
    
    return data;
}

function parseJekyllInclude(tag) {
    // Strip off the opening and closing
    const contents = /{% include (.*) %}/.exec(tag)[1];

    const argPos = contents.indexOf('=');
    if (argPos > -1) {
        // Find the last space before the first equals sign, for
        // tags like {% include {{ component }} field=field %}
        const file = contents.substr(
            0,
            contents.substr(0, argPos).lastIndexOf(' ')
        );

        // The rest are args
        const args = parseArgs(contents.substr(file.length + 1));

        return { file, args };
    }

    return { file: contents };
}

function stringifyLiquidjsInclude(tag) {
    let args = Object.entries(tag.args || {});

    if (args.length > 0) {
        args = ', ' + args.map(([ arg, val ]) => `${arg}: ${val}`).join(', ');
        return `{% include ${tag.file}${args} %}`
    }
    
    return `{% include ${tag.file} %}`
}

function rewriteFileIncludes(str) {
    // {% include file.ext arg=var arg2="val" %} -> {% include file.ext, arg=var, arg2="val" %}
    return str.replace(
        /{% include .*? %}/g,
        tag => stringifyLiquidjsInclude(parseJekyllInclude(tag))
    );
}

function rewriteVarIncludes(str) {
    // {{ include.some.var }} -> {{ some.var }}
    return str.replace(
        /{{ ?include\..*? ?}}/g,
        tag => tag.replace(/include\./, '')
    );
}

module.exports = {
    rewriteFileIncludes,
    rewriteVarIncludes
};
