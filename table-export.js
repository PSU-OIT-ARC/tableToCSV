/*!
 * table exporter
 * currently exports to Microsoft-esque CSVs
 *
 */
function table_export_csv(a, filename, selector) {
    // cells that are used up because of a rowspan or colspan are marked with
    // this special value (which is just an alias for null, but helps with readability)
    var USED_UP = null;

    function parse_string_for_csv(input_string) {
        // escape quote characters
        var output_string = input_string.replace(/"/g, "\"\"");
        output_string = output_string.replace(/^\s+|\s+$/g, "");

        // the value contains a comma, quote or a non printable character ASCII
        // character, so quote it
        if (input_string.search(/[",]|[^ -~]/) != -1) {
            output_string = "\"" + output_string + "\"";
        }
        return output_string;
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
    var max_cols = 0;
    tables.forEach(function(table){
        rows += table.rows.length;
        for(var i = 0; i < table.rows.length; i++){
            max_cols = Math.max(table.rows[i].cells.length, max_cols);
        }
    });
    // we add a blank row between each table
    rows += tables.length - 1;

    // initialize the array to store all the table data
    var cellArray = [];
    for(var r = 0; r < rows; r++){
        cellArray.push(new Array(max_cols));
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
                    if(col >= max_cols){
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
                cellArray[row][col] = parse_string_for_csv(element.textContent);
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

    var url = URL.createObjectURL(blob);        // get the URL to the blob

    // points the 'a' element at our generated file
    // this works because this function is called before the link is evaluated
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
}
