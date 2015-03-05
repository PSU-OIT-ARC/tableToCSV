/*!
 * tableToCSV
 * currently exports to Microsoft-esque CSVs
 * Compatible with AMD using UMD (https://github.com/umdjs/umd/blob/master/amdWeb.js)
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        root.tableToCSV = factory();
    }
}(this, function () {
    return function(aTag, filename, selector) {
    // cells that are used up because of a rowspan or colspan are marked with
    // this special value (which is just an alias for null, but helps with readability)
    var USED_UP = null;

    function formatForCSV(str) {
        // escape quote characters
        var output = str.replace(/"/g, "\"\"");
        output = output.replace(/^\s+|\s+$/g, "");

        // the value contains a comma, quote or a non printable character ASCII
        // character, so quote it
        if (str.search(/[",]|[^ -~]/) != -1) {
            output = "\"" + output + "\"";
        }
        return output;
    }

    // get the table DOM elements from the selectors
    var tables = [];
    var matches = document.querySelectorAll(selector);
    for(var i = 0; i < matches.length; i++){
        tables.push(matches[i]);
    }

    // calculate the max number of cols across all the tables, and how many
    // rows the CSV will have
    var rows = 0;
    var maxCols = 0;
    tables.forEach(function(table){
        rows += table.rows.length;
        for(var i = 0; i < table.rows.length; i++){
            maxCols = Math.max(table.rows[i].cells.length, maxCols);
        }
    });
    // we add a blank row between each table
    rows += tables.length - 1;

    // initialize the array to store all the table data
    var cellArray = [];
    for(var r = 0; r < rows; r++){
        cellArray.push(new Array(maxCols));
    }

    // loop through every table, every row, and every column, and add the cell
    // to the cellArray
    var row = 0;
    var col = 0;
    tables.forEach(function(table){
        for(var i = 0; i < table.rows.length; i++){
            for(var j = 0, col = 0; j < table.rows[i].cells.length; j++){
                var element = table.rows[i].cells[j];
                // walk along the cellArray until we find a cell which isn't
                // already USED_UP
                while(cellArray[row][col] === USED_UP){
                    col++;
                    if(col >= maxCols){
                        col = 0;
                        row++;
                    }
                }

                var colspan = parseInt(element.getAttribute('colspan'), 10) || 1;
                var rowspan = parseInt(element.getAttribute('rowspan'), 10) || 1;
                // mark all the relevant cells as being used up because of the
                // colspan/rowspan
                for(var r = row; r < row + rowspan; r++){
                    for(var c = col; c < col + colspan; c++){
                        cellArray[r][c] = USED_UP;
                    }
                }

                // actually write the value to the cellArray
                cellArray[row][col] = formatForCSV(element.textContent);
                col += 1;
            }
            row += 1;
        }
        row += 1; // add an extra row between tables
    });

    // build a CSV string from the cellArray
    var csvString = [];
    for(var r = 0; r < cellArray.length; r++){
        csvString.push(cellArray[r].join(","));
    }
    csvString = csvString.join("\r\n");

    // now turn it into a blob in local storage:
    var blob = new Blob([csvString], {type : 'text/csv'});

    try {
        // internet explorer, of course, does things differently
        window.navigator.msSaveOrOpenBlob(blob, filename);
        aTag.setAttribute('href', "#nowhere");
    } catch(e){
        var url = URL.createObjectURL(blob);        // get the URL to the blob

        // points the 'a' element at our generated file
        // this works because this function is called before the link is evaluated
        aTag.setAttribute('href', url);
        aTag.setAttribute('download', filename);
    }
}}));

