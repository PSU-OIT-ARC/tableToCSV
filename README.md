# tableToCSV

Export HTML tables to CSV entirely on the client.

# Usage

    <script src="tableToCSV.js"></script>
    ...
    <table>
        <tr>
            <td>hi</td>
        </tr>
    </table>

    <a href="#" onclick="tableToCSV(this, 'filename.csv', 'table')">Export to CSV</a>

It can also be used with an AMD:

    require(['tableToCSV'], function(tableToCSV){
        // do something with tableToCSV
    });
