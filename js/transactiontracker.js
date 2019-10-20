/**
 * Created by B00137205.
 */

/** Declare required variables.  */
var firstRun;
var index = 0;
var transactionType = "withdrawal";
var errorDisplay;
var errorType;
var errors = "";
var dateField;
var monthField;
var yearField;
var timeField;
var payeeField;
var paymentTypeField;
var notesField;
var amountField;
var setupAmountField;
var submitButton;
var resetButton;
var minimiseButton;
var setupSubmitButton;
var settingsButton;
var factoryResetButton;
var today = new Date();
var currentBalanceDisplay;
var pendingBalanceDisplay;
var finalBalanceDisplay;
var startingBankBalance;
var bankBalance;
var pendingTotal;
var finalTotal;
var transactionBox;
var cover;
var popup;
var settings;
var displayDiv;
var withdrawHTML;
var depositHTML;
var edit = false;
var dateFieldEdit;
var monthFieldEdit;
var yearFieldEdit;
var timeFieldEdit;
var payeeFieldEdit;
var paymentTypeFieldEdit;
var notesFieldEdit;
var amountFieldEdit;
var submitEditButton;
var closeButton;

/**UI Features */

    /**Initialise page elements*/

var initialise = function() {
    errorDisplay = document.getElementById("error-display");
    dateField = document.getElementById("date");
    monthField = document.getElementById("month");
    yearField = document.getElementById("year");
    timeField = document.getElementById("time");
    payeeField = document.getElementById("payee");
    paymentTypeField = document.getElementById("payment-type");
    notesField = document.getElementById("notes");
    amountField = document.getElementById("amount");
    setupAmountField = document.getElementById("setup-amount");
    submitButton = document.getElementById("submit");
    resetButton = document.getElementById("reset");
    minimiseButton = document.getElementById("minimise-button");
    setupSubmitButton = document.getElementById("setup-submit");
    settingsButton = document.getElementById("settings-button");
    factoryResetButton = document.getElementById("factory-reset");
    currentBalanceDisplay = document.getElementById("current-balance");
    pendingBalanceDisplay = document.getElementById("clearing-balance");
    finalBalanceDisplay = document.getElementById("final-balance");
    cover = document.getElementById("cover");
    popup = document.getElementById("setup");
    settings = document.getElementById("settings");
    displayDiv = document.getElementById("balance-display");
    closeButton = document.getElementById("close-button");
    setInputDefaults();

    /** Setup event handlers */

    monthField.onchange = function() {
        fillDates(monthField.selectedIndex, dateField, yearField.value);
    };

    submitButton.onclick = function () {
        resetFieldStyles();
        if (validateInput("transactionForm")) {
            clearErrors();
            addTransaction(index, transactionType, dateField, monthField, yearField, timeField, payeeField, paymentTypeField, notesField, amountField);
            index++;
            resetFieldValues();
            resetFieldStyles();
            updateTable();
            updateTotals();
            save();
        }
    };
    resetButton.onclick = function () {
        resetFieldValues();
        resetFieldStyles();
        clearErrors();
    };
    minimiseButton.onclick = function() {
        minimise("minimise-zone");
    };
    setupSubmitButton.onclick = function() {
        if (validateInput("setupForm")) {
            clearErrors();
            startingBankBalance = Number(setupAmountField.value);
            updateTotals();
            fadeOut("setup");
            fadeOut("cover");
            fadeIn("balance-display");
            localStorage.firstRun = false;
            save();
        }
    };
    settingsButton.onclick = function() {
        fadeIn("settings");
        fadeIn("cover");
        fadeOut("balance-display");
    };
    factoryResetButton.onclick = function() {
        localStorage.clear();
        var body = document.getElementsByTagName("body");
        settings.innerHTML = '<h3>Deleting Data...</h3><br><img src="img/loading.gif">';
        setTimeout(function(){location.reload()}, 3000);
    };
    closeButton.onclick = function() {
        fadeOut("settings");
        fadeOut("cover");
        fadeIn("balance-display");
    };
};

// Displays the setup dialogue box.
var setup = function() {
    cover.style.display = "inline";
    popup.style.display = "inline";
};


/**Transaction Input Selector */

var displayWithdrawFields = function() {
    transactionBox.innerHTML = withdrawHTML; // Rewrite code to the withdrawal fields.
    transactionType = "withdrawal"; // Sets the transaction type.
    initialise(); // Get elements and fill inputs with default data.
};

var displayDepositFields = function() {
    transactionBox.innerHTML = depositHTML; // Rewrite code to the deposit fields.
    transactionType = "deposit"; // Sets the transaction type.
    initialise(); // Get elements and fill inputs with default data.
};


/**Fill in Date & Time Fields */

var setInputDefaults = function() {
    fillTimeList(timeField);
    fillDateList(monthField, dateField, yearField);
    setToday();
    amountField.value = "0.00";
    setupAmountField.value = "0.00";
};

var setToday = function(){
    var d = today.getDate();
    dateField.options[d-1].selected = true;
};

var fillDateList = function(monthList, dateList, year) {
    year.value = today.getFullYear();
    monthList.length = 0;
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (var i=0; i<12; i++){
        monthList.options[i] = new Option(months[i]);
        monthList.options[i].value = i; //Add a value so IE can input the data when editing.
    }
    var m = today.getMonth();
    monthList.options[m].selected = true;
    fillDates(m, dateList, year);
};

// This function detects which month & year has been entered and inputs the correct amount of dates.
var fillDates = function (month, dateList, year) {
    dateList.length = 0;
    var d;
    switch (month) {
        case 0:
        case 2:
        case 4:
        case 6:
        case 7:
        case 9:
        case 11:
            d = 31;
            break;
        case 3:
        case 5:
        case 8:
        case 10:
            d = 30;
            break;
        case 1:
            if (year % 4 === 0) {
                d = 29;
            } else {
                d = 28;
            }
            break;
    }
    for (var i=0; i<d; i++){
        dateList.options[i] = new Option(i+1);
        dateList.options[i].value = i+1; //Add a value so IE can input the data when editing.
    }
};

var fillTimeList = function(timeList){
    timeList.length = 0;
    var hours;
    for (hours=0; hours<24; hours+=1){
        var hh = hours.toString();
        if (hh.length < 2){
            hh = "0"+hh;
        }
        timeList.options[timeList.options.length] = new Option (hh+":00");
        timeList.options[(timeList.options.length -1)].value = hh+":00"; //Add a value so IE can input the data when editing.
        timeList.options[timeList.options.length] = new Option (hh+":30");
        timeList.options[(timeList.options.length -1)].value = hh+":30"; //Add a value so IE can input the data when editing.
    }
    selectNearestTime(timeList);
};

var selectNearestTime = function(timeField){
    var n = today.getHours()*2 + Math.floor(today.getMinutes()/30);
    timeField.options[n].selected = true;
};


/**Events */

/**Input Field Operations */
var setInvalid = function(field) {
    field.style.borderColor = "#FF0000"; // Adds a red border to invalid field.
    field.style.borderWidth = "2px";
    displayError(errorType); // Fetch error type
    errorType = "Empty"; // Reset error type to prevent duplicates.
};

// This function returns an error message based on which error was called during validation.
var displayError = function(errorType){
    switch(errorType) {
        case "empty":
            break;
        case "notanumber":
            errors += "Amount must be a number." + "<br>";
            break;
        case "zero":
            errors += "Amount must be more than zero." + "<br>";
            break;
        case "decimal":
            errors += "Amount must have 2 digits following a decimal." + "<br>";
            break;
        case "numbertoolong":
            errors += "Amount cannot be more than 100 million, hire an accountant." + "<br>";
            break;
        case "comma":
            errors += "Amount should not be formatted with commas." + "<br>";
            break;
        case "texttoolong":
            errors += "Text input must be less than 50 characters." + "<br>";
            break;
        case "yearnotnumber":
            errors += "Year must be a number." + "<br>";
            break;
        case "yearlength":
            errors += "Year must be 4 digits." + "<br>";
            break;
        case "yeartooold":
            errors += "Man, you must be old..." + "<br>";
            break;
        }
};

// Restore fields to default values
var resetFieldValues = function() {
    dateField.value = "";
    timeField.value = "";
    payeeField.value = "";
    if (transactionType === "withdrawal") {
        paymentTypeField.value = "Withdrawal";
    } else {
        paymentTypeField.value = "Deposit";
    }
    notesField.value = "";
    amountField.value = "";
    setInputDefaults();
};
// Reset fields to default style
var resetFieldStyles = function() {
    yearField.style.borderColor = "#000000";
    yearField.style.borderWidth = "1px";
    payeeField.style.borderColor = "#000000";
    payeeField.style.borderWidth = "1px";
    paymentTypeField.style.borderColor = "#000000";
    paymentTypeField.style.borderWidth = "1px";
    amountField.style.borderColor = "#000000";
    amountField.style.borderWidth = "1px";
    notesField.style.borderColor = "#000000";
    notesField.style.borderWidth = "1px";
    if (edit) {
        yearFieldEdit.style.borderColor = "#000000";
        yearFieldEdit.style.borderWidth = "1px";
        payeeFieldEdit.style.borderColor = "#000000";
        payeeFieldEdit.style.borderWidth = "1px";
        paymentTypeFieldEdit.style.borderColor = "#000000";
        paymentTypeFieldEdit.style.borderWidth = "1px";
        amountFieldEdit.style.borderColor = "#000000";
        amountFieldEdit.style.borderWidth = "1px";
        notesFieldEdit.style.borderColor = "#000000";
        notesFieldEdit.style.borderWidth = "1px";
    }
};

// Fade out error dialogue and clear any errors that were in the display.
var clearErrors = function() {
    fadeOut("error-display");
    setTimeout(function () {errorDisplay.innerHTML = "";}, 600);
};


/** Local Storage Operations*/

var save = function() {
    localStorage["transactions"] = JSON.stringify(transactions);
    localStorage.index = index;
    localStorage.startingBankBalance = startingBankBalance;
};

var load = function() {
    var transactionsLoad = JSON.parse(localStorage["transactions"]); // Parse string data to an array.
    for (var i=0; i<localStorage.index; i++) { // Rebuild the Transaction objects,
        var x = transactionsLoad[i];
        x = new Transaction(x.type, x.date, x.month, x.year, x.time, x.payee, x.paymentType, x.note, x.amount, x.cleared);
        transactions.push(x);
    }
    index = Number(localStorage.index);
    startingBankBalance = Number(localStorage.startingBankBalance);
};


/** Exciting Stuff */

var transactions = [];

var Transaction = function(type, date, month, year, time, payee, paymentType, note, amount, cleared) {
    this.type = type;
    this.date = date;
    this.month = month;
    this.year = year;
    this.time = time;
    this.payee = payee;
    this.paymentType = paymentType;
    this.note = note;
    this.amount = Number(amount);
    this.cleared = cleared;
};

Transaction.prototype.edit = function(newDate, newMonth, newYear, newTime, newPayee, newPaymentType, newNote, newAmount) {
    this.date = newDate;
    this.month = newMonth;
    this.year = newYear;
    this.time = newTime;
    this.payee = newPayee;
    this.paymentType = newPaymentType;
    this.note = newNote;
    this.amount = Number(newAmount);
};

Transaction.prototype.tableRow = function(id){ //Write table row with current Transaction data.
    var tr = "<tr><td>" + getTransactionType(this.type) + "</td><td>" +
        this.date + " " + getMonthName(this.month) + " " + this.year + "</td><td>" + this.time + "</td><td>" + this.payee +
        "</td><td>" + this.paymentType + "</td><td>" + this.note + "</td><td>" + "£" + this.amount.toFixed(2) + "</td><td>" +
        '<a href="javascript:void(0)"><img class = "icon" src="img/edit.png" alt="Edit Transaction" onclick = "editTransaction(' + (id-1) + ')"></a>' +
        '<a href="javascript:void(0)"><img class = "icon" src="img/delete.png" alt="Delete Transaction" onclick = "deleteTransaction('+ (id-1) +')"></a>' + getClearedType(this.cleared, id) + "</td></tr>";
    return tr;
};

Transaction.prototype.fillInputs = function(){ // Input current transaction data into editable inputs.
    dateFieldEdit = document.getElementById("date-edit");
    monthFieldEdit = document.getElementById("month-edit");
    yearFieldEdit = document.getElementById("year-edit");
    timeFieldEdit = document.getElementById("time-edit");
    payeeFieldEdit = document.getElementById("payee-edit");
    paymentTypeFieldEdit = document.getElementById("payment-type-edit");
    notesFieldEdit = document.getElementById("notes-edit");
    amountFieldEdit = document.getElementById("amount-edit");
    submitEditButton = document.getElementById("submit-edit");
    fillDateList(monthFieldEdit, dateFieldEdit, yearFieldEdit);
    fillTimeList(timeFieldEdit);
    dateFieldEdit.value = this.date;
    monthFieldEdit.value = this.month;
    yearFieldEdit.value = this.year;
    timeFieldEdit.value = this.time;
    payeeFieldEdit.value = this.payee;
    paymentTypeFieldEdit.value = this.paymentType;
    notesFieldEdit.value = this.note;
    amountFieldEdit.value = this.amount;
};

var editTableRow = function(id){ // When in edit mode, this writes editable inputs into the row instead of the Transaction data.
    var selectType;
    var withdrawSelect = '<select id = "payment-type-edit"><option value="Withdrawal">Withdrawal</option><option value="Debit Card">Debit Card</option><option value="Credit Card">Credit Card</option><option value="Online">Online</option><option value="Cheque">Cheque</option><option value="Bank Transfer">Bank Transfer</option><option value="Direct Debit">Direct Debit</option></select>'
    var depositSelect = '<select id = "payment-type-edit"><option value="Deposit">Deposit</option><option value="Bank Transfer">Bank Transfer</option></select>';
    if (transactions[id-1].type == "withdrawal") {
        selectType = withdrawSelect;
    } else {
        selectType = depositSelect;
    }
    var tr = "<tr><td>" + '<img src = "img/edit.png">' + "</td><td>" +
        ' <select id = "date-edit" tabindex="1"></select><select id = "month-edit" tabindex="2" onchange="fillDates(monthFieldEdit.selectedIndex, dateFieldEdit, yearFieldEdit.value)"></select><input type = "text" id = "year-edit" tabindex="3" size="4" onchange="fillDates(monthFieldEdit.selectedIndex, dateFieldEdit, yearFieldEdit.value)">' + "</td><td>" +
        '<select id = "time-edit"></select>' + "</td><td>" +
        '<input type="text" id = "payee-edit">' + "</td><td>" +
         selectType + "</td><td>" +
        '<input type="text" id = "notes-edit"/>' + "</td><td>" +
        "£" + '<input type="text" id = "amount-edit">' + "</td><td>" +
        '<input type = "submit" value = "Submit" class = "button" id = "submit-edit" />' + "</td></tr>";
    return tr;
};

var addTransaction = function(index, transactionType, dateField, monthField, yearField, timeField, payeeField, paymentTypeField, notesField, amountField){
    var cleared;
    if (this.transactionType === "deposit") { // Automatically clear deposits.
        cleared = true;
    } else {
        cleared = false;
    }
    var x = new Transaction(transactionType, dateField.value, monthField.value, yearField.value, timeField.value, payeeField.value, paymentTypeField.value, notesField.value, amountField.value, cleared);
    transactions[index] = x;
};

var clearTransaction = function(id) { //Sets Transaction as cleared, called from onclick written in the tableRow function.
    transactions[id].cleared = true;
    save();
    updateTable();
    updateTotals();
};
//Simply clears the relevant array cell and moves each following cell down one place.
var deleteTransaction = function(id) {
    for (var i=id; i<index; i++) {
        transactions[i] = transactions[i+1];
    }
    index--; // Reduce index to reflect the array being smaller.
    save();
    updateTable();
    updateTotals();
};
// Compares transactions to allow them to be sorted by year, month, date, then time.
var compareTransaction = function (a,b) {
    if (Number(a.year) < Number(b.year)) {
        return -1;
    } else if (Number(a.year) > Number(b.year)) {
        return 1;
    } else {
        if (Number(a.month) < Number(b.month)) {
            return -1;
        } else if (Number(a.month) > Number(b.month)) {
            return 1;
        } else {
            if (Number(a.date) < Number(b.date)) {
                return -1;
            } else if (Number(a.date) > Number(b.date)) {
                return 1;
            } else {
                if (a.time < b.time) {
                    return -1;
                } else if (a.time > b.time) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
    }
};
// Calls the required functions to edit a stored Transaction.
var editTransaction = function(id) {
    edit = true; // Set program to edit mode.
    updateTable(edit, id); //Rewrite table with editable boxes.
    transactions[id].fillInputs(); //Fill editable boxes with current stored data.
    submitEditButton.onclick = function() {
        resetFieldStyles(); //Reset any field errors.
        if (validateInput("editForm")) {
            clearErrors(); //Reset any error messages.
            transactions[id].edit(dateFieldEdit.value, monthFieldEdit.value, yearFieldEdit.value, timeFieldEdit.value, payeeFieldEdit.value, paymentTypeFieldEdit.value, notesFieldEdit.value, amountFieldEdit.value);
            updateTable();
            updateTotals();
            save();
            edit = false; // Set program back to normal mode.
        }
    };
};
// Rewrites table will all data stored in the array.
var updateTable = function(edit, id){
    transactions.sort(compareTransaction);
    var table = document.getElementById("table");
    var content = '<table id = "table"><tr><th></th><th>Date</th><th>Time</th><th>Payee</th><th>Transaction Type</th><th>Notes</th><th>Amount</th><th></th></tr>';
    for(var i=index; i>0; i--) {
        var transaction = transactions[i - 1];
        if ((edit === true && (i - 1) === id)) { // If program is in edit mode, write editable row for selected transaction.
            content += editTableRow(i);
            table.innerHTML = content;
        }
        else if (typeof transaction != "null") { // If cell is not empty write the data.
            content += transaction.tableRow(i);
        }
    }
    content+="</table>";
    table.innerHTML = content;
};
// Refreshes the calculated totals.
var updateTotals = function() {
    bankBalance = startingBankBalance;
    pendingTotal = 0;
    for (var i=0; i<index; i++) {
        var transaction = transactions[i];
        if (transaction.type === "withdrawal" && transaction.cleared === true) {
            bankBalance = bankBalance - transaction.amount;
        } else if (transaction.type === "withdrawal" && transaction.cleared === false) {
            pendingTotal = pendingTotal + transaction.amount;
        } else if (transaction.type === "deposit") {
            bankBalance = bankBalance + transaction.amount;
        } else {

        }
    }
    finalTotal = bankBalance - pendingTotal;
    currentBalanceDisplay.innerHTML = "£" + bankBalance.toFixed(2);
    pendingBalanceDisplay.innerHTML = "£" + pendingTotal.toFixed(2);
    finalBalanceDisplay.innerHTML = "£" + finalTotal.toFixed(2);

    // Set box colour based on amount displayed.
    var bankBox = document.getElementById("current-balance-div");
    var finalBox = document.getElementById("final-balance-div");
    if (bankBalance <0) {
        bankBox.style.backgroundColor = "#FF0000";
    } else {
        bankBox.style.backgroundColor = "#009900";
    }
    if (finalTotal <0) {
        finalBox.style.backgroundColor = "#FF8C00";
    } else {
        finalBox.style.backgroundColor = "#009900";
    }
    if (finalTotal <0 && bankBalance <0) {
        finalBox.style.backgroundColor = "#FF0000";
    }
};
// Displays a plus or a minus in the table depending on if the transaction is a deposit or withdrawal.
var getTransactionType = function(transactionType) {
    if (transactionType === "withdrawal") {
        return '<img class = "icon" src="img/minus.png" alt="Withdrawal">';
    } else {
        return '<img class = "icon" src="img/plus.png" alt="Deposit">';
    }
};

// Converts the stored month integer into english name.
var getMonthName = function(month) {
    var m;
    switch (month) {
        case "0":
            m = "Jan";
            break;
        case "1":
            m = "Feb";
            break;
        case "2":
            m = "Mar";
            break;
        case "3":
            m = "Apr";
            break;
        case "4":
            m = "May";
            break;
        case "5":
            m = "Jun";
            break;
        case "6":
            m = "Jul";
            break;
        case "7":
            m = "Aug";
            break;
        case "8":
            m = "Sep";
            break;
        case "9":
            m = "Oct";
            break;
        case "10":
            m = "Nov";
            break;
        case "11":
            m = "Dec";
            break;
    }
    return m;
};
// Returns the correct icon for cleared or pending transactions in the table.
var getClearedType = function(cleared, id) {
    if (cleared === false) {
        return '<a href="javascript:void(0)"><img class = "icon-cleared" src="img/pending.png" alt="Transaction Pending" onmouseover="this.src =' + "'img/cleared.png'" + '" onmouseout="this.src=' + "'img/pending.png'" + '" onclick="clearTransaction(' + (id-1) + ')"> </a>';
    } else {
        return '<img class = "icon-cleared" src="img/cleared.png" alt="Transaction Cleared">';
    }
};

// Various validation steps for input types.
var validateInput = function(form) {
    errors = "";
    var date, payee, paymentType, amount, note;
    var valid = false;
    var forms = [];
    var valid1;
    var valid2;
    var valid3;
    var valid4;
    if (form === "setupForm") {
        amount = setupAmountField;
        if (validateAmount(amount)) {
            valid = true;
        }
    }
    else if (form === "transactionForm") {
        date = yearField;
        payee = payeeField;
        paymentType = paymentTypeField;
        amount = amountField;
        note = notesField;
        forms = [date, payee, paymentType, amount, note];
        valid1 = checkForEmpties(forms);
        valid2 = validateAmount(amount);
        valid3 = validateText(payee, note);
        valid4 = validateDate(date);
        if (valid1 && valid2 && valid3 && valid4) {
            valid = true;
        }
    }
    else if (form === "editForm") {
        date = yearFieldEdit;
        payee = payeeFieldEdit;
        paymentType = paymentTypeFieldEdit;
        amount = amountFieldEdit;
        note = notesFieldEdit;
        forms = [date, payee, paymentType, amount, note];
        valid1 = checkForEmpties(forms);
        valid2 = validateAmount(amount);
        valid3 =validateText(payee, note);
        valid4 = validateDate(date);
        if (valid1 && valid2 && valid3 && valid4) {
            valid = true;
        }
    }
    if (!valid) {
        errorDisplay.innerHTML = errors;
        fadeIn("error-display");
        setTimeout(function () {fadeOut("error-display");}, 8000);

    }
    return valid;
};

var checkForEmpties = function (forms) {
    var valid = true;
    for (var i = 0; i < 5; i++) {
        if (forms[i].value == "") {
            setInvalid(forms[i]);
            valid = false;
        }
    }
    if (!valid) {
        errors += "Fields cannot be empty." + "<br>";
    }
    return valid;
};

var validateAmount = function (amount) {
    var valid = true;
    var decimal = amount.value.lastIndexOf(".");
    var comma = amount.value.indexOf(",");
    if (comma != -1) {
        errorType = "comma";
        setInvalid(amount);
        valid = false;
    } else if (isNaN(amount.value)) {
        errorType = "notanumber";
        setInvalid(amount);
        valid = false;
    } else if (amount.value <= 0) {
        errorType = "zero";
        setInvalid(amount);
        valid = false;
    } else if (decimal + 3 != amount.value.length && decimal != -1) {
        errorType = "decimal";
        setInvalid(amount);
        valid = false;
    } else if (amount.value.length > 9) {
        errorType = "numbertoolong";
        setInvalid(amount);
        valid = false;
    }
    return valid;
};

var validateText = function (payee, note) {
    var valid = true;
    if (payee.value.length > 50) {
        errorType = "texttoolong";
        setInvalid(payee);
        valid = false;
    }
    if (note.value.length >50) {
        errorType = "texttoolong";
        setInvalid(note);
        valid = false;
    }
    return valid;
};

var validateDate = function (date) {
    var valid = true;
    if (isNaN(date.value)) {
        errorType = "yearnotnumber";
        setInvalid(date);
        valid = false;
    }
    if (date.value.length != 4) {
        errorType = "yearlength";
        setInvalid(date);
        valid = false;
    }
    if (date.value < 1900) {
        errorType = "yeartooold";
        setInvalid(date);
        valid = false
    }
    return valid;
};


window.onload = function(){
    initialise();
    transactionBox = document.getElementById("transaction-input-div");
    declareHTMLVariables();
    firstRun = localStorage.firstRun;
    if (firstRun === "false") {
        displayDiv.style.display = "inherit";
        load();
        updateTable();
        updateTotals();
    } else {
        setup();
    }

};

/* Animations */

var fadeIn = function(div) {
    $( "#"+div ).fadeIn( "slow", function() {
// Animation complete
    });
};

var fadeOut = function(div) {
    $( "#"+div ).fadeOut("slow", function() {
// Animation complete
    });
};

var minimise = function(div) {
    $( "#"+div ).slideUp( "slow", function() {
        var img = document.getElementById("minimise-img");
        img.src = "img/down.png";
        minimiseButton.setAttribute( "onClick", "javascript: maximise('minimise-zone');" );
    });
};
var maximise = function(div) {
    $( "#"+div ).slideDown( "slow", function() {
        var img = document.getElementById("minimise-img");
        img.src = "img/up.png";
        minimiseButton.setAttribute( "onClick", "javascript: minimise('minimise-zone');" );
    });
};

declareHTMLVariables = function() {
    withdrawHTML = '<h2>Add Transaction</h2>' +
        '<div class="input-row">' +
            '<div class = "field-div-right">' +
                '<label for="time">Time:</label>' +
                '<select id = "time"></select>' +
            '</div>' +
            '<div class = "field-div-left">' +
                '<label for="date">Date:</label>' +
                '<select id = "date" tabindex="1"></select>' + ' ' +
                '<select id = "month" tabindex="2"></select>' + ' ' +
                '<input type = "text" id = "year" tabindex="3" size="4" onchange="fillDates(monthField.selectedIndex, dateField, yearField.value)">' + ' ' +
            '</div>' +
        '</div>' +
        '<div class = "input-row">' +
            '<div class = "field-div-right">' +
                '<label for="payee">Payee:</label>' +
                '<input type="text" id = "payee" tabindex="4">' +
            '</div>' +
            '<div class = "field-div-left">' +
                '<label for="payment-type">Payment Type:</label>' +
                '<select id = "payment-type" tabindex="3">' +
                    '<option value="Withdrawal">Withdrawal</option>' +
                    '<option value="Debit Card">Debit Card</option>' +
                    '<option value="Credit Card">Credit Card</option>' +
                    '<option value="Online">Online</option>' +
                    '<option value="Cheque">Cheque</option>' +
                    '<option value="Bank Transfer">Bank Transfer</option>' +
                    '<option value="Direct Debit">Direct Debit</option>' +
                '</select>' +
            '</div>' +
        '</div>' +
        '<div class="input-row">' +
            '<div class = "field-div-right">' +
                '<label for="amount">Amount (£):</label>' +
                '<input type="text" id = "amount" tabindex="6">' +
            '</div>' +
            '<div class = "field-div-left">' +
                '<label for="notes">Notes:</label>' +
                '<input type="text" id = "notes" tabindex="5">' +
            '</div>' +
        '</div>' +
        '<div class="input-row">' +
            '<input type = "submit" value = "Submit" class = "button" id = "submit" tabindex="7" />' +
            '<input type = "button" value = "Reset" class = "button" id = "reset" tabindex="8" />' +
        '</div>';

    depositHTML = '<h2>Make Deposit</h2>' +
    '<div class="input-row">' +
    '<div class = "field-div-right">' +
    '<label for="time">Time:</label>' +
    '<select id = "time"></select>' +
    '</div>' +
    '<div class = "field-div-left">' +
    '<label for="date">Date:</label>' +
    '<select id = "date" tabindex="1"></select>' + ' ' +
    '<select id = "month" tabindex="2"></select>' + ' ' +
    '<input type = "text" id = "year" tabindex="3" size="4" onchange="fillDates(monthField.selectedIndex, dateField, yearField.value)">' + ' ' +
    '</div>' +
    '</div>' +
    '<div class = "input-row">' +
    '<div class = "field-div-right">' +
    '<label for="payee">Payer:</label>' +
    '<input type="text" id = "payee" tabindex="4">' +
    '</div>' +
    '<div class = "field-div-left">' +
    '<label for="payment-type">Payment Type:</label>' +
    '<select id = "payment-type" tabindex="3">' +
    '<option value="Deposit">Deposit</option>' +
    '<option value="Bank Transfer">Bank Transfer</option>' +
    '</select>' +
    '</div>' +
    '</div>' +
    '<div class="input-row">' +
    '<div class = "field-div-right">' +
    '<label for="amount">Amount (£):</label>' +
    '<input type="text" id = "amount" tabindex="6">' +
    '</div>' +
    '<div class = "field-div-left">' +
    '<label for="notes">Notes:</label>' +
    '<input type="text" id = "notes" tabindex="5">' +
    '</div>' +
    '</div>' +
    '<div class="input-row">' +
    '<input type = "submit" value = "Submit" class = "button" id = "submit" tabindex="7" />' +
    '<input type = "button" value = "Reset" class = "button" id = "reset" tabindex="8" />' +
    '</div>';
};