function calcDayIndex() {
  var day = parseInt(document.getElementById('day-value').value);
  var month = parseInt(document.getElementById('month-value').value);
  var year = parseInt(document.getElementById('year-value').value);
  
  var prevDays = [0,31,60,91,121,152,183,213,244,274,305,335];
  
  const resultLabel = document.getElementById('result-label');
  resultLabel.innerHTML = '';
  const noteLabel = document.getElementById('note-label');
  noteLabel.innerHTML = '';
  
  // checks
  
  if (day == 31) {
    if (month == 2 || month == 4 || month == 6 || month == 9 || month == 11) {
      resultLabel.innerHTML = 'The specified month does not have 31 days.';
      return false;
    }
  }
  if (day == 30 && month == 2) {
    resultLabel.innerHTML = 'The month February does not have 30 days.';
    return false;
  }
  if (day == 29 && month == 2 && !isLeapYear(year)) {
    resultLabel.innerHTML = 'The month February did not have 29 days in the year ' + year + '. It was no leap year.';
    return false;
  }
  
  // conversion
  
  var result = (prevDays[month-1] + day);
  resultLabel.innerHTML = 'The ' + day + '.' + month + '. got index ' + result + '.';
  if (month <= 2) {
    return false;
  }
  if (month >= 3) {
    if (isLeapYear(year)) {
      noteLabel.innerHTML = 'The year ' + year + ' was a leap year, so it was the ' + result + '. day of the year ' + year + '.';
      return false;
    } else {
      noteLabel.innerHTML = 'The year ' + year + ' was no leap year, so it was the ' + (result-1) + '. day of the year ' + year + '.';
      return false;
    }
  }
}

function isLeapYear(year) {
  if (year % 4 == 0) {
    if (year % 100 == 0) {
      if (year % 400 == 0) {
        return true;
      }
      return false;
    }
    return true;
  }
  return false;
}
